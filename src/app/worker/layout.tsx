import React from "react";
import { WorkerHeader } from "@/components/layout/WorkerHeader";
import { Footer } from "@/components/layout/Footer";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WorkerHeader />
      <main className="pt-0 min-h-screen bg-[#f8fafe]">
        {children}
      </main>
      <Footer />
    </>
  );
}

