"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { safeError } from "@/utils/logger";
import { submitVerificationForReviewSchema } from "@/lib/validations/verification";
import { requireRole } from "@/lib/server/auth/session";
import { runAction, ok, fail } from "@/lib/server/action-result";
import {
  VERIFICATION_DOCUMENT_TYPES,
  WorkerVerificationState,
  deriveVerificationSteps,
  hasAllRequiredDocuments,
  isPersonalInfoComplete,
  verificationUploadSchema,
  type VerificationDocumentRecord,
  type VerificationDocumentType,
  type VerificationUploadInput,
} from "@/types/verification";

export interface VerificationActionResult {
  success: boolean;
  error?: string;
}

async function getSignedPreviewUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("verification-documents")
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    safeError("getSignedPreviewUrl:", error);
    return null;
  }
  return data.signedUrl;
}

function mapDocumentRows(
  rows: {
    id: string;
    document_type: string;
    storage_path: string;
    file_name: string;
    mime_type: string;
    created_at: string;
  }[],
  previewUrls: Map<string, string | null>
): VerificationDocumentRecord[] {
  return rows.map((row) => ({
    id: row.id,
    documentType: row.document_type as VerificationDocumentType,
    fileName: row.file_name,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    previewUrl: previewUrls.get(row.storage_path) ?? null,
    uploadedAt: row.created_at,
  }));
}

export async function getWorkerVerificationState(): Promise<WorkerVerificationState | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, role, first_name, last_name, email, professional_title, verification_status, is_verified, phone_number, gender, civil_status, id_type, id_number, id_expiration_date, id_issuing_country"
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "worker") {
      return null;
    }

    const { data: docRows, error: docsError } = await supabase
      .from("verification_documents")
      .select("id, document_type, storage_path, file_name, mime_type, created_at")
      .eq("worker_id", profile.id)
      .order("created_at", { ascending: true });

    if (docsError) {
      safeError("getWorkerVerificationState docs:", docsError);
    }

    const previewUrls = new Map<string, string | null>();
    for (const row of docRows ?? []) {
      previewUrls.set(
        row.storage_path,
        await getSignedPreviewUrl(supabase, row.storage_path)
      );
    }

    const documents = mapDocumentRows(docRows ?? [], previewUrls);
    const personalInfoComplete = isPersonalInfoComplete(profile);
    const documentsComplete = hasAllRequiredDocuments(documents);
    const status = (profile.verification_status ??
      "unverified") as WorkerVerificationState["verificationStatus"];

    const canSubmitForReview =
      personalInfoComplete &&
      documentsComplete &&
      (status === "personal_complete" ||
        status === "documents_submitted" ||
        status === "rejected");

    return {
      workerId: profile.id,
      verificationStatus: status,
      isVerified: Boolean(profile.is_verified),
      personalInfoComplete,
      documents: documents,
      requiredDocumentTypes: [...VERIFICATION_DOCUMENT_TYPES],
      canSubmitForReview,
      steps: deriveVerificationSteps(
        status,
        personalInfoComplete,
        documentsComplete
      ),
      idType: profile.id_type ?? null,
      idNumber: profile.id_number ?? null,
      idExpirationDate: profile.id_expiration_date ?? null,
      idIssuingCountry: profile.id_issuing_country ?? null,
    };
  } catch (err) {
    safeError("getWorkerVerificationState:", err);
    return null;
  }
}

export async function uploadVerificationDocument(
  formData: FormData
): Promise<VerificationActionResult & { document?: VerificationDocumentRecord }> {
  try {
    const file = formData.get("file");
    const documentTypeRaw = formData.get("documentType");

    if (!(file instanceof File)) {
      return { success: false, error: "No file provided." };
    }

    const parsedMeta = verificationUploadSchema.safeParse({
      documentType: documentTypeRaw,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });

    if (!parsedMeta.success) {
      const issue = parsedMeta.error.issues[0]?.message ?? "Invalid file.";
      return { success: false, error: issue };
    }

    const meta: VerificationUploadInput = parsedMeta.data;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please log in." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "worker") {
      return { success: false, error: "Worker account required." };
    }

    if (profile.verification_status === "approved") {
      return { success: false, error: "Your account is already verified." };
    }

    if (profile.verification_status === "under_review") {
      return {
        success: false,
        error: "Documents are under review. You cannot upload new files yet.",
      };
    }

    const extension = meta.fileName.includes(".")
      ? meta.fileName.split(".").pop()
      : "bin";
    const storagePath = `${profile.id}/${meta.documentType}/${crypto.randomUUID()}.${extension}`;

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("verification-documents")
      .upload(storagePath, fileBuffer, {
        contentType: meta.mimeType,
        upsert: true,
      });

    if (uploadError) {
      safeError("uploadVerificationDocument storage:", uploadError);
      return { success: false, error: "Failed to upload document securely." };
    }

    const { data: savedDoc, error: upsertError } = await supabase
      .from("verification_documents")
      .upsert(
        {
          worker_id: profile.id,
          document_type: meta.documentType,
          storage_path: storagePath,
          file_name: meta.fileName,
          mime_type: meta.mimeType,
          file_size_bytes: meta.fileSize,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "worker_id,document_type" }
      )
      .select("id, document_type, storage_path, file_name, mime_type, created_at")
      .single();

    if (upsertError || !savedDoc) {
      safeError("uploadVerificationDocument db:", upsertError);
      return { success: false, error: "Failed to save document record." };
    }

    const { data: allDocs } = await supabase
      .from("verification_documents")
      .select("document_type")
      .eq("worker_id", profile.id);

    const uploadedTypes = new Set((allDocs ?? []).map((d) => d.document_type));
    const allComplete = VERIFICATION_DOCUMENT_TYPES.every((t) =>
      uploadedTypes.has(t)
    );

    const nextStatus = allComplete ? "documents_submitted" : "personal_complete";

    await supabase
      .from("profiles")
      .update({ verification_status: nextStatus })
      .eq("id", profile.id);

    const previewUrl = await getSignedPreviewUrl(supabase, storagePath);

    revalidatePath("/worker/verification");
    revalidatePath("/worker/profile");
    revalidatePath("/worker/dashboard");

    return {
      success: true,
      document: {
        id: savedDoc.id,
        documentType: savedDoc.document_type as VerificationDocumentType,
        fileName: savedDoc.file_name,
        mimeType: savedDoc.mime_type,
        storagePath: savedDoc.storage_path,
        previewUrl,
        uploadedAt: savedDoc.created_at,
      },
    };
  } catch (err) {
    safeError("uploadVerificationDocument:", err);
    return { success: false, error: "Unexpected error during upload." };
  }
}

export async function submitVerificationForReview(): Promise<VerificationActionResult> {
  const result = await runAction("submitVerificationForReview", async () => {
    submitVerificationForReviewSchema.parse({});
    const { supabase, profile } = await requireRole("worker");

    const state = await getWorkerVerificationState();
    if (!state) {
      return fail("Worker verification state not found.");
    }

    if (!state.canSubmitForReview) {
      return fail(
        "Complete your profile and upload all required documents first."
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: "under_review" })
      .eq("id", profile.id);

    if (error) {
      safeError("submitVerificationForReview:", error);
      return fail("Failed to submit for review.");
    }

    revalidatePath("/worker/verification");
    revalidatePath("/worker/dashboard");
    return ok();
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}

export async function isWorkerVerified(workerId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("id", workerId)
      .eq("role", "worker")
      .maybeSingle();

    return Boolean(data?.is_verified);
  } catch {
    return false;
  }
}
