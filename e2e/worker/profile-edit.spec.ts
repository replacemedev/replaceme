import { test, expect } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

test.describe("Worker inline profile editing", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("edits bio inline on profile page", async ({ page }) => {
    await page.goto("/worker/profile");
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.locator("textarea").fill("E2E inline bio update");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("E2E inline bio update")).toBeVisible();
  });

  test("opens rate and availability modal from profile", async ({ page }) => {
    await page.goto("/worker/profile");
    await page.getByText("Rate", { exact: true }).click();
    await expect(page.getByRole("heading", { name: "Rate & availability" })).toBeVisible();
  });

  test("opens manage skills modal", async ({ page }) => {
    await page.goto("/worker/profile");
    await page.getByRole("button", { name: "Manage" }).click();
    await expect(page.getByRole("heading", { name: "Manage top skills" })).toBeVisible();
  });
});
