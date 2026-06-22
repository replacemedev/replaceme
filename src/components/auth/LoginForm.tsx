"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Checkbox } from "@/components/ui/checkbox"
import { RoleSelector } from "@/components/auth/RoleSelector"
import { Lock, Mail, User } from "lucide-react"
import { logIn } from "@/actions/auth"
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "employer",
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const selectedRole = watch("role") || "employer"

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setAuthError(null)
    
    try {
      const result = await logIn(data)
      if (result?.error) {
        const errMsg = typeof result.error === "string" ? result.error : "Invalid login credentials.";
        setAuthError(errMsg)
        toast.error(errMsg)
      } else if (result?.success) {
        toast.success(result.message)
        router.push(result.redirectUrl)
        router.refresh()
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <RoleSelector
        options={[
          { label: "Employer", value: "employer" },
          { label: "Worker", value: "worker" },
        ]}
        value={selectedRole}
        onChange={(val) => setValue("role", val as "employer" | "worker")}
      />

      {authError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
            Username or Email Address
          </label>
          <Input
            {...register("email")}
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
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
            error={errors.password?.message}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox {...register("rememberMe")} />
            <span className="text-sm font-body-base text-slate-600 group-hover:text-slate-900 transition-colors">
              Remember me
            </span>
          </label>
          <a
            href="/forgot-password"
            className="text-sm font-body-bold font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isLoading} className="w-full text-base h-12">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
    </div>
  )
}
