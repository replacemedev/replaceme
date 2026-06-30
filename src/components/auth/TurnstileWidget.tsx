"use client";

import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isTurnstileClientEnabled(): boolean {
  return Boolean(SITE_KEY);
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

  useImperativeHandle(forwardedRef, () => ({
    reset: () => {
      ref.current?.reset();
    },
  }));

  if (!SITE_KEY) return null;

  return (
    <div className={className ?? "flex justify-center"}>
      <Turnstile
        ref={ref}
        siteKey={SITE_KEY}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.();
          ref.current?.reset();
        }}
        onError={() => {
          onError?.();
          ref.current?.reset();
        }}
        options={{
          theme: "light",
          size: "flexible",
        }}
      />
    </div>
  );
});
