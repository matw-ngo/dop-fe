import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { Button, Modal, TextInput } from "@/components/ui";
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
  const { theme } = useFormTheme();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhoneNumber("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    // Clear previous error
    setError(null);

    // Validate phone number is not empty
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      setError(t("errors.phoneRequired"));
      return;
    }

    // Basic format validation (numbers only, reasonable length)
    if (!/^\d{9,11}$/.test(trimmedPhone)) {
      setError(t("errors.phoneInvalid"));
      return;
    }

    // Call parent handler
    onVerify(trimmedPhone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
      size="lg"
    >
      <div className="p-2">
        <h3
          className="text-center text-2xl font-bold leading-8 mb-3"
          style={{ color: theme.colors.primary }}
        >
          {title || t("otp.title")}
        </h3>
        <p
          className="text-center text-sm font-normal leading-6 mb-4"
          style={{ color: theme.colors.textSecondary }}
        >
          {description || t("otp.description")}
        </p>
        <div className="mb-4">
          <TextInput
            placeholder={t("otp.placeholder")}
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="text-lg"
            disabled={isSubmitting}
            error={!!error}
            errorMessage={error || undefined}
          />
        </div>
        <div>
          <Button
            className="mx-auto block rounded-lg font-semibold w-full h-14 text-white"
            style={{ backgroundColor: theme.colors.primary }}
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !phoneNumber.trim()}
          >
            {t("otp.continue")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
