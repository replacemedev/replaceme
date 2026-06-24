import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <LandingPageClient />
      <Footer />
    </>
  );
}
