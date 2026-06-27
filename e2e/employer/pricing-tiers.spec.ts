import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer pricing — 4 tiers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("pricing page lists Discovery, Starter, Growth, and Scale", async ({
    page,
  }) => {
    await page.goto("/employer/pricing");

    await expect(
      page.getByRole("heading", {
        name: /Scale Your Remote Team/i,
      })
    ).toBeVisible();

    for (const tier of ["Discovery", "Starter", "Growth", "Scale"]) {
      await expect(
        page.locator("h3").filter({ hasText: new RegExp(`^${tier}`, "i") })
      ).toBeVisible();
    }

    await expect(page.getByText("$0", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("$19", { exact: true })).toBeVisible();
    await expect(page.getByText("$39", { exact: true })).toBeVisible();
    await expect(page.getByText("$79", { exact: true })).toBeVisible();
  });

  test("dashboard shows plan usage card", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await expect(page.getByText(/Subscription Benefits & Usage/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
