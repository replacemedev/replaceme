import { expect, type Page } from "@playwright/test";
import { E2E_PERSONAS, personaPassword } from "../../shared/personas";

/** @deprecated Use E2E_PERSONAS.admins.moderator.email */
export const ADMIN_TEST_EMAIL =
  process.env.E2E_ADMIN_EMAIL ?? E2E_PERSONAS.admins.moderator.email;

/** @deprecated Use personaPassword(E2E_PERSONAS.admins.moderator.passwordEnv) */
export const ADMIN_TEST_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD ??
  personaPassword(E2E_PERSONAS.admins.moderator.passwordEnv);

export type AdminPersona = keyof typeof E2E_PERSONAS.admins;

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
  await page.getByRole("button", { name: "Sign In" }).click({ force: true });

  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

export async function loginAsAdminPersona(page: Page, persona: AdminPersona) {
  const creds = E2E_PERSONAS.admins[persona];
  const password = personaPassword(creds.passwordEnv);
  if (!password) {
    throw new Error(
      `Missing ${creds.passwordEnv} — set in .env.local for E2E fixtures.`
    );
  }
  await loginAsAdmin(page, creds.email, password);
}

export const loginAsModeratorAdmin = (page: Page) =>
  loginAsAdminPersona(page, "moderator");
export const loginAsSuperadmin = (page: Page) =>
  loginAsAdminPersona(page, "superadmin");

export async function gotoAdminNav(page: Page, label: string) {
  await page.getByRole("link", { name: label, exact: true }).click();
}
