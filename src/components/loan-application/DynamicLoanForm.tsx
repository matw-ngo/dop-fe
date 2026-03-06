"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { StepWizard } from "@/components/form-generation";
import { OtpVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/OtpVerificationModal";
import { PhoneVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/PhoneVerificationModal";
import { FLOW_PAGES, type FlowPage } from "@/constants/flow-pages";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useFlow } from "@/hooks/flow/use-flow";
import { useLoanPurposes } from "@/hooks/i18n/use-loan-purposes";
import { usePhoneValidationMessages } from "@/hooks/phone/use-validation-messages";
import { useFlowStep } from "@/hooks/tenant/use-flow-step";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { buildLoanFormConfigFromStep } from "@/lib/builders/loan-form-config-builder";
import "@/lib/builders/register-flow-components";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { getNavigationConfig } from "@/contexts/NavigationConfigContext";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { useAuthStore } from "@/store/use-auth-store";
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
  const { getTelcoList } = usePhoneValidationMessages();
  const tenant = useTenant();
  const router = useRouter();
  const { getConsentId, hasConsent, openConsentModal } = useConsentStore();

  // Navigation security stores
  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();

  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, unknown>>(
    initialData || {},
  );
  const [createdLeadId, setCreatedLeadId] = React.useState<
    string | undefined
  >();
  const [createdLeadToken, setCreatedLeadToken] = React.useState<
    string | undefined
  >();

  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();

  const tenantId = tenant.uuid;
  const { data: flowData, isLoading: isLoadingFlow } = useFlow(tenantId);

  const loanPurposes = useLoanPurposes();

  // Step config for the current page — used to resolve consent_purpose_id
  const consentStep = useFlowStep(page);

  // Detect OTP step when flow data loads
  useEffect(() => {
    if (flowData?.steps) {
      wizardStore.detectOTPStep();
    }
  }, [flowData, wizardStore]);

  const indexStep = useMemo(() => {
    if (!flowData?.steps) return null;

    const normalizePage = (value: string) =>
      value.startsWith("/") ? value : `/${value}`;
    const normalizedPage = normalizePage(page);

    const matchingStep = flowData.steps.find(
      (step) =>
        normalizePage(step.page) === normalizedPage ||
        (normalizedPage === "/index" && normalizePage(step.page) === "/"),
    );

    // Validation: Log warning if no matching step found
    if (!matchingStep && normalizedPage !== "/index") {
      console.warn(
        `[DynamicLoanForm] No step found for page: "${page}"`,
        "\nAvailable pages:",
        flowData.steps.map((s) => s.page),
        "\nThis may indicate a mismatch between component prop and API response.",
      );
    }

    const result =
      matchingStep || (normalizedPage === "/index" ? flowData.steps[0] : null);

    if (result) {
      console.log(`[DynamicLoanForm] Matched step for page "${page}":`, {
        stepId: result.id,
        stepPage: result.page,
      });
    }

    return result;
  }, [flowData, page]);

  const stepContext = useMemo(() => {
    if (!flowData?.steps || !indexStep) return null;

    const currentStepIndex = flowData.steps.findIndex(
      (s) => s.id === indexStep.id,
    );

    const context = {
      currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : 0,
      totalSteps: flowData.steps.length,
    };

    console.log("[DynamicLoanForm] Step context:", {
      page,
      indexStepId: indexStep.id,
      flowSteps: flowData.steps.map((s) => ({ id: s.id, page: s.page })),
      ...context,
    });

    return context;
  }, [flowData, indexStep, page]);

  const formConfig = useMemo(() => {
    if (!indexStep) return null;
    return buildLoanFormConfigFromStep(
      indexStep,
      loanPurposes,
      stepContext || undefined,
    );
  }, [indexStep, loanPurposes, stepContext]);

  const validatePhoneNum = (phoneValue: string): boolean => {
    const value = String(phoneValue || "");
    if (!value || !value.trim()) {
      toast.error(t("errors.phoneRequired"));
      return false;
    }

    const phoneVerify = phoneValidation(value);
    if (Number.isNaN(parseInt(value, 10)) || phoneVerify.valid === false) {
      toast.error(t("errors.phoneInvalid"));
      return false;
    }

    if (!ALLOWED_TELCOS.includes(phoneVerify.telco)) {
      const telcoList = getTelcoList();
      toast.error(t("errors.telcoNotSupported", { telcos: telcoList }));
      return false;
    }

    return true;
  };

  const handlePhoneSubmit = (phoneValue: string) => {
    if (!validatePhoneNum(phoneValue)) {
      return;
    }

    if (!flowData || !indexStep) {
      console.error("Flow configuration not available");
      toast.error(t("errors.submissionFailed"));
      return;
    }

    const updatedData = { ...formData, phone_number: phoneValue };
    setFormData(updatedData); // Persist phone number for OtpVerificationModal

    const flowId = flowData.id;
    const stepId = indexStep.id;

    const apiPayload = mapFormDataToLeadInfo(updatedData, flowId, stepId);

    createLead(
      {
        flowId,
        tenant: tenant.uuid,
        deviceInfo: {},
        trackingParams: {},
        info: apiPayload,
        consent_id: getConsentId() || undefined,
      },
      {
        onSuccess: (data) => {
          console.log("Lead created:", data);
          setCreatedLeadId(data.id);
          setCreatedLeadToken(data.token);
          setShowPhoneModal(false);
          setShowOTPModal(true);
        },
        onError: (error) => {
          console.error("Lead creation failed:", error);
          toast.error(t("errors.submissionFailed"));
        },
      },
    );
  };

  const handleOtpSuccess = (otp: string) => {
    console.log("OTP verified successfully:", otp);

    // Create verification session after OTP success
    const otpStepIndex = useFormWizardStore.getState().otpStepIndex;
    if (otpStepIndex !== null) {
      // Get navigation config without using React hook
      const config = getNavigationConfig();
      authStore.createVerificationSession(otpStepIndex, config);
      console.log(
        "[DynamicLoanForm] Verification session created for OTP step:",
        otpStepIndex,
      );
    } else {
      console.warn(
        "[DynamicLoanForm] OTP step index not detected. Cannot create verification session.",
      );
    }

    toast.info(t("messages.otpSuccess"));
    setShowOTPModal(false);

    if (flowData && indexStep) {
      onSubmitSuccess?.(formData, {
        flowId: flowData.id,
        stepId: indexStep.id,
      });
    } else {
      onSubmitSuccess?.(formData);
    }

    if (createdLeadId && createdLeadToken) {
      router.push(
        `/loan-info?leadId=${createdLeadId}&token=${createdLeadToken}`,
      );
    }
  };

  const handleOtpFailure = (error: string) => {
    console.error("OTP verification failed:", error);
    toast.error(error);
  };

  const handleOtpExpired = () => {
    console.log("OTP expired");
    toast.error(t("messages.otpExpired"));
  };

  const handleFormComplete = (data: Record<string, unknown>) => {
    console.log("Form completed with data:", data);

    setFormData(data);

    if (indexStep?.sendOtp) {
      // Check if phone number is required and already collected
      const phoneInData = data.phone_number as string | undefined;
      const needsPhoneCollection =
        indexStep.fields.phoneNumber.required && !phoneInData;

      if (needsPhoneCollection) {
        // Phone is required but not collected - show phone modal
        console.log("[DynamicLoanForm] Phone required, opening phone modal");

        if (!hasConsent() && consentStep?.consent_purpose_id) {
          openConsentModal({
            consentPurposeId: consentStep.consent_purpose_id,
            onSuccess: () => setShowPhoneModal(true),
          });
        } else {
          setShowPhoneModal(true);
        }
      } else if (phoneInData) {
        // Phone already collected in form - proceed directly to OTP
        console.log(
          "[DynamicLoanForm] Phone already collected, proceeding to create lead",
        );
        handlePhoneSubmit(phoneInData);
      } else {
        // sendOtp: true but phone not required - configuration warning
        // NOTE: This is a potential configuration issue that should be caught in profile validation
        console.warn(
          "[DynamicLoanForm] Configuration warning: sendOtp is true but phone is not required.",
          "This may indicate a profile configuration issue.",
        );
        toast.error(t("errors.configurationError"));
      }
    } else {
      // No OTP required, navigate to next step
      if (flowData && indexStep) {
        onSubmitSuccess?.(data, { flowId: flowData.id, stepId: indexStep.id });

        // Find next step and navigate
        const currentStepIndex = flowData.steps.findIndex(
          (s) => s.id === indexStep.id,
        );
        const nextStep = flowData.steps[currentStepIndex + 1];

        if (nextStep) {
          console.log("[DynamicLoanForm] Navigating to next step:", {
            currentPage: page,
            nextPage: nextStep.page,
            nextStepId: nextStep.id,
          });
          router.push(nextStep.page);
        } else {
          console.log(
            "[DynamicLoanForm] No next step found, staying on current page",
          );
        }
      } else {
        onSubmitSuccess?.(data);
      }
    }
  };

  if (isLoadingFlow) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

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
        initialData={formData}
        onComplete={handleFormComplete}
      />

      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerify={handlePhoneSubmit}
        title={t("otp.title")}
        description={t("otp.description")}
        isSubmitting={isCreatingLead}
      />

      <OtpVerificationModal
        open={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={(formData.phone_number as string) || ""}
        leadId={createdLeadId}
        token={createdLeadToken}
        otpType={2 as 1 | 2 | undefined}
        onSuccess={handleOtpSuccess}
        onFailure={handleOtpFailure}
        onExpired={handleOtpExpired}
        size={6}
      />
    </div>
  );
};
