"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const WELCOME_MESSAGES: Record<string, string> = {
  login: "Welcome back! You are now signed in.",
  signup: "Account created successfully! Welcome aboard.",
};

function AuthFlashToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (!welcome) return;

    toast.success(WELCOME_MESSAGES[welcome] ?? WELCOME_MESSAGES.login);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("welcome");
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
