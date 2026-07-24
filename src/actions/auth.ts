"use server";

import { headers } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  employerSignUpSchema,
  workerSignUpSchema,
  type SignUpFormValues,
} from "@/lib/validations/auth";
import {
  loginCredentialsSchema,
  type LoginCredentials,
} from "@/lib/validations/auth";
import { safeLog, safeError } from "@/utils/logger";
import { authCallbackUrl, getSiteUrl } from "@/lib/auth/site-url";
import { syncResendContactForUser } from "@/lib/server/resend/contact-sync";
import { isAppRole, profileIdFilter } from "@/lib/auth/role";
import { resolvePostAuthRedirect } from "@/lib/auth/safe-callback-url";
import {
  emailVerificationSettingsPath,
  isEmailVerificationPending,
  markEmailVerificationPending,
} from "@/lib/auth/email-verification";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import {
  escapeHtml,
  renderEmailLayout,
} from "@/lib/server/email/email-templates";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import Stripe from "stripe";
import { formatFullName } from "@/lib/format/name";
import { assertRateLimit } from "@/lib/server/rate-limit";
import {
  AUTH_ERROR,
  AUTH_ERROR_MESSAGE,
  extractErrorMessage,
  mapSignupDatabaseError,
} from "@/lib/auth/error-message";
import {
  requireTurnstileToken,
  isTurnstileEnabled,
  shouldDeferTurnstileToSupabase,
} from "@/lib/turnstile/verify";
import { isRedisInfrastructureError, REDIS_UNAVAILABLE_ERROR } from "@/lib/server/redis";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/server/login-lockout";

function captchaAuthOptions(
  token: string
): { captchaToken: string } | Record<string, never> {
  if (!isTurnstileEnabled() || !shouldDeferTurnstileToSupabase()) return {};
  if (!token.trim()) return {};
  return { captchaToken: token };
}

/**
 * After Admin createUser (no session cookie), soft-confirm metadata and
 * establish a cookie session via admin magic-link OTP.
 *
 * Do NOT call signInWithPassword here: Turnstile tokens are single-use and
 * Supabase Auth CAPTCHA already consumes them on any password grant that
 * forwards captchaToken. Reusing the signup widget token causes
 * `timeout-or-duplicate` (seen in production Vercel logs).
 */
async function establishSessionAfterSignup(input: {
  userId: string;
  email: string;
  existingAppMetadata?: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const established = await softConfirmAndEstablishSession({
    email: input.email,
    userId: input.userId,
    existingAppMetadata: input.existingAppMetadata,
  });

  if (!established.ok) {
    return {
      ok: false,
      error:
        "Account created, but we could not sign you in automatically. Please sign in.",
    };
  }

  return { ok: true };
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
    return "Invalid email, username, or password. Please try again.";
  }

  if (message.includes("Invalid login credentials")) {
    return "Invalid email, username, or password. Please try again.";
  }

  return message;
}

/** Escape `%` / `_` so PostgREST `ilike` behaves as exact case-insensitive match. */
function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

async function profileExistsByEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = await createAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", escapeIlikeExact(normalized))
      .limit(1)
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

type IdentityConflict =
  | { conflict: "email" }
  | { conflict: "username" }
  | { conflict: null };

/**
 * Pre-flight uniqueness check (service role) before Supabase Auth signUp.
 * Covers workers + employers: both store email on profiles; usernames must be
 * free on profiles and company_profiles.
 */
async function checkSignupIdentityAvailable(
  email: string,
  username: string
): Promise<IdentityConflict> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = await createAdminClient();

    const [emailResult, profileUsernameResult, companyUsernameResult] =
      await Promise.all([
        admin
          .from("profiles")
          .select("id")
          .ilike("email", escapeIlikeExact(normalizedEmail))
          .limit(1)
          .maybeSingle(),
        admin
          .from("profiles")
          .select("id")
          .eq("username", normalizedUsername)
          .limit(1)
          .maybeSingle(),
        admin
          .from("company_profiles")
          .select("employer_id")
          .eq("username", normalizedUsername)
          .limit(1)
          .maybeSingle(),
      ]);

    if (emailResult.error) {
      safeError("[Auth] signup email uniqueness check failed:", emailResult.error);
    } else if (emailResult.data) {
      return { conflict: "email" };
    }

    if (profileUsernameResult.error) {
      safeError(
        "[Auth] signup profile username uniqueness check failed:",
        profileUsernameResult.error
      );
    } else if (profileUsernameResult.data) {
      return { conflict: "username" };
    }

    if (companyUsernameResult.error) {
      safeError(
        "[Auth] signup company username uniqueness check failed:",
        companyUsernameResult.error
      );
    } else if (companyUsernameResult.data) {
      return { conflict: "username" };
    }

    return { conflict: null };
  } catch (error) {
    safeError("[Auth] checkSignupIdentityAvailable unexpected error:", error);
    // Fail open to Auth + DB unique constraints rather than blocking legitimate signups.
    return { conflict: null };
  }
}

