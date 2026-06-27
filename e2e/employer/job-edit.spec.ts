import { test, expect } from "@playwright/test";
import {
  loginAsStarterEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";
import { createEmployerJob } from "./helpers/jobs";

test.describe("Employer job edit", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("edits an existing job post", async ({ page }) => {
    const title = `E2E Edit Before ${Date.now()}`;
    const updatedTitle = `E2E Edit After ${Date.now()}`;
    await createEmployerJob(page, title);

    const jobLink = page.getByRole("link", { name: title });
    await expect(jobLink).toBeVisible();
    const href = await jobLink.getAttribute("href");
    const jobId = href!.split("/").filter(Boolean).pop();

    await page.goto(`/employer/jobs/${jobId}`);
    await page.getByRole("link", { name: "Edit Job" }).click();

    await expect(
      page.getByRole("heading", { name: "Edit Job Post" })
    ).toBeVisible();

    await page.getByPlaceholder(/Senior Full-Stack/i).fill(updatedTitle);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/employer/jobs/${jobId}`), {
      timeout: 30_000,
    });
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible({
      timeout: 15_000,
    });
  });
});
