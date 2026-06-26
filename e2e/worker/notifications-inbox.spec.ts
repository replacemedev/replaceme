import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker notifications inbox", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads notifications page", async ({ page }) => {
    await page.goto("/worker/notifications");
    await expect(
      page.getByRole("heading", { name: "Notifications", level: 1 })
    ).toBeVisible();
  });
});
