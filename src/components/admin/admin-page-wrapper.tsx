"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { User } from "@/store/use-auth-store";

interface AdminPageWrapperProps {
  children: ReactNode;
  requiredRole?: User["role"];
}

export function AdminPageWrapper({
  children,
  requiredRole = "admin",
}: AdminPageWrapperProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  );
}