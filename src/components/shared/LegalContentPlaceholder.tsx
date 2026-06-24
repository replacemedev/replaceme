import { FileText } from "lucide-react";

interface LegalContentPlaceholderProps {
  message?: string;
}

export function LegalContentPlaceholder({
  message = "Legal text pending.",
}: LegalContentPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 mb-4">
        <FileText className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
