import { test, expect } from "@playwright/test";
import {
  loginAsWorker,
  WORKER_TEST_PASSWORD,
  clickWorkerNav,
  clickWorkerAccountNav,
  WORKER_PRIMARY_HREFS,
  WORKER_ACCOUNT_HREFS,
} from "./helpers/auth";

const PRIMARY_EXPECTATIONS: Record<string, RegExp | string> = {
  "/worker/dashboard": /Hello,/,
  "/worker/jobs": /Search jobs/i,
  "/worker/saved-jobs": "Saved Jobs",
  "/worker/applications": "My Applications",
  "/worker/interviews": "Interviews",
  "/worker/contracts": "Contract Offers",
  "/worker/messages": "Inbox",
};

const ACCOUNT_EXPECTATIONS: Record<
  string,
  { level?: 1 | 2 | 3; name: string } | null
> = {
  "/worker/profile": { name: "About Me" },
  "/worker/settings": { level: 1, name: "Account Settings" },
  "/worker/earnings": { level: 1, name: "Earnings" },
  "/worker/job-alerts": { level: 1, name: "Job Alerts" },
  "/worker/notifications": { level: 1, name: "Notifications" },
  "/worker/verification": { level: 1, name: "Worker Verification" },
};

test.describe("Worker navigation", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
    await page.goto("/worker/dashboard");
  });

  for (const href of WORKER_PRIMARY_HREFS) {
    test(`primary nav reaches ${href}`, async ({ page }) => {
      await clickWorkerNav(page, href);
      await expect(page).toHaveURL(new RegExp(`${href.replace("/", "\\/")}`), {
        timeout: 15_000,
      });
      const expected = PRIMARY_EXPECTATIONS[href];
      if (expected instanceof RegExp) {
        await expect(page.locator("main")).toContainText(expected);
      } else if (expected) {
        if (href === "/worker/messages") {
          await expect(page.getByText(expected, { exact: true })).toBeVisible({
            timeout: 15_000,
          });
        } else {
          await expect(
            page.getByRole("heading", { name: expected, level: 1 })
          ).toBeVisible({ timeout: 15_000 });
        }
      }
    });
  }

  for (const href of WORKER_ACCOUNT_HREFS) {
    test(`account menu reaches ${href}`, async ({ page }) => {
      await clickWorkerAccountNav(page, href);
      await expect(page).toHaveURL(new RegExp(`${href.replace("/", "\\/")}`), {
        timeout: 15_000,
      });
      const expected = ACCOUNT_EXPECTATIONS[href];
      if (expected) {
        await expect(
          page.getByRole("heading", {
            name: expected.name,
            ...(expected.level ? { level: expected.level } : {}),
          })
        ).toBeVisible({ timeout: 15_000 });
      }
    });
  }

  test("highlights active primary nav link on jobs", async ({ page }) => {
    await clickWorkerNav(page, "/worker/jobs");
    const jobsLink = page.locator('header nav a[href="/worker/jobs"]');
    await expect(jobsLink).toHaveAttribute("aria-current", "page");
  });

  test("mobile menu opens and navigates to applications", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/worker/dashboard");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("dialog")
      .locator('a[href="/worker/applications"]')
      .click();
    await expect(page).toHaveURL(/\/worker\/applications/);
  });

  test("footer hiring guide link is present", async ({ page }) => {
    await page.goto("/worker/dashboard");
    await expect(
      page.locator('footer a[href="/help/hiring-guide"]')
    ).toBeVisible();
  });
});
