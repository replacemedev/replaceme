"use client";

import {
  useCallback,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

export type FixedMenuPosition = {
  top: number;
  right: number;
};

/**
 * Positions a fixed menu below an anchor, escaping parent stacking contexts
 * (e.g. sticky headers with view-transition-name) that break overflow hit-testing.
 */
export function useFixedMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>
): FixedMenuPosition | null {
  const [pos, setPos] = useState<FixedMenuPosition | null>(null);

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update]);

  return pos;
}
