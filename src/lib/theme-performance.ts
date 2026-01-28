/**
 * Performance monitoring utilities for the theme system
 *
 * Provides comprehensive performance tracking for theme operations including:
 * - Theme switching performance metrics
 * - DOM update timing measurements
 * - Cache hit rate tracking
 * - Performance warnings and alerts
 * - Development-only debugging utilities
 *
 * @fileoverview Performance monitoring for theme system operations
 * @version 1.0.0
 * @author DOP Team
 */

// Type definitions
export interface PerformanceMetrics {
  /** Time taken for the last theme switch in milliseconds */
  lastThemeSwitchTime: number;
  /** Average theme switch time over the last N switches */
  averageThemeSwitchTime: number;
  /** Total number of theme switches performed */
  totalThemeSwitches: number;
  /** Number of slow operations (>16ms) */
  slowOperations: number;
  /** Cache hit rate percentage */
  cacheHitRate: number;
  /** DOM update metrics */
  domUpdateMetrics: DOMUpdateMetrics;
  /** Performance history for analysis */
  performanceHistory: PerformanceEntry[];
}

export interface DOMUpdateMetrics {
  /** Time taken for the last DOM update batch */
  lastUpdateTime: number;
  /** Number of properties updated in the last batch */
  lastUpdateCount: number;
  /** Total DOM updates performed */
  totalUpdates: number;
  /** Average DOM update time */
  averageUpdateTime: number;
  /** Pending updates count */
  pendingUpdates: number;
}

export interface PerformanceEntry {
  /** Timestamp of the operation */
  timestamp: number;
  /** Type of operation */
  type:
    | "theme-switch"
    | "dom-update"
    | "cache-hit"
    | "cache-miss"
    | "validation"
    | string;
  /** Duration in milliseconds */
  duration: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface PerformanceConfig {
  /** Whether performance monitoring is enabled */
  enabled?: boolean;
  /** Threshold for slow operations in milliseconds (default: 16ms) */
  slowOperationThreshold?: number;
  /** Threshold for warnings in milliseconds (default: 16ms) */
  warningThreshold?: number;
  /** Maximum number of performance entries to keep in memory */
  maxHistorySize?: number;
  /** Enable performance warnings in development */
  enableWarnings?: boolean;
  /** Enable detailed logging in development */
  enableDebugLogging?: boolean;
  /** Performance reporting interval in milliseconds */
  reportInterval?: number | null;
}

// Default configuration
const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  slowOperationThreshold: 16, // 60fps target
  maxHistorySize: 100,
  enableWarnings: process.env.NODE_ENV === "development",
  enableDebugLogging: process.env.NODE_ENV === "development",
  reportInterval: null,
};

