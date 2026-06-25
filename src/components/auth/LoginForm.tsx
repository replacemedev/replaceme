"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail } from "lucide-react";
import { signIn } from "@/actions/auth";
import {
  loginCredentialsSchema,
  type LoginCredentials,
} from "@/lib/validations/auth";
import Link from "next/link";
import { toast } from "sonner";

interface LoginFormProps {
  forgotPasswordHref: string;
}

export function LoginForm({ forgotPasswordHref }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);

    try {
      const result = await signIn(data);

      if (result && !result.success) {
        toast.error(result.error ?? "Invalid email or password. Please try again.");
      } else if (data.rememberMe) {
        localStorage.setItem("remember_email", data.email);
      } else {
        localStorage.removeItem("remember_email");
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
    } finally {
      setIsLoading(false);
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
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
          Email or Username
        </label>
        <Input
          {...register("email")}
          placeholder="Enter your email or username"
          icon={<Mail size={18} />}
          autoComplete="username"
        />
      </div>

      <div>
        <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
          Password
        </label>
        <PasswordInput
          {...register("password")}
          placeholder="Min. 8 characters"
          icon={<Lock size={18} />}
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <Checkbox {...register("rememberMe")} />
          <span className="text-sm font-body-base text-slate-600 group-hover:text-slate-900 transition-colors">
            Remember me
          </span>
        </label>
        <Link
          href={forgotPasswordHref}
          className="text-sm font-body-bold font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full text-base h-12">
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}
