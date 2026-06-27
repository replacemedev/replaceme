import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer offer and hire", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads hired workers page from nav", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await page.locator('a[href="/employer/hired"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/employer\/hired/);
    await expect(page.getByText(/Hired|workers/i).first()).toBeVisible();
  });

  test("applicant pipeline exposes hiring actions when empty", async ({
    page,
  }) => {
    const title = `E2E Offer ${Date.now()}`;
    await createEmployerJob(page, title);

    const href = await page.getByRole("link", { name: title }).getAttribute("href");
    const jobId = href!.split("/").filter(Boolean).pop();

    await page.goto(`/employer/jobs/${jobId}/applicants`);
    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kanban" })).toBeVisible();
  });
});
