/**
 * eKYC Verification Initialization
 *
 * Initialize the verification system with providers and configuration.
 * Import this file in your app initialization (e.g., _app.tsx or main.tsx).
 */

import { verificationManager } from "./manager";
import { VNPTVerificationProvider } from "./providers/vnpt-provider";

/**
 * Initialize all eKYC providers
 */
export async function initializeVerification() {
  try {
    // Initialize VNPT provider with default configuration
    const vnptProvider = new VNPTVerificationProvider();

    // Register VNPT as default provider
    await verificationManager.registerProvider(
      "vnpt",
      vnptProvider,
      {
        environment:
          process.env.NODE_ENV === "production" ? "production" : "development",
        language: "vi",
        // Add custom configuration if needed
        customOptions: {
          timeout: 300, // 5 minutes timeout
          retryConfig: {
            maxAttempts: 3,
            backoffMs: 1000,
          },
        },
      },
      true,
    ); // Set as default provider

    console.log("✅ eKYC verification system initialized successfully");

    // Perform health check
    const healthStatus = await verificationManager.healthCheck();
    console.log("Provider health status:", healthStatus);

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize eKYC verification system:", error);
    return false;
  }
}

/**
 * Cleanup verification system
 * Call this when app unmounts or on cleanup
 */
export async function cleanupVerification() {
  try {
    await verificationManager.cleanup();
    console.log("✅ eKYC verification system cleaned up");
  } catch (error) {
    console.error("❌ Error cleaning up eKYC verification system:", error);
  }
}

/**
 * Get verification statistics
 */
export function getVerificationStats() {
  return verificationManager.getStats();
}

// Auto-initialize in browser environment
if (typeof window !== "undefined") {
  // Initialize on page load
  initializeVerification();

  // Cleanup on page unload
  window.addEventListener("beforeunload", cleanupVerification);
}
