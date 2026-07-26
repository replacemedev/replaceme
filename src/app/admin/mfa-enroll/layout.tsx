import { AuthFlashToast } from "@/components/auth/AuthFlashToast";

export const dynamic = "force-dynamic";

export default function AdminMfaEnrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthFlashToast />
      {children}
    </>
  );
}
