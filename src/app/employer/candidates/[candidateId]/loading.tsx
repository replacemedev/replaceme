import type { ReactNode } from "react";
import { EmployerPageShell } from "@/components/employer/layout";

/**
 * Route-isolated skeleton for `/employer/candidates/[candidateId]`.
 * Mirrors EmployerCandidateProfile + CandidateProfileActions anatomy 1:1
 * to prevent CLS when the real profile mounts.
 */
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className ?? ""}`} />;
}

function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`bg-white border border-slate-200/80 shadow-sm sm:rounded-2xl p-6 sm:p-8 ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

export default function EmployerCandidateLoading() {
  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main column — lg:col-span-8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Profile Section */}
          <header className="relative bg-gradient-to-br from-emerald-50/20 via-white to-slate-50/30 border border-slate-200/80 shadow-sm sm:rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <Bone className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full border border-slate-200/80 shadow-sm" />
            <div className="space-y-2 flex-1 min-w-0 w-full flex flex-col items-center sm:items-start">
              <Bone className="h-8 sm:h-9 w-48 sm:w-64 rounded-lg" />
              <Bone className="h-4 sm:h-5 w-36 sm:w-44 rounded-md" />
              <Bone className="h-3 w-40 rounded-md bg-slate-100" />
            </div>
          </header>

          {/* Compensation & Availability */}
          <SectionCard className="space-y-6">
            <Bone className="h-3.5 w-48 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <Bone className="h-2.5 w-36 rounded bg-slate-100" />
                <Bone className="h-7 w-40 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Bone className="h-2.5 w-32 rounded bg-slate-100" />
                <Bone className="h-7 w-28 rounded-lg" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Bone className="h-2.5 w-24 rounded bg-slate-100" />
                <Bone className="h-5 w-52 rounded-lg" />
              </div>
            </div>
          </SectionCard>

          {/* Skills & Expertise */}
          <SectionCard className="space-y-4">
            <Bone className="h-3.5 w-36 rounded-md" />
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Bone className="h-8 w-20 rounded-full bg-slate-100" />
              <Bone className="h-8 w-28 rounded-full bg-slate-100" />
              <Bone className="h-8 w-16 rounded-full bg-slate-100" />
              <Bone className="h-8 w-24 rounded-full bg-slate-100" />
              <Bone className="h-8 w-32 rounded-full bg-slate-100" />
              <Bone className="h-8 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
              <div className="inline-flex items-center gap-2">
                <Bone className="h-4.5 w-4.5 rounded-full shrink-0" />
                <Bone className="h-4 w-52 rounded-md" />
              </div>
              <div className="inline-flex items-start gap-2">
                <Bone className="h-4.5 w-4.5 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <Bone className="h-2.5 w-28 rounded bg-slate-100" />
                  <Bone className="h-4 w-40 rounded-md" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Application Message */}
          <SectionCard className="space-y-4">
            <Bone className="h-3.5 w-40 rounded-md" />
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Bone className="h-4 w-full rounded-md bg-slate-100" />
              <Bone className="h-4 w-[94%] rounded-md bg-slate-100" />
              <Bone className="h-4 w-[88%] rounded-md bg-slate-100" />
              <Bone className="h-4 w-[72%] rounded-md bg-slate-100" />
            </div>
          </SectionCard>

          {/* Job Experience */}
          <SectionCard className="space-y-4">
            <Bone className="h-3.5 w-36 rounded-md" />
            <ul className="divide-y divide-slate-100 pt-2">
              {[0, 1].map((idx) => (
                <li key={idx} className={`py-4 space-y-2 ${idx === 0 ? "pt-0" : ""}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Bone className="h-5 w-48 sm:w-56 rounded-md" />
                    <Bone className="h-5 w-28 rounded-md bg-slate-100" />
                  </div>
                  <Bone className="h-3 w-32 rounded-md" />
                  <div className="space-y-2 pt-1">
                    <Bone className="h-3.5 w-full rounded-md bg-slate-100" />
                    <Bone className="h-3.5 w-[90%] rounded-md bg-slate-100" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    <Bone className="h-5 w-14 rounded bg-slate-100" />
                    <Bone className="h-5 w-16 rounded bg-slate-100" />
                    <Bone className="h-5 w-12 rounded bg-slate-100" />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Contact & Location */}
          <SectionCard className="space-y-4">
            <Bone className="h-3.5 w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <Bone className="h-4.5 w-4.5 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <Bone className="h-2.5 w-16 rounded bg-slate-100" />
                  <Bone className="h-4 w-36 rounded-md" />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bone className="h-4.5 w-4.5 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Bone className="h-2.5 w-14 rounded bg-slate-100" />
                  <Bone className="h-4 w-44 rounded-md" />
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <Bone className="h-4.5 w-4.5 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <Bone className="h-2.5 w-28 rounded bg-slate-100" />
                  <Bone className="h-4 w-24 rounded-md" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* About Candidate */}
          <SectionCard className="space-y-3">
            <Bone className="h-3.5 w-36 rounded-md" />
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <Bone className="h-3.5 w-full rounded-md bg-slate-100" />
              <Bone className="h-3.5 w-[96%] rounded-md bg-slate-100" />
              <Bone className="h-3.5 w-[80%] rounded-md bg-slate-100" />
            </div>
          </SectionCard>
        </div>

        {/* Sidebar Actions — lg:col-span-4; full-width buttons on mobile */}
        <aside className="lg:col-span-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 sm:p-6 space-y-4 lg:sticky lg:top-6">
            <Bone className="h-3 w-16 rounded-md" />
            <div className="flex flex-col gap-3">
              <Bone className="h-[42px] w-full rounded-xl" />
              <Bone className="h-[42px] w-full rounded-xl bg-slate-100" />
            </div>
            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <Bone className="h-3 w-24 rounded-md mb-1" />
              <Bone className="h-11 w-full rounded-xl bg-slate-100" />
            </div>
          </div>
        </aside>
      </div>
    </EmployerPageShell>
  );
}
