/**
 * Live employer lifecycle probe — screenshots + a11y snapshot to e2e/employer/debug/lifecycle/
 * Run: node scripts/e2e-employer-probe.mjs
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ARTIFACTS = path.resolve("e2e/employer/debug/lifecycle");
const EMAIL = process.env.E2E_EMPLOYER_EMAIL ?? "replacemedev@gmail.com";
const PASS = process.env.E2E_EMPLOYER_PASSWORD ?? "";

if (!PASS) {
  console.error(
    "E2E_EMPLOYER_PASSWORD is required. Add it to .env.local (no password reset script — use your real account password)."
  );
  process.exit(1);
}

fs.mkdirSync(ARTIFACTS, { recursive: true });

const log = [];
function append(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  log.push(line);
  console.log(line);
}

async function shot(page, name) {
  const file = path.join(ARTIFACTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  append(`Screenshot: ${file}`);
}

async function snap(page, name) {
  const file = path.join(ARTIFACTS, `${name}.aria.yml`);
  const tree = await page.locator("body").ariaSnapshot();
  fs.writeFileSync(file, tree);
  append(`ARIA snapshot: ${file}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ baseURL: BASE });
const page = await context.newPage();

try {
  append("Phase 0: Home");
  await page.goto("/");
  await shot(page, "01-home");
  await snap(page, "01-home");

  append("Phase 1: Login");
  await page.goto("/login");
  await page.getByPlaceholder("Enter your email or username").fill(EMAIL);
  await page.getByPlaceholder("Min. 8 characters").first().fill(PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), {
    timeout: 30_000,
  });
  append(`Post-login URL: ${page.url()}`);
  await shot(page, "02-post-login");

  if (page.url().includes("/employer/onboarding")) {
    append("Phase 2: Onboarding");
    await page.getByLabel("Company name").fill("Probe Co");
    await page.getByLabel("Industry").selectOption("Technology");
    await page.getByLabel("Company size").selectOption("1–10 employees");
    await page.getByRole("button", { name: "TypeScript" }).click();
    await page.getByRole("button", { name: "Go to dashboard" }).click();
    await page.waitForURL(/\/employer\/dashboard/, { timeout: 30_000 });
    await shot(page, "03-post-onboarding");
  } else {
    append("Phase 2: Onboarding skipped (already complete)");
  }

  append("Phase 3: Dashboard");
  await page.goto("/employer/dashboard");
  await expectVisible(page, "Welcome back");
  await shot(page, "04-dashboard");
  await snap(page, "04-dashboard");

  append("Phase 4: Job creation");
  await page.goto("/employer/jobs/create");
  await shot(page, "05-job-create-form");
  const title = `E2E Job ${Date.now()}`;
  await page.getByPlaceholder(/Senior Full-Stack/i).fill(title);
  await page.locator("select").first().selectOption({ index: 1 });
  await page
    .getByPlaceholder(/Describe the responsibilities/i)
    .fill("Automated E2E job description for employer lifecycle probe.");
  await page.getByRole("button", { name: "React" }).click();
  await page.getByRole("button", { name: "Submit with Free Review" }).click();
  await page.waitForTimeout(3000);
  append(`Post-submit URL: ${page.url()}`);
  await shot(page, "06-post-job-submit");

  append("Phase 5: Dashboard jobs check");
  await page.goto("/employer/dashboard");
  await shot(page, "07-dashboard-after-job");

  append("PROBE COMPLETE");
} catch (err) {
  append(`FAILED: ${err.message}`);
  await shot(page, "99-failure").catch(() => {});
  await snap(page, "99-failure").catch(() => {});
  process.exitCode = 1;
} finally {
  const reportPath = path.join(ARTIFACTS, "probe-log.txt");
  fs.writeFileSync(reportPath, log.join("\n") + "\n");
  await browser.close();
}

async function expectVisible(page, text) {
  const el = page.getByText(text, { exact: false }).first();
  await el.waitFor({ state: "visible", timeout: 15_000 });
}
