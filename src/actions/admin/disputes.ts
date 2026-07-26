"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/actions/admin-actions";
import {
  CASE_STAGES,
  RESOLUTION_OUTCOMES,
  USER_REPORT_STATUSES,
  USER_REPORT_VIOLATION_LABELS,
  type AdminDisputesTab,
  type CaseStage,
  type ResolutionOutcome,
  type UserReportViolation,
} from "@/lib/reporting/constants";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import {
  CACHE_TTL_SECONDS,
  CacheKeys,
  getOrSet,
} from "@/lib/server/redis-cache";
import { formatFullName } from "@/lib/format/name";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

const EVIDENCE_BUCKET = "report-evidence";

type ProfileLite = {
  id: string;
  email: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  role: string;
};

export type CaseSource = "user_report" | "legacy_dispute";

export type AdminCaseRow = {
  caseId: string;
  source: CaseSource;
  sourceId: string;
  displayId: string;
  title: string;
  description: string;
  status: string;
  caseStage: CaseStage;
  violationCategory: UserReportViolation | "legacy_mediation";
  violationLabel: string;
  plaintiffId: string | null;
  plaintiffName: string;
  plaintiffEmail: string;
  plaintiffRole: string;
  defendantId: string | null;
  defendantName: string;
  defendantEmail: string;
  defendantRole: string;
  jobId: string | null;
  disputedAmountCents: number | null;
  disputedCurrency: string | null;
  hasEvidence: boolean;
  resolutionOutcome: ResolutionOutcome | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCaseDetail = AdminCaseRow & {
  adminNotes: string | null;
  defendantResponse: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  threadId: string | null;
  evidenceSignedUrl: string | null;
  evidenceMimeType: string | null;
  jobTitle: string | null;
};

function mapProfileName(p: ProfileLite | null | undefined): string {
  if (!p) return "Unknown";
  return formatFullName(p.first_name, p.middle_name, p.last_name) || "Unknown";
}

function asProfile(value: ProfileLite | ProfileLite[] | null): ProfileLite | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function displayCaseId(source: CaseSource, id: string): string {
  const prefix = source === "legacy_dispute" ? "LG" : "UR";
  return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
}

export function encodeCasePathId(source: CaseSource, id: string): string {
  return source === "legacy_dispute" ? `legacy-${id}` : id;
}

export function parseCasePathId(caseId: string): {
  source: CaseSource;
  sourceId: string;
} | null {
  if (caseId.startsWith("legacy-")) {
    const sourceId = caseId.slice("legacy-".length);
    if (!z.string().uuid().safeParse(sourceId).success) return null;
    return { source: "legacy_dispute", sourceId };
  }
  if (!z.string().uuid().safeParse(caseId).success) return null;
  return { source: "user_report", sourceId: caseId };
}

function statusToStage(status: string, existing?: string | null): CaseStage {
  if (existing && (CASE_STAGES as readonly string[]).includes(existing)) {
    return existing as CaseStage;
  }
  if (status === "resolved") return "resolved";
  if (status === "dismissed" || status === "closed") return "dismissed";
  if (status === "investigating" || status === "under_review") {
    return "in_mediation";
  }
  return "awaiting_evidence";
}

async function signEvidenceUrl(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  storagePath: string
): Promise<string | null> {
  return getOrSet<string | null>(
    CacheKeys.storageSignedUrl(EVIDENCE_BUCKET, storagePath),
    Math.min(CACHE_TTL_SECONDS.storageSignedUrl * 10, 50 * 60),
    async () => {
      const { data, error } = await admin.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(storagePath, 60 * 60);
      if (error) {
        safeError("signEvidenceUrl:", error);
        return null;
      }
      return data?.signedUrl ?? null;
    }
  );
}

type RawUserReport = {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  case_stage?: string | null;
  violation_category: string;
  title: string;
  description: string;
  job_id: string | null;
  disputed_amount_cents?: number | null;
  disputed_currency?: string | null;
  evidence_storage_path?: string | null;
  resolution_outcome?: string | null;
  reporter_id: string;
  reported_user_id: string;
  reporter?: ProfileLite | ProfileLite[] | null;
  reported?: ProfileLite | ProfileLite[] | null;
};

function mapUserReportRow(r: RawUserReport): AdminCaseRow {
  const reporter = asProfile(r.reporter ?? null);
  const reported = asProfile(r.reported ?? null);
  const violation = r.violation_category as UserReportViolation;
  return {
    caseId: encodeCasePathId("user_report", r.id),
    source: "user_report",
    sourceId: r.id,
    displayId: displayCaseId("user_report", r.id),
    title: r.title,
    description: r.description,
    status: r.status,
    caseStage: statusToStage(r.status, r.case_stage),
    violationCategory: violation,
    violationLabel: USER_REPORT_VIOLATION_LABELS[violation] ?? violation,
    plaintiffId: r.reporter_id,
    plaintiffName: mapProfileName(reporter),
    plaintiffEmail: reporter?.email ?? "",
    plaintiffRole: reporter?.role ?? "",
    defendantId: r.reported_user_id,
    defendantName: mapProfileName(reported),
    defendantEmail: reported?.email ?? "",
    defendantRole: reported?.role ?? "",
    jobId: r.job_id,
    disputedAmountCents: r.disputed_amount_cents ?? null,
    disputedCurrency: r.disputed_currency ?? "USD",
    hasEvidence: Boolean(r.evidence_storage_path),
    resolutionOutcome: (r.resolution_outcome as ResolutionOutcome | null) ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? r.created_at,
  };
}

function mapLegacyDispute(row: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  worker_id: string | null;
  employer_id: string | null;
  job_id: string | null;
  created_at: string;
  updated_at: string;
  worker?: ProfileLite | null;
  employer?: ProfileLite | null;
}): AdminCaseRow {
  const worker = row.worker ?? null;
  const employer = row.employer ?? null;
  return {
    caseId: encodeCasePathId("legacy_dispute", row.id),
    source: "legacy_dispute",
    sourceId: row.id,
    displayId: displayCaseId("legacy_dispute", row.id),
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    caseStage: statusToStage(row.status),
    violationCategory: "legacy_mediation",
    violationLabel: "Legacy mediation",
    plaintiffId: row.worker_id,
    plaintiffName: mapProfileName(worker),
    plaintiffEmail: worker?.email ?? "",
    plaintiffRole: "worker",
    defendantId: row.employer_id,
    defendantName: mapProfileName(employer),
    defendantEmail: employer?.email ?? "",
    defendantRole: "employer",
    jobId: row.job_id,
    disputedAmountCents: null,
    disputedCurrency: null,
    hasEvidence: false,
    resolutionOutcome: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const listSchema = z
  .object({
    tab: z.enum(["financial", "safety", "resolved"]).default("financial"),
    stage: z.enum(CASE_STAGES).optional(),
    q: z.string().trim().max(120).optional(),
    limit: z.number().int().min(10).max(100).default(25),
    offset: z.number().int().min(0).default(0),
  })
  .strict();

export async function getAdminCases(input: unknown): Promise<{
  items: AdminCaseRow[];
  total: number;
  tab: AdminDisputesTab;
} | null> {
  try {
    const parsed = listSchema.parse(input ?? {});
    const { supabase } = await requireAdmin();
    const tab = parsed.tab as AdminDisputesTab;

    const selectCols = `
      id,
      created_at,
      updated_at,
      status,
      case_stage,
      violation_category,
      title,
      description,
      job_id,
      disputed_amount_cents,
      disputed_currency,
      evidence_storage_path,
      resolution_outcome,
      reporter_id,
      reported_user_id,
      reporter:profiles!user_reports_reporter_id_fkey (
        id, email, first_name, middle_name, last_name, role
      ),
      reported:profiles!user_reports_reported_user_id_fkey (
        id, email, first_name, middle_name, last_name, role
      )
    `;

    let query = supabase
      .from("user_reports")
      .select(selectCols, { count: "exact" })
      .order("created_at", { ascending: false });

    if (tab === "financial") {
      query = query
        .eq("violation_category", "wage_dispute")
        .in("status", ["open", "investigating"]);
    } else if (tab === "safety") {
      query = query
        .neq("violation_category", "wage_dispute")
        .in("status", ["open", "investigating"]);
    } else {
      query = query.in("status", ["resolved", "dismissed"]);
    }

    if (parsed.stage) query = query.eq("case_stage", parsed.stage);
    if (parsed.q) {
      const { postgrestIlikeClause } = await import(
        "@/lib/security/postgrest-filter"
      );
      query = query.or(
        [
          postgrestIlikeClause("title", parsed.q),
          postgrestIlikeClause("description", parsed.q),
        ].join(",")
      );
    }

    const needLegacy = tab === "financial" || tab === "resolved";
    const fetchLimit = needLegacy
      ? Math.min(parsed.offset + parsed.limit, 100)
      : parsed.limit;
    const fetchOffset = needLegacy ? 0 : parsed.offset;

    const { data, count, error } = await query.range(
      fetchOffset,
      fetchOffset + fetchLimit - 1
    );

    if (error) {
      safeError("getAdminCases user_reports:", error);
      return { items: [], total: 0, tab };
    }

    let items = (data ?? []).map((r) => mapUserReportRow(r as RawUserReport));
    let legacyExtra = 0;

    if (needLegacy) {
      const admin = await createAdminClient();
      let legacyQ = admin
        .from("disputes")
        .select(
          "id, title, description, status, worker_id, employer_id, job_id, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (tab === "financial") {
        legacyQ = legacyQ.in("status", ["open", "under_review"]);
      } else {
        legacyQ = legacyQ.in("status", ["resolved", "closed"]);
      }

      const { data: legacyRows, error: legacyErr } = await legacyQ.limit(50);
      if (legacyErr) {
        safeError("getAdminCases legacy:", legacyErr);
      } else if (legacyRows?.length) {
        const profileIds = [
          ...new Set(
            legacyRows.flatMap((d) =>
              [d.worker_id, d.employer_id].filter(Boolean)
            )
          ),
        ] as string[];
        const profileById = new Map<string, ProfileLite>();
        if (profileIds.length > 0) {
          const { data: profiles } = await admin
            .from("profiles")
            .select("id, email, first_name, middle_name, last_name, role")
            .in("id", profileIds);
          for (const p of profiles ?? []) {
            profileById.set(p.id, p as ProfileLite);
          }
        }

        const legacyMapped = legacyRows.map((row) =>
          mapLegacyDispute({
            ...row,
            worker: row.worker_id
              ? profileById.get(row.worker_id) ?? null
              : null,
            employer: row.employer_id
              ? profileById.get(row.employer_id) ?? null
              : null,
          })
        );

        if (parsed.q) {
          const q = parsed.q.toLowerCase();
          items = [
            ...items,
            ...legacyMapped.filter(
              (c) =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.displayId.toLowerCase().includes(q)
            ),
          ];
        } else {
          items = [...items, ...legacyMapped];
        }
        legacyExtra = legacyMapped.length;
        items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }

    const total = (count ?? 0) + legacyExtra;
    const page = needLegacy
      ? items.slice(parsed.offset, parsed.offset + parsed.limit)
      : items;

    return { items: page, total, tab };
  } catch (err) {
    safeError("getAdminCases:", err);
    return null;
  }
}

export async function getAdminCaseById(
  casePathId: string
): Promise<AdminCaseDetail | null> {
  try {
    const parsed = parseCasePathId(casePathId);
    if (!parsed) return null;
    await requireAdmin();
    const admin = await createAdminClient();

    if (parsed.source === "legacy_dispute") {
      const { data, error } = await admin
        .from("disputes")
        .select(
          "id, title, description, status, worker_id, employer_id, job_id, admin_notes, created_at, updated_at"
        )
        .eq("id", parsed.sourceId)
        .maybeSingle();
      if (error || !data) {
        if (error) safeError("getAdminCaseById legacy:", error);
        return null;
      }

      const ids = [data.worker_id, data.employer_id].filter(Boolean) as string[];
      const profileById = new Map<string, ProfileLite>();
      if (ids.length) {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, email, first_name, middle_name, last_name, role")
          .in("id", ids);
        for (const p of profiles ?? []) profileById.set(p.id, p as ProfileLite);
      }

      let jobTitle: string | null = null;
      if (data.job_id) {
        const { data: job } = await admin
          .from("jobs")
          .select("title")
          .eq("id", data.job_id)
          .maybeSingle();
        jobTitle = job?.title ?? null;
      }

      const base = mapLegacyDispute({
        ...data,
        worker: data.worker_id
          ? profileById.get(data.worker_id) ?? null
          : null,
        employer: data.employer_id
          ? profileById.get(data.employer_id) ?? null
          : null,
      });

      return {
        ...base,
        adminNotes: data.admin_notes,
        defendantResponse: null,
        reviewedBy: null,
        reviewedAt: null,
        threadId: null,
        evidenceSignedUrl: null,
        evidenceMimeType: null,
        jobTitle,
      };
    }

    const { data, error } = await admin
      .from("user_reports")
      .select(
        `
        id,
        created_at,
        updated_at,
        status,
        case_stage,
        violation_category,
        title,
        description,
        admin_notes,
        job_id,
        thread_id,
        disputed_amount_cents,
        disputed_currency,
        defendant_response,
        evidence_storage_path,
        evidence_mime_type,
        resolution_outcome,
        reporter_id,
        reported_user_id,
        reviewed_by,
        reviewed_at,
        reporter:profiles!user_reports_reporter_id_fkey (
          id, email, first_name, middle_name, last_name, role
        ),
        reported:profiles!user_reports_reported_user_id_fkey (
          id, email, first_name, middle_name, last_name, role
        )
        `
      )
      .eq("id", parsed.sourceId)
      .maybeSingle();

    if (error || !data) {
      if (error) safeError("getAdminCaseById:", error);
      return null;
    }

    const base = mapUserReportRow(data as RawUserReport);

    let jobTitle: string | null = null;
    if (data.job_id) {
      const { data: job } = await admin
        .from("jobs")
        .select("title")
        .eq("id", data.job_id)
        .maybeSingle();
      jobTitle = job?.title ?? null;
    }

    const evidenceSignedUrl = data.evidence_storage_path
      ? await signEvidenceUrl(admin, data.evidence_storage_path)
      : null;

    return {
      ...base,
      adminNotes: data.admin_notes,
      defendantResponse: data.defendant_response,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      threadId: data.thread_id,
      evidenceSignedUrl,
      evidenceMimeType: data.evidence_mime_type,
      jobTitle,
    };
  } catch (err) {
    safeError("getAdminCaseById:", err);
    return null;
  }
}

const updateCaseSchema = z
  .object({
    caseId: z.string().min(1),
    caseStage: z.enum(CASE_STAGES).optional(),
    status: z.enum(USER_REPORT_STATUSES).optional(),
    resolutionOutcome: z.enum(RESOLUTION_OUTCOMES).nullable().optional(),
    adminNotes: z.string().trim().max(5000).optional(),
    defendantResponse: z.string().trim().max(8000).optional(),
    disputedAmountCents: z.number().int().min(0).nullable().optional(),
    disputedCurrency: z.string().trim().max(8).optional(),
    legacyStatus: z
      .enum(["open", "under_review", "resolved", "closed"])
      .optional(),
  })
  .strict();

export async function updateAdminCase(input: unknown) {
  return runAction("updateAdminCase", async () => {
    const parsed = updateCaseSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid case update.");

    const path = parseCasePathId(parsed.data.caseId);
    if (!path) return fail("Invalid case id.");

    const { user } = await requireAdmin();
    const admin = await createAdminClient();
    const now = new Date().toISOString();

    if (path.source === "legacy_dispute") {
      const status = parsed.data.legacyStatus;
      if (!status && parsed.data.adminNotes === undefined) {
        return fail("Nothing to update.");
      }
      const { error } = await admin
        .from("disputes")
        .update({
          ...(status ? { status } : {}),
          ...(parsed.data.adminNotes !== undefined
            ? { admin_notes: parsed.data.adminNotes || null }
            : {}),
          updated_at: now,
        })
        .eq("id", path.sourceId);
      if (error) {
        safeError("updateAdminCase legacy:", error);
        return fail("Failed to update legacy case.");
      }
      await logAdminAction("update_dispute_case", "dispute", path.sourceId, {
        status,
      });
      revalidatePath("/admin/disputes");
      revalidatePath(`/admin/disputes/${parsed.data.caseId}`);
      return ok();
    }

    const update: {
      updated_at: string;
      reviewed_at: string;
      reviewed_by: string;
      case_stage?: string;
      status?: string;
      resolution_outcome?: string | null;
      admin_notes?: string | null;
      defendant_response?: string | null;
      disputed_amount_cents?: number | null;
      disputed_currency?: string;
    } = {
      updated_at: now,
      reviewed_at: now,
      reviewed_by: user.id,
    };

    if (parsed.data.caseStage) {
      update.case_stage = parsed.data.caseStage;
      if (parsed.data.caseStage === "resolved") update.status = "resolved";
      if (parsed.data.caseStage === "dismissed") update.status = "dismissed";
      if (
        parsed.data.caseStage === "in_mediation" ||
        parsed.data.caseStage === "arbitration_noted"
      ) {
        update.status = "investigating";
      }
      if (parsed.data.caseStage === "awaiting_evidence") {
        update.status = "open";
      }
    }
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.resolutionOutcome !== undefined) {
      update.resolution_outcome = parsed.data.resolutionOutcome;
    }
    if (parsed.data.adminNotes !== undefined) {
      update.admin_notes = parsed.data.adminNotes || null;
    }
    if (parsed.data.defendantResponse !== undefined) {
      update.defendant_response = parsed.data.defendantResponse || null;
    }
    if (parsed.data.disputedAmountCents !== undefined) {
      update.disputed_amount_cents = parsed.data.disputedAmountCents;
    }
    if (parsed.data.disputedCurrency !== undefined) {
      update.disputed_currency = parsed.data.disputedCurrency;
    }

    const { error } = await admin
      .from("user_reports")
      .update(update)
      .eq("id", path.sourceId);

    if (error) {
      safeError("updateAdminCase:", error);
      return fail("Failed to update case.");
    }

    await logAdminAction("update_dispute_case", "user_report", path.sourceId, {
      caseStage: parsed.data.caseStage,
      resolutionOutcome: parsed.data.resolutionOutcome,
      status: parsed.data.status,
    });

    revalidatePath("/admin/disputes");
    revalidatePath(`/admin/disputes/${parsed.data.caseId}`);
    revalidatePath("/admin/reports");
    return ok();
  });
}

export async function applyCaseOutcome(input: unknown) {
  return runAction("applyCaseOutcome", async () => {
    const schema = z
      .object({
        caseId: z.string().min(1),
        outcome: z.enum(RESOLUTION_OUTCOMES),
        adminNotes: z.string().trim().max(5000).optional(),
      })
      .strict();

    const parsed = schema.safeParse(input);
    if (!parsed.success) return fail("Invalid outcome.");

    const path = parseCasePathId(parsed.data.caseId);
    if (!path) return fail("Invalid case id.");
    if (path.source === "legacy_dispute") {
      const close =
        parsed.data.outcome === "dismissed" ||
        parsed.data.outcome === "mutual_closure";
      return updateAdminCase({
        caseId: parsed.data.caseId,
        legacyStatus: close ? "closed" : "under_review",
        adminNotes: parsed.data.adminNotes,
      });
    }

    const terminal =
      parsed.data.outcome === "dismissed" ||
      parsed.data.outcome === "mutual_closure" ||
      parsed.data.outcome === "favor_employer_recorded" ||
      parsed.data.outcome === "favor_worker_recorded" ||
      parsed.data.outcome === "non_binding_recommendation";

    const stage: CaseStage =
      parsed.data.outcome === "dismissed"
        ? "dismissed"
        : parsed.data.outcome === "funds_at_risk_noted"
          ? "in_mediation"
          : terminal
            ? "resolved"
            : "in_mediation";

    return updateAdminCase({
      caseId: parsed.data.caseId,
      caseStage: stage,
      resolutionOutcome: parsed.data.outcome,
      adminNotes: parsed.data.adminNotes,
    });
  });
}
