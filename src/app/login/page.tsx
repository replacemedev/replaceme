import { AuthLayout } from "@/components/auth/AuthLayout"
import { LoginForm } from "@/components/auth/LoginForm"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const testimonialPanel = (
    <div className="w-full h-full flex flex-col relative px-8 py-12 md:px-16 lg:px-24 justify-between">
      {/* Background Image & Overlay matching Stitch Design */}
      <Image
        src="/images/login-side.png"
        alt="Professional office environment"
        fill
        className="object-cover opacity-40 mix-blend-overlay -z-20"
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/10 to-[#2e6a41]/10 -z-10"></div>
      
      <div className="flex-1"></div>
      
      <div className="max-w-xl relative z-10">
        <blockquote className="text-display-md font-display-md font-bold text-slate-900 leading-tight mb-8">
          "This platform has transformed how we connect with top-tier professionals. It's an indispensable tool for our daily operations."
        </blockquote>
        
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image
              src="/images/sarah-jenkins.png"
              alt="Sarah Jenkins"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <div className="font-body-bold font-bold text-slate-900">Sarah Jenkins</div>
            <div className="text-slate-500 font-body-base text-sm">Director of Operations, TechCorp</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1"></div>
    </div>
  )

  return (
    <AuthLayout
      sidePanel={testimonialPanel}
      sidePanelPosition="right"
    >
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
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
        
        <h1 className="text-display-lg font-display-lg font-bold text-slate-900 mb-2">Welcome back</h1>
        <p className="text-body-base text-slate-600">
          Sign in to access your professional dashboard and manage your network.
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 text-center">
        <p className="text-sm font-body-base text-slate-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-body-bold font-bold text-[#006e2f] hover:text-[#005321] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
