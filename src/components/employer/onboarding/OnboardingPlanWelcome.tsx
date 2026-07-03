import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { TIER_LABELS, TIER_PRICES } from "@/lib/entitlements/ui-copy";

const DISCOVERY_INCLUDES = [
  "1 active job post",
  "10 applicants per job",
  "Anonymous candidate previews",
  "2-day job approval queue",
];

export function OnboardingPlanWelcome() {
  return (
    <aside className="mx-auto max-w-lg space-y-6">
      <div className="rounded-3xl border border-[#006e2f]/15 bg-[#fafdfb] p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
              You&apos;re starting on {TIER_LABELS.discovery}
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">
              Free forever — ${TIER_PRICES.discovery}/mo
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Complete your company profile, then post your first role. Upgrade
              anytime for full profiles, messaging, and instant approval.
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {DISCOVERY_INCLUDES.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-xs font-semibold text-slate-700"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[#006e2f]"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/employer/pricing"
          className="mt-5 inline-flex text-xs font-bold text-[#006e2f] hover:underline"
        >
          Compare Starter, Growth &amp; Scale →
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 text-center shadow-sm">
        <p className="text-xs font-semibold text-slate-500">
          After setup you&apos;ll land on your dashboard — ready to post your
          first job.
        </p>
      </div>
    </aside>
  );
}
