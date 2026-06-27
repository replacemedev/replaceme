import { test, expect } from "@playwright/test";

/**
 * Homepage pricing teaser — must match 4-tier DB (no legacy $30 Standard Plan).
 */
test.describe("Homepage pricing teaser", () => {
  test("shows four tiers and no legacy $30 plan", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Simple, Transparent Pricing")).toBeVisible();
    await expect(page.getByText("$0", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("$19", { exact: true })).toBeVisible();
    await expect(page.getByText("$39", { exact: true })).toBeVisible();
    await expect(page.getByText("$79", { exact: true })).toBeVisible();

    await expect(page.getByText(/Standard Plan/i)).toHaveCount(0);
    await expect(page.getByText(/\$30/)).toHaveCount(0);
  });

  test("compare all plans links to public pricing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Compare all plans/i }).click();
    await expect(page).toHaveURL(/\/pricing$/);
  });
});
