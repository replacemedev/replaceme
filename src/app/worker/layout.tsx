import React from "react";
import { WorkerHeader } from "@/components/layout/WorkerHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthFlashToast />
      <WorkerHeader />
      <main className="pt-0 min-h-screen bg-[#f8fafe]">
        {children}
      </main>
      <Footer />
    </>
  );
}

