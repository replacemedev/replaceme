import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Handshake,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMessagingThreads } from "@/actions/messaging";
import { getWorkerContracts } from "@/actions/worker/contracts";
import { ProfileStrengthCard } from "@/components/worker/ProfileStrengthCard";
import { RecommendedJobCard } from "@/components/worker/RecommendedJobCard";
import { ProveExpertiseCard } from "@/components/worker/ProveExpertiseCard";
import { EarningsOverviewCard } from "@/components/worker/EarningsOverviewCard";
import { SkillPill } from "@/components/worker/SkillPill";
import { RecentMessageRow } from "@/components/worker/RecentMessageRow";
import { RecentMessage } from "@/types/worker";
import {
  WorkerPageShell,
  WorkerPageHeader,
  WorkerKpiStrip,
  WorkerSectionCard,
} from "@/components/worker/layout";
import { WorkerDashboardQuickLinks } from "@/components/worker/dashboard/WorkerDashboardQuickLinks";
import { WorkerDashboardOnboardedBanner } from "@/components/worker/dashboard/WorkerDashboardOnboardedBanner";
import { computeWorkerProfileStrength } from "@/lib/worker/profile-strength";

export const dynamic = "force-dynamic";

export default async function WorkerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, role, professional_title, bio, location, portfolio_url, resume_url, cv_url, availability, hourly_rate, avatar_url"
    )
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  const workerName = profile.first_name || user.user_metadata?.first_name || "Worker";

  const [
    { data: apps },
    { data: skills },
    { data: earnings },
    { data: recommendedJobs },
    threads,
    contracts,
  ] = await Promise.all([
    supabase.from("applications").select("status").eq("candidate_id", profile.id),
    supabase
      .from("worker_skills")
      .select("*")
      .eq("worker_id", profile.id)
      .order("proficiency", { ascending: false }),
    supabase
      .from("earnings_overview")
      .select("*")
      .eq("worker_id", profile.id)
      .order("created_at", { ascending: true }),
    supabase.from("job_posts").select("*").eq("status", "Active").limit(2),
    getMessagingThreads("worker"),
    getWorkerContracts(),
  ]);

  const appliedCount = apps?.length ?? 0;
  const interviewsCount =
    apps?.filter((a) => a.status === "INTERVIEW_SCHEDULED").length ?? 0;
  const hiredCount = apps?.filter((a) => a.status === "HIRED").length ?? 0;
  const pendingOffers =
    contracts?.filter((c) => c.status.toLowerCase() === "pending").length ?? 0;

  const profileStrength = computeWorkerProfileStrength({
    professionalTitle: profile.professional_title,
    bio: profile.bio,
    location: profile.location,
    portfolioUrl: profile.portfolio_url,
    resumeUrl: profile.resume_url,
    cvUrl: profile.cv_url,
    availability: profile.availability,
    hourlyRate: profile.hourly_rate,
    avatarUrl: profile.avatar_url,
    skillCount: skills?.length ?? 0,
  });

  const workerSkillsSet = new Set(
    skills?.map((s) => s.skill_name.toLowerCase()) ?? []
  );
  const processedJobs = (recommendedJobs ?? []).map((job) => {
    const jobSkills = job.skills || [];
    const matchedCount = jobSkills.filter((s: string) =>
      workerSkillsSet.has(s.toLowerCase())
    ).length;
    const score =
      jobSkills.length > 0
        ? Math.round((matchedCount / jobSkills.length) * 100)
        : 0;
    return {
      ...job,
      match_score: score >= 50 ? 95 : 0,
    };
  });

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
    <WorkerPageShell width="wide" className="gap-8">
      <Suspense fallback={null}>
        <WorkerDashboardOnboardedBanner />
      </Suspense>

      <WorkerPageHeader
        title={`Hello, ${workerName}`}
        subhead="Your command center for applications, interviews, and employer conversations."
        bordered={false}
      />

      <WorkerKpiStrip
        items={[
          {
            label: "Applications",
            value: appliedCount,
            hint: "Total sent",
            icon: Briefcase,
            href: "/worker/applications",
          },
          {
            label: "Interviews",
            value: interviewsCount,
            hint: "Scheduled",
            icon: Calendar,
            href: "/worker/interviews",
          },
          {
            label: "Offers",
            value: pendingOffers,
            hint: "Pending response",
            icon: Handshake,
            href: "/worker/contracts",
          },
          {
            label: "Hired",
            value: hiredCount,
            hint: "Active placements",
            icon: CheckCircle,
            href: "/worker/applications",
          },
        ]}
      />

      <WorkerDashboardQuickLinks />

      <WorkerSectionCard title="Recent messages">
        {displayMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayMessages.map((msg) => (
              <RecentMessageRow key={msg.thread_id} message={msg} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-500 text-center py-6">
            No recent messages yet. Employers will reach out here when they
            respond to your applications.
          </p>
        )}
      </WorkerSectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recommended for you
            </h2>
            <Link
              href="/worker/jobs"
              className="text-xs font-bold text-slate-500 hover:text-[#006e2f] transition-colors"
            >
              View all jobs
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {processedJobs.length > 0 ? (
              processedJobs.map((job) => (
                <RecommendedJobCard key={job.id} job={job} />
              ))
            ) : (
              <p className="text-sm font-medium text-slate-500 text-center py-8 rounded-3xl border border-slate-100 bg-white">
                No active recommendations right now. Add skills or browse open
                roles to improve matches.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ProfileStrengthCard
            percentage={profileStrength.percentage}
            tierLabel={profileStrength.label}
          />
          <ProveExpertiseCard />
          <EarningsOverviewCard earnings={earnings || []} />
        </div>
      </div>

      <WorkerSectionCard
        title="My skills"
        action={
          <Link
            href="/worker/skills/edit"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
          >
            <Plus size={14} aria-hidden />
            Add skill
          </Link>
        }
      >
        <div className="flex flex-wrap gap-3">
          {skills && skills.length > 0 ? (
            skills.map((skill) => <SkillPill key={skill.id} skill={skill} />)
          ) : (
            <p className="text-sm font-medium text-slate-500">
              No skills added yet. Skills help employers find you in search.
            </p>
          )}
        </div>
      </WorkerSectionCard>
    </WorkerPageShell>
  );
}
