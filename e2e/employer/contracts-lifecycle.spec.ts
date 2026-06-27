import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer contract lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads hired workers and contract management when present", async ({
    page,
  }) => {
    await page.goto("/employer/hired");
    await expect(page.getByText(/Hired|workers/i).first()).toBeVisible();

    const viewContract = page.getByRole("link", { name: "View Contract" }).first();
    if (await viewContract.isVisible()) {
      await viewContract.click();
      await expect(page).toHaveURL(/\/employer\/contracts\//);
      await expect(
        page.getByRole("heading", { name: "Manage contract" })
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
    }
  });

  test("nav reaches hired from header", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await page.locator('a[href="/employer/hired"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/employer\/hired/);
  });
});
