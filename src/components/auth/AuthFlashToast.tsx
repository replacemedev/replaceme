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
