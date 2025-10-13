/**
 * SDK Configuration - Centralized configuration for VNPT eKYC SDK
 */

import { DocumentType } from "./types";

export interface EkycSdkConfig {
  // Required credentials
  BACKEND_URL: string;
  TOKEN_KEY: string;
  TOKEN_ID: string;
  ACCESS_TOKEN: string;

  // Core flow settings
  SDK_FLOW?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT";
  USE_METHOD?: "PHOTO" | "UPLOAD"; // KHÔNG truyền = BOTH (cả 2), chỉ set khi muốn giới hạn
  DEFAULT_LANGUAGE?: "vi" | "en";

  // Document settings
  LIST_TYPE_DOCUMENT?: number[];
  DOCUMENT_TYPE_START?: DocumentType | number;

  // API enablement flags
  ENABLE_API_LIVENESS_DOCUMENT?: boolean;
  ENABLE_API_LIVENESS_FACE?: boolean;
  ENABLE_API_MASKED_FACE?: boolean;
  ENABLE_API_COMPARE_FACE?: boolean;
  ENABLE_GGCAPCHAR?: boolean;

  // UI settings
  HAS_RESULT_SCREEN?: boolean;
  SHOW_HELP?: boolean;
  SHOW_TRADEMARK?: boolean;
  SHOW_STEP?: boolean;
  HAS_QR_SCAN?: boolean;
  DOUBLE_LIVENESS?: boolean;

  // Result screen tabs (theo tài liệu mục 29-31)
  SHOW_TAB_RESULT_INFORMATION?: boolean;
  SHOW_TAB_RESULT_VALIDATION?: boolean;
  SHOW_TAB_RESULT_QRCODE?: boolean;

  // Image settings (mục 36)
  MAX_SIZE_IMAGE?: number; // MB

  // Optional settings
  CHALLENGE_CODE?: string;
  FAKE_CAM_LABEL?: string;
  CUSTOM_THEME?: {
    PRIMARY_COLOR?: string;
    TEXT_COLOR_DEFAULT?: string;
    BACKGROUND_COLOR?: string;
  };

  // Callbacks
  CALL_BACK_DOCUMENT_RESULT?: (result: any) => void | Promise<void>;
  CALL_BACK_END_FLOW?: (result: any) => void | Promise<void>; // Called when flow ends (replaces CALL_BACK)

  // Styling (optional)
  LIST_CHOOSE_STYLE?: ListChooseStyle;
  CAPTURE_IMAGE_STYLE?: CaptureImageStyle;
  RESULT_DEFAULT_STYLE?: ResultDefaultStyle;
  MOBILE_STYLE?: MobileStyle;
}

export interface ListChooseStyle {
  background: string;
  text_color: string;
  border_item: string;
  item_active_color: string;
  background_icon: string;
  id_icon: string;
  passport_icon: string;
  drivecard_icon: string;
  army_id_icon: string;
  id_chip_icon: string;
  start_button_background: string;
  start_button_color: string;
}

export interface CaptureImageStyle {
  popup1_box_shadow: string;
  popup1_title_color: string;
  description1_color: string;
  capture_btn_background: string;
  capture_btn_color: string;
  capture_btn_icon: string;
  tutorial_btn_icon: string;
  recapture_btn_background: string;
  recapture_btn_color: string;
  recapture_btn_border: string;
  recapture_btn_icon: string;
  nextstep_btn_background: string;
  nextstep_btn_color: string;
  nextstep_btn_icon: string;
  popup2_box_shadow: string;
  popup2_title_header_color: string;
  popup2_icon_header: string;
  popup2_icon_warning1: string;
  popup2_icon_warning2: string;
  popup2_icon_warning3: string;
}

export interface ResultDefaultStyle {
  redemo_btn_background: string;
  redemo_btn_icon: string;
  redemo_btn_color: string;
}

export interface MobileStyle {
  mobile_capture_btn: string;
  mobile_capture_desc_color: string;
  mobile_tutorial_color: string;
  mobile_recapture_btn_background: string;
  mobile_recapture_btn_border: string;
  mobile_recapture_btn_icon: string;
  mobile_recapture_btn_color: string;
  mobile_nextstep_btn_background: string;
  mobile_nextstep_btn_color: string;
  mobile_nextstep_btn_icon: string;
  mobile_popup2_icon_header: string;
}

export class EkycConfigBuilder {
  private config: Partial<EkycSdkConfig> = {};

