/**
 * React Hook for eKYC SDK integration
 */

import { useEffect, useRef, useCallback } from "react";
import { EkycSdkManager, EkycSdkManagerOptions } from "@/lib/ekyc/sdk-manager";
import { EkycSdkConfig } from "@/lib/ekyc/sdk-config";
import { EkycEventHandlers } from "@/lib/ekyc/sdk-events";
import { useEkycStore } from "@/store/use-ekyc-store";

export interface UseEkycSdkOptions
  extends Omit<EkycSdkManagerOptions, "eventHandlers"> {
  autoStart?: boolean;
  customEventHandlers?: EkycEventHandlers;
}

export interface UseEkycSdkReturn {
  sdkManager: EkycSdkManager | null;
  isLoading: boolean;
  error: string | null;
  restart: () => void;
  updateConfig: (config: Partial<EkycSdkConfig>) => void;
  setFlowType: (
    flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT",
  ) => void;
  setDocumentType: (docType: number) => void;
  setLanguage: (language: "vi" | "en") => void;
}

export const useEkycSdk = (options: UseEkycSdkOptions): UseEkycSdkReturn => {
  const sdkManagerRef = useRef<EkycSdkManager | null>(null);
  const { start, setSuccess, setError, status } = useEkycStore();

  const { autoStart = true, customEventHandlers, ...managerOptions } = options;

  // Default event handlers that integrate with Zustand store
  const defaultEventHandlers: EkycEventHandlers = {
    onResult: (result) => {
      console.log("eKYC Result received:", result);
    },
    onFinish: (result) => {
      console.log("eKYC process finished:", result);
    },
    onSuccess: (data) => {
      setSuccess(data);
    },
    onError: (error) => {
      setError(error);
    },
  };

  // Merge custom handlers with defaults
  const eventHandlers = {
    ...defaultEventHandlers,
    ...customEventHandlers,
  };

  // Initialize SDK manager
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        console.log(
          "[useEkycSdk] Bắt đầu khởi tạo. Options nhận được:",
          options,
        );
        start(); // Set store status to running

        sdkManagerRef.current = new EkycSdkManager({
          ...managerOptions,
          eventHandlers,
        });

        if (autoStart) {
          console.log(
            "[useEkycSdk] Tự động bắt đầu: Gọi sdkManager.initialize với options:",
            managerOptions,
          );
          await sdkManagerRef.current.initialize(managerOptions);
        }
      } catch (error) {
        console.error("[useEkycSdk] Lỗi khi khởi tạo eKYC SDK:", error);
        console.log(
          "[useEkycSdk] Options khi xảy ra lỗi:",
          JSON.stringify(managerOptions),
        );
        setError(
          error instanceof Error ? error.message : "Failed to initialize SDK",
        );
      }
    };

    if (typeof window !== "undefined") {
      console.log(
        "[useEkycSdk] Môi trường window đã sẵn sàng, gọi initializeSDK.",
      );
      initializeSDK();
    }

    return () => {
      console.log("[useEkycSdk] Cleanup: Dọn dẹp EkycSdkManager.");
      sdkManagerRef.current?.cleanup();
    };
  }, [managerOptions.authToken, managerOptions.containerId]); // Only re-initialize if critical options change

  const restart = useCallback(() => {
    sdkManagerRef.current?.restart();
  }, []);

  const updateConfig = useCallback((config: Partial<EkycSdkConfig>) => {
    sdkManagerRef.current?.updateConfig(config);
  }, []);

  const setFlowType = useCallback(
    (
      flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT",
    ) => {
      sdkManagerRef.current?.setFlowType(flowType);
    },
    [],
  );

  const setDocumentType = useCallback((docType: number) => {
    sdkManagerRef.current?.setDocumentType(docType);
  }, []);

  const setLanguage = useCallback((language: "vi" | "en") => {
    sdkManagerRef.current?.setLanguage(language);
  }, []);

  return {
    sdkManager: sdkManagerRef.current,
    isLoading: status === "running",
    error: status === "error" ? useEkycStore.getState().error : null,
    restart,
    updateConfig,
    setFlowType,
    setDocumentType,
    setLanguage,
  };
};
