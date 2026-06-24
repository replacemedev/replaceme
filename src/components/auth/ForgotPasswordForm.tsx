"use client";

import { useState } from "react";
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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const result = await sendPasswordResetLink(data.email);

    if (!result.success) {
      toast.error(result.error ?? "Failed to send reset link.");
      return;
    }

    setSentToEmail(data.email.trim());
    setEmailSent(true);
    toast.success(result.message);
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
          href="/login"
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
          {...register("email")}
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
        <Button
          type="submit"
          disabled={isSubmitting}
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
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-body-bold font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}
