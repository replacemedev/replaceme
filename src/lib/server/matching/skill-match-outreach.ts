import { createAdminClient } from "@/lib/supabase/server";
import { scoreJobWorkerMatch } from "@/lib/matching/skill-match";
import {
  computeWorkerProfileStrength,
  type WorkerProfileStrengthInput,
} from "@/lib/worker/profile-strength";
import { safeError } from "@/utils/logger";
import type { Json } from "@/types/database";

const MAX_MATCHES_PER_JOB = 25;
const SYSTEM_MATCH_CONTENT = "We found a skill match for this role.";
const SYSTEM_MATCH_STALE_CONTENT =
  "Skills were updated. This role no longer looks like a strong match.";

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
  cta?: "quick_apply";
  overlappingSkills: string[];
  matchScore: number;
  jobTitle: string;
};

export { overlappingSkills, scoreJobWorkerMatch } from "@/lib/matching/skill-match";

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

function buildMatchPayload(params: {
  job: JobRow;
  score: number;
  overlap: string[];
  qualifies: boolean;
}): SkillMatchSystemPayload {
  const jobTitle = params.job.title?.trim() || "this role";
  const base: SkillMatchSystemPayload = {
    jobId: params.job.id,
    overlappingSkills: params.overlap,
    matchScore: params.score,
    jobTitle,
  };
  if (params.qualifies) {
    return { ...base, cta: "quick_apply" };
  }
  return base;
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

async function ensureJobThread(params: {
  admin: Awaited<ReturnType<typeof createAdminClient>>;
  workerId: string;
  companyProfileId: string;
  jobId: string;
}): Promise<string | null> {
  const { admin, workerId, companyProfileId, jobId } = params;

  const { data: existingThread } = await admin
    .from("chat_threads")
    .select("id")
    .eq("worker_id", workerId)
    .eq("company_profile_id", companyProfileId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existingThread?.id) return existingThread.id;

  const { data: inserted, error: threadError } = await admin
    .from("chat_threads")
    .insert({
      worker_id: workerId,
      company_profile_id: companyProfileId,
      job_id: jobId,
      blocked_reason: null,
    })
    .select("id")
    .single();

  if (!threadError && inserted?.id) return inserted.id;

  const { data: retry } = await admin
    .from("chat_threads")
    .select("id")
    .eq("worker_id", workerId)
    .eq("company_profile_id", companyProfileId)
    .eq("job_id", jobId)
    .maybeSingle();

  return retry?.id ?? null;
}

async function upsertSystemMatchMessage(params: {
  admin: Awaited<ReturnType<typeof createAdminClient>>;
  threadId: string;
  jobId: string;
  content: string;
  payload: SkillMatchSystemPayload;
}): Promise<"created" | "updated" | false> {
  const { admin, threadId, jobId, content, payload } = params;

  const { data: existingMsgs } = await admin
    .from("chat_messages")
    .select("id, payload")
    .eq("thread_id", threadId)
    .eq("message_kind", "system_match")
    .order("created_at", { ascending: false })
    .limit(20);

  const matchRow =
    (existingMsgs ?? []).find((row) => {
      const p = row.payload;
      return (
        p &&
        typeof p === "object" &&
        !Array.isArray(p) &&
        (p as Record<string, unknown>).jobId === jobId
      );
    }) ?? null;

  if (matchRow?.id) {
    const { error } = await admin
      .from("chat_messages")
      .update({
        content,
        payload: payload as unknown as Json,
      })
      .eq("id", matchRow.id);
    if (error) {
      safeError("skill-match: message update", error);
      return false;
    }
    // Nudge thread so inbox realtime listeners refresh.
    await admin
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId);
    return "updated";
  }

  const { error: messageError } = await admin.from("chat_messages").insert({
    thread_id: threadId,
    sender_id: null,
    content,
    message_kind: "system_match",
    payload: payload as unknown as Json,
  });

  if (messageError) {
    safeError("skill-match: message insert", messageError);
    return false;
  }
  return "created";
}

/**
 * Create a new skill-match chat, or refresh an existing one when skills change.
 * No email.
 */
