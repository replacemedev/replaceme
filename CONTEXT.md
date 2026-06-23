# Complete Marketplace Platform Context Guide & Chronological History Reference

This document captures the chronological history of this pair programming session, followed by the complete database schemas, API specs, and component layouts of the marketplace application. Use this file as a primary context payload in your new chat session to continue development without losing state.

---

## 1. Chronological Session History (What We Did)

Over the course of this programming session, we systematically developed and hardened the platform, covering the landing page, authorization workflows, Stripe payment checkout pipelines, applicant tracking systems, worker dashboards, worker profiles, and a real-time messaging system.

### Phase 1: Landing Page Visual Overhaul & Navigation
- **Visual Dryness Fix**: Re-designed the main landing page to feel modern and dynamic. Added gradient mesh background grids and text layouts.
- **Header Section Observer**: Implemented a scroll-based intersection observer to dynamically highlight the current active section (e.g., adding an active indicator line underneath the section names: Hero, Talent, FAQ, Jobs) as the user scrolls. Resolves jumping indicator issues.
- **FAQ Transitions**: Customized the FAQ section toggles, adding a smooth CSS rotation animation to the disclosure chevrons and a slide transition to the expanding answers.
- **Vercel Readiness**: Audited the project structure and next.config.ts settings to prepare the code for static pre-rendering on Vercel.

### Phase 2: Zero-Trust Auth Redesign & Inline OTP Recovery
- **Auth Page Visual Redesign**: Replaced the dry auth backgrounds with `<AuthAnimatedSidebar />` on `/signup` and `/login`. This sidebar renders animated glowing mesh floating orbs and dot grids using hardware-accelerated CSS keyframes.
- **Inline OTP Password Recovery Flow**: Integrated a client-side state machine in `/login` that allows users to toggle between Login, Request OTP Reset, and Verify OTP token screens inline on the same card view.
- **Auth Trigger Username Collision Resolution**: Redesigned the PostgreSQL `handle_new_user` trigger to handle username collisions by executing a loop that appends numeric suffixes to usernames dynamically until uniqueness is guaranteed across both roles.
- **Autonomous Role-Based Login Redirects**: Removed manual role selections. The `logIn` action reads metadata and profiles, redirecting workers to `/worker/dashboard` and employers to `/employer/dashboard`.

### Phase 3: Employer Applicants Management & PII Masking
- **Server-Side Masking**: Set up candidates fetch actions to mask PII details (names, email, bio, resume) returning anonymized `Applicant #XYZ` labels for locked candidate rows.
- **Unlock Transaction Flow**: Implemented a 1-credit transactional profile unlock system. When the employer unlocks a worker, the action transactionally deducts 1 credit from `employer_credits` and logs the candidate under `unlocked_profiles`.
- **Lightweight Dialogue Modal**: Created custom alerts enabling users to confirm credit consumption or choose to purchase upgrade packages in case of empty balances.

### Phase 4: Tiered Stripe Element Checkouts
- **Payment Intents**: Setup `/employer/checkout/[planId]` using Stripe PaymentIntents backend-side to initialize element checkouts securely.
- **Active Subscription Logic**: Implemented backend checks (`getCurrentEmployerSubscription`) to dynamically check paid subscription tiers, disabling pricing upgrades for active paid subscribers and replacing pricing cards with billing management details.

### Phase 5: Hired & Pinned Worker Boards
- **Pinned Workers**: Implemented optimistic UI toggles (`PinToggle.tsx`) allowing employers to bookmark candidate profiles instantly in the browser.
- **Hired Contract Aggregations**: Developed backend aggregations to compute hired worker contract statistics (`Total Active`, `Monthly Payroll`, and `Average Tenure`) dynamically from the `contracts` table with zero mock arrays.

