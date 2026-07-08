"use client";

import { AdminDrawer } from "./AdminDrawer";

export function AdminSlideover({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      {children}
    </AdminDrawer>
  );
}

