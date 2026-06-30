"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadCompanyLogo } from "@/actions/employer/company";
import { LogoImage } from "@/components/shared/media/LogoImage";
import {
  PROFILE_IMAGE_MAX_BYTES,
  companyLogoHelperText,
  profileImageSizeError,
  resolveProfileImageMime,
} from "@/lib/storage/profile-image";

type LogoSize = "md" | "lg";

const SIZE_CLASSES: Record<LogoSize, { box: string; px: number }> = {
  md: { box: "h-24 w-24", px: 96 },
  lg: { box: "h-28 w-28 sm:h-32 sm:w-32", px: 128 },
};

export interface CompanyLogoUploadProps {
  logoUrl: string | null;
  companyName: string;
  editable?: boolean;
  size?: LogoSize;
  onLogoChange?: (url: string | null) => void;
  helperText?: string;
}

export function CompanyLogoUpload({
  logoUrl,
  companyName,
  editable = true,
  size = "md",
  onLogoChange,
  helperText,
}: CompanyLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreviewUrl(logoUrl);
  }, [logoUrl]);

  const sizeClass = SIZE_CLASSES[size];
  const label = companyName.trim() || "Company";

  const handleFile = async (file: File) => {
    if (!editable || isUploading) return;

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error(profileImageSizeError());
      return;
    }

    if (!resolveProfileImageMime(file)) {
      toast.error("Only JPG and PNG files are allowed.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading logo…");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadCompanyLogo(formData);
      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      if (result.success && result.logoUrl) {
        setPreviewUrl(result.logoUrl);
        onLogoChange?.(result.logoUrl);
        toast.success("Company logo updated.", { id: toastId });
      }
    } catch {
      toast.error("Upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!editable) {
    return (
      <div
        className={`relative mx-auto ${sizeClass.box} overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50`}
      >
        <LogoImage
          src={previewUrl}
          alt={`${label} logo`}
          label={label}
          sizePx={sizeClass.px}
          rounded="2xl"
          colorClass="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => !isUploading && inputRef.current?.click()}
        disabled={isUploading}
        aria-label={previewUrl ? "Change company logo" : "Upload company logo"}
        className={`group relative ${sizeClass.box} overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 disabled:opacity-70 disabled:hover:scale-100`}
      >
        {previewUrl ? (
          <LogoImage
            key={previewUrl}
            src={previewUrl}
            alt={`${label} logo`}
            label={label}
            sizePx={sizeClass.px}
            rounded="2xl"
            colorClass="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-400">
            <Building2 className="h-9 w-9" aria-hidden />
          </span>
        )}

        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-900/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <Upload size={18} strokeWidth={2.25} />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {previewUrl ? "Change" : "Upload"}
          </span>
        </span>

        {isUploading ? (
          <span className="absolute inset-0 flex items-center justify-center bg-white/85">
            <Loader2 className="h-7 w-7 animate-spin text-[#006e2f]" />
          </span>
        ) : null}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <p className="max-w-xs text-center text-xs font-medium leading-relaxed text-slate-500">
        {helperText ?? companyLogoHelperText()}
      </p>
    </div>
  );
}
