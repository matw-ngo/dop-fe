"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { StepWizard } from "@/components/form-generation";
import {
  FormThemeProvider,
  legacyLoanTheme,
  useFormTheme,
} from "@/components/form-generation/themes";
import { PhoneVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/PhoneVerificationModal";
import { Modal, OtpContainer } from "@/components/ui";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useFlow } from "@/hooks/flow/use-flow";
import { useLoanPurposes } from "@/hooks/i18n/use-loan-purposes";
import { usePhoneValidationMessages } from "@/hooks/phone/use-validation-messages";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { buildLoanFormConfigFromStep } from "@/lib/builders/loan-form-config-builder";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";

interface DynamicLoanFormProps {
  onSubmitSuccess?: (data: Record<string, unknown>) => void;
}

export const DynamicLoanForm: React.FC<DynamicLoanFormProps> = ({
  onSubmitSuccess,
}) => {
  const { theme } = useFormTheme();
  const t = useTranslations("features.loan-application");
  const { getTelcoList } = usePhoneValidationMessages();
  const tenant = useTenant();
  const router = useRouter();

  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, unknown>>({});
  const [createdLeadId, setCreatedLeadId] = React.useState<
    string | undefined
  >();
  const [createdLeadToken, setCreatedLeadToken] = React.useState<
    string | undefined
  >();

  // Fetch flow configuration dynamically based on tenant from useTenant hook
  const tenantId = tenant.uuid;
  const { data: flowData, isLoading: isLoadingFlow } = useFlow(tenantId);

  // Get loan purposes at top level (before useMemo to avoid hook violations)
  const loanPurposes = useLoanPurposes();

  // Lead creation state
  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();

  // Find the step with page === "/" or "/index" (the first step for ApplyLoanForm)
  const indexStep = useMemo(() => {
    if (!flowData?.steps) return null;

    // First try to find step with page === "/index" or "/"
    const matchingStep = flowData.steps.find(
      (step) => step.page === "/index" || step.page === "/",
    );

    // If found, use it; otherwise use the first step
    return matchingStep || flowData.steps[0] || null;
  }, [flowData]);

  // Build DynamicFormConfig from step configuration
  const formConfig = useMemo(() => {
    if (!indexStep) return null;
    return buildLoanFormConfigFromStep(indexStep, loanPurposes);
  }, [indexStep, loanPurposes]);

  const handleFormComplete = (data: Record<string, unknown>) => {
    console.log("Form completed with data:", data);
    setFormData(data);

    // Only show phone verification modal if sendOtp is enabled in the flow
    if (indexStep?.sendOtp) {
      setShowPhoneModal(true);
    } else {
      // Skip phone verification, proceed directly to onSubmitSuccess
      onSubmitSuccess?.(data);
    }
  };

  const validatePhoneNum = (phoneValue: string): boolean => {
    const value = String(phoneValue || "");
    if (!value || !value.trim()) {
      toast.error(t("errors.phoneRequired"));
      return false;
    }

    const phoneVerify = phoneValidation(value);
    if (isNaN(parseInt(value, 10)) || phoneVerify.valid === false) {
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

    if (isLoadingFlow) {
      toast.info(t("messages.loading") || "Loading...");
      return;
    }

    if (!flowData || !indexStep) {
      console.error("Flow configuration not available");
      toast.error(t("errors.submissionFailed"));
      return;
    }

    // Add phone to form data
    const updatedData = { ...formData, phone_number: phoneValue };

    const flowId = flowData.id;
    const stepId = indexStep.id;

    const apiPayload = mapFormDataToLeadInfo(updatedData, flowId, stepId);

    createLead(
      {
        flowId,
        tenant: tenantId,
        deviceInfo: {},
        trackingParams: {},
        info: apiPayload,
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
    toast.info(t("messages.otpSuccess"));
    setShowOTPModal(false);

    onSubmitSuccess?.(formData);

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

  // Loading state while fetching flow
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

  // Error state if no form config
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
      <FormThemeProvider theme={legacyLoanTheme}>
        <StepWizard config={formConfig} onComplete={handleFormComplete} />

        {/* Phone Modal - Only shown when sendOtp is enabled */}
        <PhoneVerificationModal
          open={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onVerify={handlePhoneSubmit}
          title={t("otp.title")}
          description={t("otp.description")}
          isSubmitting={isCreatingLead}
        />

        {/* OTP Modal */}
        <Modal
          open={showOTPModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowOTPModal(false);
            }
          }}
          size="md"
        >
          <OtpContainer
            phoneNumber={(formData.phone_number as string) || ""}
            leadId={createdLeadId}
            token={createdLeadToken}
            size={4}
            otpType={2}
            onSuccess={handleOtpSuccess}
            onFailure={handleOtpFailure}
            onExpired={handleOtpExpired}
          />
        </Modal>
      </FormThemeProvider>
    </div>
  );
};