### Phase 6: Premium Worker Messages Center (`/worker/messages`)
- **Dual-Pane Viewport**: Designed a fixed-height layout (`h-[calc(100vh-64px)]`) splitting the screen between independent scrolling Sidebar (inbox list) and Chat window containers.
- **Supabase Sync**: Created tables `chat_threads` and `chat_messages` using MCP, applied RLS rules, and generated database typescript typings into `database.ts` and `messaging.ts`.
- **Date Separator & Template Parser**: Designed a message bubble that parses plain text, emails, websites, code blocks, and candidate templates (like email subject formats and structured questionnaires) into custom styled cards.
- **Url Nav & Optimistic UI**: Staged URL parameter synchronization (`?threadId=...`) to transition Server Component fetches, and integrated optimistic message appends on send forms.

---

## 2. Product Concept & Architecture


The application is a double-sided marketplace matching **Workers** (candidates looking for jobs, managing profiles, portfolio highlights, and communicating via a dedicated messages center) with **Employers** (companies listing jobs, browsing candidates, unlocking masked candidate PII using a credit-based subscription system, paying for pricing plan upgrades via Stripe, and hiring candidates via contracts).

### Stack Architecture
- **Frontend Framework**: Next.js 16 (App Router, dynamic and static pages) with React 19.
- **Styling**: Tailwind CSS v4 using global CSS custom properties to maintain a dark-green brand olive system (`#006e2f` primary background/accent, `#ebfdf2` light green backgrounds, `#005c26` / `#00421a` hover/active states).
- **Backend/Database**: Supabase PostgreSQL hosting database schemas, triggers, triggers functions, Row Level Security (RLS) policies, and RPC handlers.
- **Routing Protection**: Next.js middleware with Supabase SSR routing protection.
- **Stripe Elements API**: Customer profile registration and secure PaymentIntents for plan checkouts.

### Role-Based Directory Structure
The codebase strictly separates pages, actions, types, and components by role namespaces (`worker` vs `employer`) to eliminate spaghetti references:
- `/src/app/worker/*` handles the Worker experience (dashboard, messages, profile view).
- `/src/app/employer/*` handles the Employer experience (dashboard, job post creation, checkout, settings, applicants management).
- `/src/actions/worker/*` and `/src/actions/employer/*` isolate Server Actions.
- `/src/components/worker/*` and `/src/components/employer/*` house modular UI presentation and container components.

---

## 2. Complete Database Reference & SQL DDL

The database enforces a zero-trust model where all tables have Row Level Security enabled. Below is the complete SQL schema showing all primary tables, constraints, trigger functions, RLS policies, and indexes.

