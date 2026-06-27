import { test, expect } from "@playwright/test";
import {
  FIXTURE_JOBS,
  FIXTURE_THREADS,
  employerApplicantsPath,
  employerMessagesPath,
} from "../shared/fixtures";
import {
  loginAsDiscoveryEmployer,
  loginAsStarterEmployer,
  loginAsGrowthEmployer,
  loginAsScaleEmployer,
  completeEmployerOnboardingIfPresent,
} from "./helpers/auth";

/**
 * Layer 6T-E — four-tier entitlement matrix (Discovery / Starter / Growth / Scale).
 * Prerequisite: E2E_SEED_ENABLED=1 npm run seed:e2e && npm run seed:e2e:verify
 */

test.describe("Discovery tier — $0 entitlements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDiscoveryEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("dashboard shows Discovery limits and locked messaging", async ({
    page,
  }) => {
    await page.goto("/employer/dashboard");
    await expect(
      page.getByText(/Subscription Benefits & Usage/i)
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Discovery").first()).toBeVisible();
    await expect(page.getByText("1 / 1")).toBeVisible();
    await expect(page.getByText("Up to 10 per job")).toBeVisible();
    await expect(page.getByText("Messaging: Upgrade to message")).toBeVisible();
    await expect(page.getByText("Profiles: Preview only")).toBeVisible();
    await expect(page.getByText("Resumes: Locked")).toBeVisible();
  });

  test("applicant pipeline shows anonymous preview at 10-applicant cap", async ({
    page,
  }) => {
    await page.goto(employerApplicantsPath(FIXTURE_JOBS.discoveryPending));

    await expect(page.getByText("Discovery preview mode")).toBeVisible();
    await expect(page.getByText("10 Applicants Active")).toBeVisible();
    await expect(page.getByText(/Applicant #/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Upgrade to Starter" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Message/i })).toHaveCount(0);
  });

  test("blocked messaging thread shows upgrade CTA for employer", async ({
    page,
  }) => {
    await page.goto(employerMessagesPath(FIXTURE_THREADS.discoveryBlocked));
    await expect(page.getByText("Messaging unavailable")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("link", { name: /Upgrade to Starter/i })
    ).toBeVisible();
  });

  test("pricing page highlights Starter upgrade from Discovery", async ({
    page,
  }) => {
    await page.goto("/employer/pricing");
    await expect(page.getByText("$0", { exact: true }).first()).toBeVisible();
    await expect(
      page.locator("h3").filter({ hasText: /^Discovery/i })
    ).toBeVisible();
  });
});

test.describe("Starter tier — $19 entitlements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStarterEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("dashboard shows Starter usage and unlocked features", async ({
    page,
  }) => {
    await page.goto("/employer/dashboard");
    await expect(
      page.getByText(/Subscription Benefits & Usage/i)
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Starter").first()).toBeVisible();
    await expect(page.getByText("2 / 3")).toBeVisible();
    await expect(page.getByText("Up to 20 per job")).toBeVisible();
    await expect(page.getByText("Messaging: Enabled")).toBeVisible();
    await expect(page.getByText("Profiles: Full")).toBeVisible();
    await expect(page.getByText("Resumes: Enabled")).toBeVisible();
  });

  test("applicant pipeline shows full candidate identity", async ({ page }) => {
    await page.goto(employerApplicantsPath(FIXTURE_JOBS.starterActive1));

    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
    await expect(page.getByText("Discovery preview mode")).toHaveCount(0);
    await expect(page.getByText("Maya Chen")).toBeVisible({ timeout: 15_000 });
  });

  test("active messaging thread is not blocked", async ({ page }) => {
    await page.goto(employerMessagesPath(FIXTURE_THREADS.starterWorker1));
    await expect(page.getByText("Messaging unavailable")).toHaveCount(0);
    await expect(page.getByText(/intro call/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Growth tier — $39 entitlements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGrowthEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("dashboard shows Growth limits and priority features", async ({
    page,
  }) => {
    await page.goto("/employer/dashboard");
    await expect(page.getByText("Growth").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("1 / 10")).toBeVisible();
    await expect(page.getByText("Up to 50 per job")).toBeVisible();
    await expect(page.getByText("Messaging: Enabled")).toBeVisible();
    await expect(page.getByText("Profiles: Full")).toBeVisible();
  });

  test("priority job applicants load with full identity", async ({ page }) => {
    await page.goto(employerApplicantsPath(FIXTURE_JOBS.growthPriority));
    await expect(page.getByText("James Okonkwo")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Discovery preview mode")).toHaveCount(0);
  });
});

test.describe("Scale tier — $79 entitlements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsScaleEmployer(page);
    await completeEmployerOnboardingIfPresent(page);
  });

  test("dashboard shows unlimited job and applicant allowances", async ({
    page,
  }) => {
    await page.goto("/employer/dashboard");
    await expect(page.getByText("Scale").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Unlimited per job")).toBeVisible();
    await expect(page.getByText("Messaging: Enabled")).toBeVisible();
  });

  test("scale job pipeline shows full profiles", async ({ page }) => {
    await page.goto(employerApplicantsPath(FIXTURE_JOBS.scale1));
    await expect(page.getByText("Applicant Pipeline")).toBeVisible();
    await expect(page.getByText("Discovery preview mode")).toHaveCount(0);
  });
});
