import { expect, test, type Page } from "@playwright/test";

const studentIdentifier = process.env.E2E_STUDENT_IDENTIFIER;
const studentPassword = process.env.E2E_STUDENT_PASSWORD ?? "password";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("Masukkan email atau ID").fill(studentIdentifier!);
  await page.getByPlaceholder("Masukkan kata sandi").fill(studentPassword);
  await page.getByRole("button", { name: /masuk/i }).click();
  await expect(page).toHaveURL(/\/siswa(?:\/)?$/);
}

test.describe("physical activity recorder shell", () => {
  test.skip(
    !studentIdentifier,
    "E2E_STUDENT_IDENTIFIER is required for student verification."
  );

  for (const viewport of [
    { name: "mobile-375", width: 375, height: 812 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`${viewport.name} menampilkan idle state tanpa horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await login(page);
      await page.goto("/siswa/challenges/1/physical-activity");

      await expect(
        page.getByRole("heading", { name: "Tantangan fisik" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /mulai merekam/i })
      ).toBeVisible();
      await expect(page.getByText("Dioptimalkan untuk mobile")).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );

      expect(hasHorizontalOverflow).toBe(false);
    });
  }
});