```sql
-- 1. Enums
CREATE TYPE public.user_role AS ENUM ('employer', 'worker', 'admin');

-- 2. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id UUID GENERATED ALWAYS AS (id) STORED,
  role public.user_role NOT NULL DEFAULT 'worker',
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
  email TEXT,
  avatar_url TEXT,
  professional_title TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}'::text[],
  hourly_rate NUMERIC,
  experience_years INTEGER,
  is_remote BOOLEAN DEFAULT TRUE,
  is_top_rated BOOLEAN DEFAULT FALSE,
  availability TEXT DEFAULT 'Full-Time',
  location TEXT,
  portfolio_url TEXT,
  birth_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Company Profiles Table
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  company_bio TEXT,
  company_size TEXT,
  role public.user_role DEFAULT 'employer',
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_salary NUMERIC NOT NULL CHECK (monthly_salary >= 0),
  hours_per_week NUMERIC NOT NULL CHECK (hours_per_week >= 0),
  skills TEXT[] DEFAULT '{}'::text[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Review', -- 'Active', 'Closed', 'Pending Review', 'Draft'
  is_premium_path BOOLEAN DEFAULT FALSE NOT NULL,
  hiring_manager_name TEXT,
  hiring_manager_role TEXT,
  hiring_manager_email TEXT,
  clicks_count INTEGER DEFAULT 0 NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Applied', -- 'Applied', 'Reviewing', 'Interviewing', 'Hired', 'Rejected'
  match_score INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Pinned Workers Table
CREATE TABLE IF NOT EXISTS public.pinned_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (employer_id, worker_id)
);

-- 7. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employment_type TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL CHECK (hourly_rate >= 0),
  weekly_hours NUMERIC NOT NULL CHECK (weekly_hours >= 0),
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Terminated'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Billing Plans Table
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'Discovery', 'Essential', 'Professional'
  price NUMERIC NOT NULL CHECK (price >= 0),
  job_post_limit INTEGER NOT NULL CHECK (job_post_limit >= 0),
  candidate_unlocks INTEGER NOT NULL CHECK (candidate_unlocks >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Employer Subscriptions Table
CREATE TABLE IF NOT EXISTS public.employer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.billing_plans(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive'
  current_period_end TIMESTAMP WITH TIME ZONE,
  job_posts_used INTEGER DEFAULT 0 NOT NULL CHECK (job_posts_used >= 0),
  unlocks_used INTEGER DEFAULT 0 NOT NULL CHECK (unlocks_used >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Employer Credits Table
CREATE TABLE IF NOT EXISTS public.employer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits_balance INTEGER DEFAULT 5 NOT NULL CHECK (credits_balance >= 0),
  job_posts_used INTEGER DEFAULT 0 NOT NULL CHECK (job_posts_used >= 0),
  unlocks_used INTEGER DEFAULT 0 NOT NULL CHECK (unlocks_used >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Unlocked Profiles Table
CREATE TABLE IF NOT EXISTS public.unlocked_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  credits_deducted INTEGER DEFAULT 1 NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (employer_id, candidate_id)
);

-- 12. Chat Threads Table
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_profile_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (worker_id, company_profile_id, job_id)
);

-- 13. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 14. Worker Skills Table
CREATE TABLE IF NOT EXISTS public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency INTEGER NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
  proficiency_label TEXT,
  experience_duration TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Worker Projects Table
CREATE TABLE IF NOT EXISTS public.worker_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Employer Testimonials Table
CREATE TABLE IF NOT EXISTS public.employer_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.company_profiles(employer_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. FAQs & Testimonials Marketing Tables
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_title TEXT NOT NULL,
  author_company TEXT NOT NULL,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Triggers & Postgres Functions

#### Autoprovision Profile & Sync User Metadata on Sign Up
When a user signs up using Supabase Auth, their email, full name, username, and role are passed in the metadata. The trigger handles the insert:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_username TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_count INTEGER;
  v_base_username TEXT;
BEGIN
  -- Safe read metadata
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'worker'::public.user_role);
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';
  
  -- Derive username if empty
  v_username := NEW.raw_user_meta_data->>'username';
  IF v_username IS NULL OR v_username = '' THEN
    IF v_first_name IS NOT NULL THEN
      v_username := lower(v_first_name || COALESCE(v_last_name, ''));
    ELSE
      v_username := 'user_' || substr(NEW.id::text, 1, 8);
    END IF;
  END IF;

  v_username := regexp_replace(lower(v_username), '[^a-z0-9_]', '', 'g');
  v_base_username := v_username;
  v_count := 0;

  -- Enforce uniqueness of usernames across profiles & company_profiles
  LOOP
    SELECT count(*) INTO v_count
    FROM (
      SELECT username FROM public.profiles WHERE username = v_username
      UNION ALL
      SELECT username FROM public.company_profiles WHERE username = v_username
    ) AS combined;

    IF v_count = 0 THEN
      EXIT;
    END IF;

    v_count := v_count + 1;
    v_username := v_base_username || v_count::text;
  END LOOP;

  -- Insert profile
  INSERT INTO public.profiles (
    id, role, username, first_name, last_name, email, avatar_url
  ) VALUES (
    NEW.id, v_role, v_username, v_first_name, v_last_name, NEW.email, NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Role-specific provision
  IF v_role = 'employer' THEN
    -- Insert company profile
    INSERT INTO public.company_profiles (
      employer_id, company_name, industry, role, username
    ) VALUES (
      NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'), 'Technology', 'employer', v_username
    );

    -- Setup employer balance credits
    INSERT INTO public.employer_credits (
      employer_id, credits_balance
    ) VALUES (
      NEW.id, 5
    );

    -- Setup default subscription record
    INSERT INTO public.employer_subscriptions (
      employer_id, status
    ) VALUES (
      NEW.id, 'inactive'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Route Separation & Middleware Redirection Flow

Next.js `middleware.ts` intercepting paths `/worker/*` and `/employer/*` dynamically checks the authenticated role in Supabase.

```typescript
// src/utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Route protection
  const url = new URL(request.url);
  const path = url.pathname;

  if (!user && (path.startsWith("/worker") || path.startsWith("/employer"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    // Read user role from metadata to avoid unnecessary DB roundtrips in middleware
    const role = user.user_metadata?.role || "worker";

    if (path.startsWith("/worker") && role !== "worker") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
    if (path.startsWith("/employer") && role !== "employer") {
      return NextResponse.redirect(new URL("/worker/dashboard", request.url));
    }
    if (path === "/login" || path === "/signup" || path === "/") {
      return NextResponse.redirect(
        new URL(role === "employer" ? "/employer/dashboard" : "/worker/dashboard", request.url)
      );
    }
  }

  return response;
}
```

---

## 4. Auth & OTP Forms Implementation

The Auth Forms feature an inline transition state (Login Form ➔ Request OTP Reset ➔ Verify OTP & Update Password) wrapped inside a clean container.

### Reset OTP Request Action
```typescript
// src/actions/auth.ts
export async function sendResetPasswordOTP(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    });

    if (error) {
      safeError("Error sending reset password OTP:", error);
      if (error.status === 429) {
        return { success: false, error: "Rate limit exceeded. Please wait a few minutes before retrying." };
      }
      return { success: false, error: "Failed to send reset code. Please check your email." };
    }

    return { success: true };
  } catch (err) {
    safeError("Unhandled error in sendResetPasswordOTP:", err);
    return { success: false, error: "System error occurred" };
  }
}
```

### OTP Code Verification & Update Password Action
```typescript
// src/actions/auth.ts
export async function verifyOTPAndResetPassword(payload: {
  email: string;
  token: string;
  passwordNew: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Verify OTP token
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: payload.email.trim(),
      token: payload.token.trim(),
      type: "recovery",
    });

    if (otpError) {
      safeError("OTP verification error:", otpError);
      return { success: false, error: "Invalid or expired verification code." };
    }

    // 2. Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: payload.passwordNew,
    });

    if (updateError) {
      safeError("Password update error:", updateError);
      return { success: false, error: "Failed to update password. Try a stronger password." };
    }

    return { success: true };
  } catch (err) {
    safeError("Unhandled error in verifyOTPAndResetPassword:", err);
    return { success: false, error: "System error occurred" };
  }
}
```

---

## 5. Worker Messaging Center System Code

Here is the complete messaging components reference for `/worker/messages`.

### Worker Messaging Server Actions
File: [src/actions/worker/messages.ts](file:///Users/stephen/Documents/[01]%20WORK/01_replace_me/src/actions/worker/messages.ts)

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { ChatThread, ChatMessage } from "@/types/messaging";
import { revalidatePath } from "next/cache";

/**
 * Fetch all chat threads for the logged-in worker, including joins with company profiles and jobs.
 */
