import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, identifier: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Masukkan email atau ID").fill(identifier);
  await page.getByPlaceholder("Masukkan kata sandi").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 45_000 });
}

test("student sees gamification summary, leaderboard, and progress at 375px", async ({ page }) => {
  const identifier = process.env.E2E_STUDENT_IDENTIFIER;
  test.skip(!identifier, "E2E_STUDENT_IDENTIFIER is required for student verification.");

  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, identifier!, process.env.E2E_STUDENT_PASSWORD ?? "password");

  await expect(page).toHaveURL(/\/siswa$/);
  await expect(page.getByText("Total poin")).toBeVisible();
  await expect(page.getByText("Badge saya")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Progress challenge" })).toBeVisible();
  await expect(page.getByRole("grid", { name: "Peringkat siswa dalam kelas" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
    .toBe(true);
  expect(consoleErrors).toEqual([]);
});
