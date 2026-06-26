import { test, expect } from "@playwright/test";

test.describe("Public help center", () => {
  test("loads help center and hiring guide", async ({ page }) => {
    await page.goto("/help");
    await expect(
      page.getByRole("heading", { name: "Help Center", exact: true })
    ).toBeVisible();

    await page.getByRole("link", { name: "Employer Hiring Guide" }).click();
    await expect(page).toHaveURL(/\/help\/hiring-guide$/);
    await expect(
      page.getByRole("heading", { name: "Employer Hiring Guide", exact: true })
    ).toBeVisible();
  });
});
