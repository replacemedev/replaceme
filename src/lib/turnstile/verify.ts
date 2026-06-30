import { headers } from "next/headers";
import { safeError } from "@/utils/logger";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}

export async function verifyTurnstileToken(
  token: string | undefined | null
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isTurnstileEnabled()) {
    return { success: true };
  }

  if (!token?.trim()) {
    return {
      success: false,
      error: "Security verification failed. Please try again.",
    };
  }

  const headerStore = await headers();
  const remoteIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined;

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
  });

  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const data = (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      safeError("[Turnstile] verification failed:", data["error-codes"]);
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    safeError("[Turnstile] siteverify request failed:", error);
    return {
      success: false,
      error: "Security verification failed. Please try again.",
    };
  }
}
