import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell } from "lucide-react";

export const metadata = {
  title: "Notifications | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function EmployerNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { notifications } = await fetchNotificationBootstrap(user.id, 50);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Applicant updates, messages, and hiring activity.
      </p>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} />}
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`bg-white border rounded-xl px-4 py-3 ${
                n.is_read ? "border-slate-200" : "border-[#006e2f]/30 bg-[#ebfdf2]/30"
              }`}
            >
              <p className="text-sm font-bold text-slate-900">{n.title}</p>
              <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
