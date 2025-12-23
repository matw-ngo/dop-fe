import { finzoneConfig } from "./finzone";
import { TenantConfig } from "./types";

const tenants: Record<string, TenantConfig> = {
  finzone: finzoneConfig,
  // Add more tenants here
};

export function getTenantConfig(tenantId: string = "finzone"): TenantConfig {
  return tenants[tenantId] || finzoneConfig;
}

export function getTenantIdFromHostname(hostname: string): string {
  if (hostname.includes("finzone")) return "finzone";
  // Logic for other domains
  return "finzone";
}
