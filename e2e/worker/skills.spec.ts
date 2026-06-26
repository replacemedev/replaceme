import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker skills", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads manage skills page", async ({ page }) => {
    await page.goto("/worker/skills/edit");
    await expect(
      page.getByRole("heading", { name: "Manage Skills" })
    ).toBeVisible();
  });
});
