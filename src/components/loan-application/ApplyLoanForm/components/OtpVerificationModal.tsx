import type React from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { Modal, OtpContainer } from "@/components/ui";
import { MODAL_SIZE } from "../constants";
import type { OtpVerificationModalProps } from "../types";

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  open,
  onClose,
  phoneNumber,
  leadId,
  token,
  otpType = 2,
  onSuccess,
  onFailure,
  onExpired,
}) => {
  const { theme } = useFormTheme();

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      size="md"
    >
      <OtpContainer
        phoneNumber={phoneNumber}
        leadId={leadId}
        token={token}
        size={4}
        otpType={otpType as 1 | 2 | undefined}
        onSuccess={onSuccess}
        onFailure={onFailure}
        onExpired={onExpired}
      />
    </Modal>
  );
};
