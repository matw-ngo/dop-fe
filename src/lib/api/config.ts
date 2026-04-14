/**
 * API Client Configuration
 * Centralized configuration for API behavior
 */

export interface ApiConfig {
  /** Endpoints that should skip auth token handling (use leadToken instead) */
  skipAuthEndpoints: {
    /** URL patterns (supports wildcards like /leads/*) */
    patterns: string[];
  };
}

/**
 * API Client configuration
 * Modify these patterns to add/remove endpoints that skip auth handling
 */
export const apiConfig: ApiConfig = {
  skipAuthEndpoints: {
    // Lead flow APIs use leadToken from /leads response, not authToken
    patterns: [
      "/leads/*", // All lead endpoints: /leads, /leads/{id}, /leads/{id}/submit-otp, /leads/{id}/resend-otp
    ],
  },
};

/**
 * Check if a URL matches any of the configured patterns
 */
export function shouldSkipAuth(url: string): boolean {
  const patterns = apiConfig.skipAuthEndpoints.patterns;

  return patterns.some((pattern) => {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, ".*") // Escape wildcards
      .replace(/\//g, "\\/"); // Escape forward slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
}
