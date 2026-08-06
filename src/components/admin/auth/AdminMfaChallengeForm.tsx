"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { logOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminMfaChallengeForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const submitLockRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function readOtp() {
    const raw = inputRef.current?.value ?? code;
    return raw.replace(/\D/g, "").slice(0, 6);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitLockRef.current || isPending) return;

    const otp = readOtp();
    setCode(otp);
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);

    try {
      const supabase = createClient();
      // Ensure cookies/session are bound before challenge/verify.
      await supabase.auth.getSession();

      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      // Prefer newest verified factor first (often the one just enrolled),
      // then try every verified TOTP — admins can have multiple authenticators.
      const factors = [...(factorsData.totp ?? [])]
        .filter((f) => f.status === "verified")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      if (factors.length === 0) {
        toast.error("No authenticator found. Enroll MFA first.");
        window.location.assign("/admin/mfa-enroll");
        return;
      }

      let lastError: { message?: string } | null = null;

      for (const factor of factors) {
        const { error: verifyError } =
          await supabase.auth.mfa.challengeAndVerify({
            factorId: factor.id,
            code: otp,
          });

        if (!verifyError) {
          window.location.assign("/admin/dashboard");
          return;
        }

        lastError = verifyError;

        // First attempt may have already upgraded AAL2 (cookie race).
        const { data: aal } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.currentLevel === "aal2") {
          window.location.assign("/admin/dashboard");
          return;
        }
      }

      throw lastError ?? new Error("Invalid code");
    } catch {
      toast.error("Invalid code. Please try again.");
      submitLockRef.current = false;
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        await logOut();
      } catch {
        window.location.assign("/signin");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        ref={inputRef}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        className="min-h-11 text-center text-lg font-mono tracking-[0.3em]"
        disabled={isLoading || isPending}
      />
      <div className="flex flex-col gap-3 mt-6">
        <Button
          type="submit"
          disabled={isLoading || isPending || code.length !== 6}
          className="w-full min-h-11"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading || isPending}
          onClick={handleLogout}
          className="w-full min-h-11 text-slate-500 hover:text-slate-700"
        >
          {isPending ? "Signing out..." : "Logout"}
        </Button>
      </div>
    </form>
  );
}
