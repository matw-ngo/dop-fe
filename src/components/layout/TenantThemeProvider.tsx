"use client";

import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { useTenant } from "@/hooks/tenant/use-tenant";

export function TenantThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = useTenant();

  return <FormThemeProvider theme={tenant.theme}>{children}</FormThemeProvider>;
}
