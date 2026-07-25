import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { isKycResubmitStatus, type VerificationStatus } from "@/types/verification";

interface WorkerKycResubmitBannerProps {
  verificationStatus: VerificationStatus | null | undefined;
  kycRejectionReason?: string | null;
}

export function WorkerKycResubmitBanner({
  verificationStatus,
  kycRejectionReason,
}: WorkerKycResubmitBannerProps) {
  if (!verificationStatus || !isKycResubmitStatus(verificationStatus)) {
    return null;
  }

  const isRejected = verificationStatus === "rejected";

  return (
    <div
      role="alert"
      className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 ${
        isRejected
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      <div className="flex min-w-0 gap-3">
        <AlertTriangle
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            isRejected ? "text-red-600" : "text-amber-600"
          }`}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold">
            {isRejected
              ? "Identity verification was rejected"
              : "Resubmission required"}
          </p>
          <p className="text-sm leading-relaxed">
            {kycRejectionReason?.trim()
              ? kycRejectionReason
              : "Please re-upload clear, valid government ID photos."}
          </p>
        </div>
      </div>
      <Link
        href="/worker/verification"
        className={`inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-colors ${
          isRejected
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-amber-700 text-white hover:bg-amber-800"
        }`}
      >
        Update documents
      </Link>
    </div>
  );
}
