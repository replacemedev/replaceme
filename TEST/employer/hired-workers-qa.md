# QA Test Guide - Employer Hired Workers

This guide is prepared for QA engineers to validate the implementation of the Employer **Hired Workers** (My Team) management page (located at `/hired`).

---

## 1. UI Layout & Responsiveness Verification

### Step-by-Step Test:
1. Log in to the application as an **Employer** user.
2. Verify that the global header contains the **Hired** link next to **Pinned**.
3. Click the **Hired** link and verify you are navigated to `/hired`.
4. Verify that the page header displays:
   - The title `"Hired Workers"`.
   - The subtitle: `"Manage your active team members and their contracts."`
   - A solid green **"+ Post New Role"** button (Right) pointing to `/jobs/create`.
5. Verify the presentational grid layout:
   - Fits nicely within the page containers with proper padding.
   - Stats row contains exactly 3 cards (`TOTAL ACTIVE`, `MONTHLY PAYROLL`, `AVERAGE TENURE`).
   - Hired workers list displays horizontal cards with clear typography, spacing, and hover transitions.
6. Verify the **Hired Worker Card** components display:
   - Candidate's avatar (or initials in a green round card fallback if no avatar exists) with a colored online status indicator dot.
   - Candidate's full name, role, employment type badge (`FULL TIME`, `CONTRACT`), and start date (e.g. `Joined Sep 2023`).
   - Columns for Salary (e.g. `$45/hr`), Weekly Hours (e.g. `40 hrs`), and Status (e.g. `active`).
   - Action buttons: `"Message"`, `"View Contract"`, and a receipt icon button.
7. Scale the browser viewport to mobile widths:
   - Ensure the horizontal list items and stats cards scale to a stacked single-column design.
   - Confirm that no text overflows or collides.

---

## 2. Dynamic Contract Aggregations Math Verification

### Stats Calculation Test:
1. Seed the database with 3 contracts under the active employer's account:
   - **Contract 1**: Sarah Jenkins (Active), `hourly_rate = 45`, `weekly_hours = 40`, `start_date = 2023-09-01` (e.g. 33 months tenure from June 2026).
   - **Contract 2**: Marcus Chen (Active), `hourly_rate = 55`, `weekly_hours = 40`, `start_date = 2024-01-01` (e.g. 29 months tenure from June 2026).
   - **Contract 3**: Elena Rodriguez (Active), `hourly_rate = 60`, `weekly_hours = 25`, `start_date = 2023-11-01` (e.g. 31 months tenure from June 2026).
2. **Calculate expected results**:
   - **Total Active**: `3`
   - **Monthly Payroll**:
     - Contract 1: `45 * 40 * 4.3333` = $7,800
     - Contract 2: `55 * 40 * 4.3333` = $9,533
     - Contract 3: `60 * 25 * 4.3333` = $6,500
     - Total expected: `7800 + 9533 + 6500` = **$23,833**
   - **Average Tenure**:
     - Month diffs: `33 + 29 + 31` = 93 months total.
     - Expected average: `93 / 3` = **31 months** (calculated based on June 2026).
3. Load the `/hired` page.
4. **Verify UI stats match calculated expected values**:
   - `TOTAL ACTIVE` card displays `"3 Workers"`.
   - `MONTHLY PAYROLL` card displays `"$23,833"`.
   - `AVERAGE TENURE` card displays `"31 Months"`.
5. Pause one of the contracts (`status = 'paused'`) in the database.
6. Refresh the page and verify that:
   - `TOTAL ACTIVE` decrements to `2`.
   - `MONTHLY PAYROLL` card decrements, excluding the paused contract.
   - `AVERAGE TENURE` excludes the paused contract from the average.

---

## 3. Subscription Gating & Upgrade Banner Verification

### Upgrade Banner Visibility:
1. Log in with an employer account on the **Discovery** (Free) or **Essential** plan.
2. Navigate to `/hired`.
3. Verify that the **Upgrade to Professional** banner is displayed below the page header showing checks, pricing `$99/mo`, and an `"Upgrade Now"` button.
4. Click the `"Upgrade Now"` button and verify it redirects you to the pricing page `/pricing`.
5. Log in with an employer account on the **Professional** plan.
6. Navigate to `/hired`.
7. Verify that the upgrade banner is **NOT** displayed.

---

## 4. Zero-Trust Security boundaries (RLS)

### Direct Access Check:
1. Log out of the employer account.
2. Attempt to navigate directly to `/hired`.
3. Verify that the middleware blocks access and redirects you to the login page `/login`.
4. Log in as a **Worker** user.
5. Attempt to navigate to `/hired`.
6. Verify that access is blocked (redirects to `/dashboard` or worker landing page).

### IDOR Data Privacy Check:
1. While logged in as **Employer B**, attempt to run a console script calling `getHiredData` or querying `/hired` content.
2. Verify that the server action rejects the query or returns only contracts where `employer_id` matches the authenticated `auth.uid()`.
3. Confirm that Employer B cannot see or calculate any payroll, tenure, or contract metadata belonging to Employer A.
