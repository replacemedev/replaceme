"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function buildWelcomeMessage(welcome: string, name: string | null): string {
  const firstName = name?.trim().split(/\s+/)[0];

  if (welcome === "signup") {
    return firstName
      ? `Welcome aboard, ${firstName}! Your account is ready.`
      : "Account created successfully! Welcome aboard.";
  }

  if (welcome === "login") {
    return firstName
      ? `Welcome back, ${firstName}!`
      : "Welcome back! You are now signed in.";
  }

  return "Welcome!";
}

function AuthFlashToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "email") {
      toast.success(
        "Email confirmed! You can now sign in with your password."
      );
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("confirmed");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
      return;
    }

    const reset = searchParams.get("reset");
    if (reset === "success") {
      toast.success("Password updated successfully. Please sign in.");
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("reset");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
      return;
    }

    const error = searchParams.get("error");
    if (error === "auth_callback_failed") {
      toast.error("Authentication link expired or is invalid. Please try again.");
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("error");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
      return;
    }

    const welcome = searchParams.get("welcome");
    if (!welcome) return;

    const name = searchParams.get("name");
    toast.success(buildWelcomeMessage(welcome, name));

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("welcome");
    nextParams.delete("name");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}

export function AuthFlashToast() {
  return (
    <Suspense fallback={null}>
      <AuthFlashToastInner />
    </Suspense>
  );
}
