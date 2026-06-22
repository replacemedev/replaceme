"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"
import { sendResetPasswordOTP } from "@/actions/auth"
import { toast } from "sonner"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({
  onSuccess,
  onBack,
}: {
  onSuccess: (email: string) => void
  onBack: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const result = await sendResetPasswordOTP(data.email)
      if (result.error) {
        setErrorMsg(result.error)
        toast.error(result.error)
      } else {
        toast.success(result.message)
        onSuccess(data.email)
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
            Email Address
          </label>
          <Input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" disabled={isLoading} className="w-full text-base h-12">
            {isLoading ? "Sending Code..." : "Send Verification Code"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
            className="w-full text-base h-12 text-slate-600 hover:text-slate-900"
          >
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  )
}
