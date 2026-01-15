import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePhoneValidationMessages } from "@/hooks/phone/use-phone-validation-messages";
import { trackLoanApplication } from "@/lib/tracking/events";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import { FORM_STEPS, LOAN_AMOUNT, LOAN_PERIOD } from "../constants";
import { type LoanApplicationFormData, loanApplicationSchema } from "../schema";
import {
  LoanApplicationTrackingEvents,
  type UseLoanApplicationFormReturn,
} from "../types";

export function useLoanApplicationForm(): UseLoanApplicationFormReturn {
  const t = useTranslations("features.loan-application");
  const { getTelcoList } = usePhoneValidationMessages();
  const [formId, setFormId] = useState("");
  const [modals, setModals] = useState({
    phone: false,
    otp: false,
  });

  // Initialize form with React Hook Form
  const form = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      expected_amount: LOAN_AMOUNT.DEFAULT,
      loan_period: LOAN_PERIOD.DEFAULT,
      loan_purpose: "",
      phone_number: "",
      agreeStatus: "",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, isDirty, errors },
    watch,
    setValue,
    getValues,
  } = form;

  // Generate unique form ID on mount
  useEffect(() => {
    setFormId(crypto.randomUUID());
  }, []);

  // Modal state handlers
  const showPhoneModal = useCallback(() => {
    setModals((prev) => ({ ...prev, phone: true }));
  }, []);

  const hidePhoneModal = useCallback(() => {
    setModals((prev) => ({ ...prev, phone: false }));
  }, []);

  const showOtpModal = useCallback(() => {
    setModals((prev) => ({ ...prev, phone: false, otp: true }));
  }, []);

  const hideOtpModal = useCallback(() => {
    setModals((prev) => ({ ...prev, otp: false }));
  }, []);

  // Phone validation logic
  const validatePhone = useCallback(
    (
      phoneNumber: string,
    ): { valid: boolean; normalizedNumber?: string; error?: string } => {
      if (!phoneNumber || !phoneNumber.trim()) {
        return { valid: false, error: t("errors.phoneRequired") };
      }

      const phoneVerify = phoneValidation(phoneNumber);

      if (isNaN(parseInt(phoneNumber)) || !phoneVerify.valid) {
        return { valid: false, error: t("errors.phoneInvalid") };
      }

      if (!ALLOWED_TELCOS.includes(phoneVerify.telco)) {
        const telcoList = getTelcoList();
        return {
          valid: false,
          error: t("errors.telcoNotSupported", { telcos: telcoList }),
        };
      }

      return {
        valid: true,
        normalizedNumber: phoneVerify.validNum,
        telco: phoneVerify.telco,
      };
    },
    [t, getTelcoList],
  );

  // Form submission handler
  const onSubmit = useCallback(
    async (data: LoanApplicationFormData) => {
      try {
        // First, validate phone if provided
        if (data.phone_number) {
          const phoneValidationResult = validatePhone(data.phone_number);

          if (!phoneValidationResult.valid) {
            toast.error(phoneValidationResult.error || "Invalid phone number");
            return;
          }

          // Track successful phone validation
          if (
            phoneValidationResult.normalizedNumber &&
            phoneValidationResult.telco
          ) {
            trackLoanApplication.phoneNumberValid(
              phoneValidationResult.normalizedNumber,
              phoneValidationResult.telco,
            );
          }
        }

        // Check if terms are agreed
        if (data.agreeStatus !== "1") {
          toast.info(t("messages.agreeRequired"));
          showPhoneModal();
          return;
        }

        // Track form submission
        trackLoanApplication.submitApplication({ ...data, formId });

        // Show phone verification modal
        showPhoneModal();

        // In a real implementation, this would make an API call
        // For now, we'll simulate the flow
        console.log("Form submitted:", { data, formId });
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error(t("messages.submissionError"));
      }
    },
    [formId, t, validatePhone, showPhoneModal],
  );

  // Phone modal submission handler
  const handlePhoneSubmit = useCallback(
    async (phoneNumber: string) => {
      const validation = validatePhone(phoneNumber);

      if (!validation.valid) {
        toast.error(validation.error || "Invalid phone number");
        return false;
      }

      // Update form with validated phone number
      setValue("phone_number", validation.normalizedNumber || phoneNumber);

      // Show OTP modal
      showOtpModal();

      return true;
    },
    [validatePhone, setValue, showOtpModal],
  );

  // OTP success handler
  const handleOtpSuccess = useCallback(
    (otp: string) => {
      console.log("OTP verified successfully:", otp);
      toast.info(t("messages.otpSuccess"));
      hideOtpModal();

      // Track OTP verification
      trackLoanApplication.otpVerified?.();

      // Here you would proceed to the next step
      // For now, we'll just show a success message
      toast.success("Application submitted successfully!");
    },
    [t, hideOtpModal],
  );

  // OTP failure handler
  const handleOtpFailure = useCallback((error: string) => {
    console.error("OTP verification failed:", error);
    toast.error(error);

    // Track OTP failure
    trackLoanApplication.otpFailed?.(error);
  }, []);

  // OTP expired handler
  const handleOtpExpired = useCallback(() => {
    console.log("OTP expired");
    toast.error(t("messages.otpExpired"));
  }, [t]);

  // Get current form values
  const values = watch();

  return {
    // Form state
    form: control,
    errors,
    isSubmitting,
    isValid,
    isDirty,

    // Form actions
    handleSubmit,
    onSubmit,

    // Modal state
    modals: {
      phone: modals.phone,
      otp: modals.otp,
    },

    // Modal actions
    showPhoneModal,
    hidePhoneModal,
    showOtpModal,
    hideOtpModal,

    // Field value getters
    values,

    // Additional handlers for modals
    handlePhoneSubmit,
    handleOtpSuccess,
    handleOtpFailure,
    handleOtpExpired,
  };
}
