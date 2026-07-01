import { test, expect } from "@playwright/test";

const CREATE_WORKER_ACCOUNT = "Create Worker Account";

test.describe("Worker signup", () => {
  test("renders worker signup form with required fields", async ({ page }) => {
    await page.goto("/signup/worker");

    await expect(page.locator("#signup-username")).toBeVisible();
    await expect(page.locator("#signup-fullName")).toBeVisible();
    await expect(page.locator("#signup-email")).toBeVisible();
    await expect(page.locator("#signup-password")).toBeVisible();
    await expect(page.locator("#signup-confirmPassword")).toBeVisible();
    await expect(
      page.getByRole("button", { name: CREATE_WORKER_ACCOUNT })
    ).toBeVisible();
  });

  test("validates password confirmation mismatch", async ({ page }) => {
    await page.goto("/signup/worker");

    await page.locator("#signup-username").fill(`e2e_mismatch_${Date.now()}`);
    await page.locator("#signup-fullName").fill("E2E Mismatch Test");
    await page.locator("#signup-email").fill(`e2e_mismatch_${Date.now()}@example.com`);
    await page.locator("#signup-password").fill("replacemedev123");
    await page.locator("#signup-confirmPassword").fill("different-password");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: CREATE_WORKER_ACCOUNT }).click();

    await expect(page).toHaveURL(/\/signup\/worker/);
    await expect(page.getByText("Passwords do not match", { exact: true })).toBeVisible();
  });
});
