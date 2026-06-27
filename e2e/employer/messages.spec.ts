import { test, expect } from "@playwright/test";
import { FIXTURE_THREADS, employerMessagesPath } from "../shared/fixtures";
import {
  loginAsDiscoveryEmployer,
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

test.describe("Employer messaging by tier", () => {
  test("Discovery employer sees blocked thread banner", async ({ page }) => {
    await loginAsDiscoveryEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
    await page.goto(employerMessagesPath(FIXTURE_THREADS.discoveryBlocked));

    await expect(page.getByText("Messaging unavailable")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("Starter employer can open active thread", async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
    await page.goto(employerMessagesPath(FIXTURE_THREADS.starterWorker1));

    await expect(page.getByText("Messaging unavailable")).toHaveCount(0);
    await expect(page.getByText(/Tuesday or Wednesday/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
