"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  employerSignUpSchema,
  workerSignUpSchema,
  type SignUpFormValues,
} from "@/lib/validations/auth";
import {
  loginCredentialsSchema,
  type LoginCredentials,
} from "@/lib/validations/auth";
import { ROLE_HOME_PATH } from "@/config/navigation";
import { safeLog, safeError } from "@/utils/logger";
import { authCallbackUrl } from "@/lib/auth/site-url";
import { syncResendContactForUser } from "@/lib/server/resend/contact-sync";
import { isAppRole, profileIdFilter } from "@/lib/auth/role";
import { resolvePostAuthRedirect } from "@/lib/auth/safe-callback-url";
import {
  forgotPasswordSchema,
  updatePasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import Stripe from "stripe";
import { formatFullName } from "@/lib/format/name";
import { assertRateLimit } from "@/lib/server/rate-limit";
import {
  extractErrorMessage,
  mapSignupDatabaseError,
} from "@/lib/auth/error-message";
import {
  requireTurnstileToken,
  isTurnstileEnabled,
} from "@/lib/turnstile/verify";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/server/login-lockout";

function captchaAuthOptions(
  token: string
): { captchaToken: string } | Record<string, never> {
  if (!isTurnstileEnabled()) return {};
  return { captchaToken: token };
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any,
    })
  : null;

function handleAuthError(error: unknown): string {
  const message = mapSignupDatabaseError(extractErrorMessage(error));

  if (
    message.includes("fetch failed") ||
    message.includes("ConnectTimeoutError") ||
    message.includes("UND_ERR_CONNECT_TIMEOUT")
  ) {
    return "Network error: Connection to the authentication server timed out. Please check your internet connection and try again.";
  }

  if (message.includes("Email not confirmed")) {
    return "Please confirm your email address before logging in. A confirmation link was sent to your email.";
  }

  if (message.includes("Invalid login credentials")) {
    return "Invalid email, username, or password. Please try again.";
  }

  return message;
}

async function profileExistsByEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = await createAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      safeError("[Auth] profile email lookup failed:", error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    safeError("[Auth] profile email lookup unexpected error:", error);
    return false;
  }
}

/** Login identifier → auth email. Usernames require service role (RLS blocks anon SELECT on profiles). */
async function resolveEmailForLogin(identifier: string): Promise<string | null> {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = await createAdminClient();

    const { data: profileRow, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("username", trimmed)
      .maybeSingle();

    if (profileError) {
      safeError("[Auth] username lookup on profiles failed:", profileError);
    } else if (profileRow?.email) {
      return profileRow.email.trim().toLowerCase();
    }

    const { data: companyRow, error: companyError } = await admin
      .from("company_profiles")
      .select("employer_id")
      .eq("username", trimmed)
      .maybeSingle();

    if (companyError) {
      safeError("[Auth] username lookup on company_profiles failed:", companyError);
      return null;
    }

    if (!companyRow?.employer_id) return null;

    const { data: employerProfile, error: employerError } = await admin
      .from("profiles")
      .select("email")
      .eq("id", companyRow.employer_id)
      .maybeSingle();

    if (employerError) {
      safeError("[Auth] employer email lookup failed:", employerError);
      return null;
    }

    return employerProfile?.email?.trim().toLowerCase() ?? null;
  } catch (error) {
    safeError("[Auth] resolveEmailForLogin unexpected error:", error);
    return null;
  }
}

