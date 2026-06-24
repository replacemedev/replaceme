import { Bell } from "lucide-react";

interface NotificationsBellProps {
  unreadCount?: number;
  size?: number;
  className?: string;
}

export function NotificationsBell({
  unreadCount = 0,
  size = 20,
  className = "",
}: NotificationsBellProps) {
  return (
    <button
      type="button"
      className={`relative p-2 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#006e2f] ${className}`}
      aria-label={
        unreadCount > 0
          ? `View notifications (${unreadCount} unread)`
          : "View notifications"
      }
    >
      <Bell size={size} aria-hidden />
      {unreadCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
      )}
    </button>
  );
}
