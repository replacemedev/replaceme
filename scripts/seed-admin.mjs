/**
 * Seeds the local/dev admin test account via Supabase Auth Admin API.
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run seed:admin
 *   npm run db:seed          # alias
 *
 * After `supabase db reset`, run this script (SQL seed no longer inserts into auth.users).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ADMIN_EMAIL = "replacemeadmin@example.com";
const ADMIN_PASSWORD = "replacemeadmin123";
const ADMIN_USERNAME = "replacemeadmin";

function loadEnvFile(filename) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example → .env.local and add your service_role key from\n" +
      "Supabase Dashboard → Project Settings → API, then run: npm run seed:admin"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureAdminProfile(userId) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      role: "admin",
      first_name: "Admin",
      last_name: "User",
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

async function main() {
  console.log(`[seed:admin] Target: ${ADMIN_EMAIL}`);

  const existing = await findUserByEmail(ADMIN_EMAIL);
  const userPayload = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    app_metadata: {
      provider: "email",
      providers: ["email"],
      role: "admin",
    },
    user_metadata: {
      first_name: "Admin",
      last_name: "User",
      username: ADMIN_USERNAME,
      role: "admin",
    },
  };

  let userId;

  if (existing) {
    console.log("[seed:admin] User exists — updating password and admin claims...");
    const { data, error } = await supabase.auth.admin.updateUserById(
      existing.id,
      userPayload
    );

    if (error) {
      console.warn(
        "[seed:admin] Update failed (likely legacy SQL seed). Recreating user via Admin API..."
      );
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        existing.id
      );
      if (deleteError) throw deleteError;

      const { data: created, error: createError } =
        await supabase.auth.admin.createUser(userPayload);
      if (createError) throw createError;
      userId = created.user.id;
    } else {
      userId = data.user.id;
    }
  } else {
    console.log("[seed:admin] Creating admin user via Auth Admin API...");
    const { data, error } = await supabase.auth.admin.createUser(userPayload);
    if (error) throw error;
    userId = data.user.id;
  }

  await ensureAdminProfile(userId);

  console.log("[seed:admin] Done.");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  User ID:  ${userId}`);
  console.log("  Claims:   app_metadata.role = admin");
}

main().catch((error) => {
  console.error("[seed:admin] Failed:", error.message ?? error);
  process.exit(1);
});
