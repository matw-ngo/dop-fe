/**
 * SDK Configuration - Centralized configuration for VNPT eKYC SDK
 */

import { DocumentType } from "./types";

export interface EkycSdkConfig {
  BACKEND_URL: string;
  TOKEN_KEY: string;
  TOKEN_ID: string;
  AUTHORIZION: string;
  ENABLE_GGCAPCHAR: boolean;
  PARRENT_ID: string;
  FLOW_TYPE: "DOCUMENT" | "FACE";
  SHOW_RESULT: boolean;
  SHOW_HELP: boolean;
  SHOW_TRADEMARK: boolean;
  CHECK_LIVENESS_CARD: boolean;
  CHECK_LIVENESS_FACE: boolean;
  CHECK_MASKED_FACE: boolean;
  COMPARE_FACE: boolean;
  LANGUAGE: "vi" | "en";
  LIST_ITEM: number[];
  TYPE_DOCUMENT: DocumentType | number;
  USE_WEBCAM: boolean;
  USE_UPLOAD: boolean;
  ADVANCE_LIVENESS_FACE: boolean;
  LIST_CHOOSE_STYLE: ListChooseStyle;
  CAPTURE_IMAGE_STYLE: CaptureImageStyle;
  RESULT_DEFAULT_STYLE: ResultDefaultStyle;
  MOBILE_STYLE: MobileStyle;
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
  ) {
    this.config = {
      BACKEND_URL: credentials?.BACKEND_URL || "",
      TOKEN_KEY: credentials?.TOKEN_KEY || "+==",
      TOKEN_ID: credentials?.TOKEN_ID || "b85b",
      AUTHORIZION: authToken,
      ENABLE_GGCAPCHAR: true,
      PARRENT_ID: "ekyc_sdk_intergrated",
      FLOW_TYPE: "FACE",
      SHOW_RESULT: true,
      SHOW_HELP: true,
      SHOW_TRADEMARK: false,
      CHECK_LIVENESS_CARD: true,
      CHECK_LIVENESS_FACE: true,
      CHECK_MASKED_FACE: true,
      COMPARE_FACE: true,
      LANGUAGE: "vi",
      LIST_ITEM: [-1, 5, 6, 7, 9],
      TYPE_DOCUMENT: 99,
      USE_WEBCAM: true,
      USE_UPLOAD: false,
      ADVANCE_LIVENESS_FACE: true,
    };
  }

  setFlowType(flowType: "DOCUMENT" | "FACE"): EkycConfigBuilder {
    this.config.FLOW_TYPE = flowType;
    return this;
  }

  setDocumentType(docType: DocumentType | number): EkycConfigBuilder {
    this.config.TYPE_DOCUMENT = docType;
    return this;
  }

  setLanguage(language: "vi" | "en"): EkycConfigBuilder {
    this.config.LANGUAGE = language;
    return this;
  }

  setParentId(parentId: string): EkycConfigBuilder {
    this.config.PARRENT_ID = parentId;
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

    this.config.MOBILE_STYLE = {
      mobile_capture_btn:
        "https://ekyc-web.icenter.ai/images/capure_mobile.png",
      mobile_capture_desc_color: "#18D696",
      mobile_tutorial_color: "#C8242D",
      mobile_recapture_btn_background:
        "linear-gradient(180deg, #FDFDFD 0%, #DEDEDE 100%)",
      mobile_recapture_btn_border: "1px solid #18D696",
      mobile_recapture_btn_icon:
        "https://ekyc-web.icenter.ai/images/hdbank/capture.svg",
      mobile_recapture_btn_color: "#111127",
      mobile_nextstep_btn_background: "#18D696",
      mobile_nextstep_btn_color: "#111127",
      mobile_nextstep_btn_icon:
        "https://ekyc-web.icenter.ai/images/next_icon_b.png",
      mobile_popup2_icon_header:
        "https://ekyc-web.icenter.ai/images/hdbank/face_icon_popup.svg",
    };

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
export const createDefaultEkycConfig = (authToken: string): EkycSdkConfig => {
  return new EkycConfigBuilder(authToken).withDefaultStyling().build();
};
