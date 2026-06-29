"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { FormField } from "@/components/shared/FormField";
import { Lock, Mail, User, Loader2 } from "lucide-react";
import { signUp } from "@/actions/auth";
import {
  employerSignUpSchema,
  workerSignUpSchema,
  type EmployerSignUpFormValues,
  type WorkerSignUpFormValues,
} from "@/lib/validations/auth";
import Link from "next/link";

function formatSignUpError(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;
  return "Failed to create user account.";
}

function formatFieldError(message: unknown): string {
  if (typeof message === "string" && message.trim()) return message;
  return "Please check the highlighted fields.";
}

type SignUpRole = "employer" | "worker";
type SignUpValues = EmployerSignUpFormValues | WorkerSignUpFormValues;

const WORKER_DEFAULTS: WorkerSignUpFormValues = {
  role: "worker",
  username: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const EMPLOYER_DEFAULTS: EmployerSignUpFormValues = {
  ...WORKER_DEFAULTS,
  role: "employer",
};

export function SignUpForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<SignUpRole>("worker");

  const schema = useMemo(
    () =>
      selectedRole === "employer" ? employerSignUpSchema : workerSignUpSchema,
    [selectedRole]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: WORKER_DEFAULTS,
    mode: "onSubmit",
  });

  useEffect(() => {
    reset(selectedRole === "employer" ? EMPLOYER_DEFAULTS : WORKER_DEFAULTS, {
      keepDefaultValues: false,
    });
  }, [selectedRole, reset]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as SignUpRole);
    setValue("role", role as SignUpRole);
  };

  const onSubmit = async (data: SignUpValues) => {
    try {
      const result = await signUp(data);

      if (!result.success) {
        const errMsg = result.error;
        if (errMsg === "auth/username-already-exists") {
          toast.error("This username is already taken. Please choose another.");
          return;
        }
        if (errMsg === "auth/email-already-exists") {
          toast.error("This email is already registered. Please log in.");
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
      toast.error("An unexpected error occurred. Please try again.");
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
      <RoleSelector
        options={[
          { label: "I want to Work", value: "worker" },
          { label: "I want to Hire", value: "employer" },
        ]}
        value={selectedRole}
        onChange={handleRoleChange}
      />

      <form
        method="POST"
        onSubmit={handleSubmit(onSubmit, onError)}
        className="mt-4 space-y-1"
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
                  <Link
                    href="/terms-of-service"
                    className="text-[#22c55e] hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#22c55e] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            )}
          />
        </FormField>

        <div className="pt-3">
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting}
            className="h-12 w-full text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