  constructor(
    authToken: string,
    credentials?: {
      BACKEND_URL?: string;
      TOKEN_KEY?: string;
      TOKEN_ID?: string;
    },
    callbackFn?: (result: any) => void,
  ) {
    const defaultCallback = (result: any) => {
      console.log("[EKYC Default Callback] Kết quả:", result);
    };

    this.config = {
      // Required credentials
      BACKEND_URL: credentials?.BACKEND_URL || "https://api.idg.vnpt.vn",
      TOKEN_KEY: credentials?.TOKEN_KEY || "+==",
      TOKEN_ID: credentials?.TOKEN_ID || "b85b",
      ACCESS_TOKEN: authToken,

      // Core flow settings
      SDK_FLOW: "DOCUMENT_TO_FACE",
      // USE_METHOD: undefined = cho phép cả PHOTO và UPLOAD (BOTH)
      // Chỉ set khi muốn giới hạn 1 trong 2
      DEFAULT_LANGUAGE: "vi",

      // Document settings
      LIST_TYPE_DOCUMENT: [-1, 5, 6, 7, 9],
      DOCUMENT_TYPE_START: 999, // 999 để hiển thị danh sách chọn document

      // API enablement flags
      ENABLE_API_LIVENESS_DOCUMENT: true,
      ENABLE_API_LIVENESS_FACE: true,
      ENABLE_API_MASKED_FACE: true,
      ENABLE_API_COMPARE_FACE: true,
      ENABLE_GGCAPCHAR: true,

      // UI settings
      HAS_RESULT_SCREEN: true,
      SHOW_HELP: true,
      SHOW_TRADEMARK: false,
      SHOW_STEP: true,
      HAS_QR_SCAN: false,
      DOUBLE_LIVENESS: false,

      // Result screen tabs (theo tài liệu)
      SHOW_TAB_RESULT_INFORMATION: true,
      SHOW_TAB_RESULT_VALIDATION: true,
      SHOW_TAB_RESULT_QRCODE: true,

      // Image settings
      MAX_SIZE_IMAGE: 1, // MB

      // Document callback (field 21 in docs) - for intermediate results
      CALL_BACK_DOCUMENT_RESULT: async (result: any) => {
        console.log("📤".repeat(50));
        console.log("📄 [DOCUMENT CALLBACK] Nhận kết quả document step!");
        console.log("📤".repeat(50));
        console.log("[DOCUMENT CALLBACK] Result:", result);
        console.log("📤".repeat(50));
      },

      // End flow callback - called when user finishes or cancels (MAIN CALLBACK)
      CALL_BACK_END_FLOW: async (result: any) => {
        console.log("🏁".repeat(50));
        console.log(
          "🔚 [END FLOW CALLBACK] Flow kết thúc - Đây là callback chính!",
        );
        console.log("🏁".repeat(50));
        console.log("[END FLOW CALLBACK] Result:", result);
        console.log("[END FLOW CALLBACK] Type:", typeof result);
        console.log("🏁".repeat(50));

        // Forward to user callback if provided
        if (callbackFn) {
          callbackFn(result);
        }
      },
    };
  }

  setFlowType(
    flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT",
  ): EkycConfigBuilder {
    this.config.SDK_FLOW = flowType;
    return this;
  }

  setDocumentType(docType: DocumentType | number): EkycConfigBuilder {
    this.config.DOCUMENT_TYPE_START = docType;
    return this;
  }

  setLanguage(language: "vi" | "en"): EkycConfigBuilder {
    this.config.DEFAULT_LANGUAGE = language;
    return this;
  }

  setCallback(callback: (result: any) => void): EkycConfigBuilder {
    // Update END_FLOW callback to use the provided callback
    this.config.CALL_BACK_END_FLOW = async (result: any) => {
      console.log("🏁".repeat(50));
      console.log("🔚 [END FLOW CALLBACK] Flow kết thúc!");
      console.log("🏁".repeat(50));
      console.log("[END FLOW CALLBACK] Result:", result);
      console.log("🏁".repeat(50));
      callback(result);
    };
    return this;
  }

