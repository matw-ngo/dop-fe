"use client";

import { ReactNode } from "react";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPageWrapper>
        {children}
      </AdminPageWrapper>
    </ProtectedRoute>
  );
}