import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker saved jobs", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("bookmarks a job and lists it on saved jobs", async ({ page }) => {
    await page.goto("/worker/jobs");
    const viewDetails = page.getByRole("link", { name: "View Details →" }).first();
    if ((await viewDetails.count()) === 0) {
      test.skip(true, "No jobs in database");
    }

    const saveButton = page.getByRole("button", { name: "Save job" }).first();
    if ((await saveButton.count()) === 0) {
      const removeButton = page.getByRole("button", { name: "Remove bookmark" }).first();
      if ((await removeButton.count()) > 0) {
        await removeButton.click();
        await page.waitForTimeout(500);
      }
    }

    await page.getByRole("button", { name: "Save job" }).first().click();
    await page.waitForTimeout(800);

    await page.goto("/worker/saved-jobs");
    await expect(
      page.getByRole("heading", { name: "Saved Jobs" })
    ).toBeVisible();
    await expect(page.locator("article, li").first()).toBeVisible();
  });
});
