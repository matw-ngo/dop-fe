import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useFormTheme } from "@/components/form-generation/themes";
import { ManualResetButton } from "@/components/form-generation/wizard/ManualResetButton";
import { SessionTimeoutWarning } from "@/components/form-generation/wizard/SessionTimeoutWarning";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { getNavigationConfig } from "@/contexts/NavigationConfigContext";
import { Button, Modal, OtpContainer, TextInput } from "@/components/ui";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useLoanPurposes } from "@/hooks/config";
import { useErrorRecovery } from "@/hooks/navigation/use-error-recovery";
import { useNavigationGuard } from "@/hooks/navigation/use-navigation-guard";
import { useSessionReset } from "@/hooks/navigation/use-session-reset";
import { useSessionTimeout } from "@/hooks/navigation/use-session-timeout";
import { usePhoneValidationMessages } from "@/hooks/phone/use-validation-messages";
import { useTenantFlow } from "@/hooks/tenant/use-flow";
import { useTenant } from "@/hooks/tenant/use-tenant";
import {
  NavigationEvents,
  isNavigationEvent,
} from "@/lib/events/navigation-events";
import { trackLoanApplication } from "@/lib/tracking/events";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { useAuthStore } from "@/store/use-auth-store";
import { AmountField } from "./components/AmountField";
import { PeriodField } from "./components/PeriodField";
import { PurposeField } from "./components/PurposeField";
import { SubmitButton } from "./components/SubmitButton";
import { TermsAgreement } from "./components/TermsAgreement";
import { LOAN_AMOUNT, LOAN_PERIOD } from "./constants";
import {
  createLoanApplicationSchema,
  type LoanApplicationFormData,
} from "./schema";

interface ApplyLoanFormProps {
  defaultValues?: Partial<LoanApplicationFormData>;
  /**
   * Lead ID returned from POST /leads.
   * Required for OTP submission via POST /leads/{id}/submit-otp.
   */
  leadId?: string;
  /**
   * Auth token returned from POST /leads.
   * Required for OTP submission request body.
   */
  leadToken?: string;
  onSubmitSuccess?: (data: LoanApplicationFormData) => void;
  onCloseModal?: () => void;
}

