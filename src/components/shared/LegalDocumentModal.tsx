"use client";

import { useEffect, useRef } from "react";
import { X, Shield, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermsOfServiceContent } from "./legal/TermsOfServiceContent";
import { PrivacyPolicyContent } from "./legal/PrivacyPolicyContent";

interface LegalDocumentModalProps {
  open: boolean;
  documentType: "terms" | "privacy" | null;
  onClose: () => void;
}

export function LegalDocumentModal({
  open,
  documentType,
  onClose,
}: LegalDocumentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Reset scroll of the container inside on open
      const scrollContainer = dialog.querySelector(".modal-scroll-container");
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, documentType]);

  if (!open || !documentType) return null;

  const isTerms = documentType === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const maxWidthClass = isTerms ? "max-w-2xl" : "md:max-w-4xl max-w-2xl";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (e.target === dialog) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] ${maxWidthClass} h-[80vh] max-h-[750px] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs open:flex open:flex-col animate-in fade-in zoom-in-95 duration-200 focus:outline-none`}
      onClose={onClose}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-slate-50 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            {isTerms ? <ScrollText className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          </span>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Scrollable Body */}
      <div className="modal-scroll-container flex-1 min-h-0 max-h-[calc(80vh-8rem)] overflow-y-auto px-6 py-6 bg-white font-body-base leading-relaxed text-slate-600">
        <div className="prose prose-slate max-w-none">
          {isTerms ? (
            <TermsOfServiceContent hideSidebar={true} />
          ) : (
            <PrivacyPolicyContent isModal={true} />
          )}
        </div>
      </div>

      {/* Modal Sticky Footer */}
      <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl shrink-0">
        <Button
          type="button"
          variant="success"
          className="w-full h-12 text-base font-bold shadow-sm"
          onClick={onClose}
        >
          I Understand
        </Button>
      </div>
    </dialog>
  );
}
