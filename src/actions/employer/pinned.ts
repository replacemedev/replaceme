"use server";

import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { togglePinSchema } from "@/lib/validations/pinned";
import { safeError, safeLog } from "@/utils/logger";
import { PinnedWorker } from "@/types/employer/pinned";

export async function getPinnedWorkers(): Promise<PinnedWorker[]> {
  try {
    const { supabase, profile } = await requireRole("employer");

    const { data, error } = await supabase
      .from("pinned_workers")
      .select(`
        worker_id,
        profiles!pinned_workers_worker_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          professional_title,
          skills,
          experience_years,
          hourly_rate,
          is_verified
        )
      `)
      .eq("employer_id", profile.id);

    if (error) {
      safeError("Error fetching pinned workers:", error);
      return [];
    }

    const pinnedList: PinnedWorker[] = [];

    for (const row of data || []) {
      const worker = row.profiles as any;
      if (!worker) continue;

      const name =
        `${worker.first_name || ""} ${worker.last_name || ""}`.trim() ||
        "Worker";

      pinnedList.push({
        id: worker.id,
        name,
        avatarUrl: worker.avatar_url,
        role: worker.professional_title || "Developer",
        skills: worker.skills || [],
        experienceYears: worker.experience_years || 0,
        hourlyRate: worker.hourly_rate ? Number(worker.hourly_rate) : 0,
        isPinned: true,
        online: false,
        isVerified: Boolean(worker.is_verified),
      });
    }

    pinnedList.sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (pinnedList.length > 0) {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("employer_id", profile.id);

      const jobIds = jobs?.map((j) => j.id) ?? [];
      if (jobIds.length > 0) {
        const workerIds = pinnedList.map((w) => w.id);
        const { data: applications } = await supabase
          .from("applications")
          .select("candidate_id, job_id, created_at")
          .in("candidate_id", workerIds)
          .in("job_id", jobIds)
          .order("created_at", { ascending: false });

        const jobByCandidate = new Map<string, string>();
        for (const app of applications ?? []) {
          if (!jobByCandidate.has(app.candidate_id)) {
            jobByCandidate.set(app.candidate_id, app.job_id);
          }
        }

        const fallbackJobId = jobIds[0];
        for (const worker of pinnedList) {
          worker.contextJobId = jobByCandidate.get(worker.id) ?? fallbackJobId;
        }
      }
    }

    return pinnedList;
  } catch (err) {
    safeError("getPinnedWorkers exception:", err);
    return [];
  }
}

export async function togglePin(
  workerId: string
): Promise<{ success: boolean; pinned?: boolean; error?: string }> {
  const result = await runAction("togglePin", async () => {
    const parsed = togglePinSchema.parse({ workerId });
    safeLog(`[Pinned] Toggle pin for worker: ${parsed.workerId}`);

    const { supabase, profile } = await requireRole("employer");

    const { data: workerProfile, error: workerError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", parsed.workerId)
      .eq("role", "worker")
      .maybeSingle();

    if (workerError || !workerProfile) {
      return fail("Target worker profile not found.");
    }

    const { data: existingPin, error: pinError } = await supabase
      .from("pinned_workers")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("worker_id", parsed.workerId)
      .maybeSingle();

    if (pinError) {
      return fail("Database transaction failed.");
    }

    if (existingPin) {
      const { error: deleteError } = await supabase
        .from("pinned_workers")
        .delete()
        .eq("id", existingPin.id);

      if (deleteError) return fail("Failed to remove worker bookmark.");
      return ok({ pinned: false });
    }

    const { error: insertError } = await supabase.from("pinned_workers").insert({
      employer_id: profile.id,
      worker_id: parsed.workerId,
    });

    if (insertError) return fail("Failed to bookmark worker.");
    return ok({ pinned: true });
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, pinned: result.data?.pinned };
}
