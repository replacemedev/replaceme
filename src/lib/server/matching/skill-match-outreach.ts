import { createAdminClient } from "@/lib/supabase/server";
import { computeKeywordMatchScore } from "@/lib/matching/keyword-match-score";
import {
  computeWorkerProfileStrength,
  type WorkerProfileStrengthInput,
} from "@/lib/worker/profile-strength";
import { safeError } from "@/utils/logger";
import type { Json } from "@/types/database";

const MAX_MATCHES_PER_JOB = 25;
const MIN_MATCH_SCORE = 50;
const SYSTEM_MATCH_CONTENT = "We found a skill match for this role.";

type JobRow = {
  id: string;
  employer_id: string;
  title: string | null;
  description: string | null;
  skills: string[] | null;
  status: string | null;
};

type WorkerRow = {
  id: string;
  skills: string[] | null;
  professional_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  spoken_languages: string[] | null;
  location: string | null;
  resume_url: string | null;
  cv_url: string | null;
  availability: string | null;
  hourly_rate: number | null;
  onboarding_completed_at: string | null;
};

export type SkillMatchSystemPayload = {
  jobId: string;
  cta: "quick_apply";
  overlappingSkills: string[];
  matchScore: number;
  jobTitle: string;
};

/** Case-insensitive exact skill overlap (preserves job skill casing). */
export function overlappingSkills(
  jobSkills: string[] | null | undefined,
  workerSkills: string[] | null | undefined
): string[] {
  const workerLower = new Set(
    (workerSkills ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean)
  );
  const seen = new Set<string>();
  const hits: string[] = [];

  for (const skill of jobSkills ?? []) {
    const trimmed = skill.trim();
    const lower = trimmed.toLowerCase();
    if (!lower || seen.has(lower) || !workerLower.has(lower)) continue;
    seen.add(lower);
    hits.push(trimmed);
  }

  return hits;
}

export function isWorkerMatchEligible(worker: WorkerRow): boolean {
  if (!worker.onboarding_completed_at) return false;

  const input: WorkerProfileStrengthInput = {
    professionalTitle: worker.professional_title,
    bio: worker.bio,
    location: worker.location,
    resumeUrl: worker.resume_url,
    cvUrl: worker.cv_url,
    availability: worker.availability,
    hourlyRate: worker.hourly_rate,
    avatarUrl: worker.avatar_url,
    gender: worker.gender,
    birthDate: worker.birth_date,
    spokenLanguageCount: worker.spoken_languages?.length ?? 0,
    skillCount: worker.skills?.length ?? 0,
  };

  return computeWorkerProfileStrength(input).percentage === 100;
}

export function scoreJobWorkerMatch(
  job: Pick<JobRow, "title" | "description" | "skills">,
  worker: Pick<WorkerRow, "skills" | "professional_title" | "bio">
): { matchScore: number; overlappingSkills: string[]; qualifies: boolean } {
  const overlap = overlappingSkills(job.skills, worker.skills);
  const matchScore = computeKeywordMatchScore({
    jobTitle: job.title,
    jobDescription: job.description,
    jobSkills: job.skills,
    workerSkills: worker.skills,
    workerTitle: worker.professional_title,
    workerBio: worker.bio,
  });

  return {
    matchScore,
    overlappingSkills: overlap,
    qualifies: overlap.length >= 1 || matchScore >= MIN_MATCH_SCORE,
  };
}

async function employerMessagingEnabled(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  employerId: string
): Promise<boolean> {
  const { data, error } = await admin.rpc("employer_messaging_enabled", {
    p_employer_id: employerId,
  });
  if (error) {
    safeError("skill-match: employer_messaging_enabled", error);
    return false;
  }
  return Boolean(data);
}

