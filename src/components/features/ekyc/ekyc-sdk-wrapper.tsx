"use client";

import React from "react";
import { useEkycSdk } from "@/hooks/use-ekyc-sdk";
import { SdkAssets } from "@/lib/ekyc/sdk-loader";

// TODO: Replace this with a call to your Go backend to fetch the token dynamically.
// This token should not be hardcoded in the frontend in a production environment.
const AUTHORIZATION_TOKEN = ".--PdxRkzOsleZHEyqc2ezc-ssrQZyms1GfQ";

interface EkycSdkWrapperProps {
  containerId?: string;
  authToken?: string;
  flowType?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT";
  language?: "vi" | "en";
  useMethod?: "PHOTO" | "UPLOAD"; // BUG FIX: Không dùng "BOTH"
  style?: React.CSSProperties;
  className?: string;
  assets?: SdkAssets;
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

const EkycSdkWrapper: React.FC<EkycSdkWrapperProps> = (props) => {
  console.log("[EkycSdkWrapper] Props received:", props);
  const {
    containerId = "ekyc_sdk_intergrated",
    authToken = process.env.NEXT_PUBLIC_EKYC_AUTH_TOKEN || AUTHORIZATION_TOKEN,
    flowType = "FACE",
    language = "vi",
    useMethod = "PHOTO", // Default to PHOTO
    style = {
      width: "100%",
      height: "100vh",
    },
    className,
    assets,
    credentialsSource = "env",
  } = props;

  const { isLoading, error, restart, setFlowType, setLanguage, updateConfig } =
    useEkycSdk({
      authToken,
      containerId,
      credentialsSource,
      assets,
      config: {
        SDK_FLOW: flowType,
        DEFAULT_LANGUAGE: language,
        USE_METHOD: useMethod,
      },
      autoStart: true,
    });

  // Update flow type when prop changes
  React.useEffect(() => {
    setFlowType(flowType);
  }, [flowType, setFlowType]);

  // Update language when prop changes
  React.useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  // Update use method when prop changes
  React.useEffect(() => {
    updateConfig({ USE_METHOD: useMethod });
  }, [useMethod, updateConfig]);

  // Show loading state
  if (isLoading) {
    return (
      <div id={containerId} style={style} className={className}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontSize: "16px",
            color: "#666",
          }}
        >
          Đang tải SDK eKYC...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div id={containerId} style={style} className={className}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "20px",
          }}
        >
          <div
            style={{
              color: "#C8242D",
              fontSize: "16px",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Lỗi: {error}
          </div>
          <button
            onClick={restart}
            style={{
              backgroundColor: "#18D696",
              color: "#111127",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return <div id={containerId} style={style} className={className} />;
};

export default EkycSdkWrapper;