export async function signUp(formData: SignUpFormValues) {
  try {
    const role = formData.role;
    safeLog(`[Auth] Sign-up initiated for role: ${role}`);

    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "anonymous";
    const emailKey = formData.email?.trim().toLowerCase() ?? "unknown";

    const rateLimit = await assertRateLimit("signup", {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      identifier: `${ip}:${emailKey}`,
    });
    if (!rateLimit.ok) {
      return { success: false, error: rateLimit.error };
    }

    const supabase = await createClient();

    // 1. Validate Form Data using strict schemas
    const schema = role === "employer" ? employerSignUpSchema : workerSignUpSchema;
    const parsed = schema.safeParse(formData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    const turnstile = await requireTurnstileToken(data.turnstileToken, ip);
    if (!turnstile.success) {
      return { success: false, error: turnstile.error };
    }

    const firstName = data.firstName.trim();
    const middleName = data.middleName?.trim() || "";
    const lastName = data.lastName.trim();
    const suffix = "suffix" in data ? (data.suffix as string | undefined)?.trim() : "";
    const phoneNumber = "phoneNumber" in data ? (data.phoneNumber as string | undefined)?.trim() : "";
    const fullName = formatFullName(firstName, middleName, lastName, suffix);

    // 2. Sign up with Supabase Auth
    // We pass metadata that the Postgres trigger will use to populate the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        ...captchaAuthOptions(turnstile.token),
        emailRedirectTo: authCallbackUrl("signup", "/signin"),
        data: {
          role: data.role,
          username: data.username,
          full_name: fullName,
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName,
          suffix: suffix || null,
          phone_number: phoneNumber || null,
        },
      },
    });

    if (authError) {
      const msg = extractErrorMessage(authError);
      const mapped = mapSignupDatabaseError(msg);
      if (mapped === "auth/username-already-exists") {
        return { success: false, error: "auth/username-already-exists" };
      }
      if (mapped === "auth/email-already-exists") {
        return { success: false, error: "auth/email-already-exists" };
      }
      if (
        msg.includes("profiles_username_key") ||
        msg.includes("company_profiles_username_key") ||
        msg.includes("username") ||
        msg.includes("Username") ||
        msg.includes("already exists") ||
        msg.includes("23505")
      ) {
        return { success: false, error: "auth/username-already-exists" };
      }
      if (
        msg.includes("already registered") ||
        msg.includes("Email already exists") ||
        (msg.includes("email") && msg.includes("already exists"))
      ) {
        return { success: false, error: "auth/email-already-exists" };
      }
      return { success: false, error: handleAuthError(authError) };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user account." };
    }

    // Resend contact sync (for future broadcasts). Safe to run even if email confirmation is pending.
    try {
      const isEmployer = role === "employer";
      await syncResendContactForUser({
        userId: authData.user.id,
        email: authData.user.email ?? data.email,
        firstName,
        lastName: lastName || null,
        role: isEmployer ? "employer" : "worker",
        tierSlug: isEmployer ? "discovery" : null,
        companyName:
          isEmployer && "companyName" in (data as any)
            ? ((data as any).companyName as string)
            : null,
      });
    } catch (err) {
      safeError("[Auth] Resend contact sync failed:", err);
    }

    // Stripe customer is created on first checkout via ensureStripeCustomer()
    // (employer_subscriptions.stripe_customer_id — single billing source of truth).
    revalidatePath("/", "layout");
    
    if (!authData.session) {
      return {
        success: true,
        message:
          "Registration successful! Check your email and click the confirmation link to activate your account.",
        requiresConfirmation: true,
      };
    }

    const destination = resolvePostAuthRedirect(
      role === "employer" ? "employer" : "worker",
      (formData as SignUpFormValues & { callbackUrl?: string }).callbackUrl
    );
    const welcomeQuery = new URLSearchParams({
      welcome: "signup",
      name: firstName,
    });
    const separator = destination.includes("?") ? "&" : "?";

    revalidatePath("/", "layout");
    redirect(`${destination}${separator}${welcomeQuery.toString()}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    safeError("signUp error:", error);
    return { success: false, error: handleAuthError(error) };
  }
}

const GENERIC_LOGIN_ERROR =
  "Invalid email, username, or password. Please try again.";

export async function signIn(formData: LoginCredentials) {
  try {
    safeLog("[Auth] Sign-in initiated");
    const supabase = await createClient();

    const parsed = loginCredentialsSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { email, password, turnstileToken } = parsed.data;

    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "anonymous";
    const emailKey = email.trim().toLowerCase();

    const rateLimit = await assertRateLimit("signin", {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000,
      identifier: `${ip}:${emailKey}`,
    });
    if (!rateLimit.ok) {
      return { success: false, error: rateLimit.error };
    }

    const turnstile = await requireTurnstileToken(turnstileToken, ip);
    if (!turnstile.success) {
      return { success: false, error: turnstile.error };
    }

    // Silent progressive lockout (OWASP) — same message as bad password
    if (await isLoginLocked(emailKey)) {
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    const emailToAuth = await resolveEmailForLogin(email);
    if (!emailToAuth) {
      await recordLoginFailure(emailKey);
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password,
      options: captchaAuthOptions(turnstile.token),
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error:
            "Please confirm your email address before logging in. A confirmation link was sent to your email.",
        };
      }
      await recordLoginFailure(emailKey);
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        success: false,
        error:
          "Please confirm your email address before logging in. A confirmation link was sent to your email.",
      };
    }

    await clearLoginFailures(emailKey);

    // Blueprint: app_metadata → profiles.role → signup user_metadata
    let role = data.user.app_metadata?.role as string | undefined;
    let displayName =
      data.user.user_metadata?.first_name ??
      data.user.user_metadata?.full_name?.trim().split(/\s+/)[0];

    if (!isAppRole(role) || !displayName) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name")
        .or(profileIdFilter(data.user.id))
        .maybeSingle();

      if (!isAppRole(role)) {
        role = isAppRole(profile?.role)
          ? profile.role
          : isAppRole(data.user.user_metadata?.role)
            ? data.user.user_metadata.role
            : undefined;
      }

      displayName =
        profile?.first_name ??
        profile?.full_name?.trim().split(/\s+/)[0] ??
        displayName;
    }

    const finalRole = isAppRole(role) ? role : "worker";
    const redirectUrl = resolvePostAuthRedirect(
      finalRole,
      parsed.data.callbackUrl
    );

    const welcomeQuery = new URLSearchParams({ welcome: "login" });
    if (displayName) {
      welcomeQuery.set("name", displayName);
    }

    const separator = redirectUrl.includes("?") ? "&" : "?";

    revalidatePath("/", "layout");
    redirect(`${redirectUrl}${separator}${welcomeQuery.toString()}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    safeError("signIn error:", error);
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }
}