  withDefaultStyling(): EkycConfigBuilder {
    this.config.LIST_CHOOSE_STYLE = {
      background: "#fff",
      text_color: "black",
      border_item: "",
      item_active_color: "#18D696",
      background_icon: "#18D696",
      id_icon: "https://ekyc-web.icenter.ai/images/si/id_card.svg",
      passport_icon: "https://ekyc-web.icenter.ai/images/si/passport.svg",
      drivecard_icon: "https://ekyc-web.icenter.ai/images/si/drivecard.svg",
      army_id_icon: "https://ekyc-web.icenter.ai/images/si/other_doc.svg",
      id_chip_icon: "https://ekyc-web.icenter.ai/images/si/id_chip.svg",
      start_button_background: "#18D696",
      start_button_color: "#111127",
    };

    this.config.CAPTURE_IMAGE_STYLE = {
      popup1_box_shadow:
        "0px 0px 2px rgba(0, 0, 0, 0.06), 0px 3px 8px rgba(0, 0, 0, 0.1)",
      popup1_title_color: "#C8242D",
      description1_color: "#fff",
      capture_btn_background: "#18D696",
      capture_btn_color: "#111127",
      capture_btn_icon: "https://ekyc-web.icenter.ai/images/hdbank/capture.svg",
      tutorial_btn_icon: "https://ekyc-web.icenter.ai/images/hdbank/help.gif",
      recapture_btn_background:
        "linear-gradient(180deg, #FDFDFD 0%, #DEDEDE 100%)",
      recapture_btn_color: "#111127",
      recapture_btn_border: "2px solid #FEDC00",
      recapture_btn_icon:
        "https://ekyc-web.icenter.ai/images/hdbank/capture.svg",
      nextstep_btn_background: "#18D696",
      nextstep_btn_color: "#111127",
      nextstep_btn_icon:
        "https://ekyc-web.icenter.ai/images/hdbank/next_icon.svg",
      popup2_box_shadow:
        "0px 0px 2px rgba(0, 0, 0, 0.06), 0px 3px 8px rgba(0, 0, 0, 0.1)",
      popup2_title_header_color: "#C8242D",
      popup2_icon_header:
        "https://ekyc-web.icenter.ai/images/hdbank/main_icon.svg",
      popup2_icon_warning1: "",
      popup2_icon_warning2: "",
      popup2_icon_warning3: "",
    };

    this.config.RESULT_DEFAULT_STYLE = {
      redemo_btn_background: "#18D696",
      redemo_btn_icon: "https://ekyc-web.icenter.ai/images/hdbank/refresh.svg",
      redemo_btn_color: "#111127",
    };

    // BUG FIX: MOBILE_STYLE causes SDK to render in mobile mode
    // which hides the oval frame on desktop browsers
    // Only uncomment if you specifically want mobile-specific styling
    // this.config.MOBILE_STYLE = {
    //   mobile_capture_btn:
    //     "https://ekyc-web.icenter.ai/images/capure_mobile.png",
    //   mobile_capture_desc_color: "#18D696",
    //   mobile_tutorial_color: "#C8242D",
    //   mobile_recapture_btn_background:
    //     "linear-gradient(180deg, #FDFDFD 0%, #DEDEDE 100%)",
    //   mobile_recapture_btn_border: "1px solid #18D696",
    //   mobile_recapture_btn_icon:
    //     "https://ekyc-web.icenter.ai/images/hdbank/capture.svg",
    //   mobile_recapture_btn_color: "#111127",
    //   mobile_nextstep_btn_background: "#18D696",
    //   mobile_nextstep_btn_color: "#111127",
    //   mobile_nextstep_btn_icon:
    //     "https://ekyc-web.icenter.ai/images/next_icon_b.png",
    //   mobile_popup2_icon_header:
    //     "https://ekyc-web.icenter.ai/images/hdbank/face_icon_popup.svg",
    // };

    return this;
  }

  withCustomStyling(styling: {
    listChooseStyle?: Partial<ListChooseStyle>;
    captureImageStyle?: Partial<CaptureImageStyle>;
    resultDefaultStyle?: Partial<ResultDefaultStyle>;
    mobileStyle?: Partial<MobileStyle>;
  }): EkycConfigBuilder {
    if (styling.listChooseStyle) {
      // @ts-ignore
      this.config.LIST_CHOOSE_STYLE = {
        ...this.config.LIST_CHOOSE_STYLE,
        ...styling.listChooseStyle,
      };
    }
    if (styling.captureImageStyle) {
      // @ts-ignore
      this.config.CAPTURE_IMAGE_STYLE = {
        ...this.config.CAPTURE_IMAGE_STYLE,
        ...styling.captureImageStyle,
      };
    }
    if (styling.resultDefaultStyle) {
      // @ts-ignore
      this.config.RESULT_DEFAULT_STYLE = {
        ...this.config.RESULT_DEFAULT_STYLE,
        ...styling.resultDefaultStyle,
      };
    }
    if (styling.mobileStyle) {
      // @ts-ignore
      this.config.MOBILE_STYLE = {
        ...this.config.MOBILE_STYLE,
        ...styling.mobileStyle,
      };
    }
    return this;
  }

  build(): EkycSdkConfig {
    return this.config as EkycSdkConfig;
  }
}

// Default configuration factory
export const createDefaultEkycConfig = (
  authToken: string,
  callbackFn?: (result: any) => void,
): EkycSdkConfig => {
  return new EkycConfigBuilder(authToken, undefined, callbackFn)
    .withDefaultStyling()
    .build();
};
