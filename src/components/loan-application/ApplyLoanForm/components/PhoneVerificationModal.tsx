import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { Button, Modal, TextInput } from "@/components/ui";
import { MODAL_SIZE } from "../constants";
import type { PhoneVerificationModalProps } from "../types";

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  open,
  onClose,
  onVerify,
  title,
  description,
  isSubmitting = false,
}) => {
  const t = useTranslations("features.loan-application");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleVerify = () => {
    if (!phoneNumber.trim()) {
      setValidationError(t("errors.phoneRequired"));
      return;
    }

    // Basic validation - in a real app, this would be more robust
    if (!/^0[0-9]{9}$/.test(phoneNumber)) {
      setValidationError(t("errors.phoneInvalid"));
      return;
    }

    // Clear any existing errors
    setValidationError("");

    // Call the verify handler
    onVerify(phoneNumber);
  };

  const isDisabled = isSubmitting || !!validationError;

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);

    // Real-time validation
    if (value.trim() && !/^0[0-9]{9}$/.test(value)) {
      setValidationError(t("errors.phoneInvalid"));
    } else {
      setValidationError("");
    }
  };

  const handleClose = () => {
    // Reset state on close
    setPhoneNumber("");
    setValidationError("");
    onClose();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPhoneNumber("");
      setValidationError("");
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      size={MODAL_SIZE.PHONE}
    >
      <div className="font-['Lexend_Deca']">
        <p className="text-center text-2xl font-bold leading-8 mb-3">
          {title || t("otp.title")}
        </p>
        <p className="text-center text-sm font-normal leading-6 mb-4">
          {description || t("otp.description")}
        </p>
        <div>
          <TextInput
            placeholder={t("otp.placeholder")}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={!!validationError}
            errorMessage={validationError}
            disabled={isSubmitting}
          />
        </div>
        <div className="mt-6">
          <Button
            className="mx-auto block rounded-lg font-semibold md:text-sm w-full bg-primary"
            onClick={handleVerify}
            loading={isSubmitting}
            disabled={isDisabled}
          >
            {t("otp.continue")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
