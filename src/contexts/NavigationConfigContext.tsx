"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

/**
 * Navigation security configuration interface
 */
export interface NavigationConfig {
  /** Enable session timeout feature */
  enableSessionTimeout: boolean;
  /** Session timeout duration in minutes */
  sessionTimeoutMinutes: number;
  /** Enable back navigation blocking after OTP verification */
  enableBackNavigationBlock: boolean;
  /** Enable user notifications for navigation events */
  enableUserNotifications: boolean;
  /** Enable server-side validation of verification session */
  enableServerValidation: boolean;
}

/**
 * Context value interface
 */
export interface NavigationConfigContextValue {
  config: NavigationConfig;
  updateConfig: (partial: Partial<NavigationConfig>) => void;
}

/**
 * Default navigation configuration
 */
const DEFAULT_CONFIG: NavigationConfig = {
  enableSessionTimeout: false,
  sessionTimeoutMinutes: 15,
  enableBackNavigationBlock: true,
  enableUserNotifications: true,
  enableServerValidation: false,
};

/**
 * Load configuration from environment variables
 */
function loadConfigFromEnv(): NavigationConfig {
  return {
    enableSessionTimeout: process.env.NEXT_PUBLIC_NAV_ENABLE_TIMEOUT === "true",
    sessionTimeoutMinutes: Number.parseInt(
      process.env.NEXT_PUBLIC_NAV_TIMEOUT_MINUTES || "15",
      10,
    ),
    enableBackNavigationBlock:
      process.env.NEXT_PUBLIC_NAV_BLOCK_BACK !== "false",
    enableUserNotifications:
      process.env.NEXT_PUBLIC_NAV_NOTIFICATIONS !== "false",
    enableServerValidation:
      process.env.NEXT_PUBLIC_NAV_SERVER_VALIDATION === "true",
  };
}

// Create context
const NavigationConfigContext = createContext<
  NavigationConfigContextValue | undefined
>(undefined);

// Module-level config reference for non-React contexts (e.g., axios interceptors)
// WARNING: This is a mutable global variable and has limitations:
// - In SSR (Next.js), this variable is shared across requests
// - Config changes during in-flight requests may cause inconsistent behavior
// - For production, consider using Zustand store instead of React Context
let currentConfig: NavigationConfig = DEFAULT_CONFIG;

/**
 * Navigation Configuration Provider
 *
 * Provides navigation security configuration to the application.
 * Configuration can be loaded from environment variables and updated at runtime.
 *
 * @example
 * ```tsx
 * <NavigationConfigProvider>
 *   <App />
 * </NavigationConfigProvider>
 * ```
 */
export function NavigationConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<NavigationConfig>(() => {
    // Load from environment variables on initialization
    const envConfig = loadConfigFromEnv();
    currentConfig = envConfig;
    return envConfig;
  });

  // Update module-level reference when config changes
  useEffect(() => {
    currentConfig = config;
  }, [config]);

  const updateConfig = (partial: Partial<NavigationConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  return (
    <NavigationConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </NavigationConfigContext.Provider>
  );
}

/**
 * Hook to access navigation configuration in React components
 *
 * @throws {Error} If used outside NavigationConfigProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { config, updateConfig } = useNavigationConfig();
 *
 *   if (config.enableBackNavigationBlock) {
 *     // Handle navigation blocking
 *   }
 * }
 * ```
 */
export function useNavigationConfig(): NavigationConfigContextValue {
  const context = useContext(NavigationConfigContext);

  if (!context) {
    throw new Error(
      "useNavigationConfig must be used within NavigationConfigProvider",
    );
  }

  return context;
}

/**
 * Get navigation configuration for non-React contexts (e.g., axios interceptors)
 *
 * WARNING: This function accesses a module-level mutable variable which has limitations:
 * - In SSR environments (Next.js), this variable is shared across requests
 * - Config changes during in-flight requests may cause inconsistent behavior
 * - Race conditions possible when config updates during request lifecycle
 *
 * For production use, consider:
 * - Passing config through request context
 * - Using a singleton store (Zustand) instead of React Context
 * - Implementing request-scoped configuration
 *
 * @returns Current navigation configuration
 *
 * @example
 * ```typescript
 * // In axios interceptor
 * import { getNavigationConfig } from '@/contexts/NavigationConfigContext';
 *
 * const interceptor = (config) => {
 *   const navConfig = getNavigationConfig();
 *   if (navConfig.enableServerValidation) {
 *     // Add validation headers
 *   }
 *   return config;
 * };
 * ```
 */
export function getNavigationConfig(): NavigationConfig {
  return currentConfig;
}
