import {
  ADMIN_PAGE_SUBHEAD,
  ADMIN_PAGE_TITLE,
} from "@/lib/admin/ui-tokens";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className={ADMIN_PAGE_TITLE}>{title}</h1>
        <p className={ADMIN_PAGE_SUBHEAD}>{description}</p>
      </div>
      {children ? (
        <div className="w-full shrink-0 sm:w-auto">{children}</div>
      ) : null}
    </header>
  );
}
