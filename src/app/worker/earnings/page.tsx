import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerEarnings } from "@/actions/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";
import { DollarSign } from "lucide-react";

export const metadata = {
  title: "Earnings | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerEarningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const earnings = await getWorkerEarnings();

  const total = earnings.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Earnings</h1>
      <p className="text-sm text-slate-500 mt-1 mb-2">
        Payment history and projected income.
      </p>
      <p className="text-3xl font-extrabold text-[#006e2f] mb-8">
        ${total.toLocaleString()}
        <span className="text-sm font-medium text-slate-500 ml-2">total recorded</span>
      </p>

      {earnings.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={22} />}
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
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-800">
                {row.month_name}
              </span>
              <span className="text-sm font-bold text-slate-900">
                ${Number(row.amount).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
