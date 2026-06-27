import { expect, type Page } from "@playwright/test";
import {
  WORKER_NAV_ITEMS,
  WORKER_ACCOUNT_NAV_ITEMS,
} from "../../../src/config/workerNav";
import { E2E_PERSONAS, personaPassword } from "../../shared/personas";

/** @deprecated Use E2E_PERSONAS.workers.maya.email */
export const WORKER_TEST_EMAIL =
  process.env.E2E_WORKER_EMAIL ?? E2E_PERSONAS.workers.maya.email;

/** @deprecated Use personaPassword(E2E_PERSONAS.workers.maya.passwordEnv) */
export const WORKER_TEST_PASSWORD =
  process.env.E2E_WORKER_PASSWORD ??
  personaPassword(E2E_PERSONAS.workers.maya.passwordEnv);

export type WorkerPersona = keyof typeof E2E_PERSONAS.workers;

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

export async function loginAsWorkerPersona(page: Page, persona: WorkerPersona) {
  const creds = E2E_PERSONAS.workers[persona];
  const password = personaPassword(creds.passwordEnv);
  if (!password) {
    throw new Error(
      `Missing ${creds.passwordEnv} — set in .env.local for E2E fixtures.`
    );
  }
  await loginAsWorker(page, creds.email, password);
}

export const loginAsMaya = (page: Page) => loginAsWorkerPersona(page, "maya");
export const loginAsJames = (page: Page) => loginAsWorkerPersona(page, "james");
export const loginAsSofia = (page: Page) => loginAsWorkerPersona(page, "sofia");

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
