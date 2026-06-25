import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer jobs list", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
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
