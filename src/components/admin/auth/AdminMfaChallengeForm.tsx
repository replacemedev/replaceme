"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AdminMfaChallengeForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const submitLockRef = useRef(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitLockRef.current) return;

    const otp = code.trim();
    if (otp.length !== 6) return;

    submitLockRef.current = true;
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData.totp.find((f) => f.status === "verified");
      if (!totpFactor) {
        toast.error("No authenticator found. Enroll MFA first.");
        window.location.assign("/admin/mfa-enroll");
        return;
      }

      const factorId = totpFactor.id;

      // Official flow: challenge → verify (fresh challenge per attempt).
      // See https://supabase.com/docs/guides/auth/auth-mfa/totp
      const verifyOnce = async () => {
        const { data: challengeData, error: challengeError } =
          await supabase.auth.mfa.challenge({ factorId });
        if (challengeError) throw challengeError;

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code: otp,
        });
        return verifyError;
      };

      let verifyError = await verifyOnce();

      // Clock-skew / period-boundary: one retry with a new challenge.
      if (verifyError) {
        await delay(400);
        verifyError = await verifyOnce();
      }

      if (verifyError) {
        // Concurrent submit race: first attempt may have already upgraded AAL2.
        const { data: aal } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.currentLevel !== "aal2") {
          throw verifyError;
        }
      }

      // Hard nav so the next request uses the upgraded AAL2 cookies.
      window.location.assign("/admin/dashboard");
    } catch {
      toast.error("Invalid code. Please try again.");
      submitLockRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        className="min-h-11 text-center text-lg font-mono tracking-[0.3em]"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full min-h-11"
      >
        {isLoading ? "Verifying..." : "Verify & Continue"}
      </Button>
    </form>
  );
}