// Performance monitoring state
class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private performanceMarks: Map<string, number> = new Map();
  private cacheStats = {
    hits: 0,
    misses: 0,
    total: 0,
  };
  private rafTiming: {
    startTime: number | null;
    updateCount: number;
  } = {
    startTime: null,
    updateCount: 0,
  };
  public debugUtils: {
    generateReport: () => string;
    getRecentOperations: (limit?: number) => PerformanceEntry[];
    analyzeBottlenecks: () => {
      bottlenecks: PerformanceEntry[];
      recommendations: string[];
    };
  };

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.initializeMetrics();
    this.setupDebugUtils();
    this.setupPeriodicReporting();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      lastThemeSwitchTime: 0,
      averageThemeSwitchTime: 0,
      totalThemeSwitches: 0,
      slowOperations: 0,
      cacheHitRate: 0,
      domUpdateMetrics: {
        lastUpdateTime: 0,
        lastUpdateCount: 0,
        totalUpdates: 0,
        averageUpdateTime: 0,
        pendingUpdates: 0,
      },
      performanceHistory: [],
    };
  }

  private setupDebugUtils(): void {
    this.debugUtils = {
      generateReport: () => {
        const metrics = this.getMetrics();
        const summary = this.getPerformanceSummary();

        let report = "Performance Report\n";
        report += "==================\n\n";
        report += `Theme Operations: ${metrics.totalThemeSwitches}\n`;
        report += `Average Time: ${metrics.averageThemeSwitchTime.toFixed(2)}ms\n`;
        report += `Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%\n`;
        report += `Slow Operations: ${metrics.slowOperations}\n`;
        report += `Performance Grade: ${summary.grade}\n`;

        if (summary.issues.length > 0) {
          report += "\nIssues:\n";
          summary.issues.forEach((issue) => (report += `- ${issue}\n`));
        }

        return report;
      },
      getRecentOperations: (limit = 10) => {
        return this.metrics.performanceHistory.slice(-limit);
      },
      analyzeBottlenecks: () => {
        const history = this.metrics.performanceHistory;
        const threshold = this.config.slowOperationThreshold || 16;

        const bottlenecks = history
          .filter((entry) => entry.duration > threshold)
          .sort((a, b) => b.duration - a.duration);

        const recommendations = [];

        if (bottlenecks.length > 0) {
          recommendations.push("Consider optimizing slow operations");
          recommendations.push("Check for expensive theme calculations");
        }

        if (this.metrics.cacheHitRate < 80) {
          recommendations.push("Improve caching strategy");
        }

        return { bottlenecks, recommendations };
      },
    };
  }

  private setupPeriodicReporting(): void {
    if (this.config.reportInterval && typeof window !== "undefined") {
      setInterval(() => {
        this.generatePerformanceReport();
      }, this.config.reportInterval);
    }
  }

  /**
   * Start timing a performance operation
   */
  startMark(name: string): void {
    if (typeof window !== "undefined" && "performance" in window) {
      this.performanceMarks.set(name, performance.now());
    }
  }

  /**
   * End timing a performance operation and record the duration
   */
  endMark(
    name: string,
    type: PerformanceEntry["type"],
    metadata?: Record<string, any>,
  ): number {
    if (typeof window !== "undefined" && "performance" in window) {
      const endTime = performance.now();
      const startTime = this.performanceMarks.get(name);

      if (startTime !== undefined) {
        const duration = endTime - startTime;
        this.performanceMarks.delete(name);

        this.recordPerformanceEntry({
          timestamp: Date.now(),
          type,
          duration,
          metadata,
        });

        // Check for slow operations
        const threshold =
          this.config.warningThreshold ||
          this.config.slowOperationThreshold ||
          16;
        if (duration > threshold) {
          this.handleSlowOperation(name, duration, type);
        }

        if (this.config.enableDebugLogging) {
          console.debug(
            `[Theme Performance] ${name}: ${duration.toFixed(2)}ms`,
          );
        }

        return duration;
      }
    }
    return 0;
  }

  /**
   * Record a performance entry directly
   */
  recordPerformanceEntry(entry: PerformanceEntry): void {
    // Add to history
    this.metrics.performanceHistory.push(entry);

    // Maintain history size limit
    if (this.metrics.performanceHistory.length > this.config.maxHistorySize) {
      this.metrics.performanceHistory.shift();
    }

    // Update specific metrics based on entry type
    // Check if it's a theme switch (either type is 'theme-switch' or it's a custom operation name)
    if (
      entry.type === "theme-switch" ||
      (entry.metadata?.operationName &&
        entry.type === entry.metadata.operationName)
    ) {
      this.updateThemeSwitchMetrics(entry.duration);
    } else if (entry.type === "dom-update") {
      this.updateDOMUpdateMetrics(entry.duration, entry.metadata?.count || 1);
    } else if (entry.type === "cache-hit") {
      this.updateCacheStats(true);
    } else if (entry.type === "cache-miss") {
      this.updateCacheStats(false);
    }
  }

  private updateThemeSwitchMetrics(duration: number): void {
    this.metrics.lastThemeSwitchTime = duration;
    this.metrics.totalThemeSwitches++;

    // Calculate rolling average
    const totalTime =
      this.metrics.averageThemeSwitchTime *
        (this.metrics.totalThemeSwitches - 1) +
      duration;
    this.metrics.averageThemeSwitchTime =
      totalTime / this.metrics.totalThemeSwitches;
  }

  private updateDOMUpdateMetrics(duration: number, count: number): void {
    const { domUpdateMetrics } = this.metrics;
    domUpdateMetrics.lastUpdateTime = duration;
    domUpdateMetrics.lastUpdateCount = count;
    domUpdateMetrics.totalUpdates++;

    // Calculate rolling average
    const totalTime =
      domUpdateMetrics.averageUpdateTime * (domUpdateMetrics.totalUpdates - 1) +
      duration;
    domUpdateMetrics.averageUpdateTime =
      totalTime / domUpdateMetrics.totalUpdates;
  }

  private updateCacheStats(hit: boolean): void {
    this.cacheStats.total++;
    if (hit) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }

    // Update hit rate
    this.metrics.cacheHitRate =
      this.cacheStats.total > 0
        ? (this.cacheStats.hits / this.cacheStats.total) * 100
        : 0;
  }

  private handleSlowOperation(
    name: string,
    duration: number,
    type: PerformanceEntry["type"],
  ): void {
    this.metrics.slowOperations++;

    const threshold =
      this.config.warningThreshold || this.config.slowOperationThreshold || 16;

    if (this.config.enableWarnings) {
      console.warn(
        `[Theme Performance Warning] Slow ${type} detected: ${name} took ${duration.toFixed(2)}ms ` +
          `(threshold: ${threshold}ms)`,
      );

      // Provide optimization suggestions
      this.suggestOptimizations(type, duration);
    }
  }

  private suggestOptimizations(
    type: PerformanceEntry["type"],
    _duration: number,
  ): void {
    const suggestions = {
      "theme-switch": [
        "Consider reducing the number of CSS variables",
        "Batch multiple theme changes together",
        "Check for expensive custom CSS operations",
      ],
      "dom-update": [
        "Reduce the number of DOM property updates",
        "Consider using CSS classes instead of inline styles",
        "Check for layout thrashing",
      ],
      validation: [
        "Implement result caching for validations",
        "Consider debouncing rapid validations",
      ],
    };

    const typeSuggestions = suggestions[type] || [];
    if (typeSuggestions.length > 0) {
      console.log(
        "[Theme Performance] Optimization suggestions:",
        typeSuggestions,
      );
    }
  }

  /**
   * Track requestAnimationFrame batch timing
   */
  startRAFTiming(): void {
    this.rafTiming.startTime = performance.now();
    this.rafTiming.updateCount = 0;
  }

  /**
   * Track an individual update within a RAF batch
   */
  trackRAFUpdate(_property?: string, _value?: any): void {
    this.rafTiming.updateCount++;
  }

  /**
   * End RAF timing and record the batch performance
   */
  endRAFTiming(): void {
    if (this.rafTiming.startTime !== null) {
      const duration = performance.now() - this.rafTiming.startTime;
      this.recordPerformanceEntry({
        timestamp: Date.now(),
        type: "dom-update",
        duration,
        metadata: {
          count: this.rafTiming.updateCount,
          batched: true,
        },
      });

      this.rafTiming.startTime = null;
    }
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(): void {
    this.updateCacheStats(true);
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss(): void {
    this.updateCacheStats(false);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Grade performance based on current metrics
   */
  gradePerformance(): {
    grade: "A" | "B" | "C" | "D" | "F";
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const summary = this.getPerformanceSummary();
    let score = 100;

    // Calculate score based on metrics
    const threshold =
      this.config.warningThreshold || this.config.slowOperationThreshold || 16;

    if (this.metrics.lastThemeSwitchTime > threshold) {
      // Deduct more points for slow operations
      const overThreshold = this.metrics.lastThemeSwitchTime - threshold;
      score -= Math.min(40, overThreshold * 1.5);
    }

    if (this.metrics.cacheHitRate < 80) {
      score -= (80 - this.metrics.cacheHitRate) * 0.5;
    }

    if (this.metrics.slowOperations > 0) {
      score -= this.metrics.slowOperations * 10;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Calculate grade based on score
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    return {
      grade,
      score: Math.round(score),
      issues: summary.issues,
      recommendations: summary.recommendations,
    };
  }

  /**
   * Get performance summary for reporting
   */
  getPerformanceSummary(): {
    grade: "A" | "B" | "C" | "D" | "F";
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check theme switch performance
    if (this.metrics.lastThemeSwitchTime > this.config.slowOperationThreshold) {
      issues.push(
        `Theme switch is slow (${this.metrics.lastThemeSwitchTime.toFixed(2)}ms)`,
      );
      recommendations.push("Optimize theme switching performance");
      score -= 20;
    }

    // Check cache efficiency
    if (this.metrics.cacheHitRate < 80) {
      issues.push(
        `Low cache hit rate (${this.metrics.cacheHitRate.toFixed(1)}%)`,
      );
      recommendations.push("Improve caching strategy");
      score -= 15;
    }

    // Check for slow operations
    if (this.metrics.slowOperations > this.metrics.totalThemeSwitches * 0.1) {
      issues.push("Multiple slow operations detected");
      recommendations.push("Review performance bottlenecks");
      score -= 25;
    }

    // Check DOM update performance
    if (this.metrics.domUpdateMetrics.averageUpdateTime > 5) {
      issues.push(
        `DOM updates are slow (${this.metrics.domUpdateMetrics.averageUpdateTime.toFixed(2)}ms average)`,
      );
      recommendations.push("Optimize DOM update batching");
      score -= 15;
    }

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    return { grade, issues, recommendations };
  }

  /**
   * Generate and log a performance report
   */
  generatePerformanceReport(): {
    timestamp: string;
    grade: "A" | "B" | "C" | "D" | "F";
    metrics: {
      themeSwitch: {
        lastTime: string;
        averageTime: string;
        totalSwitches: number;
      };
      cache: {
        hitRate: string;
        totalOperations: number;
      };
      domUpdates: {
        lastTime: string;
        averageTime: string;
        totalUpdates: number;
        pendingUpdates: number;
      };
      slowOperations: number;
    };
    issues: string[];
    recommendations: string[];
  } {
    const summary = this.getPerformanceSummary();
    const metrics = this.getMetrics();

    const report = {
      timestamp: new Date().toISOString(),
      grade: summary.grade,
      metrics: {
        themeSwitch: {
          lastTime: `${metrics.lastThemeSwitchTime.toFixed(2)}ms`,
          averageTime: `${metrics.averageThemeSwitchTime.toFixed(2)}ms`,
          totalSwitches: metrics.totalThemeSwitches,
        },
        cache: {
          hitRate: `${metrics.cacheHitRate.toFixed(1)}%`,
          totalOperations: this.cacheStats.total,
        },
        domUpdates: {
          lastTime: `${metrics.domUpdateMetrics.lastUpdateTime.toFixed(2)}ms`,
          averageTime: `${metrics.domUpdateMetrics.averageUpdateTime.toFixed(2)}ms`,
          totalUpdates: metrics.domUpdateMetrics.totalUpdates,
          pendingUpdates: metrics.domUpdateMetrics.pendingUpdates,
        },
        slowOperations: metrics.slowOperations,
      },
      issues: summary.issues,
      recommendations: summary.recommendations,
    };

    if (summary.issues.length > 0 || this.config.enableDebugLogging) {
      console.group("[Theme Performance Report]");
      console.log("Grade:", summary.grade);
      console.log("Metrics:", report.metrics);
      if (summary.issues.length > 0) {
        console.warn("Issues:", summary.issues);
      }
      if (summary.recommendations.length > 0) {
        console.info("Recommendations:", summary.recommendations);
      }
      console.groupEnd();
    }

    return report;
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    config: PerformanceConfig;
    metrics: PerformanceMetrics;
    history: PerformanceEntry[];
    cacheStats: typeof this.cacheStats;
    exportTime: string;
  } {
    return {
      config: this.config,
      metrics: this.metrics,
      history: [...this.metrics.performanceHistory],
      cacheStats: { ...this.cacheStats },
      exportTime: new Date().toISOString(),
    };
  }

  /**
   * Measure an operation with timing
   */
  measureOperation<T>(name: string, operation: () => T): T {
    return measureThemeOperation(name, operation);
  }

  /**
   * Reset all performance metrics
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.cacheStats = { hits: 0, misses: 0, total: 0 };
    this.performanceMarks.clear();

    if (this.config.enableDebugLogging) {
      console.log("[Theme Performance] Metrics reset");
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupPeriodicReporting();
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Get or create the performance monitor instance
 */
export function getPerformanceMonitor(
  config?: Partial<PerformanceConfig>,
): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(config);
  } else if (config) {
    performanceMonitor.updateConfig(config);
  }
  return performanceMonitor;
}

/**
 * Initialize performance monitoring with custom configuration
 */
export function initializePerformanceMonitoring(
  config?: Partial<PerformanceConfig>,
): PerformanceMonitor {
  performanceMonitor = new PerformanceMonitor(config);
  return performanceMonitor;
}

/**
 * Convenience function to time theme operations
 */
export function measureThemeOperation<T>(
  name: string,
  operation: () => T,
  type: PerformanceEntry["type"] = "theme-switch",
): T {
  const monitor = getPerformanceMonitor();

  // Check if monitoring is enabled
  if (monitor.config.enabled === false) {
    return operation();
  }

  monitor.startMark(name);

  try {
    const result = operation();
    // Use name as the type for tracking specific operations
    monitor.endMark(name, type === "theme-switch" ? name : type, {
      operationName: name,
    });
    return result;
  } catch (error) {
    // Remove the mark and don't record failed operations
    monitor.performanceMarks.delete(name);
    throw error;
  }
}

/**
 * Check if performance monitoring is enabled
 */
export function isPerformanceMonitoringEnabled(
  monitor?: PerformanceMonitor,
): boolean {
  if (monitor) {
    return monitor.config.enabled !== false;
  }
  return performanceMonitor?.config.enabled !== false;
}

/**
 * Development-only performance debugging utilities
 */
export const debugUtils = {
  /**
   * Enable performance monitoring in development
   */
  enableDevelopmentMode(): void {
    if (process.env.NODE_ENV === "development") {
      initializePerformanceMonitoring({
        enableWarnings: true,
        enableDebugLogging: true,
        reportInterval: 30000, // Report every 30 seconds
      });
    }
  },

  /**
   * Create a performance timeline visualization
   */
  createTimeline(): void {
    const monitor = getPerformanceMonitor();
    const history = monitor.getMetrics().performanceHistory;

    if (history.length === 0) {
      console.log("[Theme Performance] No performance data available");
      return;
    }

    console.group("[Theme Performance Timeline]");
    history.forEach((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const duration = entry.duration.toFixed(2);
      console.log(
        `${time} | ${entry.type.padEnd(12)} | ${duration}ms`,
        entry.metadata || "",
      );
    });
    console.groupEnd();
  },

  /**
   * Analyze performance bottlenecks
   */
  analyzeBottlenecks(): void {
    const monitor = getPerformanceMonitor();
    const metrics = monitor.getMetrics();

    console.group("[Theme Performance Bottleneck Analysis]");

    // Find slowest operations
    const slowOperations = metrics.performanceHistory
      .filter((entry) => entry.duration > monitor.config.slowOperationThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    if (slowOperations.length > 0) {
      console.log("Top 5 slowest operations:");
      slowOperations.forEach((entry, index) => {
        console.log(
          `${index + 1}. ${entry.type}: ${entry.duration.toFixed(2)}ms`,
        );
      });
    }

    // Operation frequency analysis
    const operationCounts = metrics.performanceHistory.reduce(
      (acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("Operation frequency:", operationCounts);

    console.groupEnd();
  },
};

// Export types and utilities
export { PerformanceMonitor };
