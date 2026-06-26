import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker profile edit", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads edit profile form and saves", async ({ page }) => {
    await page.goto("/worker/profile/edit");
    await expect(
      page.getByRole("heading", { name: "Edit Profile" })
    ).toBeVisible();

    await page.getByLabel("Bio").fill("E2E profile bio update");
    await page.getByRole("button", { name: "Save Profile" }).click();

    await expect(page).toHaveURL(/\/worker\/profile/, { timeout: 15_000 });
  });
});
