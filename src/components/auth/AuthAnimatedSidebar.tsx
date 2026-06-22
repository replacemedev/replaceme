"use client"

export function AuthAnimatedSidebar() {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#012d14] via-[#004b1e] to-[#00170a] overflow-hidden flex flex-col justify-center select-none">
      {/* Dynamic Glowing Mesh Orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-[#22c55e]/25 to-emerald-700/5 blur-[80px] rounded-full animate-float-slow-1 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-br from-[#10b981]/20 to-teal-800/5 blur-[100px] rounded-full animate-float-slow-2 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-[#86efac]/15 to-green-600/5 blur-[60px] rounded-full animate-float-slow-3 pointer-events-none" />

      {/* Textured Grid Dot Overlay */}
      <div className="absolute inset-0 bg-grid-white-dots opacity-25 mix-blend-overlay pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-center px-12 md:px-16 lg:px-20 xl:px-24 w-full h-full text-left">

        {/* Hero Title */}
        <h2 className="text-display-xl font-display-xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
          Elevate Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-[#4ae176]">
            Global Career
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-white/80 text-lg md:text-xl max-w-md font-body-base font-normal leading-relaxed">
          Join a community of 10,000+ elite Filipino professionals.
        </p>
      </div>
    </div>
  )
}
