"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Lock, Key } from "lucide-react"
import { verifyOTPAndResetPassword, sendResetPasswordOTP } from "@/actions/auth"
import { toast } from "sonner"

const verifyCodeSchema = z.object({
  code: z.string().min(6, "Code must be exactly 6 digits").max(6, "Code must be exactly 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>

export function VerifyCodeForm({ email }: { email: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: VerifyCodeFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const result = await verifyOTPAndResetPassword(email, data.code, data.password)
      if (result.error) {
        setErrorMsg(result.error)
        toast.error(result.error)
      } else {
        toast.success(result.message)
        router.push("/login")
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const result = await sendResetPasswordOTP(email)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("A new verification code has been sent.")
      }
    } catch (err) {
      toast.error("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
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
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
            Verification Code
          </label>
          <Input
            {...register("code")}
            type="text"
            placeholder="Enter 6-digit OTP"
            icon={<Key size={18} />}
            maxLength={6}
          />
          <p className="text-xs text-slate-500 mt-1.5">
            This code expires in 10 minutes.
          </p>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-slate-400">Sent to {email}</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="text-xs font-body-bold font-bold text-[#006e2f] hover:text-[#005321] hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
            New Password
          </label>
          <PasswordInput
            {...register("password")}
            placeholder="Min. 8 characters"
            icon={<Lock size={18} />}
          />
        </div>

        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
            Confirm New Password
          </label>
          <PasswordInput
            {...register("confirmPassword")}
            placeholder="Confirm new password"
            icon={<Lock size={18} />}
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" disabled={isLoading} className="w-full text-base h-12">
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>

          <Link
            href="/login?view=forgot_password"
            className="inline-flex items-center justify-center w-full text-base h-12 rounded-xl text-sm font-body-bold font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  )
}
