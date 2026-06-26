import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker contracts", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads contract offers inbox", async ({ page }) => {
    await page.goto("/worker/contracts");
    await expect(
      page.getByRole("heading", { name: "Contract Offers", exact: true })
    ).toBeVisible();
  });
});
