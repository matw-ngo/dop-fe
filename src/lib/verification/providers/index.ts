/**
 * Verification Provider Registry
 *
 * This file exports all provider-related interfaces and utilities.
 */

export type {
  VerificationProvider,
  ProviderConfig,
  VerificationOptions,
  VerificationSession,
  VerificationResult,
  VerificationStatus,
  ProviderRegistration,
  VerificationStats,
  AutofillMapping,
  EkycVerificationConfig,
  EkycRenderMode,
  EkycRenderProps,
} from "../types";

export { VerificationManager, verificationManager } from "../manager";

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
    this.providerClasses.set(name, providerClass);
  }

  /**
   * Create a provider instance
   */
  static create(name: string, ...args: any[]): any {
    const ProviderClass = this.providerClasses.get(name);
    if (!ProviderClass) {
      throw new Error(`Provider "${name}" not registered`);
    }
    return new ProviderClass(...args);
  }

  /**
   * Get list of registered providers
   */
  static getRegisteredProviders(): string[] {
    return Array.from(this.providerClasses.keys());
  }

  /**
   * Check if provider is registered
   */
  static isRegistered(name: string): boolean {
    return this.providerClasses.has(name);
  }
}
