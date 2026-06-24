import { getNavSession } from "@/lib/auth/nav-session";
import { Header } from "./Header";
import { WorkerHeader } from "@/components/layout/WorkerHeader";
import { EmployerHeader } from "@/components/employer/layout/EmployerHeader";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";

export async function PublicHeader() {
  const session = await getNavSession();

  if (session.isAuthenticated && session.role === "worker") {
    return <WorkerHeader session={session} />;
  }

  if (session.isAuthenticated && session.role === "employer") {
    return <EmployerHeader session={session} />;
  }

  if (session.isAuthenticated && session.role === "admin") {
    return <AdminHeader session={session} />;
  }

  return <Header session={session} />;
}
