"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { purchaseCreditPack } from "@/actions/employer/credits";
import type { CreditsSummary } from "@/actions/employer/credits";
import { EmptyState } from "@/components/shared/EmptyState";
import { Coins } from "lucide-react";

export function CreditsClient({ summary }: { summary: CreditsSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const buy = (packSize: 5 | 15 | 30) => {
    startTransition(async () => {
      const toastId = toast.loading("Adding credits...");
      const result = await purchaseCreditPack({ packSize });
      if (result.success) {
        toast.success(`Added ${result.added} credits`, { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error ?? "Purchase failed", { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-[#ebfdf2]/40 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Available balance
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[#006e2f]">
            {summary.balance}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Total unlocks used
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {summary.unlocksUsed}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Purchase credits</h2>
        <div className="flex flex-wrap gap-3">
          {([5, 15, 30] as const).map((size) => (
            <button
              key={size}
              type="button"
              disabled={isPending}
              onClick={() => buy(size)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#006e2f] hover:text-[#006e2f] disabled:opacity-50"
            >
              +{size} credits
            </button>
          ))}
          <Link
            href="/employer/pricing"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#006e2f] hover:bg-emerald-50"
          >
            View plans
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Unlock history</h2>
        {summary.ledger.length === 0 ? (
          <EmptyState
            icon={<Coins size={20} />}
            title="No unlock history yet"
            description="Credits spent on candidate unlocks will appear here."
          />
        ) : (
          <ul className="space-y-2">
            {summary.ledger.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm"
              >
                <span className="font-semibold text-slate-800">
                  {entry.candidateLabel}
                </span>
                <span className="text-slate-500">
                  −{entry.creditsDeducted} ·{" "}
                  {new Date(entry.unlockedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