async function deliverMatch(params: {
  admin: Awaited<ReturnType<typeof createAdminClient>>;
  job: JobRow;
  worker: WorkerRow;
  companyProfileId: string;
  score: number;
  overlap: string[];
  qualifies: boolean;
  notifyOnCreate?: boolean;
}): Promise<"created" | "updated" | false> {
  const {
    admin,
    job,
    worker,
    companyProfileId,
    score,
    overlap,
    qualifies,
    notifyOnCreate = true,
  } = params;

  const threadId = await ensureJobThread({
    admin,
    workerId: worker.id,
    companyProfileId,
    jobId: job.id,
  });
  if (!threadId) return false;

  const { data: existingOutreach } = await admin
    .from("skill_match_outreach")
    .select("id")
    .eq("job_id", job.id)
    .eq("worker_id", worker.id)
    .maybeSingle();

  const payload = buildMatchPayload({ job, score, overlap, qualifies });
  const content = qualifies ? SYSTEM_MATCH_CONTENT : SYSTEM_MATCH_STALE_CONTENT;

  if (existingOutreach?.id) {
    const { error: outreachError } = await admin
      .from("skill_match_outreach")
      .update({
        thread_id: threadId,
        match_score: score,
        overlapping_skills: overlap,
      })
      .eq("id", existingOutreach.id);

    if (outreachError) {
      safeError("skill-match: outreach update", outreachError);
      return false;
    }

    return upsertSystemMatchMessage({
      admin,
      threadId,
      jobId: job.id,
      content,
      payload,
    });
  }

  // New matches only when currently qualified
  if (!qualifies) return false;

  const { error: outreachError } = await admin.from("skill_match_outreach").insert({
    job_id: job.id,
    worker_id: worker.id,
    thread_id: threadId,
    match_score: score,
    overlapping_skills: overlap,
  });

  if (outreachError) {
    if (outreachError.code === "23505") {
      // Concurrent insert — fall through to update path once.
      const { data: raced } = await admin
        .from("skill_match_outreach")
        .select("id")
        .eq("job_id", job.id)
        .eq("worker_id", worker.id)
        .maybeSingle();
      if (!raced?.id) return false;

      const { error: updateErr } = await admin
        .from("skill_match_outreach")
        .update({
          thread_id: threadId,
          match_score: score,
          overlapping_skills: overlap,
        })
        .eq("id", raced.id);
      if (updateErr) {
        safeError("skill-match: outreach race update", updateErr);
        return false;
      }
      return upsertSystemMatchMessage({
        admin,
        threadId,
        jobId: job.id,
        content,
        payload,
      });
    }
    safeError("skill-match: outreach insert", outreachError);
    return false;
  }

  const messageResult = await upsertSystemMatchMessage({
    admin,
    threadId,
    jobId: job.id,
    content,
    payload,
  });
  if (!messageResult) return false;

  if (notifyOnCreate) {
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
  }

  return "created";
}

const WORKER_SELECT =
  "id, skills, professional_title, bio, avatar_url, gender, birth_date, spoken_languages, location, resume_url, cv_url, availability, hourly_rate, onboarding_completed_at";

/**
 * Fan out / refresh in-app skill-match chat for an Active job (Starter+ only).
 * - New qualifying workers: create (cap 25 new per run relative to existing)
 * - Existing outreach: always refresh score + overlapping skills in chat
 * No email.
 */
export async function runSkillMatchForJob(
  jobId: string
): Promise<{ sent: number; updated: number }> {
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
      return { sent: 0, updated: 0 };
    }

    const messagingOk = await employerMessagingEnabled(admin, job.employer_id);
    if (!messagingOk) return { sent: 0, updated: 0 };

    const { data: company } = await admin
      .from("company_profiles")
      .select("id")
      .eq("employer_id", job.employer_id)
      .maybeSingle();

    if (!company?.id) return { sent: 0, updated: 0 };

    const { data: alreadySent } = await admin
      .from("skill_match_outreach")
      .select("worker_id")
      .eq("job_id", job.id);

    const existingWorkerIds = new Set((alreadySent ?? []).map((r) => r.worker_id));

    const { data: workers } = await admin
      .from("profiles")
      .select(WORKER_SELECT)
      .eq("role", "worker")
      .not("onboarding_completed_at", "is", null)
      .is("deleted_at", null)
      .limit(500);

    const byId = new Map<string, WorkerRow>();
    for (const raw of workers ?? []) {
      byId.set((raw as WorkerRow).id, raw as WorkerRow);
    }

    // Always refresh existing outreach rows for this job
    let updated = 0;
    for (const workerId of existingWorkerIds) {
      let worker = byId.get(workerId);
      if (!worker) {
        const { data } = await admin
          .from("profiles")
          .select(WORKER_SELECT)
          .eq("id", workerId)
          .maybeSingle();
        worker = (data as WorkerRow | null) ?? undefined;
      }
      if (!worker) continue;

      const scored = scoreJobWorkerMatch(job, worker);
      const result = await deliverMatch({
        admin,
        job: job as JobRow,
        worker,
        companyProfileId: company.id,
        score: scored.matchScore,
        overlap: scored.overlappingSkills,
        qualifies: isWorkerMatchEligible(worker) && scored.qualifies,
        notifyOnCreate: false,
      });
      if (result === "updated" || result === "created") updated += 1;
    }

    // Create new matches for newly qualifying workers
    const scoredNew: Array<{
      worker: WorkerRow;
      score: number;
      overlap: string[];
    }> = [];

    for (const worker of byId.values()) {
      if (existingWorkerIds.has(worker.id)) continue;
      if (!isWorkerMatchEligible(worker)) continue;

      const { matchScore, overlappingSkills, qualifies } = scoreJobWorkerMatch(
        job,
        worker
      );
      if (!qualifies) continue;

      scoredNew.push({
        worker,
        score: matchScore,
        overlap: overlappingSkills,
      });
    }

    scoredNew.sort(
      (a, b) =>
        b.score - a.score || b.overlap.length - a.overlap.length
    );
    const remainingSlots = Math.max(0, MAX_MATCHES_PER_JOB - existingWorkerIds.size);
    const top = scoredNew.slice(0, remainingSlots);

    let sent = 0;
    for (const item of top) {
      const ok = await deliverMatch({
        admin,
        job: job as JobRow,
        worker: item.worker,
        companyProfileId: company.id,
        score: item.score,
        overlap: item.overlap,
        qualifies: true,
      });
      if (ok === "created") sent += 1;
      else if (ok === "updated") updated += 1;
    }

    return { sent, updated };
  } catch (err) {
    safeError("runSkillMatchForJob", err);
    return { sent: 0, updated: 0 };
  }
}

