import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer post-hire reviews", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads reviews page", async ({ page }) => {
    await page.goto("/employer/reviews");

    await expect(
      page.getByRole("heading", { name: "Worker reviews", exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(/Leave a review|No hires to review yet|All hired workers/i)
    ).toBeVisible();
  });

  test("nav link reaches reviews page", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await page.locator('a[href="/employer/reviews"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/employer\/reviews/);
  });
});
