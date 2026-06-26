import { test, expect } from "@playwright/test";
import { ADMIN_TEST_PASSWORD, loginAsAdmin, gotoAdminNav } from "./helpers/auth";

test.describe("Admin messaging moderation", () => {
  test.skip(!ADMIN_TEST_PASSWORD, "Set E2E_ADMIN_PASSWORD in .env.local");

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    if (page.url().includes("/admin/mfa-challenge")) {
      test.skip(true, "Admin MFA challenge required");
    }
  });

  test("loads moderation page from sidebar", async ({ page }) => {
    await gotoAdminNav(page, "Moderation");
    await expect(page).toHaveURL(/\/admin\/moderation$/);
    await expect(
      page.getByRole("heading", { name: "Messaging Moderation", exact: true })
    ).toBeVisible();
  });

  test("shows threads table or empty state", async ({ page }) => {
    await page.goto("/admin/moderation");
    const empty = page.getByText("No messaging threads");
    const table = page.getByText("Messaging threads");
    await expect(empty.or(table)).toBeVisible();
  });
});
