import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerEarnings } from "@/actions/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";
import { DollarSign } from "lucide-react";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";
import { formatMoney } from "@/lib/format/currency";

export const metadata = {
  title: "Earnings | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerEarningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [earnings, { data: profile }] = await Promise.all([
    getWorkerEarnings(),
    supabase.from("profiles").select("salary_currency").eq("id", user.id).single(),
  ]);

  const currency = profile?.salary_currency ?? "PHP";
  const total = earnings.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Earnings"
        subhead="Payment history and projected income from completed work."
      />

      <div className={`${WORKER_CARD} p-6 mb-6`}>
        <p className="text-3xl font-extrabold text-[#006e2f] tabular-nums">
          {formatMoney(total, currency)}
        </p>
        <p className="text-sm font-medium text-slate-500 mt-1">Total recorded</p>
      </div>

      {earnings.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={22} aria-hidden />}
          title="No earnings yet"
          description="Completed contracts and payouts will appear here."
          actionLabel="Find jobs"
          actionHref="/worker/jobs"
        />
      ) : (
        <ul className="space-y-3">
          {earnings.map((row) => (
            <li
              key={row.id}
              className={`${WORKER_CARD} flex items-center justify-between px-4 py-3`}
            >
              <span className="text-sm font-medium text-slate-800">
                {row.month_name}
              </span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatMoney(Number(row.amount), currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WorkerPageShell>
  );
}
