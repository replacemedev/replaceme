"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { sendPasswordResetLink } from "@/actions/auth";
import {
  AUTH_ERROR,
  AUTH_ERROR_MESSAGE,
} from "@/lib/auth/error-message";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import {
  TurnstileWidget,
  isTurnstileClientEnabled,
  type TurnstileWidgetHandle,
} from "@/components/auth/TurnstileWidget";

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileRequired = isTurnstileClientEnabled();

  const resetCaptcha = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const emailRegister = register("email");

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    if (turnstileRequired && !turnstileToken) {
      toast.error("Complete security check.");
      return;
    }

    try {
      const result = await sendPasswordResetLink({
        ...data,
        turnstileToken: turnstileToken ?? undefined,
      });

      if (!result.success) {
        const errCode = result.error;
        const errMessage =
          ("message" in result && typeof result.message === "string"
            ? result.message
            : null) ??
          errCode ??
          "Failed to send link.";

        if (errCode === AUTH_ERROR.EMAIL_NOT_FOUND) {
          toast.error(AUTH_ERROR_MESSAGE.EMAIL_NOT_FOUND);
          setError("email", {
            type: "server",
            message: AUTH_ERROR_MESSAGE.EMAIL_NOT_FOUND,
          });
          setFocus("email");
          resetCaptcha();
          return;
        }

        toast.error(errMessage);
        resetCaptcha();
        return;
      }

      setSentToEmail(data.email.trim());
      setEmailSent(true);
      reset({ email: "" });
      toast.success(
        result.message ?? "Password reset link sent. Check your email inbox."
      );
    } catch {
      toast.error("Error occurred. Please retry.");
      resetCaptcha();
    }
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-sm font-body-base leading-relaxed text-slate-600">
          We sent a password reset link to{" "}
          <span className="font-body-bold font-bold text-slate-900">
            {sentToEmail}
          </span>
          . Click the link in your email to set a new password.
        </p>
        <Link
          href="/signin"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-body-bold font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      method="POST"
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-1"
      noValidate
    >
      <FormField
        label="Email Address"
        htmlFor="forgot-email"
        required
        error={errors.email?.message}
      >
        <Input
          id="forgot-email"
          {...emailRegister}
          type="email"
          placeholder="Enter your email"
          icon={<Mail size={18} />}
          autoComplete="email"
          error={errors.email?.message}
          showErrorMessage={false}
          aria-describedby="forgot-email-error"
        />
      </FormField>

      <p className="pt-1 text-xs text-slate-500">
        We&apos;ll email you a secure link to reset your password.
      </p>

      <div className="space-y-3 pt-4">
        <TurnstileWidget
          ref={turnstileRef}
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <Button
          type="submit"
          disabled={isSubmitting || (turnstileRequired && !turnstileToken)}
          className="h-12 w-full text-base"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Sending Link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <Link
          href="/signin"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-body-bold font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}
