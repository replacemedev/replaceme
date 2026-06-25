import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, 
  MessageSquare, 
  CheckCircle, 
  User, 
  BookOpen, 
  Users, 
  Plus 
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMessagingThreads } from "@/actions/messaging";
import { StatCard } from "@/components/shared/StatCard";
import { ProfileStrengthCard } from "@/components/worker/ProfileStrengthCard";
import { RecommendedJobCard } from "@/components/worker/RecommendedJobCard";
import { ProveExpertiseCard } from "@/components/worker/ProveExpertiseCard";
import { EarningsOverviewCard } from "@/components/worker/EarningsOverviewCard";
import { SkillPill } from "@/components/worker/SkillPill";
import { QuickActionCard } from "@/components/worker/QuickActionCard";
import { RecentMessageRow } from "@/components/worker/RecentMessageRow";
import { RecentMessage } from "@/types/worker";

export const dynamic = "force-dynamic";

export default async function WorkerDashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch worker profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") {
    redirect("/login");
  }

  const workerName = profile.first_name || user.user_metadata?.first_name || "Worker";

  // 1. Fetch live metrics counts
  const { data: apps } = await supabase
    .from("applications")
    .select("status")
    .eq("candidate_id", profile.id);

  const appliedCount = apps ? apps.length : 0;
  const interviewsCount = apps ? apps.filter(a => a.status === "INTERVIEW_SCHEDULED").length : 0;
  const hiredCount = apps ? apps.filter(a => a.status === "HIRED").length : 0;

  // 2. Fetch worker skills
  const { data: skills } = await supabase
    .from("worker_skills")
    .select("*")
    .eq("worker_id", profile.id)
    .order("proficiency", { ascending: false });

  // 3. Fetch earnings overview details
  const { data: earnings } = await supabase
    .from("earnings_overview")
    .select("*")
    .eq("worker_id", profile.id)
    .order("created_at", { ascending: true });

  // 4. Fetch recommended jobs from job_posts view
  const { data: recommendedJobs } = await supabase
    .from("job_posts")
    .select("*")
    .eq("status", "Active")
    .limit(2);

  // Compute skill-matching scores to display "MATCH" badge dynamically
  const workerSkillsSet = new Set(skills?.map(s => s.skill_name.toLowerCase()) || []);
  const processedJobs = (recommendedJobs || []).map((job: any) => {
    const jobSkills = job.skills || [];
    const matchedCount = jobSkills.filter((s: string) => workerSkillsSet.has(s.toLowerCase())).length;
    const score = jobSkills.length > 0 ? Math.round((matchedCount / jobSkills.length) * 100) : 0;
    return {
      ...job,
      match_score: score >= 50 ? 95 : 0 // Force score to 95 if matched to trigger MATCH badge
    };
  });

  // 5. Recent chat threads for this worker
  const threads = await getMessagingThreads("worker");
  const displayMessages: RecentMessage[] = threads
    .sort((a, b) => {
      const timeA = a.last_message?.created_at
        ? new Date(a.last_message.created_at).getTime()
        : 0;
      const timeB = b.last_message?.created_at
        ? new Date(b.last_message.created_at).getTime()
        : 0;
      return timeB - timeA;
    })
    .slice(0, 3)
    .map((thread) => ({
      thread_id: thread.id,
      latest_message: thread.last_message?.content ?? null,
      latest_message_time: thread.last_message?.created_at ?? null,
      sender_id: thread.last_message?.sender_id ?? null,
      other_first_name: null,
      other_last_name: null,
      other_avatar_url: thread.oppositeParty.avatarUrl,
      other_company_name: thread.oppositeParty.name,
      other_company_logo: thread.oppositeParty.avatarUrl,
    }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
      {/* Top Greeting Section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          Hello, {workerName}
        </h1>
        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl">
          Welcome back to your dashboard. You have some new opportunities waiting for you. Let's make today productive.
        </p>
      </div>

      {/* Recent Messages Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Recent Messages
        </h2>
        {displayMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayMessages.map((msg) => (
              <RecentMessageRow key={msg.thread_id} message={msg} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 font-semibold text-sm">
            No recent messages yet. Connected employers will chat with you here.
          </div>
        )}
      </div>

      {/* Top Stats Row (4 Columns Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          variant="dashboard"
          title="Applied Jobs"
          value={appliedCount}
          icon={<Briefcase size={16} />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard
          variant="dashboard"
          title="Interviews"
          value={interviewsCount}
          icon={<MessageSquare size={16} />}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-[#006e2f]"
        />
        <StatCard
          variant="dashboard"
          title="Hired"
          value={hiredCount}
          icon={<CheckCircle size={16} />}
          iconBgClass="bg-green-50"
          iconColorClass="text-green-600"
        />
        <ProfileStrengthCard percentage={78} />
      </div>

      {/* Middle Split-View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2/3 - Recommended Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recommended for You
            </h2>
            <Link 
              href="/worker/jobs"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 hover:underline transition-colors"
            >
              View All &gt;
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {processedJobs.length > 0 ? (
              processedJobs.map((job) => (
                <RecommendedJobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 font-semibold text-sm">
                No active recommendations. Check back later or add more skills below.
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 - Actions & Charts */}
        <div className="flex flex-col gap-6">
          <ProveExpertiseCard />
          <EarningsOverviewCard earnings={earnings || []} />
        </div>
      </div>

      {/* My Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            My Skills
          </h2>
          <Link 
            href="/skills/edit"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
          >
            <Plus size={14} />
            Add Skill
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {skills && skills.length > 0 ? (
            skills.map((skill) => (
              <SkillPill key={skill.id} skill={skill} />
            ))
          ) : (
            <div className="text-sm font-medium text-slate-500">
              No skills added yet. Click Add Skill to get started.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions (4 Columns Grid) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <QuickActionCard 
            title="Edit Profile"
            icon={<User size={20} />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            href="/profile/edit"
          />
          <QuickActionCard 
            title="Messages"
            icon={<MessageSquare size={20} />}
            iconBgClass="bg-rose-50"
            iconColorClass="text-rose-500"
            href="/messages"
          />
          <QuickActionCard 
            title="Help Articles"
            icon={<BookOpen size={20} />}
            iconBgClass="bg-indigo-50"
            iconColorClass="text-indigo-500"
            href="/help"
          />
          <QuickActionCard 
            title="Community"
            icon={<Users size={20} />}
            iconBgClass="bg-slate-100"
            iconColorClass="text-slate-600"
            href="/community"
          />
        </div>
      </div>
    </div>
  );
}
