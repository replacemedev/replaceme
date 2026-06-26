"use server";

import { requireRole } from "@/lib/server/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { uuidSchema } from "@/lib/validations/common";

export interface CreditLedgerEntry {
  id: string;
  candidateLabel: string;
  creditsDeducted: number;
  unlockedAt: string;
}

export interface CreditsSummary {
  balance: number;
  unlocksUsed: number;
  ledger: CreditLedgerEntry[];
}

export async function getEmployerCreditsSummary(): Promise<CreditsSummary> {
  const fallback = { balance: 0, unlocksUsed: 0, ledger: [] };

  try {
    const { supabase, profile } = await requireRole("employer");

    const { data: credits } = await supabase
      .from("employer_credits")
      .select("credits_balance, unlocks_used")
      .eq("employer_id", profile.id)
      .maybeSingle();

    const { data: unlocks } = await supabase
      .from("unlocked_profiles")
      .select("id, candidate_id, credits_deducted, unlocked_at")
      .eq("employer_id", profile.id)
      .order("unlocked_at", { ascending: false })
      .limit(50);

    const ledger: CreditLedgerEntry[] = (unlocks ?? []).map((row) => {
      const idClean = (row.candidate_id ?? "").replace(/[^0-9]/g, "");
      const code = idClean.length >= 3 ? idClean.substring(0, 3) : "000";
      return {
        id: row.id,
        candidateLabel: `Candidate #${code}`,
        creditsDeducted: row.credits_deducted,
        unlockedAt: row.unlocked_at,
      };
    });

    return {
      balance: credits?.credits_balance ?? 0,
      unlocksUsed: credits?.unlocks_used ?? 0,
      ledger,
    };
  } catch {
    return fallback;
  }
}

const purchaseCreditsSchema = z
  .object({ packSize: z.union([z.literal(5), z.literal(15), z.literal(30)]) })
  .strict();

/** Adds credits after employer selects a pack (billing integration stub). */
export async function purchaseCreditPack(payload: unknown) {
  const result = await runAction("purchaseCreditPack", async () => {
    const parsed = purchaseCreditsSchema.parse(payload);
    const { supabase, profile } = await requireRole("employer");

    const { data: credits, error: readError } = await supabase
      .from("employer_credits")
      .select("id, credits_balance")
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (readError || !credits) {
      return fail("Credit account not found.");
    }

    const { error: updateError } = await supabase
      .from("employer_credits")
      .update({
        credits_balance: credits.credits_balance + parsed.packSize,
      })
      .eq("id", credits.id);

    if (updateError) return fail("Failed to add credits.");

    revalidatePath("/employer/credits");
    revalidatePath("/employer/jobs");
    return ok({ added: parsed.packSize });
  });

  return result.success
    ? { success: true, added: result.data?.added }
    : { error: result.error };
}
