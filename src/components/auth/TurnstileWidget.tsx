"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isTurnstileClientEnabled(): boolean {
  return Boolean(SITE_KEY);
}

export interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

export function TurnstileWidget({
  onToken,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const ref = useRef<TurnstileInstance>(null);

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
}
