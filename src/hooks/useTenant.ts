"use client";

import { useState, useEffect } from "react";
import { TenantConfig } from "@/configs/tenants/types";
import { getTenantConfig, getTenantIdFromHostname } from "@/configs/tenants";

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
