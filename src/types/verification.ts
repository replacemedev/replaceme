import { z } from "zod";

export const VERIFICATION_DOCUMENT_TYPES = [
  "id_front",
  "id_back",
  "selfie",
] as const;

export type VerificationDocumentType = (typeof VERIFICATION_DOCUMENT_TYPES)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "personal_complete",
  "documents_submitted",
  "under_review",
  "approved",
  "rejected",
  "resubmission_required",
] as const;

/** Statuses where the worker must re-upload after admin feedback. */
export const KYC_RESUBMIT_STATUSES = ["rejected", "resubmission_required"] as const;

export type KycResubmitStatus = (typeof KYC_RESUBMIT_STATUSES)[number];

export function isKycResubmitStatus(
  status: VerificationStatus
): status is KycResubmitStatus {
  return (KYC_RESUBMIT_STATUSES as readonly string[]).includes(status);
}

/** Worker-facing rejection presets (Jumio/usability-aligned). */
export const COMMON_KYC_REJECTION_REASONS = [
  "ID image is too blurry or unreadable",
  "ID is obscured by glare or poor lighting",
  "ID is expired",
  "Name on the ID does not match your profile",
  "Date of birth on the ID does not match your profile",
  "Address or location on the ID does not match your profile",
  "Selfie does not match the photo on the ID",
  "Submission is incomplete (missing back of ID or selfie)",
  "Document type is not accepted",
  "Screenshot or photo of a screen is not accepted — upload a photo of the physical ID",
  "Document appears altered or is not an original government-issued ID",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ALLOWED_VERIFICATION_MIME_TYPES = [
  "image/jpeg",
  "image/png",
] as const;

export const MAX_VERIFICATION_FILE_BYTES = 5 * 1024 * 1024;

export const verificationUploadSchema = z.object({
  documentType: z.enum(VERIFICATION_DOCUMENT_TYPES),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_VERIFICATION_MIME_TYPES),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_VERIFICATION_FILE_BYTES, "File must be 5 MB or smaller"),
});

export type VerificationUploadInput = z.infer<typeof verificationUploadSchema>;

export interface VerificationDocumentRecord {
  id: string;
  documentType: VerificationDocumentType;
  fileName: string;
  mimeType: string;
  storagePath: string;
  previewUrl: string | null;
  uploadedAt: string;
}

export interface VerificationStep {
  id: number;
  label: string;
  state: "completed" | "active" | "pending";
}

export interface WorkerVerificationState {
  workerId: string;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  kycRejectionReason: string | null;
  personalInfoComplete: boolean;
  documents: VerificationDocumentRecord[];
  requiredDocumentTypes: VerificationDocumentType[];
  canSubmitForReview: boolean;
  steps: VerificationStep[];
  idType?: string | null;
  idNumber?: string | null;
  idExpirationDate?: string | null;
  idIssuingCountry?: string | null;
}

export const VERIFICATION_STEP_LABELS = [
  "Personal Info",
  "Identity Verification",
  "Professional Review",
] as const;

export function isPersonalInfoComplete(profile: {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  professional_title: string | null;
  id_type?: string | null;
  id_number?: string | null;
  id_expiration_date?: string | null;
  id_issuing_country?: string | null;
}): boolean {
  return Boolean(
    profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.email?.trim() &&
      profile.professional_title?.trim() &&
      profile.id_type?.trim() &&
      profile.id_number?.trim() &&
      profile.id_expiration_date?.trim() &&
      profile.id_issuing_country?.trim()
  );
}

export function hasAllRequiredDocuments(
  documents: VerificationDocumentRecord[],
  required: VerificationDocumentType[] = [...VERIFICATION_DOCUMENT_TYPES]
): boolean {
  const uploaded = new Set(documents.map((d) => d.documentType));
  return required.every((type) => uploaded.has(type));
}

export function deriveVerificationSteps(
  status: VerificationStatus,
  personalInfoComplete: boolean,
  documentsComplete: boolean
): VerificationStep[] {
  const approved = status === "approved";
  const inReview =
    status === "under_review" || status === "documents_submitted";
  const needsResubmit = isKycResubmitStatus(status);

  const step1: VerificationStep["state"] = personalInfoComplete || approved
    ? "completed"
    : "active";

  let step2: VerificationStep["state"] = "pending";
  if (approved || documentsComplete || inReview) {
    step2 = "completed";
  } else if (personalInfoComplete || needsResubmit) {
    step2 = "active";
  }

  let step3: VerificationStep["state"] = "pending";
  if (approved) {
    step3 = "completed";
  } else if (inReview || needsResubmit) {
    step3 = "active";
  }

  return VERIFICATION_STEP_LABELS.map((label, index) => ({
    id: index + 1,
    label,
    state: [step1, step2, step3][index],
  }));
}

export const DOCUMENT_TYPE_LABELS: Record<VerificationDocumentType, string> = {
  id_front: "Philippine Government ID — Front",
  id_back: "Philippine Government ID — Back",
  selfie: "Selfie Verification Photo",
};

export const DOCUMENT_TYPE_HINTS: Record<VerificationDocumentType, string> = {
  id_front: "Upload a clear photo of the front of your Philippine government-issued ID.",
  id_back: "Upload a clear photo of the back of your Philippine government-issued ID.",
  selfie: "Take a selfie holding your Philippine ID next to your face.",
};

export const VERIFICATION_BENEFITS = [
  "Apply to premium verified-only job posts",
  "Higher visibility in employer talent search",
  "Verified badge displayed across the platform",
  "Faster trust with new employers",
] as const;
