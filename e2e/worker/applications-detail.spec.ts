import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker application detail", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("navigates from applications list to detail", async ({ page }) => {
    await page.goto("/worker/applications");
    await expect(
      page.getByRole("heading", { name: "My Applications", exact: true })
    ).toBeVisible({ timeout: 15_000 });

    const viewDetails = page.getByRole("link", { name: "View Details" }).first();
    if ((await viewDetails.count()) === 0) {
      await expect(
        page.getByRole("heading", { name: "No applications sent yet" })
      ).toBeVisible();
      return;
    }

    await viewDetails.click();
    await expect(page).toHaveURL(/\/worker\/applications\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
