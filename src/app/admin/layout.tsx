import React from "react";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <main className="min-h-screen bg-[#f8fafe]">{children}</main>
      <Footer />
    </>
  );
}
