import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker job detail", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
    await page.goto("/worker/jobs");
  });

  test("shows hero and apply or applied state", async ({ page }) => {
    const viewDetails = page.getByRole("link", { name: "View Details →" }).first();
    if ((await viewDetails.count()) === 0) {
      test.skip(true, "No jobs in database");
    }
    await viewDetails.click();
    await expect(page.locator("main h1").first()).toBeVisible();

    const applyLink = page.getByRole("link", { name: "Apply for this job" });
    const appliedBadge = page.getByText("Applied", { exact: true });
    await expect(applyLink.or(appliedBadge)).toBeVisible();
  });

  test("apply link navigates to application form", async ({ page }) => {
    const viewDetails = page.getByRole("link", { name: "View Details →" }).first();
    if ((await viewDetails.count()) === 0) {
      test.skip(true, "No jobs in database");
    }
    await viewDetails.click();

    const applyLink = page.getByRole("link", { name: "Apply for this job" });
    if ((await applyLink.count()) === 0) {
      test.skip(true, "Already applied to visible job");
    }
    await applyLink.click();
    await expect(page).toHaveURL(/\/worker\/jobs\/[^/]+\/apply$/);
    await expect(
      page.getByRole("heading", { name: "Job Application" })
    ).toBeVisible();
  });
});
