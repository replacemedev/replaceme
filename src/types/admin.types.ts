import { z } from "zod";

export const timeSeriesPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const urgentAlertSchema = z.object({
  id: z.string(),
  type: z.enum(["security", "moderation", "system"]).or(z.string()),
  message: z.string(),
  created_at: z.string(),
});

export const platformMetricsSchema = z.object({
  total_workers: z.number(),
  total_employers: z.number(),
  total_users: z.number(),
  active_jobs: z.number(),
  pending_jobs: z.number(),
  total_applications: z.number(),
  active_contracts: z.number(),
  pending_verifications: z.number(),
  verified_workers: z.number(),
  active_subscriptions: z.number(),
  user_growth_30d: z.array(timeSeriesPointSchema),
  job_activity_30d: z.array(timeSeriesPointSchema),
  urgent_alerts: z.array(urgentAlertSchema),
});

export type TimeSeriesPoint = z.infer<typeof timeSeriesPointSchema>;
export type UrgentAlert = z.infer<typeof urgentAlertSchema>;
export type PlatformMetrics = z.infer<typeof platformMetricsSchema>;

export const EMPTY_PLATFORM_METRICS: PlatformMetrics = {
  total_workers: 0,
  total_employers: 0,
  total_users: 0,
  active_jobs: 0,
  pending_jobs: 0,
  total_applications: 0,
  active_contracts: 0,
  pending_verifications: 0,
  verified_workers: 0,
  active_subscriptions: 0,
  user_growth_30d: [],
  job_activity_30d: [],
  urgent_alerts: [],
};

export type AccountStatus = "active" | "suspended";

export const accountStatusSchema = z.enum(["active", "suspended"]);

export const verificationStatusSchema = z.enum([
  "unverified",
  "personal_complete",
  "documents_submitted",
  "under_review",
  "approved",
  "rejected",
]);

/** Nullable string that also accepts missing keys (legacy / partial selects). */
const nullableOptionalString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? null);

export const adminWorkerContractSchema = z.object({
  id: z.string().uuid(),
  employment_status: z.string().nullable().optional().transform((v) => v ?? null),
  show_hired_badge: z.boolean().catch(true),
  status: z.string().catch("unknown"),
});

export const adminWorkerRowSchema = z.object({
  id: z.string().uuid(),
  first_name: nullableOptionalString,
  middle_name: nullableOptionalString,
  last_name: nullableOptionalString,
  email: nullableOptionalString,
  professional_title: nullableOptionalString,
  account_status: accountStatusSchema.catch("active"),
  verification_status: verificationStatusSchema.catch("unverified"),
  is_verified: z.boolean().nullable().optional().transform((v) => v ?? false),
  created_at: z.string(),
  contracts: z
    .array(adminWorkerContractSchema)
    .optional()
    .nullable()
    .transform((v) => v ?? []),
});

export const adminEmployerRowSchema = z.object({
  id: z.string().uuid(),
  employer_id: z.string().uuid(),
  company_name: z.string(),
  email: z.string().nullable(),
  industry: z.string().nullable(),
  account_status: accountStatusSchema.catch("active"),
  subscription_status: z.string().nullable(),
  created_at: z.string(),
});

export const adminAdminRowSchema = z.object({
  id: z.string().uuid(),
  first_name: nullableOptionalString,
  middle_name: nullableOptionalString,
  last_name: nullableOptionalString,
  email: nullableOptionalString,
  account_status: accountStatusSchema.catch("active"),
  created_at: z.string(),
});

export const adminRoleSchema = z.enum(["moderator", "superadmin"]);

export const adminTeamRowSchema = adminAdminRowSchema.extend({
  admin_role: adminRoleSchema.catch("moderator"),
  display_name: z.string().nullable().optional(),
  last_sign_in_at: z.string().nullable().optional(),
});

export const adminTeamListSchema = z.array(adminTeamRowSchema);

export const adminWorkerListSchema = z.array(adminWorkerRowSchema);
export const adminEmployerListSchema = z.array(adminEmployerRowSchema);
export const adminAdminListSchema = z.array(adminAdminRowSchema);

export type AdminUserTab = "workers" | "employers" | "admins";

export type AdminUsersPageData = {
  workers: AdminWorkerRow[];
  employers: AdminEmployerRow[];
  admins: AdminAdminRow[];
};

export type AdminFetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export interface AdminWorkerRow {
  id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  professional_title: string | null;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  is_verified: boolean;
  created_at: string;
  contracts?: {
    id: string;
    employment_status: string | null;
    show_hired_badge: boolean;
    status: string;
  }[] | null;
}

export interface AdminEmployerRow {
  id: string;
  employer_id: string;
  company_name: string;
  email: string | null;
  industry: string | null;
  account_status: AccountStatus;
  subscription_status: string | null;
  created_at: string;
}

export interface AdminAdminRow {
  id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  account_status: AccountStatus;
  created_at: string;
}

export type AdminRole = "moderator" | "superadmin";

export interface AdminTeamRow extends AdminAdminRow {
  admin_role: AdminRole;
  display_name?: string | null;
  last_sign_in_at?: string | null;
}

export interface AdminJobRow {
  id: string;
  title: string;
  status: string;
  employment_type: string;
  monthly_salary: number;
  salary_currency: string | null;
  employer_id: string;
  company_name: string | null;
  created_at: string;
  plan_slug: string | null;
  submitted_for_review_at: string | null;
  requires_manual_approval: boolean;
}

