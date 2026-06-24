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
import { Lock, Mail, User, Briefcase, Loader2 } from "lucide-react";
import { signUp } from "@/actions/auth";
import {
  employerSignUpSchema,
  workerSignUpSchema,
  type EmployerSignUpFormValues,
  type WorkerSignUpFormValues,
} from "@/lib/validations/auth";
import Link from "next/link";

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
  companyName: "",
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
    reset(
      selectedRole === "employer" ? EMPLOYER_DEFAULTS : WORKER_DEFAULTS,
      { keepDefaultValues: false }
    );
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
        toast.error(
          typeof errMsg === "string" ? errMsg : "Failed to create user account."
        );
        return;
      }

      toast.success(result.message);

      if (result.requiresConfirmation) {
        router.push("/login");
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
      toast.error(firstError.message);
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
        className="space-y-3"
        noValidate
      >
        <input type="hidden" {...register("role")} />

        <Field label="Username" error={errors.username?.message}>
          <Input
            {...register("username")}
            placeholder="janesmith"
            icon={<User size={18} />}
            autoComplete="username"
            error={errors.username?.message}
          />
        </Field>

        <Field label="Full Name" error={errors.fullName?.message}>
          <Input
            {...register("fullName")}
            placeholder="Jane Doe"
            icon={<User size={18} />}
            autoComplete="name"
            error={errors.fullName?.message}
          />
        </Field>

        {selectedRole === "employer" && (
          <Field
            label="Company Name"
            error={
              "companyName" in errors
                ? (errors as { companyName?: { message?: string } }).companyName
                    ?.message
                : undefined
            }
          >
            <Input
              {...register("companyName")}
              placeholder="TechCorp Inc."
              icon={<Briefcase size={18} />}
              autoComplete="organization"
              error={
                "companyName" in errors
                  ? (errors as { companyName?: { message?: string } }).companyName
                      ?.message
                  : undefined
              }
            />
          </Field>
        )}

        <Field label="Email Address" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="jane@example.com"
            icon={<Mail size={18} />}
            autoComplete="email"
            error={errors.email?.message}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <PasswordInput
            {...register("password")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
            autoComplete="new-password"
            error={errors.password?.message}
          />
          <p className="mt-1 text-xs text-slate-500">
            Must be at least 8 characters.
          </p>
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
          <PasswordInput
            {...register("confirmPassword")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
          />
        </Field>

        <div className="pb-1.5 pt-1.5">
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
                  className="mt-1"
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
          {errors.terms?.message ? (
            <p className="mt-1 text-xs text-red-500">{errors.terms.message}</p>
          ) : null}
        </div>

        <div className="pt-1.5">
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-body-bold font-bold text-slate-800">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-500 sr-only">{error}</p> : null}
    </div>
  );
}
