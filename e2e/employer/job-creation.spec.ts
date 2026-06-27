import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer job creation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
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
