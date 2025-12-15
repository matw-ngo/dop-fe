import { useCallback, useMemo, useState } from "react";

export interface ModalState {
  phone: boolean;
  otp: boolean;
}

export interface ModalActions {
  showPhoneModal: () => void;
  hidePhoneModal: () => void;
  showOtpModal: () => void;
  hideOtpModal: () => void;
  hideAllModals: () => void;
}

export function useModal(
  initialState: ModalState = { phone: false, otp: false },
): {
  modals: ModalState;
  actions: ModalActions;
} {
  const [modals, setModals] = useState<ModalState>(initialState);

  const showPhoneModal = useCallback(() => {
    setModals((prev) => ({ ...prev, phone: true, otp: false }));
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

  const hideAllModals = useCallback(() => {
    setModals({ phone: false, otp: false });
  }, []);

  const actions: ModalActions = useMemo(
    () => ({
      showPhoneModal,
      hidePhoneModal,
      showOtpModal,
      hideOtpModal,
      hideAllModals,
    }),
    [showPhoneModal, hidePhoneModal, showOtpModal, hideOtpModal, hideAllModals],
  );

  return {
    modals,
    actions,
  };
}
