import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer candidate profile", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("returns not found for locked candidate without job context", async ({
    page,
  }) => {
    const fakeId = "00000000-0000-4000-8000-000000000001";
    const response = await page.goto(`/employer/candidates/${fakeId}`);
    expect(response?.status()).toBe(404);
  });

  test("returns not found when jobId missing", async ({ page }) => {
    const fakeId = "00000000-0000-4000-8000-000000000002";
    const response = await page.goto(`/employer/candidates/${fakeId}?jobId=`);
    expect(response?.status()).toBe(404);
  });

  test("applicant pipeline is reachable for job posts", async ({ page }) => {
    const title = `E2E Candidate ${Date.now()}`;
    await createEmployerJob(page, title);

    const href = await page.getByRole("link", { name: title }).getAttribute("href");
    const jobId = href!.split("/").filter(Boolean).pop();

    await page.goto(`/employer/jobs/${jobId}/applicants`);
    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
  });
});