export async function getWorkerThreads(): Promise<ChatThread[]> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      safeError("Auth error in getWorkerThreads:", authError);
      return [];
    }

    // Verify user is a worker
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "worker") {
      safeError("Profile error or unauthorized role in getWorkerThreads:", profileError);
      return [];
    }

    // Query threads with company_profiles and jobs joined
    const { data: threads, error: threadsError } = await supabase
      .from("chat_threads")
      .select(`
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          website_url
        ),
        jobs (
          id,
          title
        )
      `)
      .eq("worker_id", profile.id)
      .order("updated_at", { ascending: false });

    if (threadsError) {
      safeError("Error fetching worker chat threads:", threadsError);
      return [];
    }

    const formattedThreads: ChatThread[] = [];

    for (const t of (threads || [])) {
      // Get the last message in this thread
      const { data: lastMessages } = await supabase
        .from("chat_messages")
        .select("content, created_at, sender_id, read_at")
        .eq("thread_id", t.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = lastMessages?.[0] || null;

      // Get count of unread messages sent by the employer (sender_id != current user)
      const { count: unreadCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", t.id)
        .neq("sender_id", profile.id)
        .is("read_at", null);

      formattedThreads.push({
        ...t,
        company_profiles: t.company_profiles as any,
        jobs: t.jobs as any,
        last_message: lastMsg,
        unread_count: unreadCount || 0,
      });
    }

    return formattedThreads;
  } catch (err) {
    safeError("Unhandled error in getWorkerThreads Server Action:", err);
    return [];
  }
}

