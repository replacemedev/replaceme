import { test, expect } from "@playwright/test";
import {
  EMPLOYER_TEST_EMAIL,
  EMPLOYER_TEST_PASSWORD,
  loginAsEmployer,
} from "./helpers/auth";

test.describe("Employer login", () => {
  test.skip(
    !EMPLOYER_TEST_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for live employer auth"
  );

  test("signs in with email and leaves the login page", async ({ page }) => {
    await loginAsEmployer(page);

    await expect(page).not.toHaveURL(/\/signin$/);
    await expect(page.url()).toMatch(/\/employer\//);
  });

  test("signs in with username", async ({ page }) => {
    await page.goto("/signin");
    await page.getByPlaceholder("Enter your email or username").fill("replacemedev");
    await page
      .getByPlaceholder("Min. 8 characters", { exact: true })
      .first()
      .fill(EMPLOYER_TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).not.toHaveURL(/\/signin$/);
    await expect(page.url()).toMatch(/\/employer\//);
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/signin");
    await page
      .getByPlaceholder("Enter your email or username")
      .fill(EMPLOYER_TEST_EMAIL);
    await page
      .getByPlaceholder("Min. 8 characters", { exact: true })
      .first()
      .fill("not-the-real-password-xyz");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/\/signin$/);
    await expect(
      page.getByText(/Invalid email, username, or password/i)
    ).toBeVisible();
  });
});
