import React from "react";
import { EmployerHeader } from "@/components/employer/layout/EmployerHeader";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EmployerHeader />
      <main className="pt-0 min-h-screen bg-[#f8fafe]">{children}</main>
      <Footer />
    </>
  );
}