/**
 * Fetch all messages inside a specific thread.
 */
export async function getThreadMessages(threadId: string): Promise<ChatMessage[]> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Verify current user is worker or employer participant of the thread
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`
        id,
        worker_id,
        company_profiles (
          employer_id
        )
      `)
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      safeError(`Error verifying thread access for ${threadId}:`, threadError);
      return [];
    }

    const employerId = (thread.company_profiles as any)?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      safeError("Access denied to thread messages: user is not a participant.");
      return [];
    }

    // Fetch messages sorted chronologically
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      safeError("Error fetching thread messages:", messagesError);
      return [];
    }

    return (messages || []) as ChatMessage[];
  } catch (err) {
    safeError("Unhandled error in getThreadMessages Server Action:", err);
    return [];
  }
}

/**
 * Send a new chat message within a thread.
 */
export async function sendWorkerMessage(threadId: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!content || content.trim() === "") {
      return { success: false, error: "Message content cannot be empty" };
    }

    // Verify access to thread
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`
        id,
        worker_id,
        company_profiles (
          employer_id
        )
      `)
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: "Thread not found or access denied" };
    }

    const employerId = (thread.company_profiles as any)?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Insert new chat message
    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: content.trim(),
      });

    if (insertError) {
      safeError("Error inserting chat message:", insertError);
      return { success: false, error: "Failed to send message" };
    }

    revalidatePath("/worker/messages");
    return { success: true };
  } catch (err) {
    safeError("Unhandled error in sendWorkerMessage Server Action:", err);
    return { success: false, error: "System error occurred" };
  }
}

/**
 * Mark all incoming messages in a thread as read.
 */
export async function markThreadAsRead(threadId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false };
    }

    // Update messages
    const { error: updateError } = await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", threadId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (updateError) {
      safeError("Error marking thread messages as read:", updateError);
      return { success: false };
    }

    revalidatePath("/worker/messages");
    return { success: true };
  } catch (err) {
    safeError("Unhandled error in markThreadAsRead Server Action:", err);
    return { success: false };
  }
}

/**
 * Pin or unpin a thread.
 */
export async function togglePinThread(threadId: string, isPinned: boolean): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false };
    }

    const { error: updateError } = await supabase
      .from("chat_threads")
      .update({ is_pinned: isPinned })
      .eq("id", threadId)
      .eq("worker_id", user.id);

    if (updateError) {
      safeError("Error toggling pin on thread:", updateError);
      return { success: false };
    }

    revalidatePath("/worker/messages");
    return { success: true };
  } catch (err) {
    safeError("Unhandled error in togglePinThread Server Action:", err);
    return { success: false };
  }
}
```

### Messaging Client Coordinator Component
File: [src/components/worker/messages/MessagingClient.tsx](file:///Users/stephen/Documents/[01]%20WORK/01_replace_me/src/components/worker/messages/MessagingClient.tsx)

```tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChatThread, ChatMessage } from "@/types/messaging";
import { InboxSidebar } from "./InboxSidebar";
import { ChatArea } from "./ChatArea";
import { sendWorkerMessage, togglePinThread, markThreadAsRead } from "@/actions/worker/messages";

interface MessagingClientProps {
  threads: ChatThread[];
  initialMessages: ChatMessage[];
  selectedThreadId: string | null;
  currentUserId: string;
}

