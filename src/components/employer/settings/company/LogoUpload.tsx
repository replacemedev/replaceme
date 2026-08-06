"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Building2, Upload, Loader2, X } from "lucide-react";
import { LogoImage } from "@/components/shared/media/LogoImage";
import { AvatarCropDialog } from "@/components/shared/AvatarCropDialog";
import { uploadCompanyLogo } from "@/actions/employer/company";
import { toast } from "sonner";
import {
  PROFILE_IMAGE_MAX_BYTES,
  companyLogoHelperText,
  profileImageSizeError,
  resolveProfileImageMime,
} from "@/lib/storage/profile-image";

export function LogoUpload() {
  const { setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMeta, setCropMeta] = useState<{
    fileName: string;
    mimeType: string;
  } | null>(null);

  const logoUrl = watch("logoUrl");

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Uploading logo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadCompanyLogo(formData);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success && result.logoUrl) {
        setValue("logoUrl", result.logoUrl, { shouldValidate: true });
        toast.success("Logo uploaded successfully!", { id: toastId });
      }
    } catch {
      toast.error("Failed to upload image. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error(profileImageSizeError());
      return;
    }

    const mimeType = resolveProfileImageMime(file);
    if (!mimeType) {
      toast.error("Only JPG and PNG allowed.");
      return;
    }

    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
    setCropMeta({ fileName: file.name, mimeType });
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveLogo = () => {
    setValue("logoUrl", "", { shouldValidate: true });
    toast.success("Logo removed.");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
      {/* Circle Logo */}
      <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden group">
        {logoUrl ? (
          <>
            <LogoImage
              key={logoUrl}
              src={logoUrl}
              alt="Company Logo Preview"
              label="Company"
              sizePx={96}
              sizes="96px"
              rounded="full"
              fit="cover"
              className="object-cover"
              colorClass="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400"
            />
            {/* Remove overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                aria-label="Remove logo"
              >
                <X size={14} />
              </button>
            </div>
          </>
        ) : (
          <Building2 size={36} className="text-slate-400" />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#006e2f] animate-spin" />
          </div>
        )}
      </div>

      {/* Info & Button */}
      <div className="flex-1 text-center sm:text-left space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Company Logo</h3>
          <p className="text-xs text-slate-400 leading-normal">
            {companyLogoHelperText()}
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png"
          className="hidden"
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={handleButtonClick}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-[#006e2f]/30 hover:bg-[#fafdfb] text-slate-700 hover:text-[#006e2f] font-bold text-xs rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          <Upload size={14} />
          {logoUrl ? "Change Image" : "Upload Image"}
        </button>
      </div>

      <AvatarCropDialog
        open={Boolean(cropSrc && cropMeta)}
        imageSrc={cropSrc}
        fileName={cropMeta?.fileName ?? "logo.jpg"}
        mimeType={cropMeta?.mimeType ?? "image/jpeg"}
        onCancel={closeCrop}
        onConfirm={(file) => {
          closeCrop();
          void uploadFile(file);
        }}
      />
    </div>
  );
}
