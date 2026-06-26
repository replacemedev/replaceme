import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

async function openFirstApplicableJob(page: import("@playwright/test").Page) {
  await page.goto("/worker/jobs");
  const cards = page.getByRole("link", { name: "View Details →" });
  const count = await cards.count();
  if (count === 0) return null;

  for (let i = 0; i < count; i++) {
    await cards.nth(i).click();
    const applyLink = page.getByRole("link", { name: "Apply for this job" });
    if ((await applyLink.count()) > 0) {
      await applyLink.click();
      return page.url();
    }
    await page.goto("/worker/jobs");
  }
  return null;
}

test.describe("Worker job apply", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("submits application or shows already-applied jobs", async ({ page }) => {
    const applyUrl = await openFirstApplicableJob(page);
    if (!applyUrl) {
      await page.goto("/worker/jobs");
      const viewDetails = page
        .getByRole("link", { name: "View Details →" })
        .first();
      if ((await viewDetails.count()) === 0) {
        test.skip(true, "No jobs in database");
      }
      await viewDetails.click();
      await expect(page.getByText("Applied", { exact: true })).toBeVisible();
      return;
    }

    const stamp = `E2E-PHASE6-${Date.now()}`;
    await page
      .getByLabel("Application Subject *")
      .fill(`Application ${stamp}`);
    await page
      .getByLabel("Cover Letter / Message *")
      .fill(`Phase 6 automated application ${stamp}`);
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page).toHaveURL(/\/worker\/applications/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: "My Applications", exact: true })
    ).toBeVisible();
  });
});
