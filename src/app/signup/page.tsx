import { AuthLayout } from "@/components/auth/AuthLayout"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { AuthAnimatedSidebar } from "@/components/auth/AuthAnimatedSidebar"
import { AuthFooter } from "@/components/auth/AuthFooter"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <AuthLayout
      sidePanel={<AuthAnimatedSidebar />}
      sidePanelPosition="left"
      footer={<AuthFooter />}
    >

      {/* Right Side branding and form container */}
      <div className="mb-4 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2 hover:opacity-90 transition-opacity select-none">
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me"
              fill
              className="object-contain"
              sizes="32px"
              priority
            />
          </div>
          <span className="font-display-md font-bold text-xl text-slate-900 leading-none relative top-[-1px]">Replace Me</span>
        </Link>
        <p className="text-body-base text-slate-500 mb-0 text-center text-sm md:text-base">
          Join the premier professional marketplace.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <SignUpForm />
        
        <div className="mt-6 text-center">
          <p className="text-sm font-body-base text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-body-bold font-bold text-[#006e2f] hover:text-[#005321] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
