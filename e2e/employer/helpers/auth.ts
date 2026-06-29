import { expect, type Page } from "@playwright/test";
import { E2E_PERSONAS, personaPassword } from "../../shared/personas";

/** @deprecated Use E2E_PERSONAS.employers.starter.email */
export const EMPLOYER_TEST_EMAIL =
  process.env.E2E_EMPLOYER_EMAIL ??
  E2E_PERSONAS.employers.starter.email;

/** @deprecated Use personaPassword(E2E_PERSONAS.employers.starter.passwordEnv) */
export const EMPLOYER_TEST_PASSWORD =
  process.env.E2E_EMPLOYER_PASSWORD ??
  personaPassword(E2E_PERSONAS.employers.starter.passwordEnv);

export type EmployerPlanPersona = keyof typeof E2E_PERSONAS.employers;

/** Log in as employer via /signin (email or username field). */
export async function loginAsEmployer(
  page: Page,
  email = EMPLOYER_TEST_EMAIL,
  password = EMPLOYER_TEST_PASSWORD
) {
  await page.goto("/signin");
  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();

  await page
    .getByPlaceholder("Enter your email or username")
    .fill(email);
  await page
    .getByPlaceholder("Min. 8 characters", { exact: true })
    .first()
    .fill(password);
  await page.getByRole("button", { name: "Sign In" }).click({ force: true });

  await expect(page).not.toHaveURL(/\/signin$/, { timeout: 30_000 });
}

/** Log in as a tier-specific employer persona (Discovery / Starter / Growth / Scale). */
export async function loginAsEmployerPersona(
  page: Page,
  plan: EmployerPlanPersona
) {
  const persona = E2E_PERSONAS.employers[plan];
  const password = personaPassword(persona.passwordEnv);
  if (!password) {
    throw new Error(
      `Missing ${persona.passwordEnv} — set in .env.local for E2E fixtures.`
    );
  }
  await loginAsEmployer(page, persona.email, password);
}

export const loginAsDiscoveryEmployer = (page: Page) =>
  loginAsEmployerPersona(page, "discovery");
export const loginAsStarterEmployer = (page: Page) =>
  loginAsEmployerPersona(page, "starter");
export const loginAsGrowthEmployer = (page: Page) =>
  loginAsEmployerPersona(page, "growth");
export const loginAsScaleEmployer = (page: Page) =>
  loginAsEmployerPersona(page, "scale");

/** Complete employer onboarding when redirected to /employer/onboarding. */
export async function completeEmployerOnboardingIfPresent(page: Page) {
  if (!page.url().includes("/employer/onboarding")) return;

  await expect(
    page.getByRole("heading", { name: "Tell us about your company" })
  ).toBeVisible();

  await page.getByLabel("Company name").fill("E2E Test Company");
  await page.getByLabel("Industry").selectOption("Technology");
  await page.getByLabel("Company size").selectOption("11–50 employees");
  await page.getByRole("button", { name: "React" }).click();
  await page.getByRole("button", { name: "Go to dashboard" }).click();

  await expect(page).toHaveURL(/\/employer\/dashboard/, { timeout: 15_000 });
}
