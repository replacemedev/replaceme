import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker job discovery", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
    await page.goto("/worker/jobs");
  });

  test("loads search page with jobs or empty state", async ({ page }) => {
    await expect(
      page.getByPlaceholder("Search by job title, company, or keywords...")
    ).toBeVisible({ timeout: 15_000 });
    const jobCard = page.getByRole("link", { name: "View Details →" }).first();
    const empty = page.getByRole("heading", {
      name: "No jobs found matching your criteria",
    });
    await expect(jobCard.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("keyword search filters listings", async ({ page }) => {
    const jobCard = page.getByRole("link", { name: "View Details →" }).first();
    if ((await jobCard.count()) === 0) {
      test.skip(true, "No jobs in database to filter");
    }

    const title = await page
      .locator("article h3")
      .first()
      .textContent();
    const keyword = title?.trim().split(/\s+/)[0] ?? "job";
    await page
      .getByPlaceholder("Search by job title, company, or keywords...")
      .fill(keyword);
    await page.getByRole("button", { name: "Search Jobs" }).click();
    await expect(page.locator("article h3").first()).toContainText(keyword, {
      ignoreCase: true,
    });
  });

  test("opens job detail from card", async ({ page }) => {
    const viewDetails = page.getByRole("link", { name: "View Details →" }).first();
    if ((await viewDetails.count()) === 0) {
      test.skip(true, "No jobs in database");
    }
    await viewDetails.click();
    await expect(page).toHaveURL(/\/worker\/jobs\/[^/]+$/);
  });
});
