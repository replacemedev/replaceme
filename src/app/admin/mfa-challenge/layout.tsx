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
      {children}
    </>
  );
}
