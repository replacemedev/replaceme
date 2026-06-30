"use client";

import React, { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Building2, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";
import { uploadCompanyLogo } from "@/actions/employer/company";
import { toast } from "sonner";
import {
  PROFILE_IMAGE_MAX_BYTES,
  companyLogoHelperText,
  profileImageMaxMbLabel,
} from "@/lib/storage/profile-image";

export function LogoUpload() {
  const { setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const logoUrl = watch("logoUrl");

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Client-side quick checks
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error(`File must be ${profileImageMaxMbLabel()} or smaller.`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

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
    } catch (error) {
      toast.error("Failed to upload image. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = () => {
    setValue("logoUrl", "", { shouldValidate: true });
    toast.success("Logo removed.");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
      {/* Dashed Square Logo Box */}
      <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden group">
        {logoUrl ? (
          <>
            <Image
              src={logoUrl}
              alt="Company Logo Preview"
              fill
              className="object-cover"
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
    </div>
  );
}
