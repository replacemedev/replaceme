import { test, expect } from "@playwright/test";

/**
 * Public pricing — 4-tier structure:
 * Discovery $0 · Starter $19 · Growth $39 · Scale $79
 */
test.describe("Public pricing", () => {
  test("loads from header nav", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(
      page.getByRole("heading", { name: /Simple, Transparent Pricing/i })
    ).toBeVisible();
  });

  test("shows four-tier employer plans", async ({ page }) => {
    await page.goto("/pricing");

    const tierHeadings = page.locator("h3");
    await expect(tierHeadings.filter({ hasText: /^Discovery/i })).toBeVisible();
    await expect(tierHeadings.filter({ hasText: /^Starter/i })).toBeVisible();
    await expect(tierHeadings.filter({ hasText: /^Growth/i })).toBeVisible();
    await expect(tierHeadings.filter({ hasText: /^Scale/i })).toBeVisible();

    await expect(page.getByText("$0", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("$19", { exact: true })).toBeVisible();
    await expect(page.getByText("$39", { exact: true })).toBeVisible();
    await expect(page.getByText("$79", { exact: true })).toBeVisible();
  });

  test("highlights Growth as most popular", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/Most Popular/i)).toBeVisible();
  });
});
