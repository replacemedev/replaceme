import { test, expect } from "@playwright/test";
import { FIXTURE_THREADS, workerMessagesPath } from "../shared/fixtures";
import { loginAsSofia, loginAsMaya } from "../worker/helpers/auth";
import { loginAsDiscoveryEmployer } from "../employer/helpers/auth";

/**
 * Layer 6T-X — cross-role billing / messaging entitlement journeys.
 * Prerequisite: E2E_SEED_ENABLED=1 npm run seed:e2e
 */

test.describe("Worker × employer tier messaging", () => {
  test("worker on Discovery-blocked thread sees messaging unavailable banner", async ({
    page,
  }) => {
    await loginAsSofia(page);
    await page.goto(workerMessagesPath(FIXTURE_THREADS.discoveryBlocked));

    await expect(page.getByText("Inbox")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Messaging unavailable")).toBeVisible();
    await expect(
      page.getByText(/Discovery plan and cannot send messages/i)
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Upgrade to Starter/i })
    ).toHaveCount(0);
  });

  test("worker on Starter employer thread can view conversation", async ({
    page,
  }) => {
    await loginAsMaya(page);
    await page.goto(workerMessagesPath(FIXTURE_THREADS.starterWorker1));

    await expect(page.getByText("Inbox")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Messaging unavailable")).toHaveCount(0);
    await expect(page.getByText(/intro call/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Employer tier upgrade surfaces", () => {
  test("Discovery employer pricing lists all four paid upgrade paths", async ({
    page,
  }) => {
    await loginAsDiscoveryEmployer(page);
    await page.goto("/employer/pricing");

    for (const tier of ["Discovery", "Starter", "Growth", "Scale"]) {
      await expect(
        page.locator("h3").filter({ hasText: new RegExp(`^${tier}`, "i") })
      ).toBeVisible();
    }

    await expect(page.getByText("$19", { exact: true })).toBeVisible();
    await expect(page.getByText("$39", { exact: true })).toBeVisible();
    await expect(page.getByText("$79", { exact: true })).toBeVisible();
  });
});
