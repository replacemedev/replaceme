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
    <aside className="mx-auto flex w-full max-w-lg min-w-0 flex-col gap-6 md:gap-8">
      <div className="rounded-3xl border border-[#006e2f]/15 bg-[#fafdfb] px-4 py-8 shadow-sm sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-20">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f] break-words">
              You&apos;re starting on {TIER_LABELS.discovery}
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-900 break-words">
              Free forever — ${TIER_PRICES.discovery}/mo
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600 break-words">
              Complete your company profile, then post your first role. Upgrade
              anytime for full profiles, messaging, and instant approval.
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {DISCOVERY_INCLUDES.map((item) => (
            <li
              key={item}
              className="flex min-w-0 items-start gap-2 text-xs font-semibold text-slate-700"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[#006e2f]"
                aria-hidden
              />
              <span className="min-w-0 break-words">{item}</span>
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
