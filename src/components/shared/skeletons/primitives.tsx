interface SkeletonProps {
  className?: string;
}

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function SkeletonBlock({ className }: SkeletonProps) {
  return <div className={cx("bg-gray-200 rounded animate-pulse", className)} />;
}

export function TextLineSkeleton({
  className,
  width = "w-full",
}: SkeletonProps & { width?: string }) {
  return <SkeletonBlock className={cx("h-4", width, className)} />;
}

export function TitleSkeleton({
  className,
  size = "lg",
}: SkeletonProps & { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-6 w-40",
    md: "h-8 w-56",
    lg: "h-10 w-64",
    xl: "h-12 w-72",
  };
  return <SkeletonBlock className={cx(sizes[size], className)} />;
}

export function CardSkeleton({
  className,
  minHeight = "min-h-[120px]",
}: SkeletonProps & { minHeight?: string }) {
  return (
    <SkeletonBlock
      className={cx(
        "rounded-2xl border border-slate-100 bg-white",
        minHeight,
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3 animate-pulse">
      <SkeletonBlock className="h-8 w-8 rounded-lg" />
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-8 w-12" />
    </div>
  );
}

export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 border-b border-slate-100 pb-6 animate-pulse",
        withAction && "sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="space-y-2">
        <TitleSkeleton size="lg" />
        <TextLineSkeleton width="w-full max-w-md" />
      </div>
      {withAction && <SkeletonBlock className="h-11 w-40 rounded-xl shrink-0" />}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white animate-pulse">
      <SkeletonBlock className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <SkeletonBlock className="h-4 w-1/3 max-w-[10rem]" />
        <SkeletonBlock className="h-3 w-1/2 max-w-[14rem]" />
      </div>
      <SkeletonBlock className="h-9 w-24 rounded-xl shrink-0 hidden sm:block" />
    </div>
  );
}

export function GridCardSkeleton({ columns = 3 }: { columns?: number }) {
  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <div className={cx("grid gap-4 sm:gap-6", gridClass)}>
      {Array.from({ length: columns }).map((_, i) => (
        <CardSkeleton key={i} minHeight="min-h-[140px]" />
      ))}
    </div>
  );
}
