import React from "react";
import { FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DownloadResumeButtonProps {
  candidateId: string;
  resumeUrl: string | null;
  planSlug: string;
  resumeDownloadEnabled: boolean;
  className?: string;
}

export function DownloadResumeButton({
  candidateId,
  resumeUrl,
  planSlug,
  resumeDownloadEnabled,
  className = "",
}: DownloadResumeButtonProps) {
  const router = useRouter();

  if (!resumeUrl) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (!resumeDownloadEnabled) {
      e.preventDefault();
      toast.error(
        "Resume downloads are only available on Starter, Growth, or Scale plans. Upgrade to access.",
        {
          action: {
            label: "Upgrade",
            onClick: () => router.push("/employer/pricing"),
          },
        }
      );
    }
  };

  if (!resumeDownloadEnabled) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer h-10 transition-all hover:bg-slate-100/80 active:scale-[0.98] whitespace-nowrap min-w-0 ${className}`}
      >
        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="truncate">Download Resume</span>
      </button>
    );
  }

  return (
    <a
      href={`/api/resumes/download?workerId=${candidateId}`}
      download
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] cursor-pointer h-10 whitespace-nowrap min-w-0 ${className}`}
    >
      <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      <span className="truncate">Download Resume</span>
    </a>
  );
}
