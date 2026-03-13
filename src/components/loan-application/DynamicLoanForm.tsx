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
import { useFormOptions } from "@/hooks/form-options";
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
import { useLoanSearchStore } from "@/store/use-loan-search-store";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import type { components } from "@/lib/api/v1/dop";

// Type aliases from API schema
type LeadId = components["schemas"]["uuid"];
type LeadToken = string;
type CreateLeadResponse = components["schemas"]["CreateLeadResponseBody"];

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
  const loanSearchStore = useLoanSearchStore();

  // Navigation security stores
  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();

  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, unknown>>(
    initialData || {},
  );
  const [createdLeadId, setCreatedLeadId] = React.useState<
    LeadId | undefined
  >();
  const [createdLeadToken, setCreatedLeadToken] = React.useState<
    LeadToken | undefined
  >();

  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();
  const { mutate: submitLeadInfo, isPending: isSubmittingInfo } =
    useSubmitLeadInfo();

  const tenantId = tenant.uuid;
  const { data: flowData, isLoading: isLoadingFlow } = useFlow(tenantId);

  const formOptions = useFormOptions();

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
      formOptions,
      stepContext || undefined,
    );
  }, [indexStep, formOptions, stepContext]);

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

      // Check if there's a next step after OTP
      const currentStepIndex = flowData.steps.findIndex(
        (s) => s.id === indexStep.id,
      );
      const nextStep = flowData.steps[currentStepIndex + 1];

      if (nextStep) {
        // There's a next step - navigate to it
        console.log(
          "[DynamicLoanForm] OTP success - navigating to next step:",
          {
            currentPage: page,
            nextPage: nextStep.page,
            nextStepId: nextStep.id,
            currentFormData: formData,
            wizardStoreData: wizardStore.formData,
          },
        );

        // CRITICAL: Mark current step as complete and update wizard store
        // This ensures form data is persisted before navigation
        wizardStore.markStepComplete(currentStepIndex);

        // Update wizard store's current step to next step
        // This prevents validation from thinking we're skipping steps
        wizardStore.goToStep(currentStepIndex + 1);

        // Small delay to ensure state is persisted before navigation
        setTimeout(() => {
          router.push(nextStep.page);
        }, 100);
      } else {
        // This is the last step - show loan searching screen
        console.log(
          "[DynamicLoanForm] OTP success at final step - showing loan searching screen",
        );

        if (createdLeadId && createdLeadToken) {
          // Integration Point 2: Show loan searching screen after OTP success at final step
          loanSearchStore.showLoanSearching({
            leadId: createdLeadId,
            token: createdLeadToken,
            redirectTo: `/loan-info?leadId=${createdLeadId}&token=${createdLeadToken}`,
          });
        }
      }
    } else {
      onSubmitSuccess?.(formData);

      // Fallback: if no flow data, still try to show searching screen if we have lead info
      if (createdLeadId && createdLeadToken) {
        loanSearchStore.showLoanSearching({
          leadId: createdLeadId,
          token: createdLeadToken,
          redirectTo: `/loan-info?leadId=${createdLeadId}&token=${createdLeadToken}`,
        });
      }
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

          // CRITICAL: Mark current step as complete and update wizard store
          // This ensures form data is persisted and validation passes for next step
          wizardStore.markStepComplete(currentStepIndex);

          // Use setCurrentStep instead of goToStep because goToStep checks bounds
          // against the store's steps array which only contains current step config
          wizardStore.setCurrentStep(currentStepIndex + 1);

          router.push(nextStep.page);
        } else {
          // Integration Point 1 & 3: Last step without OTP - create/update lead then show searching screen
          console.log(
            "[DynamicLoanForm] Final step without OTP - processing lead and showing search screen",
          );

          // Check for existing lead from URL params or previous steps
          const existingLeadId =
            (data.leadId as LeadId | undefined) ?? createdLeadId;
          const existingToken =
            (data.token as LeadToken | undefined) ?? createdLeadToken;

          if (existingLeadId && existingToken) {
            // Integration Point 3a: Update existing lead with submit-info API
            console.log(
              "[DynamicLoanForm] Submitting lead info at final step:",
              existingLeadId,
            );

            const flowId = flowData.id;
            const stepId = indexStep.id;
            const apiPayload = mapFormDataToLeadInfo(data, flowId, stepId);

            // Call submit-info API to update lead and get matched products
            submitLeadInfo(
              { leadId: existingLeadId, data: apiPayload },
              {
                onSuccess: (response) => {
                  console.log(
                    "[DynamicLoanForm] Lead info submitted successfully:",
                    response,
                  );

                  // Store matched products if available
                  if (
                    "matched_products" in response &&
                    response.matched_products &&
                    response.matched_products.length > 0
                  ) {
                    loanSearchStore.setMatchedProducts(
                      response.matched_products,
                    );
                  }

                  // Store forward result if available
                  if ("forward_result" in response && response.forward_result) {
                    loanSearchStore.setForwardStatus(
                      response.forward_result.status,
                    );
                    loanSearchStore.setResult(response.forward_result);
                  }

                  // Show loan searching screen
                  loanSearchStore.showLoanSearching({
                    leadId: existingLeadId,
                    token: existingToken,
                    redirectTo: "/", // Or a success page
                    message: t("messages.searchingLoan"),
                  });
                },
                onError: (error) => {
                  console.error(
                    "[DynamicLoanForm] Lead info submission failed:",
                    error,
                  );
                  toast.error(t("errors.submissionFailed"));
                  loanSearchStore.setError(t("errors.submissionFailed"));
                },
              },
            );
          } else {
            // Integration Point 3b: Create new lead at final step
            console.log("[DynamicLoanForm] Creating new lead at final step");

            const flowId = flowData.id;
            const stepId = indexStep.id;
            const apiPayload = mapFormDataToLeadInfo(data, flowId, stepId);

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
                onSuccess: (leadData) => {
                  console.log(
                    "[DynamicLoanForm] Lead created at final step:",
                    leadData,
                  );

                  // Store lead data for potential future use
                  setCreatedLeadId(leadData.id);
                  setCreatedLeadToken(leadData.token);

                  // Store matched products if available
                  if (
                    leadData.matched_products &&
                    leadData.matched_products.length > 0
                  ) {
                    loanSearchStore.setMatchedProducts(
                      leadData.matched_products,
                    );
                  }

                  // Show loan searching screen
                  loanSearchStore.showLoanSearching({
                    leadId: leadData.id,
                    token: leadData.token,
                    redirectTo: "/", // Or a success page
                    message: t("messages.searchingLoan"),
                  });
                },
                onError: (error) => {
                  console.error(
                    "[DynamicLoanForm] Lead creation failed at final step:",
                    error,
                  );
                  toast.error(t("errors.submissionFailed"));
                  loanSearchStore.setError(t("errors.submissionFailed"));
                },
              },
            );
          }
        }
      } else {
        onSubmitSuccess?.(data);
      }
    }
  };

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
        initialData={formData}
        totalSteps={stepContext?.totalSteps}
        currentStepIndex={stepContext?.currentStepIndex}
        onComplete={handleFormComplete}
      />

      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerify={handlePhoneSubmit}
        title={t("otp.title")}
        description={t("otp.description")}
        isSubmitting={isCreatingLead || isSubmittingInfo}
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
