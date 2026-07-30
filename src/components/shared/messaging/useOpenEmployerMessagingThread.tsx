"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ensureMessagingThread } from "@/actions/messaging";

interface UseOpenEmployerMessagingThreadOptions {
  onSuccess?: (threadId: string) => void;
}

export function useOpenEmployerMessagingThread(
  options?: UseOpenEmployerMessagingThreadOptions
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const openThread = (jobId: string, candidateId: string) => {
    startTransition(async () => {
      const result = await ensureMessagingThread({ jobId, candidateId });

      if (result.success && result.data.threadId) {
        options?.onSuccess?.(result.data.threadId);
        router.push(`/employer/messages?threadId=${result.data.threadId}`);
        return;
      }

      toast.error(
        !result.success ? result.error : "Could not open conversation."
      );
    });
  };

  return { openThread, isPending };
}

interface EmployerOpenMessagingThreadButtonProps {
  jobId: string;
  candidateId: string;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

export function EmployerOpenMessagingThreadButton({
  jobId,
  candidateId,
  className,
  children,
  disabled = false,
}: EmployerOpenMessagingThreadButtonProps) {
  const { openThread, isPending } = useOpenEmployerMessagingThread();

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || isPending}
      aria-busy={isPending}
      aria-label={isPending ? "Opening conversation" : undefined}
      onClick={() => openThread(jobId, candidateId)}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        children
      )}
    </button>
  );
}
