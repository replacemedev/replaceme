import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

/**
 * Shared shell for all public/marketing routes (landing, legal, contact).
 * PublicHeader reads the live Supabase session on every request so logged-in
 * users always see notifications + profile dropdown — including when arriving
 * from footer Legal & Support links while on worker/employer pages.
 */
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      {children}
      <Footer />
    </>
  );
}
