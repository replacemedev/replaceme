# QA Test Guide - Employer Account Settings Hub

This guide is prepared for QA engineers to validate the implementation of the Employer **Account Settings Hub** (located at `/settings/account`).

---

## 1. UI Layout & Responsiveness Verification

### Step-by-Step Test:
1. Log in to the application as an **Employer** user.
2. Click the user avatar dropdown in the global header and verify that the "Profile Settings" link routes to `/settings/account`.
3. Verify that the breadcrumbs read `My Account › Account Settings`.
4. Verify that the page header shows the title `Account Settings` and the subtitle `Manage your profile, security, and subscription plan.`.
5. Check visual consistency on desktop:
   - Left column should contain the **Account Details & Billing** card and **Manage Plan** card.
   - Right column should contain the **Essential Plan Features** (green card) and the **Cancel Subscription** card.
6. Verify layout responsiveness by scaling the browser viewport to tablet and mobile widths:
   - Ensure the two-column grid stacks vertically into a single-column layout on smaller screens.
   - Ensure card borders, padding, and font sizes look premium and do not overflow.

---

## 2. Link Navigation Routing

### Step-by-Step Test:
1. Locate the **Account Details & Billing** list card.
2. Click the **Manage** link next to *Profile Information*.
3. Click the **Update** link next to *Account Security*.
4. Click the **View Details** link next to *Billing Information*.
5. For each click, confirm that it routes or references correctly without displaying broken pages.
6. Inside the sidebar features card, click the **Compare All Plans** button and verify that it triggers the comparison view.

---

## 3. Interactive Plan Upgrades (Stripe Mock Flow)

### Step-by-Step Test:
1. Locate the **Manage Plan** card grid.
2. Verify that the **Essential** card has a green border highlighting it, and a white-on-green badge reading `CURRENT` at the top.
3. Locate the **Professional** card.
4. Click the **Upgrade** button on the Professional card.
5. **Verify Loading State**:
   - The button text should immediately change to `Upgrading...` and the button should become disabled.
   - A loading toast reading `Preparing checkout for professional plan...` should appear (via Sonner).
6. **Verify Redirection**:
   - Once the simulated Server Action returns, verify a success toast is shown and the page redirects to the mock Stripe checkout URL: `https://checkout.stripe.com/pay/cs_test_mock_replace_me`.

---

## 4. Subscription Cancellation Flow

### Step-by-Step Test:
1. Locate the **Cancel Subscription** card at the bottom of the right-hand column.
2. Click the **Cancel Subscription** button.
3. Verify that a native confirmation dialog is triggered: `"Are you sure you want to cancel your subscription? You will lose premium features at the end of your billing cycle."`
4. Click **Cancel** in the dialog; verify that no mutation occurs and the state remains unchanged.
5. Click **Cancel Subscription** again, and click **OK** in the dialog.
6. **Verify Loading State**:
   - The button should display `Processing...` and disable itself.
   - A loading toast reading `Processing subscription cancellation...` should appear.
7. **Verify Success State**:
   - After the Server Action returns, verify that a green success toast appears with the message: `"Your subscription has been successfully cancelled. Your access will remain active until the end of the current billing cycle."`

---

## 5. Security & Role Privilege Hardening

### Step-by-Step Test:
1. Log out as an Employer.
2. Log in as a **Worker** role user.
3. Manually type `/settings/account` in the browser URL bar.
4. **Verify Unauthorized Redirection**:
   - Confirm that the middleware or server component blocks access and immediately redirects you to the main `/dashboard` page.
5. Test direct Server Action execution (via a console script or post payload request):
   - Invoke `createUpgradeCheckout` or `cancelSubscription` actions from a non-employer account session.
   - Confirm that the action catches the privilege violation and returns `{ error: "Access denied. Only employers can manage subscription billing." }` instead of executing any database operations.
