"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/shared/FormField";
import { Lock, Loader2 } from "lucide-react";
import { updatePassword } from "@/actions/auth";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/lib/validations/auth";

export function UpdatePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    try {
      const result = await updatePassword(data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  return (
    <form
      method="POST"
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-1"
      noValidate
    >
      <FormField
        label="New Password"
        htmlFor="new-password"
        required
        description="Must be at least 8 characters."
        error={errors.password?.message}
      >
        <PasswordInput
          id="new-password"
          {...register("password")}
          placeholder="Min. 8 characters"
          icon={<Lock size={18} />}
          autoComplete="new-password"
          error={errors.password?.message}
          showErrorMessage={false}
          aria-describedby="new-password-error new-password-description"
        />
      </FormField>

      <FormField
        label="Confirm Password"
        htmlFor="confirm-new-password"
        required
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirm-new-password"
          {...register("confirmPassword")}
          placeholder="Confirm new password"
          icon={<Lock size={18} />}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          showErrorMessage={false}
          aria-describedby="confirm-new-password-error"
        />
      </FormField>

      <div className="space-y-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full text-base"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Updating Password...
            </span>
          ) : (
            "Update Password"
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
