import { WorkerPageShell } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerMessagesLoading() {
  return (
    <WorkerPageShell
      width="wide"
      className="h-[calc(100dvh-4rem)] flex flex-col justify-center py-4"
    >
      <div className="w-full h-full flex items-center justify-center animate-pulse">
        <div className="flex h-full max-h-[calc(100dvh-8rem)] min-h-[480px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:max-h-[calc(100dvh-7.5rem)] lg:max-h-[calc(100dvh-6rem)] lg:min-h-[640px]">
          {/* Mock Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full p-4 space-y-4">
            <SkeletonBlock className="h-9 w-1/2 rounded-lg" />
            <SkeletonBlock className="h-10 w-full rounded-xl" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-12 rounded-full" />
              <SkeletonBlock className="h-7 w-16 rounded-full" />
              <SkeletonBlock className="h-7 w-14 rounded-full" />
            </div>
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-2 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2 mt-1">
                    <SkeletonBlock className="h-3.5 w-2/3 rounded" />
                    <SkeletonBlock className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Active Chat */}
          <div className="flex-1 bg-[#f8fafd]/40 hidden lg:flex flex-col h-full">
            {/* Active Chat Header */}
            <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-32 rounded" />
                  <SkeletonBlock className="h-3 w-20 rounded" />
                </div>
              </div>
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
            {/* Messages Area */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-end">
                <div className="bg-[#e8f5e9]/55 border border-[#c8e6c9]/40 rounded-2xl p-4 w-2/3 space-y-2">
                  <SkeletonBlock className="h-3.5 w-full rounded" />
                  <SkeletonBlock className="h-3.5 w-2/3 rounded" />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 w-2/3 space-y-2">
                  <SkeletonBlock className="h-3.5 w-full rounded" />
                  <SkeletonBlock className="h-3.5 w-1/3 rounded" />
                </div>
              </div>
            </div>
            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="h-12 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between px-4">
                <SkeletonBlock className="h-4 w-40 rounded" />
                <SkeletonBlock className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkerPageShell>
  );
}
