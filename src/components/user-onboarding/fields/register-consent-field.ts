import {
  allowCustomComponent,
  registerComponent,
} from "@/components/form-generation";
import { TermsAgreement } from "@/components/loan-application/ApplyLoanForm/components/TermsAgreement";

/**
 * Register consent agreement field for use in dynamic forms
 * Uses the existing TermsAgreement component
 */
export function registerConsentField() {
  try {
    allowCustomComponent("ConsentAgreement");
    registerComponent("ConsentAgreement", TermsAgreement);
  } catch (error) {
    console.warn(
      "ConsentAgreement component already registered or error:",
      error,
    );
  }
}
