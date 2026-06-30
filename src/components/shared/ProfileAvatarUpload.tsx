"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  removeWorkerAvatar,
  uploadWorkerAvatar,
} from "@/actions/worker/profile";

import {
  PROFILE_IMAGE_ALLOWED_TYPES,
  PROFILE_IMAGE_MAX_BYTES,
  profileImageHelperText,
  profileImageMaxMbLabel,
} from "@/lib/storage/profile-image";

type AvatarSize = "md" | "lg";

const SIZE_CLASSES: Record<
  AvatarSize,
  { ring: string; text: string; icon: number }
> = {
  md: { ring: "w-24 h-24 sm:w-28 sm:h-28", text: "text-2xl", icon: 18 },
  lg: { ring: "w-32 h-32 sm:w-36 sm:h-36", text: "text-3xl", icon: 20 },
};

function initialsFromName(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export interface ProfileAvatarUploadProps {
  avatarUrl: string | null;
  displayName: string;
  editable?: boolean;
  size?: AvatarSize;
  onAvatarChange?: (url: string | null) => void;
  helperText?: string;
}

export function ProfileAvatarUpload({
  avatarUrl,
  displayName,
  editable = true,
  size = "lg",
  onAvatarChange,
  helperText,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setPreviewUrl(avatarUrl);
  }, [avatarUrl]);

  const busy = isUploading || isRemoving;
  const initials = initialsFromName(displayName);
  const sizeClass = SIZE_CLASSES[size];

  const handleFile = async (file: File) => {
    if (!editable || busy) return;

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error(`File must be ${profileImageMaxMbLabel()} or smaller.`);
      return;
    }

    if (
      !PROFILE_IMAGE_ALLOWED_TYPES.includes(
        file.type as (typeof PROFILE_IMAGE_ALLOWED_TYPES)[number]
      )
    ) {
      toast.error("Only JPG and PNG files are allowed.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading photo…");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadWorkerAvatar(formData);
      if ("error" in result && result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      if ("success" in result && result.success && result.avatarUrl) {
        setPreviewUrl(result.avatarUrl);
        onAvatarChange?.(result.avatarUrl);
        toast.success("Profile photo updated.", { id: toastId });
      }
    } catch {
      toast.error("Upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!editable || busy || !previewUrl) return;

    setIsRemoving(true);
    const toastId = toast.loading("Removing photo…");

    try {
      const result = await removeWorkerAvatar();
      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      setPreviewUrl(null);
      onAvatarChange?.(null);
      toast.success("Profile photo removed.", { id: toastId });
    } catch {
      toast.error("Could not remove photo.", { id: toastId });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!editable) {
    return (
      <div
        className={`relative mx-auto ${sizeClass.ring} rounded-full border-4 border-white shadow-md bg-slate-50 overflow-hidden flex items-center justify-center`}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="144px"
            priority
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-[#ebfdf2] text-[#006e2f] font-bold ${sizeClass.text}`}
          >
            {initials}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <div className="relative group">
        <button
          type="button"
          onClick={() => !busy && inputRef.current?.click()}
          disabled={busy}
          aria-label={previewUrl ? "Change profile photo" : "Upload profile photo"}
          className={`relative ${sizeClass.ring} rounded-full border-4 border-white shadow-md bg-slate-50 overflow-hidden flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 disabled:opacity-70 disabled:hover:scale-100`}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="144px"
              priority
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center bg-[#ebfdf2] text-[#006e2f] font-bold ${sizeClass.text}`}
            >
              {initials}
            </div>
          )}

          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-900/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <Camera size={sizeClass.icon} strokeWidth={2.25} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {previewUrl ? "Change" : "Upload"}
            </span>
          </span>

          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/85">
              <Loader2 className="h-7 w-7 text-[#006e2f] animate-spin" />
            </span>
          ) : null}
        </button>

        {previewUrl && !busy ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove profile photo"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-md transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>

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

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-[#006e2f]/30 hover:bg-[#fafdfb] hover:text-[#006e2f] disabled:opacity-50 sm:hidden"
      >
        <Upload size={14} />
        {previewUrl ? "Change photo" : "Add photo"}
      </button>

      {helperText ? (
        <p className="max-w-xs text-center text-xs font-medium leading-relaxed text-slate-500">
          {helperText}
        </p>
      ) : (
        <p className="max-w-xs text-center text-xs font-medium leading-relaxed text-slate-500">
          {profileImageHelperText()}
        </p>
      )}
    </div>
  );
}