function identityConflictResponse(conflict: "email" | "username") {
  if (conflict === "email") {
    return {
      success: false as const,
      error: AUTH_ERROR.EMAIL_EXISTS,
      message: AUTH_ERROR_MESSAGE.EMAIL_EXISTS,
    };
  }
  return {
    success: false as const,
    error: AUTH_ERROR.USERNAME_EXISTS,
    message: AUTH_ERROR_MESSAGE.USERNAME_EXISTS,
  };
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

    // 1. Validate Form Data using strict schemas
    const schema = role === "employer" ? employerSignUpSchema : workerSignUpSchema;
    const parsed = schema.safeParse(formData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    const turnstile = await requireTurnstileToken(data.turnstileToken, ip, {
      // Signup establishes the session via OTP (no captchaToken). Verify here
      // so the widget challenge is actually consumed once.
      verifyLocally: true,
    });
    if (!turnstile.success) {
      return { success: false, error: turnstile.error };
    }

    const firstName = data.firstName.trim();
    const middleName = data.middleName?.trim() || "";
    const lastName = data.lastName.trim();
    const suffix = "suffix" in data ? (data.suffix as string | undefined)?.trim() : "";
    const phoneNumber = "phoneNumber" in data ? (data.phoneNumber as string | undefined)?.trim() : "";
    const fullName = formatFullName(firstName, middleName, lastName, suffix);
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim();

    // 2. Uniqueness pre-check (before Auth) — workers and employers share the namespace
    const identity = await checkSignupIdentityAvailable(
      normalizedEmail,
      normalizedUsername
    );
    if (identity.conflict) {
      return identityConflictResponse(identity.conflict);
    }

    // 3. Create the Auth user via Admin API (does not send a confirmation email).
    // Metadata feeds the handle_new_user trigger; deferred verification stays in settings.
    const appRole = role === "employer" ? "employer" : "worker";
    const admin = await createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: data.password,
      email_confirm: true,
      app_metadata: {
        email_verification_pending: true,
      },
      user_metadata: {
        role: data.role,
        username: normalizedUsername,
        full_name: fullName,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        suffix: suffix || null,
        phone_number: phoneNumber || null,
      },
    });

    if (authError) {
      const msg = extractErrorMessage(authError);
      const mapped = mapSignupDatabaseError(msg);
      if (mapped === AUTH_ERROR.USERNAME_EXISTS) {
        return identityConflictResponse("username");
      }
      if (mapped === AUTH_ERROR.EMAIL_EXISTS) {
        return identityConflictResponse("email");
      }
      const lower = msg.toLowerCase();
      if (
        msg.includes("profiles_username_key") ||
        msg.includes("company_profiles_username_key") ||
        msg.includes("unique_username") ||
        (lower.includes("username") &&
          (lower.includes("already") || msg.includes("23505")))
      ) {
        return identityConflictResponse("username");
      }
      if (
        lower.includes("already registered") ||
        lower.includes("already exists") ||
        lower.includes("email already") ||
        msg.includes("unique_email") ||
        msg.includes("profiles_email_unique_lower_idx") ||
        (lower.includes("email") && lower.includes("already"))
      ) {
        return identityConflictResponse("email");
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
        email: authData.user.email ?? normalizedEmail,
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

    // Admin createUser never returns a browser session — soft-confirm + OTP session
    // (avoids Turnstile single-use token reuse on password grant).
    const sessionResult = await establishSessionAfterSignup({
      userId: authData.user.id,
      email: normalizedEmail,
      existingAppMetadata: authData.user.app_metadata as
        | Record<string, unknown>
        | undefined,
    });
    if (!sessionResult.ok) {
      return { success: false, error: sessionResult.error };
    }

    const destination = resolvePostAuthRedirect(
      appRole,
      (formData as SignUpFormValues & { callbackUrl?: string }).callbackUrl
    );
    const welcomeQuery = new URLSearchParams({
      welcome: "signup",
      name: firstName,
    });
    const separator = destination.includes("?") ? "&" : "?";

    const destinationWithWelcome = `${destination}${separator}${welcomeQuery.toString()}`;
    revalidatePath("/", "layout");
    // Return URL for client navigation — awaiting redirect() rejects the client
    // promise and was intermittently surfaced as "Error occurred. Please retry."
    return { success: true as const, redirectTo: destinationWithWelcome };
  } catch (error) {
    unstable_rethrow(error);
    safeError("signUp error:", error);
    return { success: false, error: handleAuthError(error) };
  }
}

