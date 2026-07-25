"use client";

import { AdminDrawer } from "./AdminDrawer";

export function AdminSlideover({
  open,
  onClose,
  title,
  description,
  children,
  size = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "default" | "wide";
}) {
  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
    >
      {children}
    </AdminDrawer>
  );
}

