"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme/context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { queryClient } from "@/lib/query-client";

export default function Providers({
  children,
  defaultUserGroup = "system",
}: {
  children: React.ReactNode;
  defaultUserGroup?: string;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          defaultUserGroup={defaultUserGroup}
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
