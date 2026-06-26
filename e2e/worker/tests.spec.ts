import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker skill assessments", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads skill assessments page", async ({ page }) => {
    await page.goto("/worker/tests");
    await expect(
      page.getByRole("heading", { name: "Skill Assessments" })
    ).toBeVisible();
  });
});
