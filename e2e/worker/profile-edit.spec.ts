import { test, expect, type Page } from "@playwright/test";
import { loginAsWorker, WORKER_TEST_PASSWORD } from "./helpers/auth";

async function fillControlledField(page: Page, label: string, value: string) {
  const field = page.getByLabel(label);
  await field.click();
  await field.fill(value);
  await expect(field).toHaveValue(value);
}

test.describe("Worker profile edit", () => {
  test.skip(!WORKER_TEST_PASSWORD, "E2E_WORKER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await loginAsWorker(page);
  });

  test("loads edit profile form and saves bio", async ({ page }) => {
    await page.goto("/worker/profile/edit");
    await expect(
      page.getByRole("heading", { name: "Edit Profile" })
    ).toBeVisible();

    await page.getByLabel("Bio").fill("E2E profile bio update");
    await page.getByRole("button", { name: "Save Profile" }).click();

    await expect(page).toHaveURL(/\/worker\/profile\/?$/, { timeout: 15_000 });
  });

  test("saves portfolio and resume URLs", async ({ page }) => {
    await page.goto("/worker/profile/edit");
    const portfolio = "https://example.com/e2e-portfolio";
    const resume = "https://example.com/e2e-resume.pdf";

    await fillControlledField(page, "Portfolio URL", portfolio);
    await fillControlledField(page, "Resume URL", resume);

    const formPortfolio = await page.evaluate(() => {
      const form = document.querySelector("form");
      return form ? new FormData(form).get("portfolioUrl") : null;
    });
    expect(formPortfolio).toBe(portfolio);

    await page.getByRole("button", { name: "Save Profile" }).click();

    await expect(page).toHaveURL(/\/worker\/profile\/?$/, { timeout: 15_000 });
    await expect(page.getByRole("link", { name: "View Site" })).toHaveAttribute(
      "href",
      portfolio
    );
  });
});
