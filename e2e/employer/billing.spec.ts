import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer billing & pricing", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("pricing page shows plan headline", async ({ page }) => {
    await page.goto("/employer/pricing");

    await expect(
      page.getByRole("heading", {
        name: /Scale Your Remote Team/i,
      })
    ).toBeVisible();
    await expect(
      page.getByText(/Simple, Transparent Pricing/i)
    ).toBeVisible();
  });

  test("account settings shows subscription management section", async ({
    page,
  }) => {
    await page.goto("/employer/settings/account");

    await expect(
      page.getByRole("heading", { name: "Account Settings" })
    ).toBeVisible();
    await expect(
      page.getByText(/Manage your profile, security, and subscription plan/i)
    ).toBeVisible();
    await expect(page.getByText(/My Account/i)).toBeVisible();
  });
});
