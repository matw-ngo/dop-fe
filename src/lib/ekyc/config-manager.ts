/**
 * Configuration Manager for eKYC SDK
 * Handles sensitive configuration data and environment-specific settings
 */

export interface EkycCredentials {
  BACKEND_URL: string;
  TOKEN_KEY: string;
  TOKEN_ID: string;
  AUTHORIZION: string;
}

export interface EkycEnvironmentConfig {
  development: Partial<EkycCredentials>;
  staging: Partial<EkycCredentials>;
  production: Partial<EkycCredentials>;
}

export class EkycConfigManager {
  private static instance: EkycConfigManager;
  private credentials: EkycCredentials | null = null;
  private environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || "development";
  }

  static getInstance(): EkycConfigManager {
    if (!EkycConfigManager.instance) {
      EkycConfigManager.instance = new EkycConfigManager();
    }
    return EkycConfigManager.instance;
  }

  /**
   * Initialize with credentials from environment variables or API call
   */
  async initialize(
    credentialsSource?: "env" | "api" | EkycCredentials,
  ): Promise<void> {
    if (typeof credentialsSource === "object") {
      // Direct credentials provided
      this.credentials = credentialsSource;
    } else if (credentialsSource === "api") {
      // Fetch from backend API
      this.credentials = await this.fetchCredentialsFromAPI();
    } else {
      // Default: try environment variables first, then fallback
      this.credentials = this.loadFromEnvironment();
    }

    if (!this.credentials) {
      throw new Error("Failed to initialize eKYC credentials");
    }
  }

  /**
   * Load credentials from environment variables
   */
  private loadFromEnvironment(): EkycCredentials | null {
    const backendUrl =
      process.env.NEXT_PUBLIC_EKYC_BACKEND_URL ||
      process.env.EKYC_BACKEND_URL ||
      "";
    const tokenKey =
      process.env.NEXT_PUBLIC_EKYC_TOKEN_KEY ||
      process.env.EKYC_TOKEN_KEY ||
      "+==";
    const tokenId =
      process.env.NEXT_PUBLIC_EKYC_TOKEN_ID ||
      process.env.EKYC_TOKEN_ID ||
      "b85b";
    const authorization =
      process.env.NEXT_PUBLIC_EKYC_AUTH_TOKEN || process.env.EKYC_AUTH_TOKEN;

    if (!authorization) {
      console.warn("EKYC_AUTH_TOKEN not found in environment variables");
      return null;
    }

    return {
      BACKEND_URL: backendUrl,
      TOKEN_KEY: tokenKey,
      TOKEN_ID: tokenId,
      AUTHORIZION: authorization,
    };
  }

  /**
   * Fetch credentials from backend API
   */
  private async fetchCredentialsFromAPI(): Promise<EkycCredentials> {
    try {
      const response = await fetch("/api/ekyc/credentials", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credentials: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        BACKEND_URL: data.backendUrl || "",
        TOKEN_KEY: data.tokenKey || "+==",
        TOKEN_ID: data.tokenId || "b85b",
        AUTHORIZION: data.authToken,
      };
    } catch (error) {
      console.error("Error fetching eKYC credentials from API:", error);
      throw error;
    }
  }

  /**
   * Get current credentials
   */
  getCredentials(): EkycCredentials {
    if (!this.credentials) {
      throw new Error(
        "EkycConfigManager not initialized. Call initialize() first.",
      );
    }
    return { ...this.credentials };
  }

  /**
   * Update specific credential
   */
  updateCredential(key: keyof EkycCredentials, value: string): void {
    if (!this.credentials) {
      throw new Error("EkycConfigManager not initialized");
    }
    this.credentials[key] = value;
  }

  /**
   * Check if credentials are valid
   */
  isValid(): boolean {
    return !!(
      this.credentials?.AUTHORIZION &&
      this.credentials?.TOKEN_ID &&
      this.credentials?.TOKEN_KEY !== undefined
    );
  }

  /**
   * Get backend URL for proxying requests
   */
  getBackendUrl(): string {
    return this.credentials?.BACKEND_URL || "";
  }

  /**
   * Check if using proxy backend
   */
  isUsingProxy(): boolean {
    return !!this.credentials?.BACKEND_URL;
  }

  /**
   * Get environment-specific default config
   */
  getEnvironmentDefaults(): Partial<EkycCredentials> {
    const defaults: EkycEnvironmentConfig = {
      development: {
        BACKEND_URL: "http://localhost:3000/api/ekyc-proxy",
        TOKEN_KEY: "+==",
        TOKEN_ID: "b85b",
      },
      staging: {
        BACKEND_URL: "https://staging-api.datanest.com/api/ekyc-proxy",
        TOKEN_KEY: "+==",
        TOKEN_ID: "b85b",
      },
      production: {
        BACKEND_URL: "https://api.datanest.com/api/ekyc-proxy",
        TOKEN_KEY: "+==",
        TOKEN_ID: "b85b",
      },
    };

    return (
      defaults[this.environment as keyof EkycEnvironmentConfig] ||
      defaults.development
    );
  }

  /**
   * Reset credentials (useful for testing)
   */
  reset(): void {
    this.credentials = null;
  }
}
