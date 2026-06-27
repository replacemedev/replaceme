import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer pipeline navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("job detail View Pipeline reaches applicants", async ({ page }) => {
    const title = `E2E Pipeline Nav ${Date.now()}`;
    await createEmployerJob(page, title);

    const jobHref = await page.getByRole("link", { name: title }).getAttribute("href");
    const jobId = jobHref!.split("/").filter(Boolean).pop();

    await page.goto(`/employer/jobs/${jobId}`);
    await page.getByRole("link", { name: "View Pipeline" }).click();

    await expect(page).toHaveURL(new RegExp(`/employer/jobs/${jobId}/applicants/?$`));
    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
  });

  test("performance View Candidates reaches applicants", async ({ page }) => {
    const title = `E2E Perf Nav ${Date.now()}`;
    await createEmployerJob(page, title);

    const jobHref = await page.getByRole("link", { name: title }).getAttribute("href");
    const jobId = jobHref!.split("/").filter(Boolean).pop();

    await page.goto(`/employer/jobs/${jobId}`);
    await page.getByRole("link", { name: "View Candidates" }).click();

    await expect(page).toHaveURL(new RegExp(`/employer/jobs/${jobId}/applicants/?$`));
    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
  });

  test("job card APPLICANTS link reaches pipeline", async ({ page }) => {
    const title = `E2E Card Nav ${Date.now()}`;
    await createEmployerJob(page, title);

    await page.getByRole("link", { name: "APPLICANTS" }).first().click();

    await expect(page).toHaveURL(/\/employer\/jobs\/[^/]+\/applicants\/?$/);
    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
    await expect(page.getByRole("heading", { name: `Job: ${title}` })).toBeVisible();
  });

  test("pinned View Profile uses employer candidate route", async ({ page }) => {
    await page.goto("/employer/pinned");
    const viewProfile = page.getByRole("link", { name: "View Profile" }).first();

    if ((await viewProfile.count()) === 0) {
      test.skip(true, "No pinned workers in database");
    }

    const href = await viewProfile.getAttribute("href");
    expect(href).toMatch(/^\/employer\/candidates\/[^/]+/);
    expect(href).not.toMatch(/^\/workers\//);
  });
});