export interface AdminVerificationQueueRow {
  id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  username: string | null;
  phone_number: string | null;
  tin_number: string | null;
  id_type: string | null;
  id_number: string | null;
  id_expiration_date: string | null;
  id_issuing_country: string | null;
  verification_status: VerificationStatus;
  document_count: number;
  created_at: string;
}

export interface AdminVerificationDocument {
  id: string;
  document_type: string;
  file_name: string;
  mime_type: string;
  signed_url: string | null;
  created_at: string;
}

export interface AdminSubscriptionRow {
  id: string;
  employer_id: string;
  company_name: string | null;
  employer_email: string | null;
  plan_name: string | null;
  plan_slug: string | null;
  plan_price: number | null;
  unit_amount_cents: number | null;
  billing_interval: "month" | "year" | null;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  last_payment_status: string | null;
  last_payment_at: string | null;
  last_payment_error: string | null;
  failed_payment_count: number;
  job_posts_used: number;
  unlocks_used: number;
  created_at: string;
  scheduled_plan_slug: string | null;
  scheduled_effective_at: string | null;
  cancel_at_period_end: boolean;
  stripe_dispute_status: string | null;
  override_plan_id: string | null;
  override_expires_at: string | null;
  override_reason: string | null;
}

export interface AdminBillingLedgerRow {
  id: string;
  employer_id: string;
  company_name: string | null;
  event_type: string;
  amount_cents: number;
  currency: string;
  plan_slug: string | null;
  subscription_status: string | null;
  occurred_at: string;
  stripe_invoice_id: string | null;
}

export interface AdminBillingTierBreakdown {
  plan_slug: string;
  label: string;
  count: number;
  mrr_cents: number;
}

export interface AdminBillingMetrics {
  active_subscriptions: number;
  estimated_mrr_cents: number;
  total_accounts: number;
  failed_payments_30d: number;
  at_risk_count: number;
  tier_breakdown: AdminBillingTierBreakdown[];
  scheduled_changes?: number;
}

export interface AdminBillingPageData {
  metrics: AdminBillingMetrics;
  subscriptions: AdminSubscriptionRow[];
  ledger: AdminBillingLedgerRow[];
}

export interface AdminAuditLogRow {
  id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin_email: string | null;
}

export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export const moderateJobSchema = z.object({
  jobId: z.string().uuid(),
  reason: z.string().min(3).max(500).optional(),
});

export const reviewVerificationSchema = z.object({
  workerId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().min(3).max(500).optional(),
});

export const disputeStatusSchema = z.enum([
  "open",
  "under_review",
  "resolved",
  "closed",
]);

export const adminDisputeRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: disputeStatusSchema,
  worker_id: z.string().uuid().nullable(),
  employer_id: z.string().uuid().nullable(),
  job_id: z.string().uuid().nullable(),
  worker_name: z.string().nullable(),
  worker_email: z.string().nullable(),
  admin_notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const updateDisputeStatusSchema = z.object({
  disputeId: z.string().uuid(),
  status: disputeStatusSchema,
  adminNotes: z.string().max(2000).optional(),
});

export const adminApplicationRowSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  job_title: z.string().nullable(),
  company_name: z.string().nullable(),
  worker_id: z.string().uuid(),
  worker_name: z.string().nullable(),
  worker_email: z.string().nullable(),
  status: z.string(),
  match_score: z.number(),
  created_at: z.string(),
});

export const adminChatThreadRowSchema = z.object({
  id: z.string().uuid(),
  worker_id: z.string().uuid(),
  worker_name: z.string().nullable(),
  company_name: z.string().nullable(),
  job_title: z.string().nullable(),
  message_count: z.number(),
  last_message_at: z.string().nullable(),
  updated_at: z.string(),
});

export const adminSubscriptionOverrideSchema = z.object({
  subscriptionId: z.string().uuid(),
  jobPostsUsed: z.number().int().min(0).max(9999),
  unlocksUsed: z.number().int().min(0).max(9999),
  note: z.string().min(3).max(500),
});

export const adminPlanOverrideSchema = z.object({
  employerId: z.string().uuid(),
  planSlug: z.enum(["discovery", "starter", "growth", "scale"]),
  /** Days until override expires; null = permanent until revoked */
  expiresInDays: z.number().int().min(1).max(365).nullable(),
  reason: z.string().min(3).max(500),
});

export const adminRevokePlanOverrideSchema = z.object({
  employerId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export const adminIssueRefundSchema = z.object({
  employerId: z.string().uuid(),
  /** PaymentIntent id (pi_...) or Charge id (ch_...) */
  stripePaymentRef: z.string().min(3).max(128),
  /** Full refund when omitted / null */
  amountCents: z.number().int().positive().nullable(),
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"]).default("requested_by_customer"),
  note: z.string().min(3).max(500),
});

export type DisputeStatus = z.infer<typeof disputeStatusSchema>;
export type AdminDisputeRow = z.infer<typeof adminDisputeRowSchema>;
export type AdminApplicationRow = z.infer<typeof adminApplicationRowSchema>;
export type AdminChatThreadRow = z.infer<typeof adminChatThreadRowSchema>;
