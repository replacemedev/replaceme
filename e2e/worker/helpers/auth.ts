import { expect, type Page } from "@playwright/test";

export const WORKER_TEST_EMAIL =
  process.env.E2E_WORKER_EMAIL ?? "worker1";
export const WORKER_TEST_PASSWORD = process.env.E2E_WORKER_PASSWORD ?? "";

export async function loginAsWorker(
  page: Page,
  email = WORKER_TEST_EMAIL,
  password = WORKER_TEST_PASSWORD
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