const ApplyLoanForm: React.FC<ApplyLoanFormProps> = ({
  leadId,
  leadToken,
  defaultValues,
  onSubmitSuccess,
  onCloseModal: onParentCloseModal,
}) => {
  const { theme } = useFormTheme();
  const t = useTranslations("features.loan-application");
  const { data: loanPurposes = [] } = useLoanPurposes();
  const { getTelcoList } = usePhoneValidationMessages();
  const tenant = useTenant();

  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [formId, setFormId] = React.useState("");

  // Lazy load flow config only when phone modal opens
  const { data: flowConfig, isLoading: isLoadingFlow } = useTenantFlow(
    tenant.uuid,
    { enabled: showPhoneModal },
  );

  // Lead creation state
  const router = useRouter();
  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();
  const [createdLeadId, setCreatedLeadId] = React.useState<string | undefined>(
    leadId,
  );
  const [createdLeadToken, setCreatedLeadToken] = React.useState<
    string | undefined
  >(leadToken);

  // ============================================================================
  // Navigation Security Hooks
  // ============================================================================

  // Navigation guard - blocks back navigation to pre-OTP steps
  const navigationGuard = useNavigationGuard({
    onNavigationBlocked: (reason) => {
      console.log("Navigation blocked:", reason);
    },
  });

  // Session timeout - tracks session expiration with activity
  const { timeRemaining, resetTimeout } = useSessionTimeout({
    checkInterval: 10000, // Check every 10 seconds
    activityDebounce: 1000, // Debounce activity updates to 1 second
  });

  // Session reset - clears session on navigation away or logout
  const { resetSession } = useSessionReset({
    onReset: () => {
      console.log("Verification session reset");
    },
  });

  // Error recovery - handles corrupted sessions
  const errorRecovery = useErrorRecovery({
    onError: (error) => {
      console.error("Navigation error detected:", error);
    },
  });

  // Access auth store for verification session management
  const createVerificationSession = useAuthStore(
    (state) => state.createVerificationSession,
  );

  // Access wizard store for OTP step detection
  const detectOTPStep = useFormWizardStore((state) => state.detectOTPStep);

  // ============================================================================
  // Navigation Event Listeners
  // ============================================================================

  React.useEffect(() => {
    // Listen for session invalid events from API interceptors
    const handleSessionInvalid = (event: Event) => {
      if (isNavigationEvent(event)) {
        const message = event.detail.message || t("navigation.sessionInvalid");
        toast.error(message);

        // Reset session and redirect to first step
        resetSession();
      }
    };

    // Listen for OTP required events from API interceptors
    const handleOTPRequired = (event: Event) => {
      if (isNavigationEvent(event)) {
        const message = event.detail.message || t("navigation.otpRequired");
        toast.warning(message);

        // Show OTP modal
        setShowOTPModal(true);
      }
    };

    window.addEventListener(
      NavigationEvents.SESSION_INVALID,
      handleSessionInvalid,
    );
    window.addEventListener(NavigationEvents.OTP_REQUIRED, handleOTPRequired);

    return () => {
      window.removeEventListener(
        NavigationEvents.SESSION_INVALID,
        handleSessionInvalid,
      );
      window.removeEventListener(
        NavigationEvents.OTP_REQUIRED,
        handleOTPRequired,
      );
    };
  }, [t, resetSession]);

  // ============================================================================
  // OTP Step Detection
  // ============================================================================

  React.useEffect(() => {
    // Detect OTP step when flow config loads
    if (flowConfig) {
      // Note: detectOTPStep is called in DynamicLoanForm after wizard initialization
      // This is a fallback for ApplyLoanForm which doesn't use the wizard
      console.log("Flow config loaded, OTP detection handled by wizard");
    }
  }, [flowConfig]);

  // ============================================================================
  // Form Setup
  // ============================================================================

  const form = useForm<LoanApplicationFormData>({
    resolver: zodResolver(createLoanApplicationSchema(t)) as any,
    defaultValues: {
      expected_amount: LOAN_AMOUNT.MIN,
      loan_period: LOAN_PERIOD.MIN,
      loan_purpose: "",
      phone_number: "",
      agreeStatus: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = form;

  const userData = watch();

  React.useEffect(() => {
    setFormId(crypto.randomUUID());
  }, []);

  const onSubmitFirstStep = handleSubmit((data) => {
    // Check if terms are agreed
    if (data.agreeStatus !== "1") {
      toast.info(t("messages.agreeRequired"));
      return;
    }

    // Show phone modal
    setShowPhoneModal(true);
  });

  const validatePhoneNum = (): boolean => {
    const value = String(userData.phone_number || "");
    if (!value || !value.trim()) {
      setError("phone_number", { message: t("errors.phoneRequired") });
      return false;
    }

    const phoneVerify = phoneValidation(value);
    if (Number.isNaN(parseInt(value, 10)) || phoneVerify.valid === false) {
      setError("phone_number", { message: t("errors.phoneInvalid") });
      return false;
    }

    if (!ALLOWED_TELCOS.includes(phoneVerify.telco)) {
      const telcoList = getTelcoList();
      setError("phone_number", {
        message: t("errors.telcoNotSupported", { telcos: telcoList }),
      });
      return false;
    }

    clearErrors("phone_number");
    setValue("phone_number", phoneVerify.validNum);
    trackLoanApplication.phoneNumberValid(
      phoneVerify.validNum,
      phoneVerify.telco,
    );
    return true;
  };

  const onSubmitFinal = () => {
    if (!validatePhoneNum()) {
      return;
    }

    // Wait for flow config if still loading
    if (isLoadingFlow) {
      toast.info(t("messages.loading") || "Loading...");
      return;
    }

    // Ensure flow configuration is loaded
    if (!flowConfig) {
      console.error("Flow configuration not available");
      toast.error(t("errors.submissionFailed"));
      return;
    }

    console.log("Form submitted:", { userData, formId });

    // If we already have lead props, just show OTP (legacy behavior support)
    if (leadId && leadToken) {
      setShowPhoneModal(false);
      setShowOTPModal(true);
      return;
    }

    // Get flow and step IDs from dynamic flow configuration
    const flowId = flowConfig.id;
    const stepId = flowConfig.steps[0]?.id;

    if (!stepId) {
      console.error("No step ID available in flow configuration");
      toast.error(t("errors.submissionFailed"));
      return;
    }

    const apiPayload = mapFormDataToLeadInfo(userData, flowId, stepId);

    createLead(
      {
        flowId,
        tenant: tenant.uuid,
        deviceInfo: {},
        trackingParams: {},
        info: apiPayload,
      },
      {
        onSuccess: (data) => {
          console.log("Lead created:", data);
          setCreatedLeadId(data.id);
          setCreatedLeadToken(data.token);

          // Proceed to OTP
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

  // OTP event handlers
  const handleOtpSuccess = (otp: string) => {
    console.log("OTP verified successfully:", otp);
    toast.info(t("messages.otpSuccess"));
    setShowOTPModal(false);

    // ============================================================================
    // Create Verification Session After OTP Success
    // ============================================================================

    // Create verification session to lock navigation
    // Note: OTP step index should be detected by wizard store
    // For ApplyLoanForm (non-wizard), we assume OTP is at index 0
    const otpStepIndex = 0; // This form doesn't use wizard, so OTP is conceptually step 0

    // Get navigation config without using React hook
    const config = getNavigationConfig();
    createVerificationSession(otpStepIndex, config);

    console.log("Verification session created after OTP success");

    // Navigate to loan info wizard with lead data
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

  const onCloseModal = () => {
    setShowPhoneModal(false);
    setShowOTPModal(false);
  };

  const onAmountChange = (value: number) => {
    setValue("expected_amount", value);
    trackLoanApplication.inputExpectedAmount(value);
  };

  const onPurposeChange = (value: string) => {
    setValue("loan_purpose", value);
    trackLoanApplication.inputPurpose(value);
  };

  return (
    <FormProvider {...form}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Session Timeout Warning - shows when < 60s remaining */}
        {timeRemaining !== null && timeRemaining < 60 && (
          <SessionTimeoutWarning timeRemaining={timeRemaining} />
        )}

        {/* Manual Reset Button - shows on errors */}
        <ManualResetButton />

        {/* Số tiền vay field */}
        <AmountField
          value={userData.expected_amount}
          onChange={onAmountChange}
          label={t("expectedAmount.label")}
          min={LOAN_AMOUNT.MIN}
          max={LOAN_AMOUNT.MAX}
          step={LOAN_AMOUNT.STEP}
        />

        {/* Thời hạn vay field */}
        <PeriodField
          value={userData.loan_period}
          onChange={(value) => setValue("loan_period", value)}
          label={t("loanPeriod.label")}
          min={LOAN_PERIOD.MIN}
          max={LOAN_PERIOD.MAX}
          step={LOAN_PERIOD.STEP}
        />

        {/* Mục đích vay field */}
        <PurposeField
          value={userData.loan_purpose}
          onChange={onPurposeChange}
          options={loanPurposes}
          label={t("loanPurpose.label")}
          placeholder={t("loanPurpose.placeholder")}
          error={errors.loan_purpose?.message}
        />

        {/* Term Agreement */}
        <TermsAgreement
          value={userData.agreeStatus}
          onChange={(value) => setValue("agreeStatus", value as "0" | "1" | "")}
          error={errors.agreeStatus?.message}
        />

        {/* Submit Button */}
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={isSubmitting}
          onClick={onSubmitFirstStep}
        />

        {/* Phone Modal */}
        <Modal
          open={showPhoneModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowPhoneModal(false);
              onCloseModal();
            }
          }}
          size="lg"
        >
          <div className="p-2">
            <h3
              className="text-center text-2xl font-bold leading-8 mb-3"
              style={{ color: theme.colors.primary }}
            >
              {t("otp.title")}
            </h3>
            <p
              className="text-center text-sm font-normal leading-6 mb-4"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("otp.description")}
            </p>
            <div className="mb-4">
              <TextInput
                placeholder={t("otp.placeholder")}
                value={userData.phone_number}
                onChange={(e) => {
                  setValue("phone_number", e.target.value);
                  trackLoanApplication.inputPhoneNumber(e.target.value);
                }}
                onBlur={validatePhoneNum}
                error={!!errors.phone_number?.message}
                errorMessage={errors.phone_number?.message}
                className="text-lg"
              />
            </div>
            <div>
              <Button
                className="mx-auto block rounded-lg font-semibold w-full h-14 text-white"
                style={{ backgroundColor: theme.colors.primary }}
                onClick={onSubmitFinal}
                loading={isCreatingLead}
                disabled={isCreatingLead}
              >
                {t("otp.continue")}
              </Button>
            </div>
          </div>
        </Modal>

        {/* OTP Modal */}
        <Modal
          open={showOTPModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowOTPModal(false);
              onCloseModal();
            }
          }}
          size="md"
        >
          <OtpContainer
            phoneNumber={userData.phone_number || ""}
            leadId={createdLeadId}
            token={createdLeadToken}
            size={4}
            otpType={2} // SMS OTP
            onSuccess={handleOtpSuccess}
            onFailure={handleOtpFailure}
            onExpired={handleOtpExpired}
          />
        </Modal>
      </div>
    </FormProvider>
  );
};

export default ApplyLoanForm;
