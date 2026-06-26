import { test, expect } from "@playwright/test";

test.describe("Public company directory", () => {
  test("loads from footer link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Browse Companies" }).click();
    await expect(page).toHaveURL(/\/companies$/);
    await expect(
      page.getByRole("heading", { name: "Company Directory", exact: true })
    ).toBeVisible();
  });
});
