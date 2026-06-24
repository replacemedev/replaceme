# Cursor System Prompt: Secure Next.js App Router Admin Panel

## 1. Project Context & Security Philosophy

**Objective:** Build a highly secure, modern Admin Panel inside a Next.js App Router project using a **Unified Login** approach. 
The system being managed is a single-purpose utility Micro-SaaS focused on data sanitization and PII (Personally Identifiable Information) stripping for AI interactions. Because the core product handles sensitive data workflows, the administrative layer must reflect rigorous zero-trust security principles.

**Strict Constraint:** Do NOT implement "Security by Obscurity" (e.g., hiding dashboards under randomized URLs like `/asd23e2h3bh4/admin`). Use predictable, standard URLs (like `/admin`) but lock them behind an absolute fortress of Edge Middleware, Supabase JWT custom claims (`app_metadata`), Database Row Level Security (RLS), and Multi-Factor Authentication (MFA).

---

## 2. Tech Stack Alignment

Ensure all code generation strictly adheres to the following library versions and patterns:

*   **Framework:** Next.js `16.2.9` (App Router exclusively - no Pages router)
*   **Runtime Library:** React `19.2.4` (utilizing React Server Components and Server Actions)
*   **Language:** TypeScript `^5` (Strict mode enabled)
*   **Styling:** Tailwind CSS `^4` (using PostCSS `^4`)
*   **Icons:** Lucide React `^1.21.0`
*   **Notifications:** Sonner `^2.0.7` (toast alerts)
*   **Backend & Auth Provider:** Supabase
    *   `@supabase/supabase-js` `^2.108.2`
    *   `@supabase/ssr` `^0.12.0` (for cookie storage and server client instantiation)
*   **State Management & Forms:** 
    *   React Hook Form `^7.80.0`
    *   Zod `^4.4.3` (for comprehensive schema validation)
    *   `@hookform/resolvers` `^5.4.0`
*   **Payments & Billing:** Stripe `^22.2.2`

---

## 3. Core Implementation Blueprints

When generating code for this architecture, implement the following standard operating procedures:

### A. The Unified Login Architecture
Instead of building a separate, easily targeted `/admin/login` page, treat admins as standard users during authentication.
1.  **Unified Portal:** Everyone authenticates at `/login` using `@supabase/ssr`.
2.  **Server-Side Role Check:** After credential validation, inspect the user's `app_metadata.role` directly from the JWT.
3.  **Smart Routing:** Use Server Actions or Route Handlers to redirect automatically based on role:
    *   `role === 'worker'` -> `/worker/dashboard`
    *   `role === 'employer'` -> `/employer/dashboard`
    *   `role === 'admin'` -> `/admin`

### B. Next.js Edge Middleware Protection
Protect the admin pages at the edge before they even render or download JavaScript chunks to the client.
1.  Create `middleware.ts` to intercept `/admin/:path*`.
2.  Verify the user's session token.
3.  Decode the token. If the user is unauthenticated or their token lacks the explicit `admin` claim in `app_metadata`, immediately redirect them to `/403` (Forbidden) or `/login`.

### C. Hardened Role Storage & PostgreSQL RLS
Frontend UI checks are merely UX. True security must be enforced in PostgreSQL.
1.  **App Metadata:** Store the admin role in the JWT (`auth.jwt() -> app_metadata -> 'role'`), which cannot be altered by the client, avoiding vulnerable `is_admin` booleans in public user tables.
2.  **Row Level Security (RLS):** Write explicitly strict policies for all database operations. 
    *   *Example:* `CREATE POLICY "Admins can update PII rules" ON rules FOR UPDATE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');`

### D. Multi-Factor Authentication (MFA / TOTP)
High-privilege accounts must be protected beyond passwords.
1.  Enforce Time-based One-Time Passwords (TOTP).
2.  Check the Authenticator Assurance Level (AAL) upon entry to the `/admin` layout. Use `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`.
3.  If the session is `aal1` (password only), force an immediate redirect to an MFA challenge screen to step up to `aal2`. Do not render the dashboard components until `aal2` is verified.

### E. Comprehensive Audit Logging
Admins hold immense power; ensure total accountability.
1.  Create an `audit_logs` table (Fields: `id`, `admin_id`, `action_type`, `target_id`, `timestamp`, `metadata`).
2.  Whenever an admin executes a sensitive or destructive action (e.g., refunding a Stripe payment, modifying global PII sanitization parameters, deleting a user account), insert a record into this table via a secure Server Action.

---

## 4. UI/UX Directives
*   **Forms:** Build all admin settings and user modification forms using `react-hook-form` and `zod`. Never trust client inputs; validate on the client for UX, and validate again on the Server Action for security.
*   **Design:** Use `Tailwind v4` for a clean, data-dense interface suitable for administrative oversight. Utilize `Lucide React` for semantic icons.
*   **Feedback:** Wrap Server Action responses in `sonner` toasts to give admins clear, immediate feedback on success or failure of mutations.
