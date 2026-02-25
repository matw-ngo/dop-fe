import { useTenant } from "./use-tenant";
import { useTenantFlow } from "./use-flow";

/**
 * Returns the flow step configuration for a given page identifier.
 *
 * Encapsulates the tenant flow lookup + step find logic so components
 * don't need to know about useTenantFlow or hardcode page strings.
 *
 * @param page - The page identifier to match (e.g. "/index", "/loan")
 *
 * @example
 * ```tsx
 * const step = useFlowStep("/index");
 * openConsentModal({ consentPurposeId: step?.consent_purpose_id ?? "" });
 * ```
 */
export function useFlowStep(page: string) {
  const tenant = useTenant();
  const { data: tenantFlowConfig } = useTenantFlow(tenant.uuid, {
    enabled: !!tenant.uuid,
  });

  return tenantFlowConfig?.steps?.find((step) => step.page === page) ?? null;
}
