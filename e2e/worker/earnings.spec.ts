import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker earnings", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads earnings page", async ({ page }) => {
    await page.goto("/worker/earnings");
    await expect(
      page.getByRole("heading", { name: "Earnings", level: 1 })
    ).toBeVisible();
  });
});
