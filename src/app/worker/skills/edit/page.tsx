import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Manage Skills</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        View and update skills on your worker profile.
      </p>

      {skills && skills.length > 0 ? (
        <ul className="space-y-3 mb-6">
          {skills.map((s) => (
            <li
              key={s.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex justify-between"
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
        className="text-sm font-semibold text-[#006e2f] hover:underline"
      >
        Back to profile
      </Link>
    </div>
  );
}
