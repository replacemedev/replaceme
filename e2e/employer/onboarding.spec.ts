import { test, expect } from "@playwright/test";
import { EMPLOYER_TEST_PASSWORD, loginAsEmployer } from "./helpers/auth";

test.describe("Employer onboarding", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test("completes onboarding when gate is shown", async ({ page }) => {
    await loginAsEmployer(page);

    if (!page.url().includes("/employer/onboarding")) {
      test.skip(true, "Employer onboarding already completed for this account");
    }

    await expect(
      page.getByRole("heading", { name: "Tell us about your company" })
    ).toBeVisible();

    await page.getByLabel("Company name").fill("E2E Test Company");
    await page.getByLabel("Industry").selectOption("Technology");
    await page.getByLabel("Company size").selectOption("11–50 employees");
    await page.getByRole("button", { name: "React" }).click();
    await page.getByRole("button", { name: "Go to dashboard" }).click();

    await expect(page).toHaveURL(/\/employer\/dashboard/);
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });
});
