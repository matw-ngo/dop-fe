import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";
import { FieldType } from "../constants/field-types";
import { createFinancialFieldBuilders } from "./financial-fields";
import { createIdentityFieldBuilders } from "./identity-fields";
import { createLoanFieldBuilders } from "./loan-fields";
import { createPersonalFieldBuilders } from "./personal-fields";

/**
 * Simplified field builder registry
 * Returns RawFieldConfig to align with the existing renderer system
 */
export function createFieldBuilderRegistry(
  t: (key: string) => string,
): Record<string, (config?: any) => RawFieldConfig> {
  // Get all field builders from different categories
  const personalBuilders = createPersonalFieldBuilders(t);
  const identityBuilders = createIdentityFieldBuilders(t);
  const financialBuilders = createFinancialFieldBuilders(t);
  const loanBuilders = createLoanFieldBuilders(t);

  // Combine all builders into a single map
  const allBuilders: Record<string, (config?: any) => RawFieldConfig> = {
    ...personalBuilders,
    ...identityBuilders,
    ...financialBuilders,
    ...loanBuilders,
  };

  // Add special field builders
  allBuilders[FieldType.EKYC_VERIFICATION] = (config: any = {}) => {
    const { createFieldBuilderFactory } = require("./base-field-builder");
    const factory = createFieldBuilderFactory(t);

    return factory.ekyc(FieldType.EKYC_VERIFICATION, {
      provider: "default",
      verificationTypes: ["identity", "document"],
      ...config,
    });
  };

  return allBuilders;
}
