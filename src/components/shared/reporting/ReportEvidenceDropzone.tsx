"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { validateReportEvidenceFile } from "@/lib/reporting/evidence";

export interface ReportEvidenceDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ReportEvidenceDropzone({
  file,
  onFileChange,
  disabled = false,
}: ReportEvidenceDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = useCallback(
    (next: File | null) => {
      if (!next) {
        onFileChange(null);
        setPreviewUrl(null);
        return;
      }

      const validationError = validateReportEvidenceFile(next);
      if (validationError) {
        onFileChange(null);
        setPreviewUrl(null);
        return { error: validationError };
      }

      onFileChange(next);
      setPreviewUrl(URL.createObjectURL(next));
      return { error: null };
    },
    [onFileChange]
  );

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0] ?? null;
    const result = validateAndSet(picked);
    if (result?.error) toast.error(result.error);
  };

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onFileChange(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">
        Screenshot evidence{" "}
        <span className="font-medium text-slate-400">(optional)</span>
      </p>

      {file && previewUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative aspect-video w-full max-h-56">
            <Image
              src={previewUrl}
              alt="Report evidence preview"
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 100vw, 480px"
              unoptimized
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{file.name}</p>
              <p className="text-[11px] font-medium text-slate-500">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <X size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled) return;
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors sm:py-10 ${
            isDragging
              ? "border-[#006e2f] bg-[#fafdfb]"
              : "border-slate-200 bg-slate-50/80 hover:border-[#006e2f]/40 hover:bg-[#fafdfb]/60"
          } disabled:opacity-50`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#006e2f] shadow-sm">
            <ImagePlus size={22} strokeWidth={2} />
          </span>
          <span className="space-y-1">
            <span className="block text-sm font-bold text-slate-800">
              Drop an image or tap to browse
            </span>
            <span className="block text-xs font-medium text-slate-500">
              JPG or PNG, max 5 MB
            </span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

