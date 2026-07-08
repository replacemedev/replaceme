"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/shared/FormField";
import { Lock, Mail, User, Loader2 } from "lucide-react";
import { signUp } from "@/actions/auth";
import {
  employerSignUpSchema,
  workerSignUpSchema,
  type EmployerSignUpFormValues,
  type WorkerSignUpFormValues,
} from "@/lib/validations/auth";
import {
  TurnstileWidget,
  isTurnstileClientEnabled,
  type TurnstileWidgetHandle,
} from "@/components/auth/TurnstileWidget";
import { LegalDocumentModal } from "@/components/shared/LegalDocumentModal";

function formatSignUpError(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;
  return "Failed to create user account.";
}

function formatFieldError(message: unknown): string {
  if (typeof message === "string" && message.trim()) return message;
  return "Please check the highlighted fields.";
}

type SignUpRole = "employer" | "worker";

const WORKER_DEFAULTS: WorkerSignUpFormValues = {
  role: "worker",
  username: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
  turnstileToken: undefined,
};

const EMPLOYER_DEFAULTS: EmployerSignUpFormValues = {
  ...WORKER_DEFAULTS,
  role: "employer",
};

interface SignUpFormProps {
  role: SignUpRole;
  callbackUrl?: string;
  submitLabel: string;
}

export function SignUpForm({ role, callbackUrl, submitLabel }: SignUpFormProps) {
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [activeDocumentModal, setActiveDocumentModal] = useState<"terms" | "privacy" | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileRequired = isTurnstileClientEnabled();

  const schema = role === "employer" ? employerSignUpSchema : workerSignUpSchema;
  const defaultValues = role === "employer" ? EMPLOYER_DEFAULTS : WORKER_DEFAULTS;

  const resetCaptcha = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WorkerSignUpFormValues | EmployerSignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = async (
    data: WorkerSignUpFormValues | EmployerSignUpFormValues
  ) => {
    if (turnstileRequired && !turnstileToken) {
      toast.error("Complete security check.");
      return;
    }

    try {
      const result = await signUp({
        ...data,
        turnstileToken: turnstileToken ?? undefined,
        callbackUrl,
      } as (WorkerSignUpFormValues | EmployerSignUpFormValues) & {
        callbackUrl?: string;
      });

      if (!result.success) {
        const errMsg = result.error;
        if (errMsg === "auth/username-already-exists") {
          toast.error("Username taken.");
          return;
        }
        if (errMsg === "auth/email-already-exists") {
          toast.error("Email already registered.");
          return;
        }
        toast.error(formatSignUpError(errMsg));
        return;
      }

      if (result.requiresConfirmation) {
        toast.success(result.message);
        router.push("/signin");
        router.refresh();
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
      toast.error("Error occurred. Please retry.");
    } finally {
      resetCaptcha();
    }
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(formatFieldError(firstError.message));
    }
  };

  return (
    <div className="w-full">
      <form
        method="POST"
        onSubmit={handleSubmit(onSubmit, onError)}
        className="space-y-1"
        noValidate
      >
        <input type="hidden" {...register("role")} />

        <FormField
          label="Username"
          htmlFor="signup-username"
          required
          error={errors.username?.message}
        >
          <Input
            id="signup-username"
            {...register("username")}
            placeholder="janesmith"
            icon={<User size={18} />}
            autoComplete="username"
            error={errors.username?.message}
            showErrorMessage={false}
            aria-describedby="signup-username-error"
          />
        </FormField>

        <FormField
          label="Full Name"
          htmlFor="signup-fullName"
          required
          error={errors.fullName?.message}
        >
          <Input
            id="signup-fullName"
            {...register("fullName")}
            placeholder="Jane Doe"
            icon={<User size={18} />}
            autoComplete="name"
            error={errors.fullName?.message}
            showErrorMessage={false}
            aria-describedby="signup-fullName-error"
          />
        </FormField>

        <FormField
          label="Email Address"
          htmlFor="signup-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="signup-email"
            {...register("email")}
            type="email"
            placeholder="jane@example.com"
            icon={<Mail size={18} />}
            autoComplete="email"
            error={errors.email?.message}
            showErrorMessage={false}
            aria-describedby="signup-email-error"
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="signup-password"
          required
          description="Must be at least 8 characters."
          error={errors.password?.message}
        >
          <PasswordInput
            id="signup-password"
            {...register("password")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
            autoComplete="new-password"
            error={errors.password?.message}
            showErrorMessage={false}
            aria-describedby="signup-password-error signup-password-description"
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="signup-confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="signup-confirmPassword"
            {...register("confirmPassword")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            showErrorMessage={false}
            aria-describedby="signup-confirmPassword-error"
          />
        </FormField>

        <FormField id="signup-terms" error={errors.terms?.message} className="pt-2">
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <label className="group flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={field.value === true}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="mt-0.5"
                  aria-invalid={errors.terms ? true : undefined}
                  aria-describedby={
                    errors.terms ? "signup-terms-error" : undefined
                  }
                />
                <span className="text-sm font-body-base leading-relaxed text-slate-600">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setActiveDocumentModal("terms")}
                    className="text-[#22c55e] hover:underline bg-transparent border-none p-0 inline font-medium cursor-pointer"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setActiveDocumentModal("privacy")}
                    className="text-[#22c55e] hover:underline bg-transparent border-none p-0 inline font-medium cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            )}
          />
        </FormField>

        <TurnstileWidget
          ref={turnstileRef}
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
          className="pt-2"
        />

        <div className="pt-3">
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting || (turnstileRequired && !turnstileToken)}
            className="h-12 w-full text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Creating Account...
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>

      <LegalDocumentModal
        open={activeDocumentModal !== null}
        documentType={activeDocumentModal}
        onClose={() => setActiveDocumentModal(null)}
      />
    </div>
  );
}
