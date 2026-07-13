import React, { useRef, useState } from "react";
import { Upload, FileText, Loader2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  uploadWorkerResume,
  deleteWorkerResume,
  getWorkerResumePreviewUrl,
} from "@/actions/worker/profile";

interface ResumeUploadProps {
  resumeUrl: string | null;
  onUploadComplete?: (url: string | null) => void;
}

export function ResumeUpload({
  resumeUrl: initialResumeUrl,
  onUploadComplete,
}: ResumeUploadProps) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(initialResumeUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF document.");
      return;
    }

    if (file.size > 5242880) {
      toast.error("File exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading resume...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadWorkerResume(formData);
      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else if (result.success && result.resumeUrl) {
        setResumeUrl(result.resumeUrl);
        onUploadComplete?.(result.resumeUrl);
        toast.success("Resume uploaded successfully.", { id: toastId });
      }
    } catch {
      toast.error("Upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Removing resume...");

    try {
      const result = await deleteWorkerResume();
      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else {
        setResumeUrl(null);
        onUploadComplete?.(null);
        toast.success("Resume removed.", { id: toastId });
      }
    } catch {
      toast.error("Could not remove resume.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = async () => {
    const toastId = toast.loading("Generating secure preview link...");
    try {
      const result = await getWorkerResumePreviewUrl();
      if (result.error || !result.previewUrl) {
        toast.error(result.error ?? "Failed to generate preview link.", { id: toastId });
      } else {
        toast.dismiss(toastId);
        window.open(result.previewUrl, "_blank");
      }
    } catch {
      toast.error("Failed to generate preview link.", { id: toastId });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const busy = isUploading || isDeleting;

  return (
    <div className="w-full">
      {resumeUrl ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl w-full overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">Uploaded Resume</p>
              <p className="text-[10px] font-medium text-slate-400">PDF Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              disabled={busy}
              onClick={handlePreview}
              className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3.5 text-xs font-bold text-red-600 hover:bg-red-100/70 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !busy && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#006e2f] bg-[#ebfdf2]/20"
              : "border-slate-200 bg-white hover:border-[#006e2f]/30 hover:bg-[#fafdfb]"
          } ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 mb-3 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-[#006e2f] animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-slate-400" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700">
              {isUploading ? "Uploading resume..." : "Click to upload or drag & drop"}
            </p>
            <p className="text-[10px] font-medium text-slate-400">PDF files only (max 5MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
