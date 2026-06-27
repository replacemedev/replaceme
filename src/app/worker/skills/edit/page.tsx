import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  WorkerPageShell,
  WorkerPageHeader,
  WorkerBreadcrumb,
} from "@/components/worker/layout";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export const metadata = {
  title: "Manage Skills | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerSkillsEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: skills } = await supabase
    .from("worker_skills")
    .select("id, skill_name, proficiency_label, category")
    .eq("worker_id", user.id)
    .order("proficiency", { ascending: false });

  return (
    <WorkerPageShell width="narrow">
      <WorkerBreadcrumb
        items={[
          { label: "Dashboard", href: "/worker/dashboard" },
          { label: "Profile", href: "/worker/profile" },
          { label: "Skills" },
        ]}
      />
      <WorkerPageHeader
        title="Manage skills"
        subhead="View and update skills on your worker profile."
      />

      {skills && skills.length > 0 ? (
        <ul className="space-y-3 mb-6">
          {skills.map((s) => (
            <li
              key={s.id}
              className={`${WORKER_CARD} flex items-center justify-between px-4 py-3`}
            >
              <span className="text-sm font-bold text-slate-900">{s.skill_name}</span>
              <span className="text-xs text-slate-500">{s.proficiency_label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 mb-6">No skills listed yet.</p>
      )}

      <Link
        href="/worker/profile"
        className="text-sm font-semibold text-[#006e2f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm"
      >
        Back to profile
      </Link>
    </WorkerPageShell>
  );
}
