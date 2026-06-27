import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer billing & pricing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
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
