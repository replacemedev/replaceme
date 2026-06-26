import { test, expect } from "@playwright/test";

test.describe("Public FAQ pages", () => {
  test("employer FAQ page loads with fallback content", async ({ page }) => {
    await page.goto("/faq/employer");
    await expect(page.getByRole("heading", { name: /Employer FAQs/i })).toBeVisible();
    await expect(page.getByText("How do I post a job?")).toBeVisible();
  });

  test("worker FAQ page loads with fallback content", async ({ page }) => {
    await page.goto("/faq/worker");
    await expect(page.getByRole("heading", { name: /Worker FAQs/i })).toBeVisible();
    await expect(page.getByText("Is ReplaceMe free for workers?")).toBeVisible();
  });

  test("footer links reach FAQ routes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Employer FAQs" }).click();
    await expect(page).toHaveURL(/\/faq\/employer\/?$/);

    await page.goto("/");
    await page.getByRole("link", { name: "Worker FAQs" }).click();
    await expect(page).toHaveURL(/\/faq\/worker\/?$/);
  });
});
