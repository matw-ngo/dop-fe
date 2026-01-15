"use client";

import { useTenant } from "@/hooks/use-tenant";
import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";

export function TenantThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = useTenant();

  return <FormThemeProvider theme={tenant.theme}>{children}</FormThemeProvider>;
}
