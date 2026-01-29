"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { ConsentModal } from "@/components/consent/ConsentModal";
import { StepWizard } from "@/components/form-generation";
import {
  FormThemeProvider,
  legacyLoanTheme,
} from "@/components/form-generation/themes";
import { OtpVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/OtpVerificationModal";
import { PhoneVerificationModal } from "@/components/loan-application/ApplyLoanForm/components/PhoneVerificationModal";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useFlow } from "@/hooks/flow/use-flow";
import { useLoanPurposes } from "@/hooks/i18n/use-loan-purposes";
import { usePhoneValidationMessages } from "@/hooks/phone/use-validation-messages";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { buildLoanFormConfigFromStep } from "@/lib/builders/loan-form-config-builder";
import "@/lib/builders/register-flow-components";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { useConsentStore } from "@/store/use-consent-store";

interface DynamicLoanFormProps {
  onSubmitSuccess?: (
    data: Record<string, unknown>,
    context?: { flowId: string; stepId: string },
  ) => void;
  page?: string;
  initialData?: Record<string, unknown>;
}

export const DynamicLoanForm: React.FC<DynamicLoanFormProps> = ({
  onSubmitSuccess,
  page = "/index",
  initialData,
}) => {
  const t = useTranslations("features.loan-application");
  const { getTelcoList } = usePhoneValidationMessages();
  const tenant = useTenant();
  const router = useRouter();
  const { getConsentId } = useConsentStore();

  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [showConsentModal, setShowConsentModal] = React.useState(false);
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

  const indexStep = useMemo(() => {
    if (!flowData?.steps) return null;

    const matchingStep = flowData.steps.find(
      (step) => step.page === page || (page === "/index" && step.page === "/"),
    );

    return matchingStep || (page === "/index" ? flowData.steps[0] : null);
  }, [flowData, page]);

  const formConfig = useMemo(() => {
    if (!indexStep) return null;
    return buildLoanFormConfigFromStep(indexStep, loanPurposes);
  }, [indexStep, loanPurposes]);

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

  const handleConsentSuccess = () => {
    setShowConsentModal(false);
    setShowPhoneModal(true);
  };

  const handleOtpSuccess = (otp: string) => {
    console.log("OTP verified successfully:", otp);
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
      // FIXME
      // if (!hasConsent()) {
      //   setShowConsentModal(true);
      // } else {
      //   setShowPhoneModal(true);
      // }
      setShowPhoneModal(true);
    } else {
      if (flowData && indexStep) {
        onSubmitSuccess?.(data, { flowId: flowData.id, stepId: indexStep.id });
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
      <FormThemeProvider theme={legacyLoanTheme}>
        <StepWizard
          config={formConfig}
          initialData={formData}
          onComplete={handleFormComplete}
        />

        <ConsentModal
          open={showConsentModal}
          setOpen={setShowConsentModal}
          onSuccess={handleConsentSuccess}
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
      </FormThemeProvider>
    </div>
  );
};
