/**
 * SDK Loader - Handles loading of VNPT eKYC SDK assets
 */

export interface SdkAssets {
  cssPath: string;
  jsPath: string;
}

export class EkycSdkLoader {
  private static instance: EkycSdkLoader;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): EkycSdkLoader {
    if (!EkycSdkLoader.instance) {
      EkycSdkLoader.instance = new EkycSdkLoader();
    }
    return EkycSdkLoader.instance;
  }

  async loadSdk(assets?: SdkAssets): Promise<void> {
    console.log("[EKYC Loader] Nhận được yêu cầu tải SDK với assets:", assets);
    const effectiveAssets = assets || {
      cssPath: "/ekyc/web-sdk-2.1.4.6.css",
      jsPath: "/ekyc/web-sdk-version-3.2.0.0.js",
    };
    console.log("[EKYC Loader] Assets sẽ được sử dụng:", effectiveAssets);

    if (this.isLoaded) {
      console.log("[EKYC Loader] SDK đã được tải trước đó. Bỏ qua.");
      return Promise.resolve();
    }

    if (this.loadPromise) {
      console.log(
        "[EKYC Loader] SDK đang trong quá trình tải. Chờ hoàn thành...",
      );
      return this.loadPromise;
    }

    console.log("[EKYC Loader] Bắt đầu quá trình tải mới.");
    this.loadPromise = this._performLoad(effectiveAssets);
    return this.loadPromise;
  }

  private async _performLoad(assets: SdkAssets): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[EKYC Loader] Bắt đầu tải CSS từ: ${assets.cssPath}`);
      // Load CSS
      const styles = document.createElement("link");
      styles.id = "vnpt_ekyc_styles";
      styles.rel = "stylesheet";
      styles.href = assets.cssPath;
      styles.onload = () => {
        console.log("[EKYC Loader] Tải CSS thành công.");
      };
      styles.onerror = () => {
        console.error(`[EKYC Loader] Lỗi khi tải CSS từ: ${assets.cssPath}`);
        // We don't reject here, maybe it's not critical
      };
      document.head.appendChild(styles);

      console.log(`[EKYC Loader] Bắt đầu tải JS SDK từ: ${assets.jsPath}`);
      // Load JS
      const sdkScript = document.createElement("script");
      sdkScript.id = "vnpt_ekyc_sdk";
      sdkScript.src = assets.jsPath;
      sdkScript.async = true;

      sdkScript.onload = async () => {
        console.log("[EKYC Loader] Tải file JS SDK thành công.");
        try {
          if (!window.FaceVNPTBrowserSDK || !window.SDK) {
            const errorMessage =
              "VNPT eKYC SDK không tìm thấy trên window object sau khi tải script.";
            console.error(`[EKYC Loader] Lỗi: ${errorMessage}`);
            reject(new Error(errorMessage));
            return;
          }

          console.log(
            "[EKYC Loader] Bắt đầu khởi tạo FaceVNPTBrowserSDK (window.FaceVNPTBrowserSDK.init)...",
          );
          await window.FaceVNPTBrowserSDK.init();
          console.log("[EKYC Loader] Khởi tạo FaceVNPTBrowserSDK thành công.");

          this.isLoaded = true;
          resolve();
        } catch (error) {
          console.error(
            "[EKYC Loader] Lỗi trong quá trình khởi tạo FaceVNPTBrowserSDK:",
            error,
          );
          reject(error);
        }
      };

      sdkScript.onerror = () => {
        const errorMessage = `Lỗi khi tải file JS SDK từ: ${assets.jsPath}`;
        console.error(`[EKYC Loader] ${errorMessage}`);
        reject(new Error(errorMessage));
      };

      document.head.appendChild(sdkScript);
    });
  }

  cleanup(): void {
    document.getElementById("vnpt_ekyc_sdk")?.remove();
    document.getElementById("vnpt_ekyc_styles")?.remove();
    this.isLoaded = false;
    this.loadPromise = null;
  }

  get loaded(): boolean {
    return this.isLoaded;
  }
}
