import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer credits ledger", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("shows balance, purchase packs, and unlock history section", async ({
    page,
  }) => {
    await page.goto("/employer/credits");

    await expect(
      page.getByRole("heading", { name: "Credits", exact: true })
    ).toBeVisible();
    await expect(page.getByText("Available balance")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unlock history", exact: true })
    ).toBeVisible();
    await page.getByRole("button", { name: "+5 credits" }).click();
    await expect(page.getByText(/Added 5 credits/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("nav link reaches credits page", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await page.locator('a[href="/employer/credits"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/employer\/credits/);
  });
});
