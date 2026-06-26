import { test, expect } from "@playwright/test";

test.describe("Public pricing", () => {
  test("loads from header nav", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(
      page.getByRole("heading", { name: /Simple, Transparent Pricing/i })
    ).toBeVisible();
  });
});
