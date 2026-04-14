"use client";

import { memo, useCallback, useMemo } from "react";
import {
  useConsentModalConfig,
  useConsentModalIsOpen,
  useConsentStore,
} from "@/store/use-consent-store";
import { ConsentModal } from "./ConsentModal";

/**
 * ConsentGlobalProvider
 *
 * Mounts a single ConsentModal instance at the app level.
 * Trigger from anywhere via: useConsentStore(s => s.openConsentModal)
 *
 * Re-render safety:
 * - Uses 3 granular selectors (modalIsOpen, modalConfig, closeConsentModal)
 * - Each selector is independent — store's consent data updates do NOT cause re-renders here
 * - memo() prevents parent re-renders from propagating
 * - useCallback/useMemo keep prop references stable for ConsentModal's own memo
 */
function ConsentGlobalProviderInner() {
  const modalIsOpen = useConsentModalIsOpen();
  const modalConfig = useConsentModalConfig();
  const closeConsentModal = useConsentStore((s) => s.closeConsentModal);

  const handleSetOpen = useCallback(
    (open: boolean) => {
      if (!open) closeConsentModal();
    },
    [closeConsentModal],
  );

  const handleSuccess = useCallback(
    (consentId: string) => {
      modalConfig?.onSuccess?.(consentId);
      closeConsentModal();
    },
    [modalConfig, closeConsentModal],
  );

  const stepData = useMemo(
    () =>
      modalConfig
        ? { consent_purpose_id: modalConfig.consentPurposeId }
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalConfig?.consentPurposeId],
  );

  return (
    <ConsentModal
      open={modalIsOpen}
      setOpen={handleSetOpen}
      onSuccess={handleSuccess}
      stepData={stepData}
    />
  );
}

export const ConsentGlobalProvider = memo(ConsentGlobalProviderInner);
