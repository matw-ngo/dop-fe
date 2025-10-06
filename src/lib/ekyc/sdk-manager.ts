/**
 * SDK Manager - Main orchestrator for VNPT eKYC SDK integration
 */

import { EkycSdkLoader, SdkAssets } from "./sdk-loader";
import { EkycSdkConfig, createDefaultEkycConfig } from "./sdk-config";
import { EkycEventManager, EkycEventHandlers, EkycResult } from "./sdk-events";
import { EkycConfigManager } from "./config-manager";

// Extend global window interface
declare global {
  interface Window {
    FaceVNPTBrowserSDK: {
      init: () => Promise<void>;
    };
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
  credentialsSource?:
    | "env"
    | "api"
    | {
        BACKEND_URL: string;
        TOKEN_KEY: string;
        TOKEN_ID: string;
        AUTHORIZION: string;
      };
}

export class EkycSdkManager {
  private loader: EkycSdkLoader;
  private eventManager: EkycEventManager;
  private configManager: EkycConfigManager;
  private config: EkycSdkConfig;
  private containerId: string;
  private isInitialized = false;

  constructor(options: EkycSdkManagerOptions) {
    this.loader = EkycSdkLoader.getInstance();
    this.eventManager = new EkycEventManager(options.eventHandlers);
    this.configManager = EkycConfigManager.getInstance();
    this.containerId = options.containerId || "ekyc_sdk_intergrated";

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
              AUTHORIZION: options.authToken,
            }
          : "env");

      console.log(
        "[EKYC] Bước 1: Khởi tạo Config Manager với nguồn:",
        credentialsSource,
      );
      await this.configManager.initialize(credentialsSource);
      console.log("[EKYC] Hoàn thành: Khởi tạo Config Manager.");

      // Create configuration using credentials from config manager
      console.log("[EKYC] Bước 2: Tạo cấu hình SDK...");
      const credentials = this.configManager.getCredentials();
      const baseConfig = createDefaultEkycConfig(credentials.AUTHORIZION);

      this.config = {
        ...baseConfig,
        BACKEND_URL: credentials.BACKEND_URL,
        TOKEN_KEY: credentials.TOKEN_KEY,
        TOKEN_ID: credentials.TOKEN_ID,
        AUTHORIZION: credentials.AUTHORIZION,
        ...options.config,
        PARRENT_ID: this.containerId,
      };
      console.log(
        "[EKYC] Hoàn thành: Tạo cấu hình SDK. Cấu hình:",
        this.config,
      );

      // Load SDK assets
      console.log("[EKYC] Bước 3: Tải assets của SDK. Assets:", options.assets);
      await this.loader.loadSdk(options.assets);
      console.log("[EKYC] Hoàn thành: Tải assets của SDK.");

      // Initialize SDK with configuration
      console.log("[EKYC] Bước 4: Khởi tạo SDK với cấu hình (SDK.launch).");
      await this.initializeSdk();
      console.log("[EKYC] Hoàn thành: Khởi tạo SDK.");

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
    (this.eventManager as any).getCurrentConfig = () => this.config;

    const resultHandler = this.eventManager.getResultHandler();
    const finishHandler = this.eventManager.getFinishHandler();

    window.SDK.launch(this.config);
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

  setFlowType(flowType: "DOCUMENT" | "FACE"): void {
    this.updateConfig({ FLOW_TYPE: flowType });
  }

  setDocumentType(docType: number): void {
    this.updateConfig({ TYPE_DOCUMENT: docType });
  }

  setLanguage(language: "vi" | "en"): void {
    this.updateConfig({ LANGUAGE: language });
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
