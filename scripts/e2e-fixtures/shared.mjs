import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_DEV_PASSWORD = "E2eFixture!2026";

export function loadEnvFile(filename) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
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

export function initEnv() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
}

export function assertSeedEnabled() {
  if (process.env.E2E_SEED_ENABLED !== "1") {
    console.error(
      "[seed:e2e] Refusing to run: set E2E_SEED_ENABLED=1 in .env.local (never in production)."
    );
    process.exit(1);
  }
}

export function assertNotProduction() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").toLowerCase();
  const blocked = ["prod", "production", "live"];
  if (blocked.some((token) => url.includes(token))) {
    console.error("[seed:e2e] Refusing to seed a production Supabase URL.");
    process.exit(1);
  }
}

export function getPassword(envKey) {
  const value = process.env[envKey];
  if (value) return value;
  console.warn(
    `[seed:e2e] ${envKey} unset — using default dev password (${DEFAULT_DEV_PASSWORD})`
  );
  return DEFAULT_DEV_PASSWORD;
}

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function upsertRows(supabase, table, rows, onConflict = "id") {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table} upsert failed: ${error.message}`);
}

export async function deleteByIds(supabase, table, column, ids) {
  if (!ids.length) return;
  const { error } = await supabase.from(table).delete().in(column, ids);
  if (error) throw new Error(`${table} delete failed: ${error.message}`);
}

export async function resolveExistingUserId(supabase, email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(`Profile lookup failed: ${error.message}`);
  return data?.id ?? null;
}

export function formatAuthError(error) {
  if (!error) return "unknown error";
  const parts = [error.message, error.code, error.status, error.name].filter(
    Boolean
  );
  if (parts.length > 0) return parts.join(" | ");
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export async function ensureAuthUser(supabase, {
  id,
  email,
  password,
  role,
  firstName,
  lastName,
  username,
}) {
  const userPayload = {
    email,
    password,
    email_confirm: true,
    app_metadata: { provider: "email", providers: ["email"], role },
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      username,
      role,
    },
  };

  let userId = id ?? (await resolveExistingUserId(supabase, email));

  if (userId) {
    const { error } = await supabase.auth.admin.updateUserById(userId, userPayload);
    if (error) {
      await supabase.auth.admin.deleteUser(userId);
      const { data, error: createError } = await supabase.auth.admin.createUser({
        ...userPayload,
        id: userId,
      });
      if (createError)
        throw new Error(`createUser failed: ${formatAuthError(createError)}`);
      userId = data.user.id;
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      ...userPayload,
      ...(id ? { id } : {}),
    });
    if (error) throw new Error(`createUser failed: ${formatAuthError(error)}`);
    userId = data.user.id;
  }

  return userId;
}

export async function fetchPlanIdsBySlug(supabase) {
  const { data, error } = await supabase
    .from("billing_plans")
    .select("id, slug")
    .in("slug", ["discovery", "starter", "growth", "scale"]);
  if (error) throw new Error(`billing_plans fetch failed: ${error.message}`);
  const map = Object.fromEntries((data ?? []).map((p) => [p.slug, p.id]));
  for (const slug of ["discovery", "starter", "growth", "scale"]) {
    if (!map[slug]) {
      throw new Error(
        `Missing billing_plans row for slug "${slug}". Run Layer 1B migration first.`
      );
    }
  }
  return map;
}
