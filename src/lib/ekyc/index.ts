/**
 * eKYC Library - Main exports
 */

// Core SDK functionality
export { EkycSdkLoader } from "./sdk-loader";
export type { SdkAssets } from "./sdk-loader";

export {
  EkycConfigBuilder,
  createDefaultEkycConfig,
} from "./sdk-config";
export type {
  EkycSdkConfig,
  ListChooseStyle,
  CaptureImageStyle,
  ResultDefaultStyle,
  MobileStyle,
} from "./sdk-config";

export { EkycEventManager } from "./sdk-events";
export type { EkycResult, EkycEventHandlers } from "./sdk-events";

export { EkycSdkManager } from "./sdk-manager";
export type { EkycSdkManagerOptions } from "./sdk-manager";

export { EkycConfigManager } from "./config-manager";
export type { EkycCredentials, EkycEnvironmentConfig } from "./config-manager";

// Types
export * from "./types";

// React integration
export { useEkycSdk } from "../../hooks/features/ekyc/use-sdk";
export type {
  UseEkycSdkOptions,
  UseEkycSdkReturn,
} from "../../hooks/features/ekyc/use-sdk";
