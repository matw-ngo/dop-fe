"use client";

import { ReactNode } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AdminPageWrapper>
      {children}
    </AdminPageWrapper>
  );
}