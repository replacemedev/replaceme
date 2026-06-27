import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer notifications", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads notifications inbox", async ({ page }) => {
    await page.goto("/employer/notifications");

    await expect(
      page.getByRole("heading", { name: "Notifications", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No notifications" })
    ).toBeVisible();
  });

  test("nav link reaches notifications page", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await page.getByRole("link", { name: "Notifications" }).click();
    await expect(page).toHaveURL(/\/employer\/notifications/);
  });
});
