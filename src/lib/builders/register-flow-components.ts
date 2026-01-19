import {
  allowCustomComponent,
  registerComponent,
} from "@/components/form-generation";
import { PhoneVerificationField } from "@/components/form-generation/fields/PhoneVerificationField";

// Register custom components for flow-based forms
export function registerFlowComponents() {
  allowCustomComponent("PhoneVerification");
  registerComponent("PhoneVerification", PhoneVerificationField);
}

// Call registration immediately for side effects
// This ensures components are available when the module is imported
try {
  registerFlowComponents();
} catch (error) {
  // Ignore registration errors (e.g., in strict mode or hot reload)
  console.debug("Flow components registration skipped:", error);
}
