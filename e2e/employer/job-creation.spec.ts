import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer job creation", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("creates a job via standard review path", async ({ page }) => {
    const title = `E2E Job ${Date.now()}`;
    await createEmployerJob(page, title);

    await expect(
      page.getByRole("heading", { name: "Your Job Posts" })
    ).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });
});
