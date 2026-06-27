import { Users, CreditCard, Calendar } from "lucide-react";
import type { HiredStats } from "@/types/employer/hired";
import { StatCard } from "@/components/shared/StatCard";

interface HiredStatsStripProps {
  stats: HiredStats;
}

export function HiredStatsStrip({ stats }: HiredStatsStripProps) {
  const formattedPayroll = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.monthlyPayroll);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        variant="dashboard"
        title="Total active"
        value={`${stats.totalActive} ${stats.totalActive === 1 ? "worker" : "workers"}`}
        icon={<Users size={16} aria-hidden />}
        iconBgClass="bg-[#ebfdf2]"
        iconColorClass="text-[#006e2f]"
      />
      <StatCard
        variant="dashboard"
        title="Monthly payroll"
        value={formattedPayroll}
        icon={<CreditCard size={16} aria-hidden />}
        iconBgClass="bg-slate-100"
        iconColorClass="text-slate-500"
      />
      <StatCard
        variant="dashboard"
        title="Average tenure"
        value={`${stats.averageTenure} ${stats.averageTenure === 1 ? "mo" : "mos"}`}
        icon={<Calendar size={16} aria-hidden />}
        iconBgClass="bg-slate-100"
        iconColorClass="text-slate-500"
      />
    </div>
  );
}
