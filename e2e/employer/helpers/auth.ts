import { expect, type Page } from "@playwright/test";

export const EMPLOYER_TEST_EMAIL =
  process.env.E2E_EMPLOYER_EMAIL ?? "replacemedev@gmail.com";
/** Set E2E_EMPLOYER_PASSWORD in .env.local — no default; tests skip when unset. */
export const EMPLOYER_TEST_PASSWORD = process.env.E2E_EMPLOYER_PASSWORD ?? "";

/** Log in as employer via /login (email or username field). */
export async function loginAsEmployer(
  page: Page,
  email = EMPLOYER_TEST_EMAIL,
  password = EMPLOYER_TEST_PASSWORD
) {
  await page.goto("/login");
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
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

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

  await expect(page).toHaveURL(/\/employer\/dashboard/);
}
