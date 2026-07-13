"use client";

import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isTurnstileClientEnabled(): boolean {
  return Boolean(SITE_KEY?.trim());
}

export interface TurnstileWidgetHandle {
  reset: () => void;
}

export interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget(
  { onToken, onExpire, onError, className },
  forwardedRef
) {
  const ref = useRef<TurnstileInstance>(null);
  const callbacksRef = useRef({ onToken, onExpire, onError });
  callbacksRef.current = { onToken, onExpire, onError };

  useImperativeHandle(forwardedRef, () => ({
    reset: () => {
      ref.current?.reset();
    },
  }));

  const options = useMemo(
    () => ({
      theme: "light" as const,
      size: "normal" as const,
      refreshExpired: "auto" as const,
    }),
    []
  );

  if (!SITE_KEY?.trim()) return null;

  return (
    <div
      className={
        className ??
        "flex min-h-[65px] w-full items-center justify-center overflow-hidden"
      }
    >
      <Turnstile
        ref={ref}
        siteKey={SITE_KEY}
        onSuccess={(token) => callbacksRef.current.onToken(token)}
        onExpire={() => callbacksRef.current.onExpire?.()}
        onError={() => callbacksRef.current.onError?.()}
        options={options}
      />
    </div>
  );
});
