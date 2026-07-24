"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/actions/auth";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/auth";
import { ProfileModal } from "@/components/worker/profile/inline/ProfileModal";
import { FormField } from "@/components/shared/FormField";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = (data: ChangePasswordFormValues) => {
    setFormError(null);
    startTransition(async () => {
      const result = await changePassword(data);
      if (!result.success) {
        setFormError(result.error ?? "Failed to update password.");
        return;
      }
      toast.success(result.message ?? "Password updated successfully");
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center justify-center text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700"
      >
        Change password
      </button>

      <ProfileModal
        open={open}
        title="Change password"
        onClose={() => {
          if (pending) return;
          setOpen(false);
        }}
        maxWidth="max-w-md"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
              className="h-11 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={pending}
              className="h-11 w-full sm:w-auto"
            >
              {pending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Updating…
                </span>
              ) : (
                "Update password"
              )}
            </Button>
          </div>
        }
      >
        <form
          id={formId}
          method="POST"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-1"
          noValidate
        >
          <p className="mb-4 text-sm leading-relaxed text-slate-500">
            Enter your current password, then choose a new one. You will stay
            signed in on this device.
          </p>

          {formError ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <FormField
            label="Current password"
            htmlFor="current-password"
            required
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="current-password"
              {...register("currentPassword")}
              placeholder="Your current password"
              icon={<Lock size={18} />}
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              showErrorMessage={false}
              aria-describedby="current-password-error"
            />
          </FormField>

          <FormField
            label="New password"
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
            label="Confirm new password"
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
        </form>
      </ProfileModal>
    </>
  );
}
