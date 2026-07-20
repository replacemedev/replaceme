import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";

export function WorkerFaqSkeleton() {
  return (
    <main
      className={`${PUBLIC_PAGE_TOP} pb-16 min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1 animate-pulse`}
      aria-busy="true"
      aria-label="Loading Worker FAQs"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="text-center mb-10 sm:mb-12">
          {/* Badge Skeleton */}
          <div className="h-6 w-24 bg-slate-200 rounded-full mx-auto mb-4" />
          {/* Title Skeleton */}
          <div className="h-10 sm:h-12 w-64 sm:w-80 bg-slate-200 rounded-lg mx-auto mb-3" />
          {/* Last Updated Skeleton */}
          <div className="h-4 w-44 bg-slate-200 rounded mx-auto" />
        </header>

        {/* Subtitle / Description Skeleton */}
        <div className="h-4 w-72 sm:w-80 bg-slate-200 rounded mx-auto mb-8 -mt-4" />

        {/* 5 Stacked FAQ Card Skeletons */}
        <div className="space-y-4">
          {[
            { qWidth: "w-2/3", a1Width: "w-full", a2Width: "w-4/5" },
            { qWidth: "w-3/4", a1Width: "w-full", a2Width: "w-3/4" },
            { qWidth: "w-1/2", a1Width: "w-full", a2Width: "w-5/6" },
            { qWidth: "w-3/5", a1Width: "w-full", a2Width: "w-2/3" },
            { qWidth: "w-2/3", a1Width: "w-full", a2Width: "w-4/5" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3"
            >
              {/* Question Skeleton */}
              <div className={`h-5 ${item.qWidth} bg-slate-200 rounded`} />
              {/* Answer Skeletons */}
              <div className={`h-4 ${item.a1Width} bg-slate-200 rounded mt-2`} />
              <div className={`h-4 ${item.a2Width} bg-slate-200 rounded`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
