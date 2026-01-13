/**
 * SDK Manager - Main orchestrator for VNPT eKYC SDK integration
 */

import { EkycConfigManager } from "./config-manager";
import { createDefaultEkycConfig, type EkycSdkConfig } from "./sdk-config";
import {
  type EkycEventHandlers,
  EkycEventManager,
  EkycResult,
} from "./sdk-events";
import { EkycSdkLoader, type SdkAssets } from "./sdk-loader";

// Extend global window interface
declare global {
  interface Window {
    SDK: {
      viewResult: (typeDocument: any, result: any) => void;
      launch: (config: any) => void;
    };
  }
}

export interface EkycSdkManagerOptions {
  authToken?: string; // Made optional, will be loaded from config manager
  containerId?: string;
  config?: Partial<EkycSdkConfig>;
  assets?: SdkAssets;
  eventHandlers?: EkycEventHandlers;
  leadId?: string; // Optional lead ID for backend submission
  onComplete?: (result: EkycResult, leadId?: string) => void; // Callback when eKYC flow completes
  credentialsSource?:
    | "env"
    | "api"
    | {
        BACKEND_URL: string;
        TOKEN_KEY: string;
        TOKEN_ID: string;
        ACCESS_TOKEN: string;
      };
}

export class EkycSdkManager {
  private loader: EkycSdkLoader;
  private eventManager: EkycEventManager;
  private configManager: EkycConfigManager;
  private config: EkycSdkConfig;
  private containerId: string;
  private isInitialized = false;
  private leadId?: string;
  private onComplete?: (result: EkycResult, leadId?: string) => void;

  constructor(options: EkycSdkManagerOptions) {
    this.loader = EkycSdkLoader.getInstance();
    this.eventManager = new EkycEventManager(options.eventHandlers);
    this.configManager = EkycConfigManager.getInstance();
    this.containerId = options.containerId || "ekyc_sdk_intergrated";
    this.leadId = options.leadId;
    this.onComplete = options.onComplete;

    // Will be set during initialize()
    this.config = {} as EkycSdkConfig;
  }

  async initialize(
    options: EkycSdkManagerOptions & { assets?: SdkAssets } = {},
  ): Promise<void> {
    try {
      console.log("--- [EKYC] Bắt đầu quá trình initialize ---");
      // Initialize config manager with credentials
      const credentialsSource =
        options.credentialsSource ||
        (options.authToken
          ? {
              BACKEND_URL: "",
              TOKEN_KEY: "+==",
              TOKEN_ID: "b85b",
              ACCESS_TOKEN: options.authToken,
            }
          : "env");

      console.log(
        "[EKYC] Bước 1: Khởi tạo Config Manager với nguồn:",
        credentialsSource,
      );
      await this.configManager.initialize(credentialsSource);
      // console.log("[EKYC] Hoàn thành: Khởi tạo Config Manager.");

      // Create configuration using credentials from config manager
      // console.log("[EKYC] Bước 2: Tạo cấu hình SDK...");
      const credentials = this.configManager.getCredentials();

      const callbackFn = this.eventManager.getResultHandler();

      const baseConfig = createDefaultEkycConfig(
        credentials.ACCESS_TOKEN,
        callbackFn,
      );

      this.config = {
        ...baseConfig,
        BACKEND_URL: credentials.BACKEND_URL,
        TOKEN_KEY: credentials.TOKEN_KEY,
        TOKEN_ID: credentials.TOKEN_ID,
        ACCESS_TOKEN: credentials.ACCESS_TOKEN,
        ...options.config,
        // Use END_FLOW callback as main callback
        CALL_BACK_END_FLOW: async (result: any) => {
          console.log("🏁".repeat(20));
          console.log("🔚 [END FLOW CALLBACK] Flow kết thúc - Callback chính!");
          console.log("🏁".repeat(20));
          console.log("[END FLOW CALLBACK] Result:", result);
          console.log("[END FLOW CALLBACK] Lead ID:", this.leadId);
          console.log("🏁".repeat(20));

          // Call the original callback
          if (callbackFn) {
            callbackFn(result);
          }

          // Call custom onComplete callback with leadId
          if (this.onComplete) {
            this.onComplete(result, this.leadId);
          }
        },
      };
      // console.log(
      //   "[EKYC] Hoàn thành: Tạo cấu hình SDK. Cấu hình:",
      //   this.config,
      // );

      // Load SDK assets
      // console.log("[EKYC] Bước 3: Tải assets của SDK. Assets:", options.assets);
      await this.loader.loadSdk(options.assets);
      // console.log("[EKYC] Hoàn thành: Tải assets của SDK.");

      // Initialize SDK with configuration
      // console.log("[EKYC] Bước 4: Khởi tạo SDK với cấu hình (SDK.launch).");
      await this.initializeSdk();
      // console.log("[EKYC] Hoàn thành: Khởi tạo SDK.");

      this.isInitialized = true;
      console.log("--- [EKYC] Quá trình initialize hoàn tất thành công ---");
    } catch (error) {
      console.error("--- [EKYC] LỖI trong quá trình initialize ---", error);
      throw error;
    }
  }

  private async initializeSdk(): Promise<void> {
    if (!window.SDK) {
      throw new Error("eKYC SDK not available on window object");
    }

    // Store config reference for event handlers
    this.eventManager.setCurrentConfig(this.config);

    window.SDK.launch(this.config);
    // console.log("✅ [EKYC] SDK.launch() completed");
  }

  updateConfig(newConfig: Partial<EkycSdkConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.isInitialized) {
      // Reinitialize with new config
      this.initializeSdk().catch(console.error);
    }
  }

  updateEventHandlers(handlers: Partial<EkycEventHandlers>): void {
    this.eventManager.setHandlers(handlers);
  }

  setFlowType(
    flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT",
  ): void {
    this.updateConfig({ SDK_FLOW: flowType });
  }

  setDocumentType(docType: number): void {
    this.updateConfig({ DOCUMENT_TYPE_START: docType });
  }

  setLanguage(language: "vi" | "en"): void {
    this.updateConfig({ DEFAULT_LANGUAGE: language });
  }

  restart(): void {
    if (this.isInitialized) {
      this.initializeSdk().catch(console.error);
    }
  }

  cleanup(): void {
    this.loader.cleanup();
    this.isInitialized = false;

    // Remove any SDK-created elements
    const vnptEkycElement = document.getElementById("vnpt_ekyc");
    vnptEkycElement?.remove();
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  get currentConfig(): EkycSdkConfig {
    return { ...this.config };
  }
}
