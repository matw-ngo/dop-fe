/**
 * eKYC Library - Main exports
 */

export type {
  UseEkycSdkOptions,
  UseEkycSdkReturn,
} from "../../hooks/features/ekyc/use-sdk";
// React integration
export { useEkycSdk } from "../../hooks/features/ekyc/use-sdk";
export type { EkycCredentials, EkycEnvironmentConfig } from "./config-manager";
export { EkycConfigManager } from "./config-manager";
export type {
  CaptureImageStyle,
  EkycSdkConfig,
  ListChooseStyle,
  MobileStyle,
  ResultDefaultStyle,
} from "./sdk-config";
export {
  createDefaultEkycConfig,
  EkycConfigBuilder,
} from "./sdk-config";
export type { EkycEventHandlers, EkycResult } from "./sdk-events";
export { EkycEventManager } from "./sdk-events";
export type { SdkAssets } from "./sdk-loader";
// Core SDK functionality
export { EkycSdkLoader } from "./sdk-loader";
export type { EkycSdkManagerOptions } from "./sdk-manager";
export { EkycSdkManager } from "./sdk-manager";
// Types
export * from "./types";
