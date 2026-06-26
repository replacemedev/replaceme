import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker job alerts", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("creates a job alert", async ({ page }) => {
    await page.goto("/worker/job-alerts");
    await expect(
      page.getByRole("heading", { name: "Job Alerts" })
    ).toBeVisible();

    const stamp = `E2E-${Date.now()}`;
    await page.getByLabel("Label").fill(`Alert ${stamp}`);
    await page.getByLabel("Search keywords").fill("react developer");
    await page.getByRole("button", { name: "Save alert" }).click();
    await expect(page.getByText("Job alert created")).toBeVisible({
      timeout: 10_000,
    });
  });
});
