"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/lib/theme/context";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({
  children,
  defaultUserGroup = "system",
}: {
  children: React.ReactNode;
  defaultUserGroup?: string;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
