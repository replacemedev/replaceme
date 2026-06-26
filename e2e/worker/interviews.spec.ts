import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker interviews", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads interviews page", async ({ page }) => {
    await page.goto("/worker/interviews");
    await expect(
      page.getByRole("heading", { name: "Interviews", exact: true })
    ).toBeVisible();
  });
});
