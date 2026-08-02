import { expect, test } from "@playwright/test";

test("landing page reveals the hero and stays within the viewport", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Tetap Semangat Belajar Bersama EduQuest",
    }),
  ).toBeVisible();
  await expect(page.locator("[data-marketing-reveal]").first()).toHaveCSS(
    "opacity",
    "1",
  );

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});