async function deliverMatch(params: {
  admin: Awaited<ReturnType<typeof createAdminClient>>;
  job: JobRow;
  worker: WorkerRow;
  companyProfileId: string;
  score: number;
  overlap: string[];
}): Promise<boolean> {
  const { admin, job, worker, companyProfileId, score, overlap } = params;

  let threadId: string | null = null;
  const { data: existingThread } = await admin
    .from("chat_threads")
    .select("id")
    .eq("worker_id", worker.id)
    .eq("company_profile_id", companyProfileId)
    .eq("job_id", job.id)
    .maybeSingle();

  if (existingThread?.id) {
    threadId = existingThread.id;
  } else {
    const { data: inserted, error: threadError } = await admin
      .from("chat_threads")
      .insert({
        worker_id: worker.id,
        company_profile_id: companyProfileId,
        job_id: job.id,
        blocked_reason: null,
      })
      .select("id")
      .single();

    if (threadError || !inserted) {
      const { data: retry } = await admin
        .from("chat_threads")
        .select("id")
        .eq("worker_id", worker.id)
        .eq("company_profile_id", companyProfileId)
        .eq("job_id", job.id)
        .maybeSingle();
      threadId = retry?.id ?? null;
    } else {
      threadId = inserted.id;
    }
  }

  if (!threadId) return false;

  // Dedup via unique (job_id, worker_id) — ignore conflicts
  const { error: outreachError } = await admin.from("skill_match_outreach").insert({
    job_id: job.id,
    worker_id: worker.id,
    thread_id: threadId,
    match_score: score,
    overlapping_skills: overlap,
  });

  if (outreachError) {
    if (outreachError.code === "23505") return false;
    safeError("skill-match: outreach insert", outreachError);
    return false;
  }

  const jobTitle = job.title?.trim() || "this role";
  const payload: SkillMatchSystemPayload = {
    jobId: job.id,
    cta: "quick_apply",
    overlappingSkills: overlap,
    matchScore: score,
    jobTitle,
  };

  const { error: messageError } = await admin.from("chat_messages").insert({
    thread_id: threadId,
    sender_id: null,
    content: SYSTEM_MATCH_CONTENT,
    message_kind: "system_match",
    payload: payload as unknown as Json,
  });

  if (messageError) {
    safeError("skill-match: message insert", messageError);
    return false;
  }

  // In-app notification only — no email for matches
  try {
    await admin.rpc("create_notification", {
      p_user_id: worker.id,
      p_type: "new_message",
      p_title: "New skill match",
      p_message: SYSTEM_MATCH_CONTENT,
      p_action_url: `/worker/messages?thread=${threadId}`,
      p_metadata: { jobId: job.id, threadId, kind: "system_match" },
    });
  } catch {
    // Best-effort
  }

  return true;
}

const WORKER_SELECT =
  "id, skills, professional_title, bio, avatar_url, gender, birth_date, spoken_languages, location, resume_url, cv_url, availability, hourly_rate, onboarding_completed_at";

/**
 * Fan out in-app skill-match chat for an Active job (Starter+ employer only).
 * Cap 25 workers. No email.
 */
