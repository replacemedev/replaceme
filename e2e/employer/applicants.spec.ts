import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer applicant pipeline", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("loads applicant pipeline and toggles card/table views", async ({ page }) => {
    const title = `E2E Applicants ${Date.now()}`;
    await createEmployerJob(page, title);

    const jobLink = page.getByRole("link", { name: title });
    await expect(jobLink).toBeVisible();
    const href = await jobLink.getAttribute("href");
    expect(href).toBeTruthy();

    const jobId = href!.split("/").filter(Boolean).pop();
    await page.goto(`/employer/jobs/${jobId}/applicants`);

    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: `Job: ${title}` })
    ).toBeVisible();
    await expect(page.getByText(/Applicants Active/i)).toBeVisible();
    await expect(page.getByText(/Credits Remaining/i)).toBeVisible();

    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByRole("button", { name: "Table" })).toHaveClass(
      /bg-\[#10b981\]/
    );

    await page.getByRole("button", { name: "Cards" }).click();
    await expect(page.getByRole("button", { name: "Cards" })).toHaveClass(
      /bg-\[#10b981\]/
    );
  });
});
