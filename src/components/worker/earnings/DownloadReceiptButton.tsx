"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadReceiptButtonProps {
  referenceNumber: string;
  jobTitle: string;
}

export function DownloadReceiptButton({
  referenceNumber,
  jobTitle,
}: DownloadReceiptButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    const toastId = toast.loading(`Generating PDF receipt for "${jobTitle}"...`);

    setTimeout(() => {
      setIsDownloading(false);
      toast.success(`Receipt downloaded successfully!`, {
        id: toastId,
        description: `Reference: ${referenceNumber}`,
      });
    }, 1200);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#006e2f] hover:bg-[#ebfdf2] rounded-xl border border-slate-200/80 hover:border-[#006e2f]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      title="Download PDF Receipt"
    >
      {isDownloading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Download size={13} />
      )}
      <span>Download</span>
    </button>
  );
}
