import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";

export const dynamic = "force-dynamic";

export default function AdminMfaChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthFlashToast />
      <AdminHeader />
      {children}
    </>
  );
}
