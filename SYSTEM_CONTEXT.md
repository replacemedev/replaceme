# System Context & Architecture Directory

This document serves as the comprehensive technical directory and system context for the **ReplaceMe** remote hiring platform. It maps out the design, stack, codebase organization, database schema, payment flow, and security configurations.

---

## 1. System Overview

**ReplaceMe** is a modern SaaS recruitment marketplace connecting businesses/employers with remote workers across key domains, including:
* Content Creation & Copywriting
* UI/UX & Graphic Design
* Virtual Assistance & Admin Support
* Social Media & Community Management

The architecture is built around a split-role design (Employers vs. Workers) using Next.js App Router Server Actions for backend tasks and Supabase as the primary database, auth, and storage provider.

---

## 2. Technology Stack

### Frontend & Core Layout
* **Framework:** Next.js `16.2.9` (App Router)
* **Runtime Library:** React `19.2.4`
* **Language:** TypeScript `^5`
* **Styling:** Tailwind CSS `^4` (using PostCSS `^4`)
* **Icons:** Lucide React `^1.21.0`
* **Notifications:** Sonner `^2.0.7` (toast alerts)

### Backend, Auth & Storage
* **Database & Auth Provider:** Supabase
* **Client Library:** `@supabase/supabase-js` `^2.108.2`
* **SSR Integration:** `@supabase/ssr` `^0.12.0` (handling cookie storage and server client instantiation)

### State Management & Forms
* **Form Handling:** React Hook Form `^7.80.0`
* **Validation Schema:** Zod `^4.4.3`
* **Resolvers:** `@hookform/resolvers` `^5.4.0`

### Payments & Billing
* **Payment Processor:** Stripe `^22.2.2`

---

## 3. Codebase Structure

The code is organized under a modular architecture separating presentation components, server actions, typings, database utilities, and page routes:

```
├── .next/                    # Next.js build outputs
├── public/                   # Static assets (images, favicon, etc.)
├── supabase/                 # Supabase configuration & migrations
├── src/
│   ├── app/                  # Next.js App Router (pages, layouts, API routes)
│   │   ├── (auth)/           # Authentication routes (login, register)
│   │   ├── (employer)/       # Protected employer dashboard & settings
│   │   └── layout.tsx        # Global layout component
│   │
│   ├── actions/              # Decoupled Server Actions (Data Fetching & Mutations)
│   │   ├── auth.ts           # Session and auth mutations
│   │   └── employer/         # Employer domain server actions
│   │       ├── applicants.ts # Applicant state management
│   │       ├── billing.ts    # Stripe checkout flows
│   │       ├── company.ts    # Employer profile update actions
│   │       ├── dashboard.ts  # Dashboard metrics fetch
│   │       ├── jobs.ts       # Job creation, editing, & deletion actions
│   │       └── messages.ts   # Chat & message thread database actions
│   │
│   ├── components/           # UI Components
│   │   ├── ui/               # Core atomic design system elements
│   │   ├── layout/           # Shared layout shells (Headers, Footers, Navbars)
│   │   └── employer/         # Complex components specific to the Employer UI
│   │
│   ├── lib/                  # Library configs
│   │   └── supabase/
│   │       └── server.ts     # Supabase Server Client helper with cookie handling
│   │
│   ├── types/                # TypeScript interfaces and type definitions
│   ├── utils/                # Utility helpers (e.g. logger, string formatters)
│   └── proxy.ts              # Proxy routing configurations
```

---

## 4. Database Schema (PostgreSQL)

The database runs on Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.

### Custom Enums & Roles
```sql
CREATE TYPE user_role AS ENUM ('employer', 'worker', 'admin');
```

### Profiles Table
Maps directly to auth users and holds common user metadata.
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'worker',
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_auth_user UNIQUE (auth_user_id)
);
```

### Role-Specific Profile Extensions
Extends profiles with role-specific parameters for Employers and Workers.
```sql
CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_employer_profile UNIQUE (profile_id)
);

CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_title TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_worker_profile UNIQUE (profile_id)
);
```

### Jobs Table
Stores job advertisements posted by Employers.
```sql
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_salary NUMERIC NOT NULL,
  hours_per_week NUMERIC NOT NULL,
  skills TEXT[] NOT NULL,
  notification_preference TEXT NOT NULL DEFAULT 'daily',
  status TEXT NOT NULL DEFAULT 'Pending Review',
  intent TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Database Triggers
A trigger automates the creation of a `profile` and a role-specific record (`employers` or `workers`) upon a successful user signup in Supabase Auth:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  user_role_val user_role;
BEGIN
  BEGIN
    user_role_val := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::user_role;
  END;

  INSERT INTO public.profiles (
    auth_user_id,
    email,
    username,
    first_name,
    last_name,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'last_name',
    user_role_val
  ) RETURNING id INTO new_profile_id;

  IF user_role_val = 'employer'::user_role THEN
    INSERT INTO public.employers (profile_id, company_name)
    VALUES (new_profile_id, COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'));
  ELSIF user_role_val = 'worker'::user_role THEN
    INSERT INTO public.workers (profile_id)
    VALUES (new_profile_id);
  END IF;

  RETURN new;
END;
$$;
```

---

## 5. Security & Row Level Security (RLS)

All database queries are guarded by strict Row Level Security (RLS) policies.

* **Profiles:** Users can only view or update their own profile records (`auth.uid() = auth_user_id`).
* **Employers:** Employers can only access their specific company metrics (profile joined matching `auth.uid()`).
* **Workers:** Workers can only access their own profile detail extensions.
* **Jobs:**
  * Employers have full CRUD control over their own job advertisements.
  * Public users (Workers) can only view active/approved jobs (`status = 'Active'`).

---

## 6. Subscription & Payment Strategy (Stripe)

Billing is separated into three tiers with localized configurations:
1. **Discovery:** Free/starter access with limited applicant unlocks.
2. **Essential:** Standard tier for growing teams.
3. **Professional:** Unlimited listings, priority support, and advanced unlocks.

* **Upgrade Flow:** Handled via Stripe Checkout. Server actions create checkout sessions returning validation redirect URLs (`checkout.stripe.com/pay/...`).
* **State Updates:** Session updates triggers and Stripe webhooks update `stripe_customer_id` and corresponding plan values.
