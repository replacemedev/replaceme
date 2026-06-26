import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker messages", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads messaging center", async ({ page }) => {
    await page.goto("/worker/messages");
    await expect(page.getByText("Inbox")).toBeVisible({ timeout: 15_000 });
  });
});