export async function runSkillMatchForJob(
  jobId: string
): Promise<{ sent: number }> {
  try {
    const admin = await createAdminClient();
    const { data: job, error } = await admin
      .from("jobs")
      .select("id, employer_id, title, description, skills, status")
      .eq("id", jobId)
      .eq("status", "Active")
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !job?.employer_id) {
      return { sent: 0 };
    }

    const messagingOk = await employerMessagingEnabled(admin, job.employer_id);
    if (!messagingOk) return { sent: 0 };

    const { data: company } = await admin
      .from("company_profiles")
      .select("id")
      .eq("employer_id", job.employer_id)
      .maybeSingle();

    if (!company?.id) return { sent: 0 };

    const { data: alreadySent } = await admin
      .from("skill_match_outreach")
      .select("worker_id")
      .eq("job_id", job.id);

    const excluded = new Set((alreadySent ?? []).map((r) => r.worker_id));

    const { data: workers } = await admin
      .from("profiles")
      .select(WORKER_SELECT)
      .eq("role", "worker")
      .not("onboarding_completed_at", "is", null)
      .is("deleted_at", null)
      // Safety cap — full ranking still happens in JS (case-insensitive + keyword score).
      .limit(500);

    const scored: Array<{
      worker: WorkerRow;
      score: number;
      overlap: string[];
    }> = [];

    for (const raw of workers ?? []) {
      const worker = raw as WorkerRow;
      if (excluded.has(worker.id)) continue;
      if (!isWorkerMatchEligible(worker)) continue;

      const { matchScore, overlappingSkills, qualifies } = scoreJobWorkerMatch(
        job,
        worker
      );
      if (!qualifies) continue;

      scored.push({
        worker,
        score: matchScore,
        overlap: overlappingSkills,
      });
    }

    scored.sort(
      (a, b) =>
        b.score - a.score || b.overlap.length - a.overlap.length
    );
    const top = scored.slice(0, MAX_MATCHES_PER_JOB);

    let sent = 0;
    for (const item of top) {
      const ok = await deliverMatch({
        admin,
        job: job as JobRow,
        worker: item.worker,
        companyProfileId: company.id,
        score: item.score,
        overlap: item.overlap,
      });
      if (ok) sent += 1;
    }

    return { sent };
  } catch (err) {
    safeError("runSkillMatchForJob", err);
    return { sent: 0 };
  }
}

/**
 * When a worker becomes match-eligible, outreach against Active Starter+ jobs.
 */
export async function runSkillMatchForWorker(
  workerId: string
): Promise<{ sent: number }> {
  try {
    const admin = await createAdminClient();
    const { data: workerRaw } = await admin
      .from("profiles")
      .select(WORKER_SELECT)
      .eq("id", workerId)
      .eq("role", "worker")
      .maybeSingle();

    if (!workerRaw) return { sent: 0 };
    const worker = workerRaw as WorkerRow;
    if (!isWorkerMatchEligible(worker)) return { sent: 0 };

    const { data: alreadySent } = await admin
      .from("skill_match_outreach")
      .select("job_id")
      .eq("worker_id", workerId);

    const excludedJobs = new Set((alreadySent ?? []).map((r) => r.job_id));

    const { data: jobs } = await admin
      .from("jobs")
      .select("id, employer_id, title, description, skills, status")
      .eq("status", "Active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(80);

    const messagingCache = new Map<string, boolean>();
    let sent = 0;

    const ranked = ((jobs ?? []) as JobRow[])
      .filter((j) => j.employer_id && !excludedJobs.has(j.id))
      .map((job) => {
        const scored = scoreJobWorkerMatch(job, worker);
        return { job, ...scored };
      })
      .filter((c) => c.qualifies)
      .sort((a, b) => b.matchScore - a.matchScore);

    for (const candidate of ranked) {
      let messagingOk = messagingCache.get(candidate.job.employer_id);
      if (messagingOk === undefined) {
        messagingOk = await employerMessagingEnabled(
          admin,
          candidate.job.employer_id
        );
        messagingCache.set(candidate.job.employer_id, messagingOk);
      }
      if (!messagingOk) continue;

      const { data: company } = await admin
        .from("company_profiles")
        .select("id")
        .eq("employer_id", candidate.job.employer_id)
        .maybeSingle();
      if (!company?.id) continue;

      const ok = await deliverMatch({
        admin,
        job: candidate.job,
        worker,
        companyProfileId: company.id,
        score: candidate.matchScore,
        overlap: candidate.overlappingSkills,
      });
      if (ok) sent += 1;
    }

    return { sent };
  } catch (err) {
    safeError("runSkillMatchForWorker", err);
    return { sent: 0 };
  }
}

/** Fire-and-forget; never throws into the caller. */
export function triggerSkillMatchForJob(jobId: string): void {
  void runSkillMatchForJob(jobId).catch((err) =>
    safeError("triggerSkillMatchForJob:", err)
  );
}

/** Fire-and-forget; never throws into the caller. */
export function triggerSkillMatchForWorker(workerId: string): void {
  void runSkillMatchForWorker(workerId).catch((err) =>
    safeError("triggerSkillMatchForWorker:", err)
  );
}
