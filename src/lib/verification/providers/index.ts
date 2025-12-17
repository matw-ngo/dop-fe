/**
 * Verification Provider Registry
 *
 * This file exports all provider-related interfaces and utilities.
 */

export { VerificationManager, verificationManager } from "../manager";
export type {
  AutofillMapping,
  EkycRenderMode,
  EkycRenderProps,
  EkycVerificationConfig,
  ProviderConfig,
  ProviderRegistration,
  VerificationOptions,
  VerificationProvider,
  VerificationResult,
  VerificationSession,
  VerificationStats,
  VerificationStatus,
} from "../types";

// Import and export specific providers when they are created
// export { VNPTVerificationProvider } from "./vnpt-provider";
// export { CitizenIDProvider } from "./citizenid-provider";
// export { AWSRekognitionProvider } from "./aws-rekognition-provider";

/**
 * Provider factory - creates provider instances based on name
 */
export class ProviderFactory {
  private static providerClasses = new Map<string, any>();

  /**
   * Register a provider class
   */
  static register(name: string, providerClass: any): void {
    ProviderFactory.providerClasses.set(name, providerClass);
  }

  /**
   * Create a provider instance
   */
  static create(name: string, ...args: any[]): any {
    const ProviderClass = ProviderFactory.providerClasses.get(name);
    if (!ProviderClass) {
      throw new Error(`Provider "${name}" not registered`);
    }
    return new ProviderClass(...args);
  }

  /**
   * Get list of registered providers
   */
  static getRegisteredProviders(): string[] {
    return Array.from(ProviderFactory.providerClasses.keys());
  }

  /**
   * Check if provider is registered
   */
  static isRegistered(name: string): boolean {
    return ProviderFactory.providerClasses.has(name);
  }
}
