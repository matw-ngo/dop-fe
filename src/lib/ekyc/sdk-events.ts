/**
 * SDK Event Handlers - Manages callbacks and events for VNPT eKYC SDK
 */

import type { EkycSdkConfig } from "./sdk-config";

export interface EkycResult {
  code: number;
  data?: unknown;
  type_document?: number;
  message?: string;
}

export interface EkycEventHandlers {
  onResult?: (result: EkycResult) => void;
  onFinish?: (result: EkycResult) => void;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export class EkycEventManager {
  private handlers: EkycEventHandlers = {};
  private currentConfig: EkycSdkConfig | null = null;

  constructor(handlers: EkycEventHandlers = {}) {
    this.handlers = handlers;
  }

  setHandlers(handlers: Partial<EkycEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  setCurrentConfig(config: EkycSdkConfig): void {
    this.currentConfig = config;
  }

  getCurrentConfig(): EkycSdkConfig | null {
    return this.currentConfig;
  }

  getResultHandler() {
    const handler = (result: EkycResult) => {
      console.log("\n".repeat(3));
      console.log("⚡".repeat(20));
      console.log("[EKYC CALLBACK] Result:", result);
      console.log("⚡".repeat(20));

      if (result) {
        this.handlers.onSuccess?.(result);
        // if (window.SDK && result.type_document !== undefined) {
        //   window.SDK.viewResult(result.type_document, result);
        // }
      } else {
        this.handlers.onError?.("An unknown error occurred.");
      }

      this.handlers.onResult?.(result);

      console.log("⚡".repeat(20));
      console.log(
        "🔚 [EKYC CALLBACK] ================== END CALLBACK ==================",
      );
      console.log("⚡".repeat(20));
      console.log("\n".repeat(3));
    };

    return handler;
  }

  getFinishHandler() {
    return (result: EkycResult) => {
      console.log("eKYC finish data", result);

      this.handlers.onFinish?.(result);

      // Handle the two-step process (document + face)
      this.handleTwoStepProcess(result);
    };
  }

  private handleTwoStepProcess(result: EkycResult): void {
    const vnptEkycElement = document.getElementById("vnpt_ekyc");

    if (vnptEkycElement?.parentNode && result.type_document !== undefined) {
      vnptEkycElement.parentNode.removeChild(vnptEkycElement);

      // Get the current configuration and modify it for face capture
      const currentConfig = this.getCurrentConfig();
      if (currentConfig) {
        const faceConfig = {
          ...currentConfig,
          SDK_FLOW: "FACE" as const,
          DOCUMENT_TYPE_START: result.type_document,
        };

        window.SDK.launch(faceConfig);
      }
    }
  }
}
