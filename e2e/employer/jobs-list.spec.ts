import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer jobs list", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads /employer/jobs without 404", async ({ page }) => {
    await page.goto("/employer/jobs");

    await expect(page).toHaveURL(/\/employer\/jobs$/);
    await expect(
      page.getByRole("heading", { name: "Your Job Posts" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Post a New Job" })
    ).toBeVisible();
  });
});
