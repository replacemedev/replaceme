"use client";

import { useEffect } from "react";
import { FileImage, X, ZoomIn } from "lucide-react";
import { OptimizedImage } from "@/components/shared/media/OptimizedImage";
import { DOCUMENT_TYPE_LABELS } from "@/types/verification";
import type { AdminVerificationDocument } from "@/types/admin.types";
import type { VerificationDocumentType } from "@/types/verification";

export function isImageMime(mime: string | null | undefined) {
  return Boolean(mime?.startsWith("image/"));
}

export function formatRegionCity(
  city: string | null | undefined,
  region: string | null | undefined,
  locationFallback?: string | null
) {
  const parts = [city?.trim(), region?.trim()].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  const fallback = locationFallback?.trim();
  return fallback || null;
}

export function formatKycDate(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function documentTypeLabel(type: string) {
  return (
    DOCUMENT_TYPE_LABELS[type as VerificationDocumentType] ??
    type.replace(/_/g, " ")
  );
}

/** Safari-safe full-screen ID zoom with body scroll lock. */
export function DocumentLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        aria-label="Close image preview"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-white">{alt}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-h-[80vh] overflow-hidden rounded-xl bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URLs */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export function VerificationDocCard({
  doc,
  onZoom,
}: {
  doc: AdminVerificationDocument;
  onZoom?: (src: string, alt: string) => void;
}) {
  const previewUrl = doc.signed_url;
  const fullUrl = doc.full_signed_url ?? doc.signed_url;
  const showPreview = Boolean(previewUrl && isImageMime(doc.mime_type));
  const label = documentTypeLabel(doc.document_type);

  return (
    <li className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3">
      {showPreview ? (
        <button
          type="button"
          onClick={() => fullUrl && onZoom?.(fullUrl, label)}
          className="group relative mb-2 block w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left"
        >
          <OptimizedImage
            src={previewUrl!}
            alt={label}
            fill
            sizes="(max-width: 1024px) 100vw, 420px"
            loading="lazy"
            className="object-contain"
            containerClassName="relative aspect-[3/2] w-full overflow-hidden"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ZoomIn className="h-3 w-3" aria-hidden />
            Zoom
          </span>
        </button>
      ) : null}
      <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-700">
        <FileImage className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-[11px] text-slate-400">{doc.file_name}</p>
      {fullUrl ? (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-[#006e2f] hover:underline"
        >
          View / download
        </a>
      ) : (
        <p className="mt-2 text-xs font-semibold text-red-500">
          Unable to generate preview URL
        </p>
      )}
    </li>
  );
}

export function ProfileDetailsCard({
  fullName,
  birthDate,
  regionCity,
  addressLine1,
  idType,
  idNumber,
  idExpirationDate,
  idIssuingCountry,
}: {
  fullName: string;
  birthDate: string | null;
  regionCity: string | null;
  addressLine1: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idExpirationDate?: string | null;
  idIssuingCountry?: string | null;
}) {
  return (
    <div className="h-fit min-w-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Profile details
      </p>
      <p className="mt-1 text-[11px] font-medium text-slate-400">
        Cross-reference against the ID images
      </p>
      <dl className="mt-4 space-y-4">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Full legal name
          </dt>
          <dd className="mt-1 break-words text-base font-bold text-slate-900">
            {fullName}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Date of birth
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">
            {birthDate ?? "—"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Region / city
          </dt>
          <dd className="mt-1 break-words text-base font-semibold text-slate-900">
            {regionCity ?? "—"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Address line
          </dt>
          <dd className="mt-1 break-words text-base font-semibold text-slate-900">
            {addressLine1?.trim() ? addressLine1 : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Submitted ID details
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Typed by the worker during onboarding
        </p>
        <dl className="mt-3 space-y-3">
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              ID type
            </dt>
            <dd className="mt-1 break-words text-base font-semibold text-slate-900">
              {idType?.trim() ? idType : "—"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              ID number
            </dt>
            <dd className="mt-1 break-all font-mono text-base font-semibold tracking-wide text-slate-900">
              {idNumber?.trim() ? idNumber : "—"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Expiration date
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {formatKycDate(idExpirationDate) ?? "—"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Issuing country
            </dt>
            <dd className="mt-1 break-words text-base font-semibold text-slate-900">
              {idIssuingCountry?.trim() ? idIssuingCountry : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
