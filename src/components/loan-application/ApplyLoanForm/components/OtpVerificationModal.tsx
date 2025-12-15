import type React from "react";
import { Modal, OtpContainer } from "@/components/ui";
import { MODAL_SIZE } from "../constants";
import type { OtpVerificationModalProps } from "../types";

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  open,
  onClose,
  phoneNumber,
  onSuccess,
  onFailure,
  onExpired,
  size = MODAL_SIZE.OTP,
}) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      size={size}
    >
      <OtpContainer
        phoneNumber={phoneNumber}
        size={4}
        otpType={2} // SMS OTP
        onSuccess={onSuccess}
        onFailure={onFailure}
        onExpired={onExpired}
      />
    </Modal>
  );
};
