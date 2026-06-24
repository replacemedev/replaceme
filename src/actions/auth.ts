"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { employerSignUpSchema, workerSignUpSchema } from "@/lib/validations/auth";
import {
  loginCredentialsSchema,
  type LoginCredentials,
} from "@/types/auth.types";
import { ROLE_HOME_PATH } from "@/config/navigation";
import { safeLog, safeError } from "@/utils/logger";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any,
    })
  : null;

function handleAuthError(error: any): string {
  if (!error) return "An unknown error occurred.";
  
  const message = typeof error === "string" ? error : (error.message || "An unexpected error occurred.");
  
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
    return "Invalid email or password. Please try again.";
  }
  
  return message;
}

export async function signUp(formData: any) {
  try {
    const role = formData.role;
    safeLog(`[Auth] Sign-up initiated for role: ${role}`);

    const supabase = await createClient();

    // 1. Validate Form Data using strict schemas
    const schema = role === "employer" ? employerSignUpSchema : workerSignUpSchema;
    const parsed = schema.safeParse(formData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    // Split fullName into first and last name
    const nameParts = data.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // 2. Sign up with Supabase Auth
    // We pass metadata that the Postgres trigger will use to populate the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: data.role,
          username: data.username,
          full_name: data.fullName,
          first_name: firstName,
          last_name: lastName,
          company_name: "companyName" in data ? data.companyName : null,
        },
      },
    });

    if (authError) {
      const msg = authError.message;
      if (msg.includes("profiles_username_key") || msg.includes("company_profiles_username_key") || msg.includes("username") || msg.includes("Username") || msg.includes("already exists") || msg.includes("23505")) {
        return { success: false, error: "auth/username-already-exists" };
      }
      if (msg.includes("already registered") || msg.includes("Email already exists") || (msg.includes("email") && msg.includes("already exists"))) {
        return { success: false, error: "auth/email-already-exists" };
      }
      return { success: false, error: handleAuthError(authError) };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user account." };
    }

    // 3. Conditional Stripe Customer Creation for Employers
    if (role === "employer" && stripe) {
      try {
        const customer = await stripe.customers.create({
          email: data.email,
          name: data.fullName,
          metadata: {
            supabase_user_id: authData.user.id,
            username: data.username,
          },
        });

        // Update the user's profile with the new Stripe Customer ID using elevated privileges if available
        let dbClient = supabase;
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const { createAdminClient } = await import("@/lib/supabase/server");
            dbClient = await createAdminClient();
          } catch (adminErr) {
            safeError("Failed to initialize admin client, falling back to standard user client:", adminErr);
          }
        }

        const { error: updateError } = await dbClient
          .from("profiles")
          .update({ stripe_customer_id: customer.id })
          .eq("auth_user_id", authData.user.id);

        if (updateError) {
          safeError("Failed to update profile with Stripe ID:", updateError);
        }
      } catch (stripeError) {
        safeError("Stripe customer creation failed:", stripeError);
      }
    }

    // 4. Return success response to the client
    revalidatePath("/", "layout");
    
    if (!authData.session) {
      return {
        success: true,
        message: "Registration successful! Please check your email to confirm your account before logging in. (This link/code expires in 10 minutes)",
        requiresConfirmation: true
      };
    }

    return {
      success: true,
      message: "Registration successful! Redirecting...",
      redirectUrl: role === "employer" ? "/employer/dashboard" : "/worker/dashboard"
    };
  } catch (error) {
    safeError("signUp error:", error);
    return { success: false, error: handleAuthError(error) };
  }
}

const GENERIC_LOGIN_ERROR = "Invalid email or password. Please try again.";

function resolvePostLoginPath(role: string): string {
  if (role === "admin") return ROLE_HOME_PATH.admin;
  if (role === "employer") return ROLE_HOME_PATH.employer;
  if (role === "worker") return "/worker/dashboard";
  return ROLE_HOME_PATH.worker;
}

export async function signIn(formData: LoginCredentials) {
  try {
    safeLog("[Auth] Sign-in initiated");
    const supabase = await createClient();

    const parsed = loginCredentialsSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { email, password } = parsed.data;

    let emailToAuth = email;
    if (!email.includes("@")) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", email)
        .maybeSingle();

      if (!profileData?.email) {
        return { success: false, error: GENERIC_LOGIN_ERROR };
      }
      emailToAuth = profileData.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error:
            "Please confirm your email address before logging in. A confirmation link was sent to your email.",
        };
      }
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return {
        success: false,
        error:
          "Please confirm your email address before logging in. A confirmation link was sent to your email.",
      };
    }

    // Blueprint: read role from JWT app_metadata (server-controlled, not client-writable)
    let role = data.user.app_metadata?.role as string | undefined;

    if (!role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      role = profile?.role;
    }

    const finalRole = role ?? "worker";
    const redirectUrl = resolvePostLoginPath(finalRole);

    revalidatePath("/", "layout");
    redirect(redirectUrl);
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
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function sendResetPasswordOTP(email: string) {
  try {
    safeLog(`[Auth] Send reset password OTP requested for: ${email}`);
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      safeError(`[Auth] resetPasswordForEmail error: ${error.message} (status: ${error.status})`);
      if (error.status === 429) {
        return { success: false, error: "Too many requests. Please wait a few minutes before trying again." };
      }
      return {
        success: true,
        message: "If an account matches that email, a verification code has been sent."
      };
    }

    return {
      success: true,
      message: "If an account matches that email, a verification code has been sent."
    };
  } catch (error) {
    safeError("[Auth] sendResetPasswordOTP unexpected error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function verifyOTPAndResetPassword(email: string, code: string, newPassword: string) {
  try {
    safeLog(`[Auth] Verifying reset OTP for: ${email}`);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });

    if (error) {
      safeError(`[Auth] verifyOtp error: ${error.message}`);
      return { success: false, error: "Invalid or expired verification code." };
    }

    if (!data.user) {
      return { success: false, error: "Verification failed. User session could not be established." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      safeError(`[Auth] updateUser password error: ${updateError.message}`);
      return { success: false, error: "Failed to reset password. Please try again." };
    }

    safeLog("[Auth] Password reset successful");
    return {
      success: true,
      message: "Password reset successful! You have been signed in."
    };
  } catch (error) {
    safeError("[Auth] verifyOTPAndResetPassword unexpected error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}


