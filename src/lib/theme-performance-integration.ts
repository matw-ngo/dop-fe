/**
 * Integration example for theme performance monitoring
 *
 * This file demonstrates how to integrate the performance monitoring utilities
 * with the existing theme system components.
 */

import {
  debugUtils,
  getPerformanceMonitor,
  measureThemeOperation,
  type PerformanceConfig,
} from "./theme-performance";

/**
 * Initialize performance monitoring for the theme system
 * Call this early in your application startup
 */
export function initializeThemePerformanceMonitoring(
  config?: Partial<PerformanceConfig>,
) {
  // Enable in development mode by default
  if (process.env.NODE_ENV === "development" && !config) {
    debugUtils.enableDevelopmentMode();
  } else {
    // Initialize with custom configuration
    getPerformanceMonitor(config);
  }
}

/**
 * Enhanced theme utils with performance monitoring
 * This shows how to wrap existing theme utilities with performance tracking
 */

import type { ThemeConfig } from "@/components/renderer/theme/types";
import { applyTheme as baseApplyTheme } from "@/components/renderer/theme/utils";

/**
 * Wrapped applyTheme function with performance monitoring
 */
export function applyThemeWithMonitoring(
  theme: ThemeConfig,
  mode: "light" | "dark",
  customizations?: any,
): void {
  const monitor = getPerformanceMonitor();

  // Track the complete theme switch operation
  monitor.startMark("theme-switch");

  try {
    // Track validation if applicable
    if (theme.id) {
      monitor.recordPerformanceEntry({
        timestamp: Date.now(),
        type: "cache-miss",
        duration: 0,
        metadata: { themeId: theme.id },
      });
    }

    // Call the original applyTheme function
    baseApplyTheme(theme, mode, customizations);

    // End timing and record the performance
    const duration = monitor.endMark("theme-switch", "theme-switch", {
      themeId: theme.id,
      mode,
      hasCustomizations: !!customizations,
    });

    // Log performance in development
    if (process.env.NODE_ENV === "development" && duration > 0) {
      console.log(
        `[Theme Performance] Applied theme "${theme.name}" in ${duration.toFixed(2)}ms`,
      );
    }
  } catch (error) {
    // Record error case
    monitor.endMark("theme-switch", "theme-switch", {
      error: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

/**
 * Performance-aware cache tracking for theme validation
 */
export function trackCacheHit(cacheKey: string, isHit: boolean): void {
  const monitor = getPerformanceMonitor();
  monitor.recordPerformanceEntry({
    timestamp: Date.now(),
    type: isHit ? "cache-hit" : "cache-miss",
    duration: 0,
    metadata: { cacheKey },
  });
}

/**
 * Performance monitoring hooks for React components
 */
export const useThemePerformance = () => {
  const monitor = getPerformanceMonitor();

  return {
    // Get current metrics
    getMetrics: monitor.getMetrics.bind(monitor),

    // Get performance summary with grade
    getPerformanceSummary: monitor.getPerformanceSummary.bind(monitor),

    // Generate and log a report
    generateReport: monitor.generatePerformanceReport.bind(monitor),

    // Export data for analysis
    exportData: monitor.exportData.bind(monitor),

    // Reset metrics
    resetMetrics: monitor.reset.bind(monitor),

    // Debug utilities
    debug: debugUtils,
  };
};

/**
 * Performance monitoring middleware for theme operations
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string,
  operationType: "theme-switch" | "dom-update" | "validation" = "theme-switch",
): T {
  return ((...args: any[]) => {
    return measureThemeOperation(
      operationName,
      () => fn(...args),
      operationType,
    );
  }) as T;
}

/**
 * Example: How to integrate with the existing ThemeProvider
 */
/*
// In your theme context/component:

import {
  initializeThemePerformanceMonitoring,
  applyThemeWithMonitoring,
  trackCacheHit
} from '@/lib/theme-performance-integration';

// Initialize on app startup
initializeThemePerformanceMonitoring({
  slowOperationThreshold: 16, // 60fps target
  enableWarnings: true,
  enableDebugLogging: true,
  reportInterval: 30000 // Report every 30 seconds
});

// In your ThemeSync component or wherever applyTheme is called:
// Replace:
// applyTheme(themeConfig, resolvedTheme, customizations);
// With:
// applyThemeWithMonitoring(themeConfig, resolvedTheme, customizations);

// When checking cache:
// Replace:
// if (validationCache.has(value)) { ... }
// With:
// const isHit = validationCache.has(value);
// trackCacheHit(value, isHit);
// if (isHit) { ... }
*/

/**
 * Development debugging shortcuts
 * Add these to your window object in development for easy access
 */
export function setupDevelopmentDebugShortcuts(): void {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    // @ts-expect-error
    window.themePerf = {
      // View current metrics
      metrics: () => getPerformanceMonitor().getMetrics(),

      // Generate performance report
      report: () => getPerformanceMonitor().generatePerformanceReport(),

      // View performance timeline
      timeline: () => debugUtils.createTimeline(),

      // Analyze bottlenecks
      analyze: () => debugUtils.analyzeBottlenecks(),

      // Reset metrics
      reset: () => getPerformanceMonitor().reset(),

      // Export data
      export: () => getPerformanceMonitor().exportData(),

      // Access monitor directly
      monitor: getPerformanceMonitor(),
    };

    console.log(
      "[Theme Performance] Debug shortcuts available at window.themePerf\n" +
        "Try: themePerf.metrics(), themePerf.report(), themePerf.timeline(), themePerf.analyze()",
    );
  }
}
