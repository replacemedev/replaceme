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
import { Lock, Mail, User, Briefcase } from "lucide-react"
import { signUp } from "@/actions/auth"
import { employerSignUpSchema, workerSignUpSchema } from "@/lib/validations/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SignUpForm() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"employer" | "worker">("worker")
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    unregister,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(selectedRole === "employer" ? employerSignUpSchema : workerSignUpSchema),
    defaultValues: {
      role: "worker",
      username: "",
      fullName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleRoleChange = (role: string) => {
    const newRole = role as "employer" | "worker"
    setSelectedRole(newRole)
    setValue("role", newRole)
    if (newRole === "worker") {
      unregister("companyName")
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setAuthError(null)
    
    try {
      const result = await signUp(data)
      if (!result.success) {
        const errMsg = result.error
        if (errMsg === "auth/username-already-exists") {
          setError("username", { message: "This username is already taken. Please choose another." })
        } else if (errMsg === "auth/email-already-exists") {
          setError("email", { message: "This email is already registered. Please log in." })
        } else {
          const sanitizedMsg = typeof errMsg === "string" ? errMsg : "Failed to create user account."
          setAuthError(sanitizedMsg)
          toast.error(sanitizedMsg)
        }
      } else {
        toast.success(result.message)
        if (result.redirectUrl) {
          router.push(result.redirectUrl)
          router.refresh()
        }
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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

      {authError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {authError}
        </div>
      )}

      <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register("role")} />
        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
            Username
          </label>
          <Input
            {...register("username")}
            placeholder="janesmith"
            icon={<User size={18} />}
            error={errors.username?.message as string}
          />
        </div>

        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
            Full Name
          </label>
          <Input
            {...register("fullName")}
            placeholder="Jane Doe"
            icon={<User size={18} />}
            error={errors.fullName?.message as string}
          />
        </div>

        {selectedRole === "employer" && (
          <div>
            <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
              Company Name
            </label>
            <Input
              {...register("companyName")}
              placeholder="TechCorp Inc."
              icon={<Briefcase size={18} />}
              error={errors.companyName?.message as string}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
            Email Address
          </label>
          <Input
            {...register("email")}
            placeholder="jane@example.com"
            icon={<Mail size={18} />}
            error={errors.email?.message as string}
          />
        </div>

        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
            Password
          </label>
          <PasswordInput
            {...register("password")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
            error={errors.password?.message as string}
          />
          <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters.</p>
        </div>

        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
            Confirm Password
          </label>
          <PasswordInput
            {...register("confirmPassword")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
            error={errors.confirmPassword?.message as string}
          />
        </div>

        <div className="pt-1.5 pb-1.5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox {...register("terms")} className="mt-1" />
            <span className="text-sm font-body-base text-slate-600 leading-relaxed">
              I agree to the <a href="/terms" className="text-[#22c55e] hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#22c55e] hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-red-500 text-xs mt-1">{errors.terms.message as string}</p>
          )}
        </div>

        <div className="pt-1.5">
          <Button type="submit" variant="success" disabled={isLoading} className="w-full text-base h-12">
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  )
}
