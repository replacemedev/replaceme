import { test, expect } from "@playwright/test";
import { ADMIN_TEST_PASSWORD, loginAsAdmin, gotoAdminNav } from "./helpers/auth";

test.describe("Admin billing ops", () => {
  test.skip(!ADMIN_TEST_PASSWORD, "Set E2E_ADMIN_PASSWORD in .env.local");

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    if (page.url().includes("/admin/mfa-challenge")) {
      test.skip(true, "Admin MFA challenge required");
    }
  });

  test("loads billing ops from sidebar", async ({ page }) => {
    await gotoAdminNav(page, "Billing Ops");
    await expect(page).toHaveURL(/\/admin\/billing-ops$/);
    await expect(
      page.getByRole("heading", { name: "Billing Operations", exact: true })
    ).toBeVisible();
  });

  test("shows ledger or empty state", async ({ page }) => {
    await page.goto("/admin/billing-ops");
    const empty = page.getByRole("heading", { name: "No billing records" });
    const ops = page.getByRole("heading", { name: "Billing operations", exact: true });
    await expect(empty.or(ops)).toBeVisible();
  });

  test("override usage control when subscriptions exist", async ({ page }) => {
    await page.goto("/admin/billing-ops");
    const overrideBtn = page.getByRole("button", { name: "Override usage" }).first();
    if ((await overrideBtn.count()) === 0) return;
    await overrideBtn.click();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });
});
