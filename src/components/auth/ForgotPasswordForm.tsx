"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"
import { sendResetPasswordOTP } from "@/actions/auth"
import { toast } from "sonner"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const router = useRouter()
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
        router.push(
          `/login?view=verify_code&email=${encodeURIComponent(data.email)}`
        )
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.")
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
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
        <div>
          <label className="block text-sm font-body-bold font-bold text-slate-800 mb-2">
            Email Address
          </label>
          <Input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} />}
          />
          <p className="text-xs text-slate-500 mt-2">
            This code expires in 10 minutes.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" disabled={isLoading} className="w-full text-base h-12">
            {isLoading ? "Sending Code..." : "Send Verification Code"}
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full text-base h-12 rounded-xl text-sm font-body-bold font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}
