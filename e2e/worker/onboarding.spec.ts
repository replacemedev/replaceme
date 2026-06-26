import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker onboarding", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test("skips when worker profile is already complete", async ({ page }) => {
    await loginAsWorker(page);
    if (page.url().includes("/worker/onboarding")) {
      test.skip(true, "Worker onboarding not complete — use fresh account");
    }
    await page.goto("/worker/dashboard");
    await expect(page).toHaveURL(/\/worker\/dashboard/);
  });
});
