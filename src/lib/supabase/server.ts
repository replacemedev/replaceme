import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Vercel Serverless & Supabase Connection Pooling Optimization:
 * 
 * 1. SERVERLESS INSTANTIATION:
 *    Next.js App Router calls this function for every server-side operation (Server Components, Actions, Routes).
 *    To prevent cookie read/write overhead and redundant fetches, cookie Store is accessed on-demand.
 * 
 * 2. DATABASE CONNECTION POOLING (Supavisor):
 *    When deploying on Vercel, serverless scaling can spin up hundreds of concurrent functions.
 *    If direct PostgreSQL connections (port 5432) are used, the database will quickly throw "too many connections" errors.
 *    
 *    To configure connection pooling in the Vercel Dashboard:
 *    - Go to Vercel Project Settings -> Environment Variables.
 *    - Configure your database connection string using Supabase's built-in connection pooler (Supavisor).
 *    - Use TRANSACTION MODE (Port 6543) for serverless operations (e.g., Prisma, Drizzle, or direct PG drivers).
 *      Example connection string: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
 *      Note the `?pgbouncer=true` parameter (or `?sslmode=require`).
 *    - Avoid SESSION MODE (Port 5432) in serverless environments as it binds each PostgreSQL connection to a single client,
 *      quickly exhausting the database connection limit under load.
 */

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// For accessing Supabase with elevated privileges (e.g., updating profiles after creation)
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )
}

