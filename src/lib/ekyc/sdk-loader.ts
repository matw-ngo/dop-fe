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

  async loadSdk(
    assets: SdkAssets = {
      cssPath: "/ekyc/web-sdk-2.1.4.6.css",
      jsPath: "/ekyc/web-sdk-3.0.js",
    },
  ): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._performLoad(assets);
    return this.loadPromise;
  }

  private async _performLoad(assets: SdkAssets): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load CSS
      const styles = document.createElement("link");
      styles.id = "vnpt_ekyc_styles";
      styles.rel = "stylesheet";
      styles.href = assets.cssPath;
      document.head.appendChild(styles);

      // Load JS
      const sdkScript = document.createElement("script");
      sdkScript.id = "vnpt_ekyc_sdk";
      sdkScript.src = assets.jsPath;
      sdkScript.async = true;

      sdkScript.onload = async () => {
        try {
          if (!window.FaceVNPTBrowserSDK || !window.ekycsdk) {
            throw new Error("VNPT eKYC SDK not found on window object.");
          }

          await window.FaceVNPTBrowserSDK.init();
          this.isLoaded = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      sdkScript.onerror = () => {
        reject(new Error("Failed to load VNPT eKYC SDK"));
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
