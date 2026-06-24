import { Check, Lock } from "lucide-react";
import { VERIFICATION_BENEFITS } from "@/types/verification";

export function VerificationSidebar() {
  return (
    <aside className="space-y-5">
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">
          Verification Benefits
        </h2>
        <ul className="space-y-3">
          {VERIFICATION_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-600">
              <Check
                className="h-4 w-4 text-[#006e2f] mt-0.5 shrink-0"
                strokeWidth={3}
                aria-hidden
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-[#006e2f]/20 bg-[#ebfdf2]/50 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-5 w-5 text-[#006e2f]" aria-hidden />
          <h2 className="text-base font-extrabold text-[#0a4a29]">
            Secure & Private
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your identity documents are encrypted in private storage. Only authorized
          verification reviewers can access them. Employers never see your ID images.
        </p>
      </article>
    </aside>
  );
}
