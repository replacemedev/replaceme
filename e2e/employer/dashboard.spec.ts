import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("shows welcome message and job posts section", async ({ page }) => {
    await page.goto("/employer/dashboard");

    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Your Job Posts" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Post a New Job" })
    ).toBeVisible();

    await page.getByRole("link", { name: "View All" }).click();
    await expect(page).toHaveURL(/\/employer\/jobs$/);
  });
});
