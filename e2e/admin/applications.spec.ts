import { test, expect } from "@playwright/test";
import { ADMIN_TEST_PASSWORD, loginAsAdmin, gotoAdminNav } from "./helpers/auth";

test.describe("Admin applications oversight", () => {
  test.skip(!ADMIN_TEST_PASSWORD, "Set E2E_ADMIN_PASSWORD in .env.local");

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    if (page.url().includes("/admin/mfa-challenge")) {
      test.skip(true, "Admin MFA challenge required");
    }
  });

  test("loads applications page from sidebar", async ({ page }) => {
    await gotoAdminNav(page, "Applications");
    await expect(page).toHaveURL(/\/admin\/applications$/);
    await expect(
      page.getByRole("heading", { name: "Applications", exact: true })
    ).toBeVisible();
  });

  test("shows table or empty state", async ({ page }) => {
    await page.goto("/admin/applications");
    const empty = page.getByText("No applications yet");
    const table = page.getByText("Platform applications");
    await expect(empty.or(table)).toBeVisible();
  });
});
