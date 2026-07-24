"use client";

import { useState, useEffect, useRef } from "react";
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
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import {
  TurnstileWidget,
  isTurnstileClientEnabled,
  type TurnstileWidgetHandle,
} from "@/components/auth/TurnstileWidget";

interface LoginFormProps {
  forgotPasswordHref: string;
  callbackUrl?: string;
}

export function LoginForm({ forgotPasswordHref, callbackUrl }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const submitLockRef = useRef(false);
  const turnstileRequired = isTurnstileClientEnabled();

  const resetCaptcha = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };
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
    if (submitLockRef.current || isLoading) return;

    if (turnstileRequired && !turnstileToken) {
      toast.error("Complete security check.");
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);
    toast.dismiss();

    try {
      const result = await signIn({
        ...data,
        turnstileToken: turnstileToken ?? undefined,
        callbackUrl,
      });

      if (result && !result.success) {
        toast.error(result.error ?? "Invalid credentials.");
        resetCaptcha();
        submitLockRef.current = false;
        setIsLoading(false);
        return;
      }

      if (data.rememberMe) {
        localStorage.setItem("remember_email", data.email);
      } else {
        localStorage.removeItem("remember_email");
      }
      // Keep loading/locked until Next.js redirect navigates away.
    } catch (error) {
      // Re-throw Next.js redirect / router errors so navigation is not swallowed.
      unstable_rethrow(error);

      toast.error("Error occurred. Please retry.");
      resetCaptcha();
      submitLockRef.current = false;
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <Checkbox {...register("rememberMe")} disabled={isLoading} />
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

      <div className="pt-4 space-y-4">
        <TurnstileWidget
          ref={turnstileRef}
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <Button
          type="submit"
          disabled={isLoading || (turnstileRequired && !turnstileToken)}
          aria-busy={isLoading}
          className="w-full text-base h-12"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}
