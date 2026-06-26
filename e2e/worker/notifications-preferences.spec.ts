import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker notification preferences", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads preferences and saves toggles", async ({ page }) => {
    await page.goto("/worker/settings/notifications");

    await expect(
      page.getByRole("heading", { name: "Notification preferences", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /View notification history/i })
    ).toBeVisible();

    await page
      .getByRole("switch", { name: "Email: application updates" })
      .click();
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByText("Preferences saved")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("reachable from account settings", async ({ page }) => {
    await page.goto("/worker/settings");
    await page.getByRole("link", { name: /Notification preferences/i }).click();
    await expect(page).toHaveURL(/\/worker\/settings\/notifications/);
  });
});
