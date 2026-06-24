import Image from "next/image";

export function LoginTestimonial() {
  return (
    <div className="w-full h-full flex flex-col relative px-8 py-12 md:px-16 lg:px-24 justify-between">
      <Image
        src="/images/login-side.png"
        alt="Professional office environment"
        fill
        className="object-cover opacity-40 mix-blend-overlay -z-20"
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/10 to-[#2e6a41]/10 -z-10" />

      <div className="flex-1" />

      <div className="max-w-xl relative z-10">
        <blockquote className="text-display-md font-display-md font-bold text-slate-900 leading-tight mb-8">
          &ldquo;This platform has transformed how we connect with top-tier
          professionals. It&apos;s an indispensable tool for our daily
          operations.&rdquo;
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
            <div className="font-body-bold font-bold text-slate-900">
              Sarah Jenkins
            </div>
            <div className="text-slate-500 font-body-base text-sm">
              Director of Operations, TechCorp
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
}
