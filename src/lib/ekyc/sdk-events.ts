/**
 * SDK Event Handlers - Manages callbacks and events for VNPT eKYC SDK
 */

export interface EkycResult {
  code: number;
  data?: any;
  type_document?: number;
  message?: string;
}

export interface EkycEventHandlers {
  onResult?: (result: EkycResult) => void;
  onFinish?: (result: EkycResult) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export class EkycEventManager {
  private handlers: EkycEventHandlers = {};

  constructor(handlers: EkycEventHandlers = {}) {
    this.handlers = handlers;
  }

  setHandlers(handlers: Partial<EkycEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  getResultHandler() {
    return (result: EkycResult) => {
      console.log("eKYC Result:", result);

      if (result && result.code === 0) {
        this.handlers.onSuccess?.(result.data);
        if (window.SDK && result.type_document !== undefined) {
          window.SDK.viewResult(result.type_document, result);
        }
      } else {
        const errorMessage = result.message || "An unknown error occurred.";
        this.handlers.onError?.(errorMessage);
      }

      this.handlers.onResult?.(result);
    };
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

  private getCurrentConfig(): any {
    // This would need to be stored somewhere accessible
    // For now, we'll return null and handle it in the main manager
    return null;
  }
}
