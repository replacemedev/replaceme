import { expect, type Page } from "@playwright/test";
import {
  WORKER_NAV_ITEMS,
  WORKER_ACCOUNT_NAV_ITEMS,
} from "../../../src/config/workerNav";

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
  await completeWorkerOnboardingIfPresent(page);
}

/** Complete worker onboarding when redirected to /worker/onboarding. */
export async function completeWorkerOnboardingIfPresent(page: Page) {
  if (!page.url().includes("/worker/onboarding")) return;

  await expect(
    page.getByRole("heading", { name: "Set up your worker profile" })
  ).toBeVisible();

  await page.getByPlaceholder("e.g. Senior React Developer").fill("E2E Worker");
  await page.getByRole("button", { name: "React" }).click();
  await page.getByRole("button", { name: "Continue to job search" }).click();

  await expect(page).toHaveURL(/\/worker\/(job-search|dashboard|jobs)/, {
    timeout: 15_000,
  });
}

/** Click primary header nav link (excludes in-page duplicates like dashboard "View All"). */
export async function clickWorkerNav(page: Page, href: string) {
  await page.locator(`header nav a[href="${href}"]`).click();
}

export async function openWorkerAccountMenu(page: Page) {
  await page.getByRole("button", { name: "User menu" }).click();
  await expect(
    page.getByRole("menu", { name: "User actions dropdown" })
  ).toBeVisible();
}

export async function clickWorkerAccountNav(page: Page, href: string) {
  await openWorkerAccountMenu(page);
  await page
    .getByRole("menu", { name: "User actions dropdown" })
    .locator(`a[href="${href}"]`)
    .click();
}

export const WORKER_PRIMARY_HREFS = WORKER_NAV_ITEMS.map((item) => item.href);
export const WORKER_ACCOUNT_HREFS = WORKER_ACCOUNT_NAV_ITEMS.map(
  (item) => item.href
);
