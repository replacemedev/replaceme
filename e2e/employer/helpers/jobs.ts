import { expect, type Page } from "@playwright/test";

/** Fill and submit the employer job creation form (standard / free review path). */
export async function createEmployerJob(
  page: Page,
  title: string,
  options?: { skill?: string }
) {
  await page.goto("/employer/jobs/create");
  await expect(
    page.getByRole("heading", { name: "Create a Job Post" })
  ).toBeVisible();

  await page
    .getByPlaceholder(/Senior Full-Stack/i)
    .fill(title);
  await page.locator("select").first().selectOption({ index: 1 });
  await page
    .getByPlaceholder(/Describe the responsibilities/i)
    .fill(
      "E2E automated job description with enough characters for validation."
    );
  await page.getByRole("button", { name: options?.skill ?? "React" }).click();
  await page.getByRole("button", { name: "Submit with Free Review" }).click();

  await expect(page).toHaveURL(/\/employer\/dashboard/, { timeout: 30_000 });
  await expect(page.getByText(title, { exact: false })).toBeVisible({
    timeout: 15_000,
  });
}
