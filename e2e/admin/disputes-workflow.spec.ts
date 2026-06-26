import { test, expect } from "@playwright/test";
import {
  ADMIN_TEST_PASSWORD,
  loginAsAdmin,
  gotoAdminNav,
} from "./helpers/auth";

test.describe("Admin disputes workflow", () => {
  test.skip(!ADMIN_TEST_PASSWORD, "Set E2E_ADMIN_PASSWORD in .env.local");

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    if (page.url().includes("/admin/mfa-challenge")) {
      test.skip(true, "Admin MFA enrolled — complete challenge manually or disable for E2E");
    }
  });

  test("loads disputes queue from sidebar", async ({ page }) => {
    await gotoAdminNav(page, "Disputes");
    await expect(page).toHaveURL(/\/admin\/disputes$/);
    await expect(
      page.getByRole("heading", { name: "Disputes", exact: true })
    ).toBeVisible();
  });

  test("shows queue or empty state", async ({ page }) => {
    await page.goto("/admin/disputes");
    const empty = page.getByRole("heading", { name: "No disputes filed" });
    const queue = page.getByRole("heading", { name: "Mediation queue", exact: true });
    await expect(empty.or(queue)).toBeVisible();
  });

  test("filter pills render when disputes exist", async ({ page }) => {
    await page.goto("/admin/disputes");
    const queue = page.getByRole("heading", { name: "Mediation queue", exact: true });
    if (!(await queue.isVisible())) return;
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open" })).toBeVisible();
  });
});
