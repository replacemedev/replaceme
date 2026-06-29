import { test, expect } from "@playwright/test";
import {
  loginAsWorker,
  WORKER_TEST_PASSWORD,
} from "./helpers/auth";
import {
  loginAsEmployer,
  EMPLOYER_TEST_PASSWORD,
} from "../employer/helpers/auth";

test.describe("Worker route security", () => {
  test("redirects unauthenticated users from worker routes to login", async ({
    page,
  }) => {
    await page.goto("/worker/dashboard");
    await expect(page).toHaveURL(/\/signin/, { timeout: 15_000 });
  });

  test.describe("cross-role access", () => {
    test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");
    test.skip(!EMPLOYER_TEST_PASSWORD, "E2E_EMPLOYER_PASSWORD not set");

    test("worker cannot access employer dashboard", async ({ page }) => {
      await loginAsWorker(page);
      await page.goto("/employer/dashboard");
      await expect(page).toHaveURL(/\/worker\//, { timeout: 15_000 });
    });

    test("employer cannot access worker dashboard", async ({ page }) => {
      await loginAsEmployer(page);
      await page.goto("/worker/dashboard");
      await expect(page).toHaveURL(/\/employer\//, { timeout: 15_000 });
    });
  });
});
