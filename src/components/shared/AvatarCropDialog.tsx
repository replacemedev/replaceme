"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const OUTPUT_SIZE = 512;
const VIEWPORT = 280;

type AvatarCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  mimeType: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

export function AvatarCropDialog({
  open,
  imageSrc,
  fileName,
  mimeType,
  onCancel,
  onConfirm,
}: AvatarCropDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setNatural({ w: 0, h: 0 });
    setExporting(false);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const ready = natural.w > 0 && natural.h > 0;
  const coverScale = ready
    ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h) * zoom
    : 1;
  const drawnW = natural.w * coverScale;
  const drawnH = natural.h * coverScale;
  const dx = (VIEWPORT - drawnW) / 2 + offset.x;
  const dy = (VIEWPORT - drawnH) / 2 + offset.y;

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    setOffset({
      x: dragRef.current.originX + (event.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (event.clientY - dragRef.current.startY),
    });
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !ready) return;

    setExporting(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      const scale = OUTPUT_SIZE / VIEWPORT;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, dx * scale, dy * scale, drawnW * scale, drawnH * scale);

      const outType = mimeType === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, outType, 0.92)
      );
      if (!blob) throw new Error("Export failed");

      const base = fileName.replace(/\.[^.]+$/, "") || "avatar";
      const ext = outType === "image/png" ? "png" : "jpg";
      onConfirm(new File([blob], `${base}-cropped.${ext}`, { type: blob.type }));
    } catch {
      setExporting(false);
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[90] m-0 h-[100dvh] max-h-none w-full max-w-none bg-transparent p-0 open:flex open:items-end open:justify-center open:sm:items-center backdrop:bg-slate-900/50"
      onCancel={(e) => {
        e.preventDefault();
        if (!exporting) onCancel();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && !exporting) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
        role="document"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-extrabold text-slate-900">Crop photo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Drag to reposition. Zoom to frame your face in the circle.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div
            className="relative mx-auto touch-none select-none overflow-hidden rounded-full border border-slate-200 bg-slate-100"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- cropper needs naturalWidth/Height
              <img
                ref={imgRef}
                src={imageSrc}
                alt=""
                draggable={false}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  setNatural({ w: el.naturalWidth, h: el.naturalHeight });
                }}
                className="absolute max-w-none pointer-events-none"
                style={{
                  width: drawnW || undefined,
                  height: drawnH || undefined,
                  left: dx,
                  top: dy,
                }}
              />
            ) : null}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#006e2f]"
              disabled={!ready || exporting}
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="!w-full min-h-11 sm:!w-auto"
            disabled={exporting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="!w-full min-h-11 gap-2 sm:!w-auto"
            disabled={!ready || exporting}
            onClick={() => void handleConfirm()}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Use photo
          </Button>
        </div>
      </div>
    </dialog>
  );
}
