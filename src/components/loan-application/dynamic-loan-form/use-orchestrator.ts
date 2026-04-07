import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useReducer, useState } from "react";
import { toast } from "sonner";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { getNavigationConfig } from "@/contexts/NavigationConfigContext";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { usePhoneValidationMessages } from "@/hooks/phone/use-validation-messages";
import type { components } from "@/lib/api/v1/dop";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { useAuthStore } from "@/store/use-auth-store";
import { useLoanSearchStore } from "@/store/use-loan-search-store";
import { resolveLeadIdentity } from "./identity";
import { dynamicLoanFormReducer, initialMachineState } from "./machine";
import { buildLoanInfoRedirect } from "./navigation";

type LeadId = components["schemas"]["uuid"];

type LeadToken = string;

type FlowStep = {
  id: string;
  page: string;
  sendOtp?: boolean;
  consent_purpose_id?: string;
  fields: { phoneNumber: { required: boolean } };
};

type FlowData = {
  id: string;
  steps: FlowStep[];
};

type StepContext = { currentStepIndex: number; totalSteps: number };

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];

export function useDynamicLoanFormOrchestrator(input: {
  page: string;
  flowData: FlowData | null | undefined;
  indexStep: FlowStep | null;
  stepContext: StepContext | null;
  isFirstStep: boolean;
  tenantId: string;
  hasConsent: () => boolean;
  getConsentId: () => string | null;
  openConsentModal: (args: {
    consentPurposeId: string;
    onSuccess: () => void;
  }) => void;
  consentPurposeId?: string;
  initialData?: Record<string, unknown>;
  onSubmitSuccess?: (
    data: Record<string, unknown>,
    context?: { flowId: string; stepId: string },
  ) => void;
}) {
  const t = useTranslations("features.loan-application");
  const router = useRouter();
  const { getTelcoList } = usePhoneValidationMessages();

  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();
  const loanSearchStore = useLoanSearchStore();

  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();
  const { mutate: submitLeadInfo, isPending: isSubmittingInfo } =
    useSubmitLeadInfo();

  const [machineState, dispatch] = useReducer(
    dynamicLoanFormReducer,
    initialMachineState,
  );

  const [formData, setFormData] = useState<Record<string, unknown>>(
    input.initialData || {},
  );

  const [createdLeadId, setCreatedLeadId] = useState<LeadId | undefined>();
  const [createdLeadToken, setCreatedLeadToken] = useState<
    LeadToken | undefined
  >();

  const [phoneForOtp, setPhoneForOtp] = useState<string>(
    (input.initialData?.phone_number as string) || "",
  );

  const [pendingSubmitInfo, setPendingSubmitInfo] = useState<{
    leadId: LeadId;
    payload: SubmitLeadInfoRequestBody;
  } | null>(null);

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

  const openPhoneModalWithConsent = () => {
    if (!input.hasConsent() && input.consentPurposeId) {
      input.openConsentModal({
        consentPurposeId: input.consentPurposeId,
        onSuccess: () => dispatch({ type: "NEED_PHONE" }),
      });
      return;
    }

    dispatch({ type: "NEED_PHONE" });
  };

  const completeOtpSuccessFlow = (leadId?: LeadId, leadToken?: LeadToken) => {
    if (input.flowData && input.indexStep) {
      input.onSubmitSuccess?.(formData, {
        flowId: input.flowData.id,
        stepId: input.indexStep.id,
      });

      const currentStepIndex = input.flowData.steps.findIndex(
        (s) => s.id === input.indexStep?.id,
      );
      const nextStep = input.flowData.steps[currentStepIndex + 1];

      if (nextStep) {
        wizardStore.markStepComplete(currentStepIndex);
        wizardStore.goToStep(currentStepIndex + 1);

        setTimeout(() => {
          router.push(nextStep.page);
        }, 100);
      } else if (leadId && leadToken) {
        loanSearchStore.showLoanSearching({
          leadId,
          token: leadToken,
          redirectTo: buildLoanInfoRedirect(leadId, leadToken),
        });
      }
    } else {
      input.onSubmitSuccess?.(formData);

      if (leadId && leadToken) {
        loanSearchStore.showLoanSearching({
          leadId,
          token: leadToken,
          redirectTo: buildLoanInfoRedirect(leadId, leadToken),
        });
      }
    }

    dispatch({ type: "RESET" });
  };

  const createVerificationSessionAfterOtp = () => {
    const otpStepIndex = useFormWizardStore.getState().otpStepIndex;
    if (otpStepIndex === null) return;

    const config = getNavigationConfig();
    authStore.createVerificationSession(otpStepIndex, config);
  };

  const onWizardComplete = (data: Record<string, unknown>) => {
    setFormData(data);

    if (!input.indexStep || !input.flowData || !input.stepContext) {
      toast.error(t("errors.submissionFailed"));
      return;
    }

    if (input.indexStep.sendOtp) {
      const phoneInData = data.phone_number as string | undefined;
      const needsPhoneCollection =
        input.indexStep.fields.phoneNumber.required && !phoneInData;

      if (needsPhoneCollection) {
        openPhoneModalWithConsent();
        return;
      }

      if (phoneInData) {
        if (!validatePhoneNum(phoneInData)) return;

        setPhoneForOtp(phoneInData);

        // Step 1: Must createLead FIRST to get token for OTP
        if (input.isFirstStep) {
          const apiPayload = mapFormDataToLeadInfo(
            { ...data, phone_number: phoneInData },
            input.flowData.id,
            input.indexStep.id,
          );

          createLead(
            {
              flowId: input.flowData.id,
              tenant: input.tenantId,
              deviceInfo: {},
              trackingParams: {},
              info: apiPayload,
              consent_id: input.getConsentId() || undefined,
            },
            {
              onSuccess: (leadData) => {
                setCreatedLeadId(leadData.id);
                setCreatedLeadToken(leadData.token);

                wizardStore.updateStepData(input.indexStep?.id, {
                  leadId: leadData.id,
                  token: leadData.token,
                });

                // Now show OTP with the token from createLead
                dispatch({
                  type: "HAVE_PHONE",
                  afterOtpAction: { type: "createLead" },
                });
              },
              onError: () => {
                toast.error(t("errors.submissionFailed"));
              },
            },
          );
          return;
        }

        // Step 2+: Already have lead/token, show OTP directly
        const { leadId, token } = resolveLeadIdentity({
          data: { ...data, phone_number: phoneInData },
          createdLeadId,
          createdLeadToken,
        });

        if (!leadId || !token) {
          toast.error(t("errors.submissionFailed"));
          return;
        }

        // Sync to state for OTP container
        setCreatedLeadId(leadId);
        setCreatedLeadToken(token);

        const apiPayload = mapFormDataToLeadInfo(
          { ...data, phone_number: phoneInData },
          input.flowData.id,
          input.indexStep.id,
        );

        setPendingSubmitInfo({ leadId, payload: apiPayload });
        dispatch({
          type: "HAVE_PHONE",
          afterOtpAction: { type: "submitInfo", leadId, payload: apiPayload },
        });
        return;
      }

      toast.error(t("errors.configurationError"));
      return;
    }

    // sendOtp=false: Step 1 always creates lead first; Step 2+ submits if lead exists
    const currentStepIndex = input.flowData.steps.findIndex(
      (s) => s.id === input.indexStep?.id,
    );
    const nextStep = input.flowData.steps[currentStepIndex + 1];

    // Step 1: Must createLead FIRST before navigating (to get token for subsequent steps)
    if (input.isFirstStep) {
      // Extract values before async callback to avoid TS narrowing issues
      const { flowData, indexStep } = input;
      if (!flowData || !indexStep) return;

      const apiPayload = mapFormDataToLeadInfo(data, flowData.id, indexStep.id);

      createLead(
        {
          flowId: flowData.id,
          tenant: input.tenantId,
          deviceInfo: {},
          trackingParams: {},
          info: apiPayload,
          consent_id: input.getConsentId() || undefined,
        },
        {
          onSuccess: (leadData) => {
            setCreatedLeadId(leadData.id);
            setCreatedLeadToken(leadData.token);

            wizardStore.updateStepData(indexStep.id, {
              leadId: leadData.id,
              token: leadData.token,
            });

            input.onSubmitSuccess?.(data, {
              flowId: flowData.id,
              stepId: indexStep.id,
            });

            if (nextStep) {
              wizardStore.markStepComplete(currentStepIndex);
              wizardStore.setCurrentStep(currentStepIndex + 1);
              router.push(nextStep.page);
            } else {
              // Step 1 is also final step (edge case)
              if (
                leadData.matched_products &&
                leadData.matched_products.length > 0
              ) {
                loanSearchStore.setMatchedProducts(leadData.matched_products);
              }

              loanSearchStore.showLoanSearching({
                leadId: leadData.id,
                token: leadData.token,
                redirectTo: "/",
                message: t("messages.searchingLoan"),
              });
            }
          },
          onError: () => {
            toast.error(t("errors.submissionFailed"));
            // Note: Don't set loanSearchStore error here - we're still in Step 1
            // loanSearchStore should only be used when actually searching for loans
          },
        },
      );
      return;
    }

    // Step 2+: Navigate if there's next step, or submit if final
    input.onSubmitSuccess?.(data, {
      flowId: input.flowData.id,
      stepId: input.indexStep.id,
    });

    if (nextStep) {
      wizardStore.markStepComplete(currentStepIndex);
      wizardStore.setCurrentStep(currentStepIndex + 1);
      router.push(nextStep.page);
      return;
    }

    const { leadId, token } = resolveLeadIdentity({
      data,
      createdLeadId,
      createdLeadToken,
    });

    if (leadId && token) {
      const apiPayload = mapFormDataToLeadInfo(
        data,
        input.flowData.id,
        input.indexStep.id,
      );

      submitLeadInfo(
        { leadId, data: apiPayload },
        {
          onSuccess: (response) => {
            if (
              "matched_products" in response &&
              response.matched_products &&
              response.matched_products.length > 0
            ) {
              loanSearchStore.setMatchedProducts(response.matched_products);
            }

            if ("forward_result" in response && response.forward_result) {
              loanSearchStore.setForwardStatus(response.forward_result.status);
              loanSearchStore.setResult(response.forward_result);
            }

            loanSearchStore.showLoanSearching({
              leadId,
              token,
              redirectTo: "/",
              message: t("messages.searchingLoan"),
            });
          },
          onError: () => {
            toast.error(t("errors.submissionFailed"));
            loanSearchStore.setError(t("errors.submissionFailed"));
          },
        },
      );
      return;
    }

    const apiPayload = mapFormDataToLeadInfo(
      data,
      input.flowData.id,
      input.indexStep.id,
    );

    createLead(
      {
        flowId: input.flowData.id,
        tenant: input.tenantId,
        deviceInfo: {},
        trackingParams: {},
        info: apiPayload,
        consent_id: input.getConsentId() || undefined,
      },
      {
        onSuccess: (leadData) => {
          setCreatedLeadId(leadData.id);
          setCreatedLeadToken(leadData.token);

          wizardStore.updateStepData(input.indexStep?.id, {
            leadId: leadData.id,
            token: leadData.token,
          });

          if (
            leadData.matched_products &&
            leadData.matched_products.length > 0
          ) {
            loanSearchStore.setMatchedProducts(leadData.matched_products);
          }

          loanSearchStore.showLoanSearching({
            leadId: leadData.id,
            token: leadData.token,
            redirectTo: "/",
            message: t("messages.searchingLoan"),
          });
        },
        onError: () => {
          toast.error(t("errors.submissionFailed"));
          // Note: loanSearchStore error should be set by the component that initiated the search
        },
      },
    );
  };

  const onPhoneVerify = (phoneValue: string) => {
    if (!validatePhoneNum(phoneValue)) return;

    if (!input.flowData || !input.indexStep) {
      toast.error(t("errors.submissionFailed"));
      return;
    }

    setPhoneForOtp(phoneValue);

    const updatedData: Record<string, unknown> = {
      ...formData,
      phone_number: phoneValue,
    };
    setFormData(updatedData);

    // Step 1: Must createLead FIRST to get token for OTP
    if (input.isFirstStep) {
      // Extract values before async callback to avoid TS narrowing issues
      const { flowData, indexStep } = input;
      if (!flowData || !indexStep) return;

      const apiPayload = mapFormDataToLeadInfo(
        updatedData,
        flowData.id,
        indexStep.id,
      );

      createLead(
        {
          flowId: flowData.id,
          tenant: input.tenantId,
          deviceInfo: {},
          trackingParams: {},
          info: apiPayload,
          consent_id: input.getConsentId() || undefined,
        },
        {
          onSuccess: (leadData) => {
            setCreatedLeadId(leadData.id);
            setCreatedLeadToken(leadData.token);

            wizardStore.updateStepData(indexStep.id, {
              leadId: leadData.id,
              token: leadData.token,
            });

            // Now show OTP with the token from createLead
            dispatch({
              type: "HAVE_PHONE",
              afterOtpAction: { type: "createLead" },
            });
          },
          onError: () => {
            toast.error(t("errors.submissionFailed"));
          },
        },
      );
      return;
    }

    // Step 2+: Already have lead/token, show OTP directly
    const { leadId, token } = resolveLeadIdentity({
      data: updatedData,
      createdLeadId,
      createdLeadToken,
    });

    if (!leadId || !token) {
      toast.error(t("errors.submissionFailed"));
      return;
    }

    // Sync to state for OTP container
    setCreatedLeadId(leadId);
    setCreatedLeadToken(token);

    const apiPayload = mapFormDataToLeadInfo(
      updatedData,
      input.flowData.id,
      input.indexStep.id,
    );

    setPendingSubmitInfo({ leadId, payload: apiPayload });
    dispatch({
      type: "HAVE_PHONE",
      afterOtpAction: { type: "submitInfo", leadId, payload: apiPayload },
    });
  };

  const onOtpSuccess = (_otp: string) => {
    dispatch({ type: "OTP_SUBMIT" });

    createVerificationSessionAfterOtp();

    toast.info(t("messages.otpSuccess"));

    // Step 2+: submit-info after OTP
    if (pendingSubmitInfo) {
      submitLeadInfo(
        { leadId: pendingSubmitInfo.leadId, data: pendingSubmitInfo.payload },
        {
          onSuccess: () => {
            setPendingSubmitInfo(null);
            completeOtpSuccessFlow(pendingSubmitInfo.leadId, createdLeadToken);
            dispatch({ type: "OTP_SUCCESS" });
          },
          onError: () => {
            toast.error(t("errors.submissionFailed"));
            setPendingSubmitInfo(null);
            // Close OTP modal - OTP was verified, but submit-info failed
            // User needs to retry the step from beginning
            dispatch({ type: "CLOSE_OTP" });
          },
        },
      );
      return;
    }

    // Step 1: OTP OK, just navigate (createLead already done)
    if (input.isFirstStep && createdLeadId && createdLeadToken) {
      completeOtpSuccessFlow(createdLeadId, createdLeadToken);
      dispatch({ type: "OTP_SUCCESS" });
      return;
    }

    dispatch({ type: "OTP_FAILURE" });
  };

  const onOtpFailure = (error: string) => {
    toast.error(error);
    dispatch({ type: "OTP_FAILURE" });
  };

  const onOtpExpired = () => {
    toast.error(t("messages.otpExpired"));
    dispatch({ type: "OTP_EXPIRED" });
  };

  return {
    formData,
    setFormData,
    createdLeadId,
    createdLeadToken,
    phoneForOtp,
    isPhoneModalOpen: machineState.status === "collecting_phone",
    isOtpModalOpen:
      machineState.status === "awaiting_otp" ||
      machineState.status === "submitting",
    isSubmitting: isCreatingLead || isSubmittingInfo,
    onWizardComplete,
    onPhoneVerify,
    onOtpSuccess,
    onOtpFailure,
    onOtpExpired,
    onClosePhone: () => dispatch({ type: "CLOSE_PHONE" }),
    onCloseOtp: () => dispatch({ type: "CLOSE_OTP" }),
  };
}
