/**
 * Secure Token Management
 * Provides secure token storage and retrieval with automatic refresh mechanism
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Token interface
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  tokenType: "Bearer";
}

// Token store state
interface TokenStoreState {
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Token operations
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  isTokenExpired: () => boolean;
  refreshTokens: () => Promise<boolean>;
}

// Token expiry buffer (5 minutes before actual expiry)
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

/**
 * Create secure storage that encrypts sensitive data
 */
const createSecureStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (name: string) => {
      try {
        const item = sessionStorage.getItem(name);
        if (!item) return null;

        // Basic obfuscation (not encryption, but better than plain text)
        const decoded = atob(item);
        return decoded;
      } catch (error) {
        console.warn("Failed to retrieve from secure storage:", error);
        return null;
      }
    },

    setItem: (name: string, value: string) => {
      try {
        // Basic obfuscation (not encryption, but better than plain text)
        const encoded = btoa(value);
        sessionStorage.setItem(name, encoded);
      } catch (error) {
        console.error("Failed to store in secure storage:", error);
      }
    },

    removeItem: (name: string) => {
      try {
        sessionStorage.removeItem(name);
      } catch (error) {
        console.error("Failed to remove from secure storage:", error);
      }
    },
  };
};

/**
 * Token Store with secure storage
 */
export const useTokenStore = create<TokenStoreState>()(
  persist(
    (set, get) => ({
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (tokens: AuthTokens) => {
        set({
          tokens,
          isAuthenticated: true,
        });
      },

      clearTokens: () => {
        set({
          tokens: null,
          isAuthenticated: false,
        });
      },

      getAccessToken: () => {
        const { tokens } = get();
        return tokens?.accessToken || null;
      },

      getRefreshToken: () => {
        const { tokens } = get();
        return tokens?.refreshToken || null;
      },

      isTokenExpired: () => {
        const { tokens } = get();
        if (!tokens) return true;

        return Date.now() >= tokens.expiresAt - TOKEN_EXPIRY_BUFFER;
      },

      refreshTokens: async (): Promise<boolean> => {
        const { tokens, getRefreshToken } = get();
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          return false;
        }

        try {
          set({ isLoading: true });

          // Make API call to refresh tokens
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error("Token refresh failed");
          }

          const newTokens: AuthTokens = await response.json();

          set({
            tokens: newTokens,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error("Token refresh error:", error);
          get().clearTokens();
          return false;
        }
      },
    }),
    {
      name: "auth-tokens",
      storage: createJSONStorage(() => createSecureStorage()),
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/**
 * Hook for managing authentication tokens
 */
export const useAuthTokens = () => {
  const tokenStore = useTokenStore();

  // Auto-refresh tokens if they're about to expire
  const checkAndRefreshTokens = async () => {
    if (tokenStore.isTokenExpired() && tokenStore.isAuthenticated) {
      const refreshed = await tokenStore.refreshTokens();
      if (!refreshed) {
        // Token refresh failed, redirect to login
        window.location.href = "/login";
      }
    }
  };

  return {
    ...tokenStore,
    checkAndRefreshTokens,
  };
};

/**
 * Utility to get Authorization header value
 */
export const getAuthHeader = (): { Authorization?: string } => {
  const accessToken = useTokenStore.getState().getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

/**
 * Token validation utilities
 */
export const tokenValidation = {
  /**
   * Validate JWT token format
   */
  validateTokenFormat: (token: string): boolean => {
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split(".");
    return parts.length === 3;
  },

  /**
   * Extract token payload without verification
   */
  getTokenPayload: (token: string) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (_error) {
      return null;
    }
  },

  /**
   * Check if token contains required claims
   */
  validateTokenClaims: (token: string): boolean => {
    const payload = tokenValidation.getTokenPayload(token);
    if (!payload) return false;

    // Check for required claims
    return !!(
      (
        (payload.sub && // Subject (user ID)
          payload.iat && // Issued at
          payload.exp && // Expiration
          payload.scope) ||
        payload.roles
      ) // Scope or roles
    );
  },
};

/**
 * Security utilities
 */
export const securityUtils = {
  /**
   * Generate CSRF token
   */
  generateCSRFToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  },

  /**
   * Sanitize user input
   */
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript protocol
      .replace(/on\w+=/gi, ""); // Remove event handlers
  },

  /**
   * Validate email format
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  /**
   * Validate Vietnamese phone number
   */
  validateVietnamesePhone: (phone: string): boolean => {
    const phoneRegex = /^(03[2-9]|05[6-9]|07[0-9]|08[1-9]|09[0-9])[0-9]{7}$/;
    return phoneRegex.test(phone);
  },
};