const GENERIC_LOGIN_ERROR =
  "Invalid email, username, or password. Please try again.";

function mapSignInInfrastructureError(error: unknown): string | null {
  if (isRedisInfrastructureError(error)) {
    return REDIS_UNAVAILABLE_ERROR;
  }
  return null;
}

/**
 * Soft-confirm unconfirmed users, then establish a cookie session via admin
 * magic-link OTP (avoids reusing a single-use Turnstile token on password retry).
 */
async function softConfirmAndEstablishSession(input: {
  email: string;
  userId: string;
  existingAppMetadata?: Record<string, unknown>;
}): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const { error: confirmError } = await admin.auth.admin.updateUserById(
    input.userId,
    {
      email_confirm: true,
      app_metadata: {
        ...input.existingAppMetadata,
        email_verification_pending: true,
      },
    }
  );
  if (confirmError) {
    safeError("[Auth] soft-confirm on signIn failed:", confirmError);
  }

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: input.email,
    });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    safeError("[Auth] soft-confirm generateLink failed:", linkError);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (otpError || !otpData.user) {
    safeError("[Auth] soft-confirm verifyOtp failed:", otpError);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  await markEmailVerificationPending(input.userId, input.existingAppMetadata);
  return { ok: true, user: otpData.user };
}

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
      maxAttempts: 5,
      windowMs: 60 * 1000,
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

    let {
      data: { user: signedInUser },
      error,
    } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password,
      options: captchaAuthOptions(turnstile.token),
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("captcha") ||
        error.message.toLowerCase().includes("turnstile")
      ) {
        const captchaMode = shouldDeferTurnstileToSupabase()
          ? "supabase_only"
          : "app_siteverify";
        safeError("[Auth] signIn captcha rejected", {
          supabaseMessage: error.message,
          status: error.status,
          captchaMode,
          turnstileWidgetEnabled: isTurnstileEnabled(),
          captchaTokenForwarded: Boolean(turnstile.token?.trim()),
          hint:
            error.message.includes("timeout-or-duplicate")
              ? "Turnstile token was reused — client must reset widget and send a fresh token"
              : error.message.includes("invalid")
                ? "Verify Supabase Auth → CAPTCHA secret matches TURNSTILE_SECRET_KEY and Cloudflare widget hostnames include this domain"
                : undefined,
        });
        return {
          success: false,
          error: "Security check failed. Please complete it again and retry.",
        };
      }

      // Legacy accounts blocked by Confirm email — soft-confirm then session via OTP.
      if (
        error.message.includes("Email not confirmed") ||
        error.code === "email_not_confirmed"
      ) {
        const admin = await createAdminClient();
        const { data: byEmail } = await admin
          .from("profiles")
          .select("id")
          .ilike("email", escapeIlikeExact(emailToAuth))
          .limit(1)
          .maybeSingle();

        if (!byEmail?.id) {
          await recordLoginFailure(emailKey);
          return { success: false, error: GENERIC_LOGIN_ERROR };
        }

        const { data: authUser } = await admin.auth.admin.getUserById(
          byEmail.id
        );
        const established = await softConfirmAndEstablishSession({
          email: emailToAuth,
          userId: byEmail.id,
          existingAppMetadata: authUser?.user?.app_metadata,
        });

        if (!established.ok) {
          await recordLoginFailure(emailKey);
          return { success: false, error: established.error };
        }

        signedInUser = established.user;
        error = null;
      } else {
        safeError("[Auth] signInWithPassword failed:", error.message);
        await recordLoginFailure(emailKey);
        return { success: false, error: GENERIC_LOGIN_ERROR };
      }
    }

    if (!signedInUser) {
      await recordLoginFailure(emailKey);
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    await clearLoginFailures(emailKey);

    // Blueprint: app_metadata → profiles.role → signup user_metadata
    let role = signedInUser.app_metadata?.role as string | undefined;
    let displayName =
      signedInUser.user_metadata?.first_name ??
      signedInUser.user_metadata?.full_name?.trim().split(/\s+/)[0];

    if (!isAppRole(role) || !displayName) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name")
        .or(profileIdFilter(signedInUser.id))
        .maybeSingle();

      if (!isAppRole(role)) {
        role = isAppRole(profile?.role)
          ? profile.role
          : isAppRole(signedInUser.user_metadata?.role)
            ? signedInUser.user_metadata.role
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
    const postAuthRedirect = `${redirectUrl}${separator}${welcomeQuery.toString()}`;

    revalidatePath("/", "layout");
    // Client navigates with router.replace — avoids redirect()-rejection being
    // mis-handled as "Error occurred. Please retry." on the login form.
    return { success: true as const, redirectTo: postAuthRedirect };
  } catch (error) {
    unstable_rethrow(error);
    const infrastructureError = mapSignInInfrastructureError(error);
    safeError("signIn error:", error);
    return {
      success: false,
      error: infrastructureError ?? GENERIC_LOGIN_ERROR,
    };
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

    // String input = authenticated "reset my password" path (no public Turnstile widget).
    const isAuthenticatedCaller = typeof input === "string";

    const parsed = forgotPasswordSchema.safeParse(
      isAuthenticatedCaller ? { email: input } : input
    );
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "anonymous";

    let captchaOk = true;
    if (!isAuthenticatedCaller) {
      const turnstile = await requireTurnstileToken(
        parsed.data.turnstileToken,
        ip
      );
      if (!turnstile.success) {
        return { success: false, error: turnstile.error };
      }
      captchaOk = Boolean(turnstile.token);
    }
    if (!captchaOk) {
      return { success: false, error: "Security check failed. Please try again." };
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const exists = await profileExistsByEmail(normalizedEmail);

    if (!exists) {
      return {
        success: false,
        error: AUTH_ERROR.EMAIL_NOT_FOUND,
        message: AUTH_ERROR_MESSAGE.EMAIL_NOT_FOUND,
      };
    }

    // Generate recovery link without Supabase Auth mailer (avoids heavy dashboard
    // template logo). Send branded HTML via Resend with CDN-hosted ~20KB logo.
    const admin = await createAdminClient();
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "recovery",
        email: normalizedEmail,
        options: {
          redirectTo: authCallbackUrl("recovery", "/update-password"),
        },
      });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      safeError("[Auth] recovery generateLink failed:", linkError);
      if (linkError?.status === 429) {
        return {
          success: false,
          error: "Too many requests. Please wait a few minutes before trying again.",
        };
      }
      return {
        success: false,
        error: "Failed to send reset link. Please try again.",
      };
    }

    const resetHref = `${getSiteUrl()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=${encodeURIComponent("/update-password")}`;
    const bodyHtml = `
      <p style="margin:0 0 14px 0;">We received a request to reset the password for your <strong>Replaceme</strong> account.</p>
      <p style="margin:0 0 18px 0;">Choose a new password using the secure link below.</p>
      <p style="margin:0 0 18px 0;">
        <a href="${escapeHtml(resetHref)}" style="display:inline-block;background:#006e2f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:-0.01em;line-height:1.2;">Reset password</a>
      </p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.55;">
        If you didn’t request a reset, you can safely ignore this email. Your password won’t change.
      </p>
    `;
    const rendered = renderEmailLayout({
      title: "Reset your password",
      preheader: "Secure link to choose a new Replaceme password.",
      bodyHtml,
      footerNote: "This link expires for your security. Need help? support@replaceme.ph",
    });

    const sent = await sendTransactionalEmail({
      templateKey: "auth.password_reset",
      to: normalizedEmail,
      subject: "Reset your password — Replaceme",
      html: rendered.html,
      text: rendered.text,
      idempotencyKey: `password-reset:${normalizedEmail}:${Math.floor(Date.now() / 60_000)}`,
    });

    if (!sent.success) {
      return { success: false, error: sent.error };
    }

    return {
      success: true,
      message: "Password reset link sent. Check your email inbox.",
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
    unstable_rethrow(error);
    safeError("[Auth] updatePassword unexpected error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * In-app password change for an authenticated user.
 *
 * Uses Supabase Auth's native current_password validation on updateUser
 * (supabase-js v2.102+). Do NOT verify via signInWithPassword here —
 * Auth CAPTCHA blocks password grants without a Turnstile token, which
 * previously surfaced every failure as "Current password is incorrect."
 *
 * Does not sign the user out or send email.
 */
export async function changePassword(formData: {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    safeLog("[Auth] In-app password change requested");

    const parsed = changePasswordSchema.safeParse(formData);
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
        error: "You must be signed in to change your password.",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
      current_password: parsed.data.currentPassword,
    });

    if (updateError) {
      safeError(`[Auth] changePassword updateUser error: ${updateError.message}`);
      const message = updateError.message.toLowerCase();

      if (
        message.includes("incorrect") ||
        message.includes("invalid login") ||
        message.includes("invalid credentials") ||
        message.includes("current password") ||
        updateError.code === "invalid_credentials"
      ) {
        return {
          success: false,
          error: "Current password is incorrect.",
        };
      }

      if (message.includes("same")) {
        return {
          success: false,
          error: "New password must be different from your current password.",
        };
      }

      if (
        message.includes("reauthentication") ||
        message.includes("reauthenticate") ||
        message.includes("nonce")
      ) {
        return {
          success: false,
          error:
            "For security, please sign out and sign back in, then try changing your password again.",
        };
      }

      return {
        success: false,
        error: "Failed to update password. Please try again.",
      };
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    safeError("[Auth] changePassword unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getEmailVerificationStatus(): Promise<{
  email: string | null;
  needsVerification: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { email: null, needsVerification: false };
  }

  return {
    email: user.email ?? null,
    needsVerification: isEmailVerificationPending(user),
  };
}

/**
 * Sends an email verification link from Account Settings (on demand only).
 * Always emails via Resend with the CDN logo (skips Supabase Auth mailer assets).
 */
export async function resendEmailVerification(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const rateLimit = await assertRateLimit("email-verification", {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return { success: false, error: rateLimit.error };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { success: false, error: "You must be signed in to verify your email." };
    }

    if (!isEmailVerificationPending(user)) {
      return { success: true, message: "Your email is already verified." };
    }

    const role =
      (typeof user.app_metadata?.role === "string" && user.app_metadata.role) ||
      (typeof user.user_metadata?.role === "string" && user.user_metadata.role) ||
      "worker";
    const settingsPath = emailVerificationSettingsPath(String(role));
    const redirectTo = authCallbackUrl("signup", settingsPath);

    const admin = await createAdminClient();
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: user.email,
        options: { redirectTo },
      });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      safeError("[Auth] generateLink for verification failed:", linkError);
      return {
        success: false,
        error: "Could not send verification email. Please try again.",
      };
    }

    const verifyHref = `${getSiteUrl()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=email&next=${encodeURIComponent(settingsPath)}`;

    const bodyHtml = `
      <p style="margin:0 0 14px 0;">Confirm <strong>${escapeHtml(user.email)}</strong> for your Replaceme account.</p>
      <p style="margin:0 0 18px 0;">You can keep using the app — this just verifies ownership of your email.</p>
      <p style="margin:0 0 18px 0;">
        <a href="${escapeHtml(verifyHref)}" style="display:inline-block;background:#006e2f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;">Verify email</a>
      </p>
    `;
    const rendered = renderEmailLayout({
      title: "Verify your email",
      preheader: "Confirm your email address for Replaceme.",
      bodyHtml,
    });

    const sent = await sendTransactionalEmail({
      templateKey: "auth.email_verification",
      to: user.email,
      subject: "Verify your email — Replaceme",
      html: rendered.html,
      text: rendered.text,
      userId: user.id,
      role: isAppRole(role) ? role : null,
      idempotencyKey: `email-verify:${user.id}:${Math.floor(Date.now() / 60_000)}`,
    });

    if (!sent.success) {
      return { success: false, error: sent.error };
    }

    return {
      success: true,
      message: "Verification email sent. Check your inbox.",
    };
  } catch (error) {
    safeError("[Auth] resendEmailVerification unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

