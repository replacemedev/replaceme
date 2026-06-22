import { AuthLayout } from "@/components/auth/AuthLayout"
import { SignUpForm } from "@/components/auth/SignUpForm"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  const imagePanel = (
    <div className="w-full h-full relative z-10">
      <Image
        src="/images/signup-side.png"
        alt="Professional remote workers"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#004b1e] via-[#006e2f]/80 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-12 md:p-16 lg:p-24 flex flex-col justify-end h-full">
        <h2 className="text-display-lg font-display-lg font-bold text-white mb-4 leading-tight">
          Elevate Your Global Career
        </h2>
        <p className="text-body-base text-white/90 text-lg max-w-md font-body-bold font-bold">
          Join a community of 10,000+ elite Filipino professionals.
        </p>
      </div>
    </div>
  )

  return (
    <AuthLayout
      sidePanel={imagePanel}
      sidePanelPosition="left"
    >
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="font-display-md font-bold text-xl text-slate-900 leading-none relative top-[-1px]">Replace Me</span>
        </Link>
        <p className="text-body-base text-slate-500 mb-4 text-center">
          Join the premier professional marketplace.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <SignUpForm />
        
        <div className="mt-8 text-center">
          <p className="text-sm font-body-base text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-body-bold font-bold text-[#22c55e] hover:text-[#16a34a] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
