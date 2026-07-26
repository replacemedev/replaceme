"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { auditAdminMfaEvent } from "@/actions/admin/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
} | null;

export function AdminMfaEnrollForm() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [enroll, setEnroll] = useState<EnrollState>(null);
  const [code, setCode] = useState("");
  const [bootPending, startBoot] = useTransition();
  const [verifyPending, startVerify] = useTransition();

  const startEnrollment = useCallback(() => {
    startBoot(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Authenticator",
        });
        if (error) throw error;
        if (!data?.id || !data.totp) {
          throw new Error("Enrollment did not return TOTP details");
        }
        setEnroll({
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
      } catch {
        toast.error("Could not start MFA enrollment. Try again.");
      }
    });
  }, []);

  useEffect(() => {
    // Avoid duplicate unverified factors under React Strict Mode remount.
    if (startedRef.current) return;
    startedRef.current = true;
    startEnrollment();
  }, [startEnrollment]);

  function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!enroll) return;
    startVerify(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: enroll.factorId,
          code: code.trim(),
        });
        if (error) throw error;
        await auditAdminMfaEvent("auth.mfa_enrolled", {
          factor_id: enroll.factorId,
        });
        toast.success("Authenticator enrolled");
        router.push("/admin/dashboard");
        router.refresh();
      } catch {
        toast.error("Invalid code. Check your authenticator and try again.");
      }
    });
  }

  async function copySecret() {
    if (!enroll?.secret) return;
    try {
      await navigator.clipboard.writeText(enroll.secret);
      toast.success("Secret copied");
    } catch {
      toast.error("Could not copy secret");
    }
  }

  if (bootPending && !enroll) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#006e2f]" aria-hidden />
        <p className="text-sm">Preparing authenticator…</p>
      </div>
    );
  }

  if (!enroll) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-500">
          Could not start enrollment. Generate a new QR code to continue.
        </p>
        <Button
          type="button"
          onClick={startEnrollment}
          className="!w-full min-h-11"
        >
          Retry enrollment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <Smartphone className="h-5 w-5" aria-hidden />
        </div>
        <p className="max-w-sm text-center text-sm leading-relaxed text-slate-500">
          Scan this QR with Google Authenticator, 1Password, or Authy. Then
          enter the 6-digit code to finish.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- Supabase returns inline SVG data URI */}
        <img
          src={enroll.qrCode}
          alt="TOTP QR code"
          width={180}
          height={180}
          className="h-[180px] w-[180px] max-w-full rounded-2xl border border-slate-100 bg-white p-2"
        />
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Manual secret
        </p>
        <div className="mt-2 flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all font-mono text-xs text-slate-700">
            {enroll.secret}
          </code>
          <button
            type="button"
            onClick={copySecret}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
            aria-label="Copy secret"
          >
            <Copy className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
          Verification code
        </label>
        <Input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="min-h-11 text-center text-lg font-mono tracking-[0.3em]"
          disabled={verifyPending}
        />
      </div>

      <Button
        type="submit"
        disabled={verifyPending || code.length !== 6}
        className="!w-full min-h-11 gap-2"
      >
        {verifyPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        Verify &amp; continue
      </Button>
    </form>
  );
}
