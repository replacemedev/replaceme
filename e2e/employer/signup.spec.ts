import { test, expect } from "@playwright/test";

const EMPLOYER_EMAIL =
  process.env.E2E_EMPLOYER_EMAIL ?? "replacemedev@gmail.com";
const EMPLOYER_PASSWORD = process.env.E2E_EMPLOYER_PASSWORD ?? "";

test.describe("Employer signup", () => {
  test("renders employer signup form with required fields", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "I want to Hire" }).click();

    await expect(page.locator("#signup-username")).toBeVisible();
    await expect(page.locator("#signup-fullName")).toBeVisible();
    await expect(page.locator("#signup-email")).toBeVisible();
    await expect(page.locator("#signup-password")).toBeVisible();
    await expect(page.locator("#signup-confirmPassword")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("validates password confirmation mismatch", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "I want to Hire" }).click();

    await page.locator("#signup-username").fill(`e2e_mismatch_${Date.now()}`);
    await page.locator("#signup-fullName").fill("E2E Mismatch Test");
    await page.locator("#signup-email").fill(`e2e_mismatch_${Date.now()}@example.com`);
    await page.locator("#signup-password").fill("replacemedev123");
    await page.locator("#signup-confirmPassword").fill("different-password");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByText("Passwords do not match", { exact: true })).toBeVisible();
  });

  test.skip(
    !EMPLOYER_PASSWORD,
    "Set E2E_EMPLOYER_PASSWORD for duplicate-email signup guard test"
  );

  test("blocks duplicate email registration for existing employer account", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "I want to Hire" }).click();

    await page.locator("#signup-username").fill(`e2e_dup_${Date.now()}`);
    await page.locator("#signup-fullName").fill("E2E Duplicate Test");
    await page.locator("#signup-email").fill(EMPLOYER_EMAIL);
    await page.locator("#signup-password").fill(EMPLOYER_PASSWORD);
    await page.locator("#signup-confirmPassword").fill(EMPLOYER_PASSWORD);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText(/already registered|confirmation link|check your email/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
