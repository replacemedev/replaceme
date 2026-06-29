import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker skills", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("opens manage skills from profile", async ({ page }) => {
    await page.goto("/worker/profile");
    await page.getByRole("button", { name: "Manage" }).click();
    await expect(
      page.getByRole("heading", { name: "Manage top skills" })
    ).toBeVisible();
  });
});
