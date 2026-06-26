import { test, expect } from "@playwright/test";
import { loginAsAdmin, ADMIN_TEST_PASSWORD } from "./helpers/auth";

test.describe("Admin FAQ CMS", () => {
  test.skip(!ADMIN_TEST_PASSWORD, "Set E2E_ADMIN_PASSWORD for live admin auth");

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings/pages/faq");
    await expect(page.getByRole("heading", { name: "FAQ content" })).toBeVisible();
  });

  test("admin saves a custom employer FAQ item", async ({ page }) => {
    const question = `E2E Employer FAQ ${Date.now()}`;
    const answer = "Automated answer for employer FAQ E2E.";

    const employerSection = page.locator("section").filter({ hasText: "Employer FAQs" });
    await employerSection.getByRole("button", { name: "Add FAQ" }).click();
    await employerSection.getByLabel("Question").last().fill(question);
    await employerSection.getByLabel("Answer").last().fill(answer);
    await employerSection.getByRole("button", { name: "Save Employer FAQs" }).click();
    await expect(employerSection.getByText("Saved.")).toBeVisible({ timeout: 15_000 });

    await page.goto("/faq/employer");
    await expect(page.getByRole("heading", { name: /Employer FAQs/i })).toBeVisible();
    await expect(page.getByText(question)).toBeVisible();
    await expect(page.getByText(answer)).toBeVisible();
  });
});
