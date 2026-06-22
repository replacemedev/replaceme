# ReplaceMe Implementation & Testing Checklist

Use this checklist to verify the backend integration, authentication flows, and dashboard scaffolding before deploying to production.

---

## 1. Environment & Setup Checklist
- [ ] Supabase project created and API keys obtained (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] Stripe API keys obtained for conditional Employer billing (`STRIPE_SECRET_KEY`).
- [ ] `.env.local` configured with required environment variables:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  STRIPE_SECRET_KEY=your_stripe_secret_key
  ```
- [ ] Run `bun install` to ensure all packages (`@supabase/ssr`, `stripe`, `zod`, `react-hook-form`, `@hookform/resolvers`) are up to date.

---

## 2. Database Schema & RLS Checklist
- [ ] Execute `database.sql` (or `supabase/migrations/00_initial_schema.sql`) in your Supabase SQL Editor.
- [ ] Verify that the `user_role` enum type is successfully created (`employer`, `worker`, `admin`).
- [ ] Verify that the tables `profiles`, `employers`, and `workers` are created in the `public` schema.
- [ ] Verify that RLS (Row Level Security) is enabled on all three tables.
- [ ] Verify that the `on_auth_user_created` trigger is registered on the `auth.users` table and executes `public.handle_new_user()`.
- [ ] Test trigger execution by manually creating a test user in the Supabase Auth Dashboard:
  - [ ] If user role metadata is `employer`, verify a profile and employer record are created.
  - [ ] If user role metadata is `worker`, verify a profile and worker record are created.

---

## 3. Authentication & Sign Up Flow Checklist
- [ ] Access `/signup` in your browser.
- [ ] Test validation by submitting empty values (verify form errors from Zod schemas).
- [ ] Sign up as a **Worker** (`role: worker`):
  - [ ] Check Supabase Auth and database tables (verify that `profiles` and `workers` records are created).
  - [ ] Verify that `stripe_customer_id` remains `null`.
  - [ ] Verify redirect to `/worker/dashboard`.
- [ ] Sign up as an **Employer** (`role: employer`):
  - [ ] Check Supabase Auth and database tables (verify that `profiles` and `employers` records are created).
  - [ ] If Stripe secret key is enabled in `.env.local`, verify a new Customer ID is generated in the Stripe Dashboard and updated in the `profiles` table.
  - [ ] Verify redirect to `/dashboard`.

---

## 4. Authentication & Log In Flow Checklist
- [ ] Access `/login` in your browser.
- [ ] Log in with the registered **Worker** credentials:
  - [ ] Verify that user is successfully logged in.
  - [ ] Verify redirect to `/worker/dashboard`.
- [ |] Log in with the registered **Employer** credentials:
  - [ ] Verify that user is successfully logged in.
  - [ ] Verify redirect to `/dashboard`.
- [ ] Attempt to access `/login` or `/signup` while logged in:
  - [ ] Verify auto-redirect to respective dashboards (`/dashboard` for Employer, `/worker/dashboard` for Worker).

---

## 5. Route Protection & Middleware Checklist
- [ ] Clear browser cookies/session and attempt to access protected routes:
  - [ ] Attempt `/dashboard` -> Verify auto-redirect to `/login`.
  - [ ] Attempt `/worker/dashboard` -> Verify auto-redirect to `/login`.
- [ ] Log in as a **Worker** and attempt to access:
  - [ ] `/dashboard` -> Verify auto-redirect back to `/worker/dashboard`.
- [ ] Log in as an **Employer** and attempt to access:
  - [ ] `/worker/dashboard` -> Verify auto-redirect back to `/dashboard`.

---

## 6. Dashboard Scaffolding & Empty States Checklist
- [ ] Verify that `fetchDashboardData()` in `src/actions/dashboard.ts` returns empty lists and zero values.
- [ ] Access the Employer Dashboard at `/dashboard`:
  - [ ] Verify statistics (Active Job Posts, Total Applicants, Hired Workers, Unread Messages) display `0`.
  - [ ] Verify **Active Job Posts** widget renders: *"No active job posts yet. Create your first job listing to connect with remote talent..."* along with the *"Post Your First Job"* button.
  - [ ] Verify **Recent Messages** widget renders: *"No messages yet. When you contact candidates or receive applications, your chats will appear here."*
  - [ ] Verify **Pinned Talent** widget renders: *"No pinned talent. Pin talent profiles during search to review them later."*
  - [ ] Verify **Your Workers** widget renders: *"No hired workers yet. Your active team members will be listed here once hired."*
- [ ] Access the Worker Dashboard at `/worker/dashboard` and verify placeholder state renders correctly.
