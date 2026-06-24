import Image from "next/image";

function GeometricPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-[15] h-full w-full opacity-[0.12]"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="auth-geometric-grid"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M48 0H0V48"
            fill="none"
            stroke="rgb(5 150 105)"
            strokeWidth="0.75"
          />
          <circle cx="24" cy="24" r="1.25" fill="rgb(20 184 166 / 0.55)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-geometric-grid)" />
    </svg>
  );
}

export function LoginTestimonial() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden px-8 py-12 md:px-16 lg:px-24">
      <div
        className="pointer-events-none absolute inset-0 -z-30 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100"
        aria-hidden
      />

      <GeometricPattern />

      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.22]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(16 185 129 / 0.2) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div
        className="pointer-events-none absolute -right-16 top-16 -z-10 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-24 -z-10 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl"
        aria-hidden
      />

      <Image
        src="/images/login-side.png"
        alt=""
        fill
        className="-z-10 object-cover opacity-25 mix-blend-multiply"
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
      />

      <div className="flex-1" />

      <div className="relative z-10 max-w-xl">
        <blockquote className="text-display-md font-display-md mb-8 font-bold leading-tight text-slate-900">
          &ldquo;This platform has transformed how we connect with top-tier
          professionals. It&apos;s an indispensable tool for our daily
          operations.&rdquo;
        </blockquote>

        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <Image
              src="/images/sarah-jenkins.png"
              alt="Sarah Jenkins"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <p className="font-body-bold font-bold text-slate-900">
              Sarah Jenkins
            </p>
            <p className="text-sm font-body-base text-slate-500">
              Director of Operations, TechCorp
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
}
