import { expect, type Page } from "@playwright/test";

export const ADMIN_TEST_EMAIL =
  process.env.E2E_ADMIN_EMAIL ?? "replacemeadmin@example.com";
export const ADMIN_TEST_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

export async function loginAsAdmin(
  page: Page,
  email = ADMIN_TEST_EMAIL,
  password = ADMIN_TEST_PASSWORD
) {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();

  await page.getByPlaceholder("Enter your email or username").fill(email);
  await page
    .getByPlaceholder("Min. 8 characters", { exact: true })
    .first()
    .fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

export async function gotoAdminNav(page: Page, label: string) {
  await page.getByRole("link", { name: label, exact: true }).click();
}
