import { test, expect } from "@playwright/test";

test.describe("Public job board", () => {
  test("loads job board from header nav", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Browse Jobs", exact: true }).first().click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(
      page.getByRole("heading", { name: "Browse Jobs", exact: true })
    ).toBeVisible();
  });

  test("job detail shows signup CTA when jobs exist", async ({ page }) => {
    await page.goto("/jobs");
    const jobLink = page.locator('a[href^="/jobs/"]').first();
    if ((await jobLink.count()) === 0) {
      await expect(
        page.getByText("No active jobs posted yet")
      ).toBeVisible();
      return;
    }
    await jobLink.click();
    await expect(page.getByRole("link", { name: "Sign up to apply" })).toBeVisible();
  });
});
