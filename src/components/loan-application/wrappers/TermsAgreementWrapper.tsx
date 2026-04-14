import type React from "react";
import type { FieldComponentProps } from "@/components/form-generation";
import { TermsAgreement } from "../ApplyLoanForm/components/TermsAgreement";

type TermsAgreementValue = string;

/**
 * Wrapper component to adapt TermsAgreement for use in DynamicFormConfig
 * Converts FieldComponentProps to TermsAgreementProps
 */
export const TermsAgreementWrapper: React.FC<
  FieldComponentProps<TermsAgreementValue>
> = ({ value, onChange, error }) => {
  return (
    <TermsAgreement value={value ?? ""} onChange={onChange} error={error} />
  );
};
