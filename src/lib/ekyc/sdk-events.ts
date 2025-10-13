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
    const handler = (result: EkycResult) => {
      console.log("\n".repeat(3));
      console.log("⚡".repeat(50));
      console.log("📣 [EKYC CALLBACK] ĐƯỢC GỌI TỪ SDK!");
      console.log("⚡".repeat(50));
      console.log("[EKYC CALLBACK] Result:", result);
      console.log("[EKYC CALLBACK] Result type:", typeof result);
      console.log("[EKYC CALLBACK] Result code:", result?.code);
      console.log("⚡".repeat(50));

      if (result && result.code === 0) {
        console.log("[EKYC CALLBACK] Code = 0, gọi onSuccess");
        this.handlers.onSuccess?.(result.data);
        if (window.SDK && result.type_document !== undefined) {
          console.log("[EKYC CALLBACK] Gọi SDK.viewResult");
          window.SDK.viewResult(result.type_document, result);
        }
      } else {
        console.log("[EKYC CALLBACK] Code != 0, có lỗi:", result.message);
        const errorMessage = result.message || "An unknown error occurred.";
        this.handlers.onError?.(errorMessage);
      }

      console.log("[EKYC CALLBACK] Gọi onResult handler");
      this.handlers.onResult?.(result);

      console.log("⚡".repeat(50));
      console.log("🔚 [EKYC CALLBACK] KẾt thúc xử lý callback");
      console.log("⚡".repeat(50));
      console.log("\n".repeat(3));
    };

    console.log(
      "🔧 [EKYC] Creating callback handler. Handler type:",
      typeof handler,
    );
    console.log(
      "🔧 [EKYC] Handler function:",
      handler.toString().substring(0, 100),
    );

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

  private getCurrentConfig(): any {
    // This would need to be stored somewhere accessible
    // For now, we'll return null and handle it in the main manager
    return null;
  }
}
