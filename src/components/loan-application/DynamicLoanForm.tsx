"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import { StepWizard } from "@/components/form-generation";
import { OtpVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/OtpVerificationModal";
import { PhoneVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/PhoneVerificationModal";
import { FLOW_PAGES, type FlowPage } from "@/constants/flow-pages";
import { useFormOptions } from "@/hooks/form-options";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { buildLoanFormConfigFromStep } from "@/lib/builders/loan-form-config-builder";
import "@/lib/builders/register-flow-components";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { useDynamicLoanStepContext } from "@/components/loan-application/dynamic-loan-form/step-context";
import { useDynamicLoanFormOrchestrator } from "@/components/loan-application/dynamic-loan-form/use-orchestrator";
import type { MappedStep } from "@/mappers/flowMapper";
import { useConsentStore } from "@/store/use-consent-store";

interface DynamicLoanFormProps {
  onSubmitSuccess?: (
    data: Record<string, unknown>,
    context?: { flowId: string; stepId: string },
  ) => void;
  /**
   * Logical page identifier (not physical route)
   * Should match step.page from API response
   * @example "/index", "/submit-info", "/personal-info"
   */
  page?: FlowPage | string;
  initialData?: Record<string, unknown>;
}

export const DynamicLoanForm: React.FC<DynamicLoanFormProps> = ({
  onSubmitSuccess,
  page = FLOW_PAGES.INDEX,
  initialData,
}) => {
  const t = useTranslations("features.loan-application");
  const tenant = useTenant();
  useRouter();
  const { getConsentId, hasConsent, openConsentModal } = useConsentStore();
  const wizardStore = useFormWizardStore();

  const tenantId = tenant.uuid;

  const { flowData, indexStep, stepContext, isFirstStep } =
    useDynamicLoanStepContext({ tenantId, page });

  const formOptions = useFormOptions();

  const formConfig = React.useMemo(() => {
    if (!indexStep) return null;
    return buildLoanFormConfigFromStep(
      indexStep,
      formOptions,
      stepContext || undefined,
    );
  }, [indexStep, formOptions, stepContext]);

  useEffect(() => {
    if (flowData?.steps) {
      wizardStore.detectOTPStep();
    }
  }, [flowData, wizardStore]);

  const orchestrator = useDynamicLoanFormOrchestrator({
    page: String(page),
    flowData,
    indexStep,
    stepContext,
    isFirstStep,
    tenantId,
    hasConsent,
    getConsentId,
    openConsentModal,
    consentPurposeId: (indexStep as MappedStep | null)?.consentPurposeId,
    initialData,
    onSubmitSuccess,
  });

  // FIXME TODO
  // if (isLoadingFlow || formOptions.isLoading) {
  //   return (
  //     <div className="max-w-2xl mx-auto p-4">
  //       <div className="flex flex-col items-center justify-center py-12">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
  //         <p className="text-muted-foreground">Đang tải cấu hình...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (!formConfig) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Không thể tải cấu hình form</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dynamic-loan-form">
      <StepWizard
        config={formConfig}
        initialData={orchestrator.formData}
        totalSteps={stepContext?.totalSteps}
        currentStepIndex={stepContext?.currentStepIndex}
        onComplete={orchestrator.onWizardComplete}
      />

      <PhoneVerificationModal
        open={orchestrator.isPhoneModalOpen}
        onClose={orchestrator.onClosePhone}
        onVerify={orchestrator.onPhoneVerify}
        title={t("otp.title")}
        description={t("otp.description")}
        isSubmitting={orchestrator.isSubmitting}
      />

      <OtpVerificationModal
        open={orchestrator.isOtpModalOpen}
        onClose={orchestrator.onCloseOtp}
        phoneNumber={orchestrator.phoneForOtp}
        leadId={orchestrator.createdLeadId}
        token={orchestrator.createdLeadToken}
        otpType={2 as 1 | 2 | undefined}
        onSuccess={orchestrator.onOtpSuccess}
        onFailure={orchestrator.onOtpFailure}
        onExpired={orchestrator.onOtpExpired}
        size={6}
      />
    </div>
  );
};
