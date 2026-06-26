import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker dashboard", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads greeting and key sections", async ({ page }) => {
    await page.goto("/worker/dashboard");
    await expect(page.getByRole("heading", { name: /Hello,/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Messages" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recommended for You" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Quick Actions" })
    ).toBeVisible();
  });
});
