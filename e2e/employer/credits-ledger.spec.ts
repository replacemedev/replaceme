import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer credits (deprecated)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("legacy /employer/credits redirects to subscription settings", async ({
    page,
  }) => {
    await page.goto("/employer/credits");
    await expect(page).toHaveURL(/\/employer\/settings\/account/, {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: "Account Settings" })
    ).toBeVisible();
  });
});
