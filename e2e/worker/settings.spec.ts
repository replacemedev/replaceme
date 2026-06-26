import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker settings", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads settings and saves availability", async ({ page }) => {
    await page.goto("/worker/settings");
    await expect(
      page.getByRole("heading", { name: "Account Settings" })
    ).toBeVisible();

    await page.getByLabel("Availability").selectOption("Part-time");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Settings saved")).toBeVisible({
      timeout: 10_000,
    });
  });
});