/**
 * When a worker becomes match-eligible or changes skills, outreach / refresh
 * against Active Starter+ jobs.
 */
export async function runSkillMatchForWorker(
  workerId: string
): Promise<{ sent: number; updated: number }> {
  try {
    const admin = await createAdminClient();
    const { data: workerRaw } = await admin
      .from("profiles")
      .select(WORKER_SELECT)
      .eq("id", workerId)
      .eq("role", "worker")
      .maybeSingle();

    if (!workerRaw) return { sent: 0, updated: 0 };
    const worker = workerRaw as WorkerRow;
    const eligible = isWorkerMatchEligible(worker);

    const { data: alreadySent } = await admin
      .from("skill_match_outreach")
      .select("job_id")
      .eq("worker_id", workerId);

    const existingJobIds = new Set((alreadySent ?? []).map((r) => r.job_id));

    const { data: jobs } = await admin
      .from("jobs")
      .select("id, employer_id, title, description, skills, status")
      .eq("status", "Active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(120);

    const messagingCache = new Map<string, boolean>();
    let sent = 0;
    let updated = 0;

    const jobRows = (jobs ?? []) as JobRow[];
    const jobsById = new Map(jobRows.map((j) => [j.id, j]));

    // Refresh every existing outreach for this worker
    for (const jobId of existingJobIds) {
      let job = jobsById.get(jobId);
      if (!job) {
        const { data } = await admin
          .from("jobs")
          .select("id, employer_id, title, description, skills, status")
          .eq("id", jobId)
          .maybeSingle();
        job = (data as JobRow | null) ?? undefined;
      }
      if (!job?.employer_id || job.status !== "Active") continue;

      let messagingOk = messagingCache.get(job.employer_id);
      if (messagingOk === undefined) {
        messagingOk = await employerMessagingEnabled(admin, job.employer_id);
        messagingCache.set(job.employer_id, messagingOk);
      }
      if (!messagingOk) continue;

      const { data: company } = await admin
        .from("company_profiles")
        .select("id")
        .eq("employer_id", job.employer_id)
        .maybeSingle();
      if (!company?.id) continue;

      const scored = scoreJobWorkerMatch(job, worker);
      const result = await deliverMatch({
        admin,
        job,
        worker,
        companyProfileId: company.id,
        score: scored.matchScore,
        overlap: scored.overlappingSkills,
        qualifies: eligible && scored.qualifies,
        notifyOnCreate: false,
      });
      if (result === "updated" || result === "created") updated += 1;
    }

    if (!eligible) return { sent, updated };

    const ranked = jobRows
      .filter((j) => j.employer_id && !existingJobIds.has(j.id))
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
        qualifies: true,
      });
      if (ok === "created") sent += 1;
      else if (ok === "updated") updated += 1;
    }

    return { sent, updated };
  } catch (err) {
    safeError("runSkillMatchForWorker", err);
    return { sent: 0, updated: 0 };
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