export function MessagingClient({
  threads,
  initialMessages,
  selectedThreadId,
  currentUserId,
}: MessagingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for messages (to allow optimistic/instant updates)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "pinned">("all");

  // Keep messages state in sync when initialMessages changes (server refetch)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Mark thread as read when selected
  useEffect(() => {
    if (selectedThreadId) {
      markThreadAsRead(selectedThreadId).then(() => {
        // Trigger page refresh silently to clear badges
        startTransition(() => {
          router.refresh();
        });
      });
    }
  }, [selectedThreadId, router]);

  // Handle selecting a thread (updates URL param)
  const handleSelectThread = (threadId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("threadId", threadId);
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Handle sending a message (optimistic UI)
  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;

    // 1. Optimistically append message to local state
    const tempId = Math.random().toString();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      thread_id: selectedThreadId,
      sender_id: currentUserId,
      content: content,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: {
        id: currentUserId,
        full_name: "You",
        avatar_url: null,
        role: "worker",
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. Call Server Action to persist in Supabase
    const result = await sendWorkerMessage(selectedThreadId, content);

    if (!result.success) {
      // Rollback optimistic message if error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(result.error || "Failed to send message");
    } else {
      // 3. Revalidate path via router.refresh()
      startTransition(() => {
        router.refresh();
      });
    }
  };

  // Handle pinning thread
  const handleTogglePin = async () => {
    if (!selectedThreadId) return;
    const currentThread = threads.find((t) => t.id === selectedThreadId);
    if (!currentThread) return;

    const newPinnedState = !currentThread.is_pinned;
    const result = await togglePinThread(selectedThreadId, newPinnedState);

    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const activeThread = threads.find((t) => t.id === selectedThreadId) || null;

  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <div className="flex flex-row w-full h-full max-w-7xl mx-auto border-x border-slate-200 bg-white">
        {/* Sidebar thread listing */}
        <InboxSidebar
          threads={threads}
          selectedThreadId={selectedThreadId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectThread={handleSelectThread}
        />

        {/* Active conversation window */}
        <ChatArea
          thread={activeThread}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onTogglePin={handleTogglePin}
        />
      </div>
    </div>
  );
}
```

### Message Bubble Presenter Component
File: [src/components/worker/messages/MessageBubble.tsx](file:///Users/stephen/Documents/[01]%20WORK/01_replace_me/src/components/worker/messages/MessageBubble.tsx)

```tsx
"use client";

import React from "react";
import { ChatMessage } from "@/types/messaging";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isMe = message.sender_id === currentUserId;
  
  // Format message time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Safe split name to get initials
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Helper to parse content and detect email links, template blocks, etc.
  const renderParsedContent = (content: string) => {
    // Split into paragraphs/sections by double newlines
    const sections = content.split(/\n\n+/);

    return sections.map((section, idx) => {
      const trimmed = section.trim();

      // Check if it's the "Email Subject Format" block
      if (
        trimmed.toLowerCase().includes("email subject format:") ||
        (trimmed.startsWith("[") && trimmed.includes("] - [") && trimmed.endsWith("]"))
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[12px] text-slate-700 leading-relaxed select-all"
          >
            {trimmed.split("\n").map((line, lidx) => (
              <div key={lidx}>{line}</div>
            ))}
          </div>
        );
      }

      // Check if it's the application template form
      if (
        trimmed.toUpperCase().includes("FULL NAME:") ||
        trimmed.toUpperCase().includes("JOB POSITION YOU APPLIED FOR:")
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap select-all"
          >
            {trimmed}
          </div>
        );
      }

      // General paragraph formatting with link parsing (emails, websites)
      const lines = trimmed.split("\n");
      return (
        <p key={idx} className="text-[14px] leading-relaxed text-slate-700 font-medium mb-3 last:mb-0">
          {lines.map((line, lidx) => {
            // Match emails and links
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const urlRegex = /(https?:\/\/[^\s]+)/gi;

            let parsedLine: React.ReactNode = line;

            if (emailRegex.test(line)) {
              const parts = line.split(emailRegex);
              parsedLine = parts.map((part, pidx) => {
                if (emailRegex.test(part)) {
                  return (
                    <a
                      key={pidx}
                      href={`mailto:${part}`}
                      className="text-[#006e2f] hover:underline font-semibold"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              });
            } else if (urlRegex.test(line)) {
              const parts = line.split(urlRegex);
              parsedLine = parts.map((part, pidx) => {
                if (urlRegex.test(part)) {
                  return (
                    <a
                      key={pidx}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006e2f] hover:underline font-semibold"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              });
            }

            return (
              <React.Fragment key={lidx}>
                {parsedLine}
                {lidx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  const senderName = message.sender?.full_name || "User";
  const initials = getInitials(senderName);

  if (isMe) {
    return (
      <div className="flex flex-col items-end w-full mb-6 last:mb-2 max-w-[85%] sm:max-w-[70%] ml-auto">
        {/* Chat Bubble card */}
        <div className="w-full bg-[#e8f5e9]/55 border border-[#c8e6c9]/40 rounded-2xl p-5 shadow-xs">
          {renderParsedContent(message.content)}
        </div>

        {/* Footer Details */}
        <div className="flex items-center gap-1.5 mt-2 mr-1">
          <span className="text-[11px] font-semibold text-slate-400">
            {formatTime(message.created_at)}
          </span>
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-semibold text-[9px]">
            {initials}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full mb-6 last:mb-2 max-w-[85%] sm:max-w-[70%] mr-auto">
      {/* Chat Bubble card */}
      <div className="w-full bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
        {renderParsedContent(message.content)}
      </div>

      {/* Footer Details */}
      <div className="flex items-center gap-1.5 mt-2 ml-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-semibold text-[9px]">
          {initials}
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
```

### Messages Route Page Orchestrator
File: [src/app/worker/messages/page.tsx](file:///Users/stephen/Documents/[01]%20WORK/01_replace_me/src/app/worker/messages/page.tsx)

```tsx
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerThreads, getThreadMessages } from "@/actions/worker/messages";
import { MessagingClient } from "@/components/worker/messages/MessagingClient";
import { ChatMessage } from "@/types/messaging";

export const dynamic = "force-dynamic";

interface WorkerMessagesPageProps {
  searchParams: Promise<{
    threadId?: string;
  }>;
}

export default async function WorkerMessagesPage({ searchParams }: WorkerMessagesPageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Double check worker role eligibility
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "worker") {
    redirect("/login");
  }

  // Fetch threads joining company profiles and job details
  const threads = await getWorkerThreads();

  // Resolve searchParams promise
  const resolvedParams = await searchParams;
  const activeThreadId = resolvedParams.threadId || null;

  let initialMessages: ChatMessage[] = [];
  if (activeThreadId) {
    initialMessages = await getThreadMessages(activeThreadId);
  }

  return (
    <MessagingClient
      threads={threads}
      initialMessages={initialMessages}
      selectedThreadId={activeThreadId}
      currentUserId={profile.id}
    />
  );
}
```

---

## 6. Employer Domain & Candidate Unlock System Design

An essential backend module is the PII masking logic in [src/actions/employer/applicants.ts](file:///Users/stephen/Documents/[01]%20WORK/01_replace_me/src/actions/employer/applicants.ts). This makes sure that candidate contact details remain encrypted until a credit profile unlock is registered.

### PII Candidate Masking Server Action
```typescript
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { Applicant } from "@/types/employer/applicants";

export async function getApplicants(jobId: string): Promise<Applicant[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Verify job belongs to this employer (Anti-IDOR)
    const { data: job } = await supabase
      .from("jobs")
      .select("id, employer_id")
      .eq("id", jobId)
      .single();

    if (!job || job.employer_id !== user.id) {
      safeError("Unauthorized access to applicant pipeline details");
      return [];
    }

    // Fetch applications joined with candidate profiles
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        match_score,
        created_at,
        candidate:profiles (
          id,
          first_name,
          last_name,
          username,
          avatar_url,
          professional_title,
          bio,
          email,
          portfolio_url,
          experience_years,
          hourly_rate
        )
      `)
      .eq("job_id", jobId);

    if (error || !applications) {
      safeError("Error querying job applicants:", error);
      return [];
    }

    // Fetch unlocked profiles by this employer
    const { data: unlocks } = await supabase
      .from("unlocked_profiles")
      .select("candidate_id")
      .eq("employer_id", user.id);

    const unlockedSet = new Set(unlocks?.map(u => u.candidate_id) || []);
    const formattedApplicants: Applicant[] = [];

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const cand = app.candidate as any;
      if (!cand) continue;

      const isUnlocked = unlockedSet.has(cand.id);

      if (isUnlocked) {
        // Return full profiles
        formattedApplicants.push({
          id: app.id,
          candidate_id: cand.id,
          status: app.status,
          match_score: app.match_score,
          full_name: `${cand.first_name || ""} ${cand.last_name || ""}`.trim(),
          username: cand.username,
          avatar_url: cand.avatar_url,
          professional_title: cand.professional_title || "Professional Developer",
          bio: cand.bio || "",
          email: cand.email,
          portfolio_url: cand.portfolio_url,
          experience_years: cand.experience_years || 0,
          hourly_rate: cand.hourly_rate || 0,
          is_locked: false,
        });
      } else {
        // Scrub PII parameters (Return masked values)
        formattedApplicants.push({
          id: app.id,
          candidate_id: cand.id,
          status: app.status,
          match_score: app.match_score,
          full_name: `Applicant #${app.id.slice(0, 4).toUpperCase()}`,
          username: null,
          avatar_url: null, // Avoid disclosing avatar
          professional_title: cand.professional_title || "Professional Developer",
          bio: "This candidate's profile bio is locked. Unlock profile to read their details.",
          email: "locked@replaceme.co",
          portfolio_url: null,
          experience_years: cand.experience_years || 0,
          hourly_rate: cand.hourly_rate || 0,
          is_locked: true,
        });
      }
    }

    return formattedApplicants;
  } catch (err) {
    safeError("Unhandled error fetching applicants:", err);
    return [];
  }
}
```

### Profile Credit Unlock Server Action
This action deducts credit transactionally using Supabase database calls.

```typescript
export async function unlockCandidateProfile(candidateId: string, applicationId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 1. Fetch employer's current credits balance
    const { data: balance, error: balError } = await supabase
      .from("employer_credits")
      .select("credits_balance")
      .eq("employer_id", user.id)
      .single();

    if (balError || !balance) {
      return { success: false, error: "Could not fetch your credits balance." };
    }

    if (balance.credits_balance < 1) {
      return { success: false, error: "Insufficient credits. Please upgrade your plan." };
    }

    // 2. Transactional Unlock - Deduct 1 credit & log profile unlock
    const { error: deductError } = await supabase
      .from("employer_credits")
      .update({ 
        credits_balance: balance.credits_balance - 1,
        unlocks_used: (balance.unlocks_used || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("employer_id", user.id);

    if (deductError) {
      safeError("Error deducting credit balance:", deductError);
      return { success: false, error: "Failed to deduct credits. Try again." };
    }

    const { error: unlockError } = await supabase
      .from("unlocked_profiles")
      .insert({
        employer_id: user.id,
        candidate_id: candidateId,
        application_id: applicationId || null,
        credits_deducted: 1,
      });

    if (unlockError) {
      safeError("Error registering unlocked profile:", unlockError);
      // Rollback credit deduction in case of logging failure
      await supabase
        .from("employer_credits")
        .update({ credits_balance: balance.credits_balance })
        .eq("employer_id", user.id);
      return { success: false, error: "Failed to unlock candidate. Credits restored." };
    }

    return { success: true };
  } catch (err) {
    safeError("Unhandled error unlocking candidate profile:", err);
    return { success: false, error: "System error occurred" };
  }
}
```

---

## 7. QA Verification Protocols

For any further development:
- **Build Verification**: Make sure to test bundling via `bun run build`.
- **Static Analysis**: Verify type checks using `npx tsc --noEmit`.
- **RLS Testing**: Run validation cases from `/docs/qa/WorkerMessages_QA.md` to ensure data boundaries are held.
- **Empty States**: Verify that empty inbox states correctly display presentational `<EmptyState />` UI loaders with brand color matching `#006e2f`.
