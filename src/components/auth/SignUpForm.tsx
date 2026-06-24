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
          toast.error("This username is already taken. Please choose another.")
        } else if (errMsg === "auth/email-already-exists") {
          toast.error("This email is already registered. Please log in.")
        } else {
          const sanitizedMsg = typeof errMsg === "string" ? errMsg : "Failed to create user account."
          setAuthError(sanitizedMsg)
          toast.error(sanitizedMsg)
        }
      } else {
        toast.success(result.message)
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
        }
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const onError = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0]
    if (firstErrorKey) {
      toast.error(errors[firstErrorKey].message)
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

      <form method="POST" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3">
        <input type="hidden" {...register("role")} />
        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-1.5">
            Username
          </label>
          <Input
            {...register("username")}
            placeholder="janesmith"
            icon={<User size={18} />}
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
          />
        </div>

        <div className="pt-1.5 pb-1.5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox {...register("terms")} className="mt-1" />
            <span className="text-sm font-body-base text-slate-600 leading-relaxed">
              I agree to the <a href="/terms-of-service" className="text-[#22c55e] hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-[#22c55e] hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>

        <div className="pt-1.5">
          <Button type="submit" variant="success" disabled={isLoading} className="w-full text-base h-12">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
