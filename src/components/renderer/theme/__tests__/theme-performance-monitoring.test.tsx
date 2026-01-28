import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPerformanceMonitor,
  initializePerformanceMonitoring,
  isPerformanceMonitoringEnabled,
  measureThemeOperation,
  type PerformanceMonitor,
} from "@/lib/theme-performance";

// Mock performance.now for consistent test results
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, "performance", {
  value: {
    now: mockPerformanceNow,
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
  writable: true,
});

describe("Theme Performance Monitoring", () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset performance time
    let time = 0;
    mockPerformanceNow.mockImplementation(() => {
      time += 10; // Increment by 10ms each call
      return time;
    });

    // Get a fresh monitor instance
    monitor = getPerformanceMonitor({
      enabled: true,
      warningThreshold: 16,
      enableWarnings: true,
    });
  });

  afterEach(() => {
    monitor.reset();
  });

  describe("Basic Performance Tracking", () => {
    it("should measure theme operation timing", async () => {
      const result = measureThemeOperation("test-operation", () => {
        return "test-result";
      });

      expect(result).toBe("test-result");

      const metrics = monitor.getMetrics();
      expect(metrics.lastThemeSwitchTime).toBeGreaterThan(0);
      expect(metrics.totalThemeSwitches).toBe(1);
      expect(metrics.averageThemeSwitchTime).toBeGreaterThan(0);
    });

    it("should track multiple operations", async () => {
      // First operation
      measureThemeOperation("operation-1", () => {});

      // Second operation (faster)
      mockPerformanceNow.mockImplementation(() => {
        return 5; // Faster operation
      });
      measureThemeOperation("operation-2", () => {});

      const metrics = monitor.getMetrics();
      expect(metrics.totalThemeSwitches).toBe(2);
      expect(metrics.averageThemeSwitchTime).toBeGreaterThan(0);
    });

    it("should detect slow operations", async () => {
      let callCount = 0;
      // Simulate a slow operation (20ms)
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return 0; // Start time
        } else {
          return 20; // End time (20ms later)
        }
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      measureThemeOperation("slow-operation", () => {});

      const metrics = monitor.getMetrics();
      expect(metrics.slowOperations).toBe(1);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const warningMessage = consoleSpy.mock.calls[0][0];
      expect(warningMessage).toContain("[Theme Performance Warning]");
      expect(warningMessage).toContain("slow-operation");
      expect(warningMessage).toContain("20.00ms");

      consoleSpy.mockRestore();
    });
  });

  describe("DOM Update Metrics", () => {
    it("should track DOM update timing", () => {
      monitor.startRAFTiming();
      monitor.trackRAFUpdate("--color-primary", "#000");
      monitor.trackRAFUpdate("--color-secondary", "#fff");
      monitor.endRAFTiming();

      const metrics = monitor.getMetrics();
      expect(metrics.domUpdateMetrics.lastUpdateCount).toBe(2);
      expect(metrics.domUpdateMetrics.lastUpdateTime).toBeGreaterThan(0);
      expect(metrics.domUpdateMetrics.totalUpdates).toBe(1);
    });

    it("should handle multiple RAF batches", () => {
      // First batch
      monitor.startRAFTiming();
      monitor.trackRAFUpdate("--property-1", "value1");
      monitor.endRAFTiming();

      // Second batch
      monitor.startRAFTiming();
      monitor.trackRAFUpdate("--property-2", "value2");
      monitor.trackRAFUpdate("--property-3", "value3");
      monitor.endRAFTiming();

      const metrics = monitor.getMetrics();
      expect(metrics.domUpdateMetrics.totalUpdates).toBe(2);
      expect(metrics.domUpdateMetrics.averageUpdateTime).toBeGreaterThan(0);
    });
  });

  describe("Cache Performance Tracking", () => {
    it("should track cache hit rate", () => {
      monitor.recordCacheHit();
      monitor.recordCacheHit();
      monitor.recordCacheMiss();
      monitor.recordCacheHit();

      const metrics = monitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(75); // 3 hits out of 4 total = 75%
    });

    it("should handle empty cache statistics", () => {
      const metrics = monitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(0);
    });
  });

  describe("Performance History", () => {
    it("should maintain performance history", () => {
      measureThemeOperation("operation-1", () => {});
      measureThemeOperation("operation-2", () => {});

      const metrics = monitor.getMetrics();
      expect(metrics.performanceHistory).toHaveLength(2);
      expect(metrics.performanceHistory[0].type).toBe("operation-1");
      expect(metrics.performanceHistory[1].type).toBe("operation-2");
    });

    it("should limit history size", () => {
      const limitedMonitor = getPerformanceMonitor({ maxHistorySize: 3 });

      // Add more operations than the limit
      for (let i = 0; i < 5; i++) {
        measureThemeOperation(`operation-${i}`, () => {});
      }

      const metrics = limitedMonitor.getMetrics();
      expect(metrics.performanceHistory).toHaveLength(3);
      // Should keep the most recent 3
      expect(metrics.performanceHistory[0].type).toBe("operation-2");
      expect(metrics.performanceHistory[2].type).toBe("operation-4");
    });
  });

  describe("Performance Grading", () => {
    it("should grade performance as A for fast operations", () => {
      let callCount = 0;
      // Fast operation (5ms)
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 5;
      });

      measureThemeOperation("fast-operation", () => {});
      // Add some cache hits to improve the score
      monitor.recordCacheHit();
      monitor.recordCacheHit();
      monitor.recordCacheHit();

      const grade = monitor.gradePerformance();

      expect(grade.grade).toBe("A");
      expect(grade.score).toBeGreaterThanOrEqual(90);
    });

    it("should grade performance as C for slow operations", () => {
      let callCount = 0;
      // Slow operation (25ms)
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 25;
      });

      measureThemeOperation("slow-operation", () => {});
      // Add a mix of cache hits and misses to get a C grade
      monitor.recordCacheHit();
      monitor.recordCacheHit();
      monitor.recordCacheHit();
      monitor.recordCacheMiss();

      const grade = monitor.gradePerformance();

      expect(grade.grade).toBe("C");
      expect(grade.score).toBeGreaterThanOrEqual(70);
      expect(grade.score).toBeLessThan(80);
    });

    it("should grade performance as F for very slow operations", () => {
      let callCount = 0;
      // Very slow operation (100ms)
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 100;
      });

      measureThemeOperation("very-slow-operation", () => {});
      const grade = monitor.gradePerformance();

      expect(grade.grade).toBe("F");
      expect(grade.score).toBeLessThan(60);
    });
  });

  describe("Configuration", () => {
    it("should respect enabled configuration", () => {
      const disabledMonitor = getPerformanceMonitor({ enabled: false });

      const result = measureThemeOperation("test", () => "result");
      expect(result).toBe("result");

      const metrics = disabledMonitor.getMetrics();
      expect(metrics.totalThemeSwitches).toBe(0); // Should not track when disabled
    });

    it("should use custom warning threshold", () => {
      const customMonitor = getPerformanceMonitor({ warningThreshold: 50 });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Operation under custom threshold (30ms)
      mockPerformanceNow.mockImplementation(() => {
        return 30;
      });

      customMonitor.measureOperation("custom-threshold", () => {});

      // Should not warn since 30ms < 50ms
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("Data Export", () => {
    it("should export performance data", () => {
      measureThemeOperation("export-test", () => {});
      monitor.recordCacheHit();

      const exported = monitor.exportData();

      expect(exported).toHaveProperty("metrics");
      expect(exported).toHaveProperty("history");
      expect(exported).toHaveProperty("config");
      expect(exported).toHaveProperty("exportTime");
      expect(exported.metrics.totalThemeSwitches).toBe(1);
    });
  });

  describe("Utility Functions", () => {
    it("should check if monitoring is enabled", () => {
      expect(isPerformanceMonitoringEnabled()).toBe(true);

      const disabledMonitor = getPerformanceMonitor({ enabled: false });
      expect(isPerformanceMonitoringEnabled(disabledMonitor)).toBe(false);
    });

    it("should initialize monitoring with default config", () => {
      const initializedMonitor = initializePerformanceMonitoring();
      expect(initializedMonitor).toBeDefined();
      expect(isPerformanceMonitoringEnabled(initializedMonitor)).toBe(true);
    });

    it("should reset metrics", () => {
      measureThemeOperation("reset-test", () => {});

      let metrics = monitor.getMetrics();
      expect(metrics.totalThemeSwitches).toBe(1);

      monitor.reset();

      metrics = monitor.getMetrics();
      expect(metrics.totalThemeSwitches).toBe(0);
      expect(metrics.performanceHistory).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle operations that throw errors", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        measureThemeOperation("error-operation", () => {
          throw new Error("Test error");
        });
      }).toThrow("Test error");

      const metrics = monitor.getMetrics();
      expect(metrics.performanceHistory).toHaveLength(0); // Should not record failed operations

      consoleSpy.mockRestore();
    });

    it("should handle performance API unavailability", () => {
      // Mock performance API as unavailable
      const originalPerformance = global.performance;
      delete (global as any).performance;

      // Should not throw
      expect(() => {
        measureThemeOperation("no-perf-api", () => {});
      }).not.toThrow();

      // Restore performance API
      global.performance = originalPerformance;
    });
  });

  describe("Development Debugging", () => {
    it("should provide debug utilities in development", () => {
      const debugUtils = monitor.debugUtils;

      expect(debugUtils).toBeDefined();
      expect(debugUtils.generateReport).toBeDefined();
      expect(debugUtils.getRecentOperations).toBeDefined();
      expect(debugUtils.analyzeBottlenecks).toBeDefined();
    });

    it("should generate performance report", () => {
      let callCount = 0;
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 10; // Fast operation
      });
      measureThemeOperation("report-test", () => {});
      monitor.recordCacheHit();

      const report = monitor.debugUtils.generateReport();

      expect(report).toContain("Performance Report");
      expect(report).toContain("Theme Operations: 1");
      expect(report).toContain("Cache Hit Rate: 100.0%");
    });

    it("should analyze performance bottlenecks", () => {
      let callCount = 0;
      // Add some slow operations
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 50; // Slow operation (50ms)
      });
      measureThemeOperation("slow-op-1", () => {});

      callCount = 0;
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 60; // Another slow operation (60ms)
      });
      measureThemeOperation("slow-op-2", () => {});

      const analysis = monitor.debugUtils.analyzeBottlenecks();

      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });
});
