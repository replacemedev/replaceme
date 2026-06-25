"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles legacy Supabase recovery links that return tokens in the URL hash
 * (implicit flow). PKCE / token_hash links are handled by /auth/callback and
 * /auth/confirm route handlers instead.
 */
export function RecoveryHashHandler() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;

    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken || type !== "recovery") return;

    setStatus("working");

    const supabase = createClient();
    void supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          return;
        }

        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        setStatus("done");
        router.refresh();
      });
  }, [router]);

  if (status === "working") {
    return (
      <p className="mb-4 text-sm text-slate-500" role="status">
        Verifying your reset link…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="mb-4 text-sm text-red-600" role="alert">
        This reset link has expired. Please request a new one.
      </p>
    );
  }

  return null;
}
