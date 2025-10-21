/**
 * SDK Loader - Handles loading of VNPT eKYC SDK assets
 */

export interface SdkAssets {
  cssPath: string;
  jsPath: string;
  qrPath?: string; // Optional: VNPTQRBrowserApp.js
  browserSdkPath?: string; // Optional: VNPTBrowserSDKAppV4.0.0.js
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
    // console.log("[EKYC Loader] Nhận được yêu cầu tải SDK với assets:", assets);
    const effectiveAssets = assets || {
      cssPath: "", // BUG FIX: CSS causes Lottie oval animation to fail
      jsPath: "/web-sdk-version-3.2.0.0.js",
      qrPath: "/lib/VNPTQRBrowserApp.js",
      browserSdkPath: "/lib/VNPTBrowserSDKAppV4.0.0.js",
    };
    // console.log("[EKYC Loader] Assets sẽ được sử dụng:", effectiveAssets);

    if (this.isLoaded) {
      // console.log("[EKYC Loader] SDK đã được tải trước đó. Bỏ qua.");
      return Promise.resolve();
    }

    if (this.loadPromise) {
      // console.log(
      //   "[EKYC Loader] SDK đang trong quá trình tải. Chờ hoàn thành...",
      // );
      return this.loadPromise;
    }

    // console.log("[EKYC Loader] Bắt đầu quá trình tải mới.");
    this.loadPromise = this._performLoad(effectiveAssets);
    return this.loadPromise;
  }

  private async _performLoad(assets: SdkAssets): Promise<void> {
    return new Promise((resolve, reject) => {
      // console.log(`[EKYC Loader] Bắt đầu tải CSS từ: ${assets.cssPath}`);

      // Load CSS (skip if empty path)
      if (assets.cssPath) {
        const styles = document.createElement("link");
        styles.id = "vnpt_ekyc_styles";
        styles.rel = "stylesheet";
        styles.href = assets.cssPath;
        styles.onload = () => {
          // console.log("[EKYC Loader] Tải CSS thành công.");
        };
        styles.onerror = () => {
          // console.error(`[EKYC Loader] Lỗi khi tải CSS từ: ${assets.cssPath}`);
          // We don't reject here, maybe it's not critical
        };
        document.head.appendChild(styles);
      } else {
        console.log("[EKYC Loader] ⚠️ Skipping CSS loading (empty path)");
      }

      // Helper function to load a script
      const loadScript = (src: string, id: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.id = id;
          script.src = src;
          script.defer = true;
          script.onload = () => {
            // console.log(`[EKYC Loader] ✅ Loaded: ${src}`);
            resolve();
          };
          script.onerror = () => {
            console.error(`[EKYC Loader] ❌ Failed to load: ${src}`);
            reject(new Error(`Failed to load ${src}`));
          };
          document.head.appendChild(script);
        });
      };

      // Load all scripts in order
      const loadAllScripts = async () => {
        try {
          // 1. Load main SDK
          // console.log(
          //   `[EKYC Loader] Bắt đầu tải main SDK từ: ${assets.jsPath}`,
          // );
          await loadScript(assets.jsPath, "vnpt_ekyc_sdk");

          // 2. Load QR library (if provided)
          if (assets.qrPath) {
            // console.log(
            //   `[EKYC Loader] Bắt đầu tải QR library từ: ${assets.qrPath}`,
            // );
            await loadScript(assets.qrPath, "vnpt_qr_library");
          }

          // 3. Load Browser SDK (if provided)
          if (assets.browserSdkPath) {
            // console.log(
            //   `[EKYC Loader] Bắt đầu tải Browser SDK từ: ${assets.browserSdkPath}`,
            // );
            await loadScript(assets.browserSdkPath, "vnpt_browser_sdk");
          }

          // Verify window.SDK exists
          if (!window.SDK) {
            throw new Error(
              "VNPT eKYC SDK không tìm thấy trên window object sau khi tải script.",
            );
          }

          console.log("[EKYC Loader] ✅ Tất cả scripts đã tải thành công!");
          this.isLoaded = true;
          resolve();
        } catch (error) {
          console.error("[EKYC Loader] Lỗi trong quá trình tải:", error);
          reject(error);
        }
      };

      loadAllScripts();
    });
  }

  cleanup(): void {
    // Remove all SDK-related scripts and styles
    document.getElementById("vnpt_ekyc_sdk")?.remove();
    document.getElementById("vnpt_qr_library")?.remove();
    document.getElementById("vnpt_browser_sdk")?.remove();
    document.getElementById("vnpt_ekyc_styles")?.remove();
    this.isLoaded = false;
    this.loadPromise = null;
  }

  get loaded(): boolean {
    return this.isLoaded;
  }
}
