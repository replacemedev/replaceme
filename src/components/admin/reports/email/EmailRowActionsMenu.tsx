"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  Copy,
  Eye,
  Loader2,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailMessageRow } from "@/actions/admin/email-management";

type MenuCoords = { top: number; left: number };

export function EmailRowActionsMenu({
  row,
  onViewEvents,
  onDuplicateBroadcast,
}: {
  row: AdminEmailMessageRow;
  onViewEvents: () => void;
  onDuplicateBroadcast?: (subject: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const [pending, startTransition] = useTransition();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
    setCoords(null);
  };

  const placeMenu = () => {
    const el = summaryRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = 220;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    setCoords({ top: rect.bottom + 4, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placeMenu();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        detailsRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };
    const onReposition = () => placeMenu();
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const profileHref = row.user_id
    ? `/admin/users?q=${encodeURIComponent(row.to_email ?? row.user_id)}`
    : null;

  return (
    <details
      ref={detailsRef}
      className="relative inline-block text-left"
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        setOpen(next);
        if (!next) setCoords(null);
      }}
    >
      <summary
        ref={summaryRef}
        className="list-none cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
        aria-label="Email actions"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </summary>
      {open && coords ? (
        <div
          ref={menuRef}
          className="fixed z-[200] w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          style={{ top: coords.top, left: coords.left }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => {
              closeMenu();
              onViewEvents();
            }}
          >
            <Eye className="h-4 w-4 text-slate-400" />
            View events / payload
          </button>
          {row.kind === "broadcast" && onDuplicateBroadcast ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
              onClick={() => {
                closeMenu();
                onDuplicateBroadcast(row.subject ?? "");
                toast.message("Subject copied into composer");
              }}
            >
              <Copy className="h-4 w-4 text-slate-400" />
              Duplicate to composer
            </button>
          ) : null}
          {row.kind === "transactional" ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-500"
              onClick={() => {
                closeMenu();
                startTransition(() => {
                  toast.message(
                    "Retry is available from the originating flow for this template."
                  );
                });
              }}
            >
              <Copy className="h-4 w-4 text-slate-400" />
              Retry send
            </button>
          ) : null}
          {profileHref ? (
            <Link
              href={profileHref}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
              onClick={closeMenu}
            >
              <UserRound className="h-4 w-4 text-slate-400" />
              View recipient profile
            </Link>
          ) : (
            <p className="px-3 py-2 text-xs text-slate-400">
              No recipient profile (broadcast)
            </p>
          )}
        </div>
      ) : null}
    </details>
  );
}
