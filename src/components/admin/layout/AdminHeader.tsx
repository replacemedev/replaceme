import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { NotificationsBell } from "@/components/shared/nav/NotificationsBell";
import { AdminDropdown } from "./AdminDropdown";

export async function AdminHeader() {
  const session = await getNavSession();

  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto h-16">
        <NavBrand homeHref={session.homeHref} compact />
        <div className="flex items-center gap-3">
          <NotificationsBell unreadCount={session.unreadMessageCount} />
          {session.profile && (
            <AdminDropdown
              profile={session.profile}
              displayName={session.displayName}
              initials={session.initials}
            />
          )}
        </div>
      </div>
    </header>
  );
}
