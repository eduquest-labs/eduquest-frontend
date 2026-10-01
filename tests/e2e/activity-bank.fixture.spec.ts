import { loadEnvConfig } from "@next/env";
import { expect, test, type Page } from "@playwright/test";
import { encode } from "next-auth/jwt";
import path from "node:path";

loadEnvConfig(process.cwd());
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

// UI fixture proof only: signed local session, mocked API, no writes to the real database.
async function setupFixture(page: Page, role: "guru" | "superadmin", paginated = false) {
  const salt = "authjs.session-token";
  const token = await encode({ secret: secret!, salt, token: { userId: 90001, role, name: "Bank Fixture", email: "fixture@example.test", permissions: [], accessToken: "fixture-only", accessTokenExpiry: Date.now() + 3600000 }, maxAge: 3600 });
  await page.context().addCookies([{ name: salt, value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
  const shared = { id: 1, parent_id: null, name: "Gerak Lokomotor", collection: "shared", owner_id: null, material_count: 1 };
  const personal = { id: 2, parent_id: null, name: "Materi Saya", collection: "private", owner_id: 90001, material_count: 0 };
  const material = { id: 1, folder_id: 1, folder: shared, title: "Jogging", summary: "Panduan kegiatan jogging untuk kelas penelitian.", objectives: "Memahami petunjuk aktivitas.", explanation: "Materi contoh untuk pemeriksaan tampilan.", steps: "Baca instruksi guru.\nIkuti rute kegiatan.", task_instruction: "Ikuti rute yang ditentukan guru.", tags: ["Jogging", "Daya tahan"], references: [], media_links: [], created_by: 1, status: role === "guru" ? "published" : "draft", version: "f24cb4b3-8fc1-4875-a0c8-e6e37f8ba9ac", questions: [{ question_type: "isian_singkat", question_text: "GPS merekam apa?", correct_answer_text: "jarak", points: 10 }] };
  let count = paginated ? 13 : 1;
  await page.route((url) => /\/activity-bank\//.test(url.pathname) || /\/api\/classes(?:\/|$)/.test(url.pathname), async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (route.request().method() === "DELETE" && /\/materials\/\d+$/.test(path)) { count--; return route.fulfill({ status: 204 }); }
    let body: unknown;
    if (path.endsWith("/activity-bank/folders")) body = { data: role === "guru" ? [shared, personal] : [shared] };
    else if (path.endsWith("/activity-bank/materials")) {
      const currentPage = Number(url.searchParams.get("page") ?? 1);
      const start = (currentPage - 1) * 12;
      const data = paginated ? Array.from({ length: Math.max(0, Math.min(12, count - start)) }, (_, i) => ({ ...material, id: start + i + 1, title: "Jogging " + (start + i + 1) })) : [material];
      body = { data: url.searchParams.get("collection") === "private" ? [] : data, total: url.searchParams.get("collection") === "private" ? 0 : count, current_page: currentPage, last_page: Math.ceil(count / 12) };
    }
    else if (/\/activity-bank\/materials\/\d+$/.test(path)) { const id = Number(path.split("/").pop()); body = { ...material, id, title: paginated ? "Jogging " + id : material.title }; }
    else if (path.endsWith("/api/classes")) body = { data: [] };
    else return route.fulfill({ status: 500, json: { message: "Unexpected fixture request" } });
    await route.fulfill({ json: body });
  });
}

test.describe("activity bank UI fixtures", () => {
  test.skip(!secret, "A local AUTH_SECRET is needed for the signed fixture session.");
  for (const extension of ["pdf", "docx"] as const) {
    test("imports a real " + extension + " document after explicit preview confirmation", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await setupFixture(page, "superadmin");
      await page.goto("/superadmin/activity-bank");
      await page.getByRole("button", { name: "Tambah materi" }).click();
      await page.getByLabel("Pilih dokumen").setInputFiles(path.join(process.cwd(), "tests/fixtures/bank-document." + extension));
      const preview = page.getByRole("textbox", { name: "Hasil pembacaan dokumen" });
      await expect(preview).toHaveValue(new RegExp("Panduan jogging dari " + extension.toUpperCase()));
      await expect(page.getByRole("textbox", { name: "Materi", exact: true })).toHaveValue("");
      await preview.fill("Teks ditinjau guru");
      await page.getByRole("button", { name: "Tambahkan teks ke materi" }).click();
      await expect(page.getByRole("textbox", { name: "Materi", exact: true })).toHaveValue("Teks ditinjau guru");
      await expect(page.getByRole("textbox", { name: "Judul materi" })).toHaveValue("bank-document");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
  test("deleting the last material on page two returns to the populated list", async ({ page }) => {
    await setupFixture(page, "superadmin", true);
    await page.goto("/superadmin/activity-bank");
    await page.getByRole("button", { name: "Berikutnya", exact: true }).click();
    await page.getByRole("heading", { name: "Jogging 13", exact: true }).click();
    await page.getByRole("button", { name: "Hapus", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Hapus", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Jogging 1", exact: true })).toBeVisible();
  });
  for (const role of ["guru", "superadmin"] as const) {
    for (const width of [375, 1440]) {
      test(role + " bank and material at " + width + "px", async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await setupFixture(page, role);
        await page.goto("/" + role + "/activity-bank");
        await expect(page.getByRole("heading", { name: "Bank Aktivitas Gerak" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Jogging", exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath("bank-list.png"), fullPage: true });
        await page.getByRole("heading", { name: "Jogging", exact: true }).click();
        await expect(page.getByRole("heading", { name: "Langkah kegiatan" })).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath("bank-detail.png"), fullPage: true });
        if (role === "guru") {
          await expect(page.getByRole("button", { name: "Publikasikan", exact: true })).toHaveCount(0);
          await page.getByRole("checkbox", { name: "Pilih soal 1" }).check();
          await expect(page.getByRole("button", { name: "Buat draft challenge" })).toBeDisabled();
        } else {
          await expect(page.getByRole("button", { name: "Publikasikan", exact: true })).toBeVisible();
          await page.getByRole("button", { name: "Edit materi" }).click();
          await expect(page.getByRole("textbox", { name: "Judul materi" })).toHaveValue("Jogging");
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(errors).toEqual([]);
      });
    }
  }
});
