import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer applicant kanban", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("shows kanban pipeline columns", async ({ page }) => {
    const title = `E2E Kanban ${Date.now()}`;
    await createEmployerJob(page, title);

    const jobLink = page.getByRole("link", { name: title });
    const href = await jobLink.getAttribute("href");
    const jobId = href!.split("/").filter(Boolean).pop();

    await page.goto(`/employer/jobs/${jobId}/applicants`);
    await page.getByRole("button", { name: "Kanban" }).click();

    await expect(page.getByTestId("applicant-kanban")).toBeVisible();
    await expect(page.getByLabel("New")).toBeVisible();
    await expect(page.getByLabel("Interview")).toBeVisible();
    await expect(page.getByLabel("Hired")).toBeVisible();
  });
});
