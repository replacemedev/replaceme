"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Loader2,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { auditAdminMfaEvent } from "@/actions/admin/security";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TotpFactor = {
  id: string;
  friendly_name?: string | null;
  status: string;
};

type PendingEnroll = {
  factorId: string;
  qrCode: string;
  secret: string;
} | null;

export function AdminMfaManageCard({
  initiallyEnrolled,
}: {
  initiallyEnrolled: boolean;
}) {
  const router = useRouter();
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingEnroll, setPendingEnroll] = useState<PendingEnroll>(null);
  const [code, setCode] = useState("");
  const [unenrollId, setUnenrollId] = useState<string | null>(null);
  const [enrollPending, startEnroll] = useTransition();
  const [verifyPending, startVerify] = useTransition();
  const [unenrollPending, startUnenroll] = useTransition();

  const refreshFactors = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error("Could not load authenticators");
      setFactors([]);
    } else {
      setFactors(data?.totp ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshFactors();
  }, [refreshFactors]);

  const verified = factors.filter((f) => f.status === "verified");

  function beginEnroll() {
    startEnroll(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: `Authenticator ${verified.length + 1}`,
        });
        if (error) throw error;
        if (!data?.id || !data.totp) throw new Error("Missing TOTP payload");
        setPendingEnroll({
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
        setCode("");
      } catch {
        toast.error("Could not start enrollment");
      }
    });
  }

  function confirmEnroll(event: React.FormEvent) {
    event.preventDefault();
    if (!pendingEnroll) return;
    startVerify(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: pendingEnroll.factorId,
          code: code.trim(),
        });
        if (error) throw error;
        await auditAdminMfaEvent("auth.mfa_enrolled", {
          factor_id: pendingEnroll.factorId,
        });
        toast.success("Authenticator added");
        setPendingEnroll(null);
        setCode("");
        await refreshFactors();
        router.refresh();
      } catch {
        toast.error("Invalid code. Try again.");
      }
    });
  }

  function confirmUnenroll() {
    if (!unenrollId) return;
    startUnenroll(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: unenrollId,
        });
        if (error) throw error;
        await auditAdminMfaEvent("auth.mfa_unenrolled", {
          factor_id: unenrollId,
        });
        toast.success("Authenticator removed");
        setUnenrollId(null);
        await refreshFactors();
        router.refresh();
      } catch {
        toast.error("Could not remove authenticator. Re-verify MFA and retry.");
      }
    });
  }

  async function copySecret() {
    if (!pendingEnroll?.secret) return;
    try {
      await navigator.clipboard.writeText(pendingEnroll.secret);
      toast.success("Secret copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3 border-b border-slate-50 p-5 sm:flex-row sm:items-start sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <Smartphone className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-800">
              Authenticator (TOTP)
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Required for admin portal access. Use an authenticator app — not
              SMS. Removing your last factor will send you back to enrollment.
            </p>
          </div>
          {!pendingEnroll ? (
            <Button
              type="button"
              variant="outline"
              disabled={enrollPending || loading}
              onClick={beginEnroll}
              className="!w-full min-h-11 shrink-0 gap-2 sm:!w-auto"
            >
              {enrollPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              {initiallyEnrolled || verified.length > 0
                ? "Add authenticator"
                : "Enroll authenticator"}
            </Button>
          ) : null}
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading factors…
            </div>
          ) : null}

          {!loading && verified.length === 0 && !pendingEnroll ? (
            <p className="text-sm text-amber-800">
              No verified authenticator yet. Enroll a TOTP app to keep using the
              admin portal.
            </p>
          ) : null}

          {verified.length > 0 ? (
            <ul className="space-y-2">
              {verified.map((factor) => (
                <li
                  key={factor.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#006e2f]"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {factor.friendly_name?.trim() || "Authenticator"}
                      </p>
                      <p className="text-xs text-slate-400">Verified TOTP</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="!w-full min-h-11 gap-2 border-red-200 text-red-700 hover:bg-red-50 sm:!w-auto"
                    onClick={() => setUnenrollId(factor.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}

          {pendingEnroll ? (
            <form
              onSubmit={confirmEnroll}
              className="space-y-4 rounded-xl border border-[#006e2f]/20 bg-[#ebfdf2]/40 p-4"
            >
              <p className="text-sm font-semibold text-slate-800">
                Scan &amp; verify new authenticator
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingEnroll.qrCode}
                  alt="TOTP QR code"
                  width={160}
                  height={160}
                  className="h-40 w-40 max-w-full shrink-0 rounded-2xl border border-white bg-white p-2"
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Manual secret
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="min-w-0 flex-1 break-all font-mono text-xs text-slate-700">
                        {pendingEnroll.secret}
                      </code>
                      <button
                        type="button"
                        onClick={copySecret}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600"
                        aria-label="Copy secret"
                      >
                        <Copy className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <Input
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="min-h-11 text-center font-mono tracking-[0.3em]"
                    disabled={verifyPending}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={verifyPending || code.length !== 6}
                      className="!w-full min-h-11 gap-2 sm:!w-auto"
                    >
                      {verifyPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="!w-full min-h-11 sm:!w-auto"
                      disabled={verifyPending}
                      onClick={() => {
                        setPendingEnroll(null);
                        setCode("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(unenrollId)}
        title="Remove authenticator?"
        description="If this is your last factor, you will be required to enroll again before using the admin portal."
        confirmLabel="Remove authenticator"
        variant="danger"
        loading={unenrollPending}
        onConfirm={confirmUnenroll}
        onCancel={() => {
          if (unenrollPending) return;
          setUnenrollId(null);
        }}
      />
    </>
  );
}
