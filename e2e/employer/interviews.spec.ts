import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer interviews", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads interviews inbox", async ({ page }) => {
    await page.goto("/employer/interviews");

    await expect(
      page.getByRole("heading", { name: "Interviews", exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(/No interviews scheduled|Scheduled:/i)
    ).toBeVisible();
  });

  test("nav link reaches interviews page", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await page.getByRole("link", { name: "Interviews" }).click();
    await expect(page).toHaveURL(/\/employer\/interviews/);
  });
});
