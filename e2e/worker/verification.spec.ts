import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker verification", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads verification page", async ({ page }) => {
    await page.goto("/worker/verification");
    await expect(
      page.getByRole("heading", { name: "Worker Verification" })
    ).toBeVisible();
  });
});
