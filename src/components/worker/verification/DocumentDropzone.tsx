"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { uploadVerificationDocument } from "@/actions/verification";
import {
  ALLOWED_VERIFICATION_MIME_TYPES,
  DOCUMENT_TYPE_HINTS,
  DOCUMENT_TYPE_LABELS,
  MAX_VERIFICATION_FILE_BYTES,
  type VerificationDocumentRecord,
  type VerificationDocumentType,
} from "@/types/verification";

interface DocumentDropzoneProps {
  documentType: VerificationDocumentType;
  existing?: VerificationDocumentRecord | null;
  disabled?: boolean;
}

export function DocumentDropzone({
  documentType,
  existing,
  disabled = false,
}: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<VerificationDocumentRecord | null>(
    existing ?? null
  );

  const uploadFile = useCallback(
    (file: File) => {
      if (disabled) return;

      if (!ALLOWED_VERIFICATION_MIME_TYPES.includes(file.type as (typeof ALLOWED_VERIFICATION_MIME_TYPES)[number])) {
        toast.error("Invalid file format.");
        return;
      }

      if (file.size > MAX_VERIFICATION_FILE_BYTES) {
        toast.error("File too large (max 5MB).");
        return;
      }

      startTransition(async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        const result = await uploadVerificationDocument(formData);
        if (!result.success) {
          toast.error(result.error ?? "Upload failed.");
          return;
        }

        if (result.document) {
          setPreview(result.document);
        }
        toast.success(`${DOCUMENT_TYPE_LABELS[documentType]} uploaded.`);
        router.refresh();
      });
    },
    [disabled, documentType, router]
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) uploadFile(file);
  };

  const isImage =
    preview?.mimeType.startsWith("image/") && preview.previewUrl;

  return (
    <article className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900">
        {DOCUMENT_TYPE_LABELS[documentType]}
      </h3>
      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
        {DOCUMENT_TYPE_HINTS[documentType]}
      </p>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && !isPending && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`mt-4 relative flex flex-col items-center justify-center min-h-[140px] rounded-xl border-dashed border-2 transition-colors cursor-pointer ${
          disabled
            ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
            : isDragging
              ? "border-emerald-500 bg-emerald-50/50"
              : preview
                ? "border-slate-300 bg-[#f6fdf9] hover:border-emerald-500"
                : "border-slate-300 bg-white hover:border-emerald-500"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_VERIFICATION_MIME_TYPES.join(",")}
          className="sr-only"
          disabled={disabled || isPending}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isPending ? (
          <div className="flex flex-col items-center gap-2 text-[#006e2f]">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <span className="text-xs font-semibold">Uploading securely…</span>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-2 p-3 w-full">
            {isImage ? (
              // ponytail: standard img tag preserves dynamic aspect ratio without cropping
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.previewUrl!}
                alt={preview.fileName}
                className="object-contain max-h-48 w-auto mx-auto rounded-lg shadow-sm border border-slate-200"
              />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-[#006e2f]" aria-hidden />
            )}
            <p className="text-xs font-semibold text-slate-700 truncate max-w-full px-2">
              {preview.fileName}
            </p>
            {!disabled && (
              <span className="text-[11px] font-bold text-[#006e2f]">
                Click or drop to replace
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 p-4">
            <FileUp className="h-8 w-8 text-slate-400" aria-hidden />
            <span className="text-xs font-semibold text-center">
              Drag & drop or click to upload
            </span>
            <span className="text-[10px] text-slate-400">
              Max 5 MB · JPG, PNG, WebP, PDF
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
