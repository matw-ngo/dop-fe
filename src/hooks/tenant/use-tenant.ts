"use client";

import { useEffect, useState } from "react";
import { getTenantConfig, getTenantIdFromHostname } from "@/configs/tenants";
import type { TenantConfig } from "@/configs/tenants/types";

export function useTenant() {
  // Safe default for initial render/SSR
  const [tenant, setTenant] = useState<TenantConfig>(
    getTenantConfig("finzone"),
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const tenantId = getTenantIdFromHostname(hostname);
      setTenant(getTenantConfig(tenantId));
    }
  }, []);

  return tenant;
}
