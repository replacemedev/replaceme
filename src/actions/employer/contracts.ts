"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/server/auth/session";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { uuidSchema } from "@/lib/validations/common";

const contractIdSchema = z.object({ contractId: uuidSchema }).strict();

const updateContractSchema = z
  .object({
    contractId: uuidSchema,
    hourlyRate: z.number().min(0),
    weeklyHours: z.number().min(1).max(168),
    status: z.enum(["active", "paused", "terminated", "offered"]),
  })
  .strict();

export interface EmployerContractDetail {
  id: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  jobId: string | null;
  jobTitle: string | null;
  hourlyRate: number;
  weeklyHours: number;
  employmentType: string;
  status: string;
  startDate: string;
}

export async function getEmployerContract(
  contractId: string
): Promise<EmployerContractDetail | null> {
  const parsed = contractIdSchema.safeParse({ contractId });
  if (!parsed.success) return null;

  const { supabase, profile } = await requireRole("employer");

  const { data: contract } = await supabase
    .from("contracts")
    .select(
      `
      id,
      worker_id,
      job_id,
      hourly_rate,
      weekly_hours,
      employment_type,
      status,
      start_date,
      profiles!contracts_worker_id_fkey ( first_name, last_name, professional_title ),
      jobs ( title )
    `
    )
    .eq("id", parsed.data.contractId)
    .eq("employer_id", profile.id)
    .maybeSingle();

  if (!contract) return null;

  const worker = contract.profiles as {
    first_name?: string;
    last_name?: string;
    professional_title?: string;
  } | null;
  const job = contract.jobs as { title?: string } | null;

  return {
    id: contract.id,
    workerId: contract.worker_id,
    workerName:
      `${worker?.first_name ?? ""} ${worker?.last_name ?? ""}`.trim() || "Worker",
    workerRole: worker?.professional_title ?? "Professional",
    jobId: contract.job_id,
    jobTitle: job?.title ?? null,
    hourlyRate: Number(contract.hourly_rate),
    weeklyHours: Number(contract.weekly_hours),
    employmentType: contract.employment_type,
    status: contract.status,
    startDate: contract.start_date,
  };
}

export async function updateEmployerContract(payload: unknown) {
  const result = await runAction("updateEmployerContract", async () => {
    const parsed = updateContractSchema.parse(payload);
    const { supabase, profile } = await requireRole("employer");

    const { error } = await supabase
      .from("contracts")
      .update({
        hourly_rate: parsed.hourlyRate,
        weekly_hours: parsed.weeklyHours,
        status: parsed.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.contractId)
      .eq("employer_id", profile.id);

    if (error) return fail("Failed to update contract.");

    revalidatePath(`/employer/contracts/${parsed.contractId}`);
    revalidatePath("/employer/hired");
    return ok();
  });

  return result.success ? { success: true } : { error: result.error };
}

export async function terminateEmployerContract(contractId: string) {
  const result = await runAction("terminateEmployerContract", async () => {
    const parsed = contractIdSchema.parse({ contractId });
    const { supabase, profile } = await requireRole("employer");

    const { error } = await supabase
      .from("contracts")
      .update({
        status: "terminated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.contractId)
      .eq("employer_id", profile.id);

    if (error) return fail("Failed to terminate contract.");

    revalidatePath(`/employer/contracts/${parsed.contractId}`);
    revalidatePath("/employer/hired");
    return ok();
  });

  return result.success ? { success: true } : { error: result.error };
}