/** @deprecated Use signIn */
export async function logIn(formData: LoginCredentials) {
  return signIn(formData);
}

export async function logOut() {
  const supabase = await createClient();
  // Local only — use revokeAllSessionsAndSignOut for every device
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/signin");
}

export async function sendPasswordResetLink(
  input: ForgotPasswordFormValues | string
) {
  try {
    safeLog("[Auth] Password reset link requested");

    const rateLimit = await assertRateLimit("password-reset", {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return { success: false, error: rateLimit.error };
    }

    const parsed = forgotPasswordSchema.safeParse(
      typeof input === "string" ? { email: input } : input
    );
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "anonymous";

    const turnstile = await requireTurnstileToken(
      parsed.data.turnstileToken,
      ip
    );
    if (!turnstile.success) {
      return { success: false, error: turnstile.error };
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const exists = await profileExistsByEmail(normalizedEmail);

    if (exists) {
      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: authCallbackUrl("recovery", "/update-password"),
        ...captchaAuthOptions(turnstile.token),
      });

      if (error) {
        safeError(
          `[Auth] resetPasswordForEmail error: ${error.message} (status: ${error.status})`
        );
        if (error.status === 429) {
          return {
            success: false,
            error: "Too many requests. Please wait a few minutes before trying again.",
          };
        }
      }
    }

    return {
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  } catch (error) {
    safeError("[Auth] sendPasswordResetLink unexpected error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function updatePassword(formData: {
  password: string;
  confirmPassword: string;
}) {
  try {
    safeLog("[Auth] Password update requested");

    const parsed = updatePasswordSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Your reset link has expired. Please request a new one.",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (updateError) {
      safeError(`[Auth] updateUser password error: ${updateError.message}`);
      return {
        success: false,
        error: "Failed to update password. Please try again.",
      };
    }

    await supabase.auth.signOut({ scope: "global" });
    revalidatePath("/", "layout");
    redirect("/signin?reset=success");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    safeError("[Auth] updatePassword unexpected error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

