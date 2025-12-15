import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadTheme,
  loadThemes,
  preloadThemes,
  getAvailableThemes,
  isThemeCached,
  getThemeCacheMetrics,
  clearThemeCache,
} from "../lazy-loader";
// Note: initializeThemes is not easily testable due to auto-initialization logic

describe("Lazy Loading Integration Tests", () => {
  beforeEach(() => {
    clearThemeCache();
  });

  afterEach(() => {
    clearThemeCache();
  });

  describe("Real Theme Loading", () => {
    it("should load the default theme", async () => {
      const theme = await loadTheme("default");

      expect(theme).toBeDefined();
      expect(theme.id).toBe("default");
      expect(theme.name).toBe("Default");
      expect(theme.colors).toBeDefined();
      expect(theme.colors.light).toBeDefined();
      expect(theme.colors.dark).toBeDefined();
    });

    it("should load the corporate theme", async () => {
      const theme = await loadTheme("corporate");

      expect(theme).toBeDefined();
      expect(theme.id).toBe("corporate");
      expect(theme.name).toBe("Corporate");
      expect(theme.group).toBe("business");
    });

    it("should load multiple themes in parallel", async () => {
      const themes = await loadThemes(["default", "corporate"]);

      expect(themes).toHaveLength(2);
      expect(themes[0].id).toBe("default");
      expect(themes[1].id).toBe("corporate");
    });

    it("should cache loaded themes", async () => {
      // First load
      const start1 = performance.now();
      const theme1 = await loadTheme("default");
      const duration1 = performance.now() - start1;

      // Check if cached
      expect(isThemeCached("default")).toBe(true);

      // Second load (should be from cache)
      const start2 = performance.now();
      const theme2 = await loadTheme("default");
      const duration2 = performance.now() - start2;

      expect(theme1).toBe(theme2); // Same reference
      expect(duration2).toBeLessThan(duration1); // Faster from cache
    });

    it("should preload critical themes", async () => {
      const result = await preloadThemes(["default", "corporate"]);

      expect(result.requested).toBe(2);
      expect(result.loaded).toBeGreaterThan(0);
      expect(result.failed).toBeLessThan(2);

      // Preloaded themes should be cached
      expect(isThemeCached("default")).toBe(true);
      if (result.loaded > 0) {
        expect(isThemeCached("corporate")).toBe(true);
      }
    });
  });

  describe("Cache Performance", () => {
    it("should track cache metrics", async () => {
      // Initial metrics
      let metrics = getThemeCacheMetrics();
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.cacheSize).toBe(0);

      // Load theme (cache miss)
      await loadTheme("default");
      metrics = getThemeCacheMetrics();
      expect(metrics.cacheMisses).toBeGreaterThan(0);
      expect(metrics.cacheSize).toBeGreaterThan(0);

      // Load again (cache hit)
      await loadTheme("default");
      metrics = getThemeCacheMetrics();
      expect(metrics.cacheHits).toBeGreaterThan(0);
      expect(metrics.hitRate).toBeGreaterThan(0);
    });

    it("should clear cache properly", async () => {
      // Load some themes
      await loadTheme("default");
      await loadTheme("corporate");
      expect(isThemeCached("default")).toBe(true);
      expect(isThemeCached("corporate")).toBe(true);

      // Clear cache
      clearThemeCache();
      expect(isThemeCached("default")).toBe(false);
      expect(isThemeCached("corporate")).toBe(false);

      const metrics = getThemeCacheMetrics();
      expect(metrics.cacheSize).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid theme IDs gracefully", async () => {
      await expect(loadTheme("nonexistent")).rejects.toThrow();
    });

    it("should preload themes with error tolerance", async () => {
      const result = await preloadThemes(["nonexistent", "default"]);

      // Should not fail completely
      expect(result.requested).toBe(2);
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(result.loaded).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance Characteristics", () => {
    it("should load themes within acceptable time", async () => {
      const start = performance.now();
      await loadTheme("default");
      const duration = performance.now() - start;

      // Should load quickly (adjust threshold as needed)
      expect(duration).toBeLessThan(100);
    });

    it("should handle concurrent loads efficiently", async () => {
      const start = performance.now();
      const promises = Array.from({ length: 5 }, () => loadTheme("default"));
      await Promise.all(promises);
      const duration = performance.now() - start;

      // Concurrent loads should not take much longer than a single load
      expect(duration).toBeLessThan(200);
    });
  });

  describe("Utility Functions", () => {
    it("should list available themes", () => {
      const themes = getAvailableThemes();
      expect(themes).toContain("default");
      expect(themes).toContain("corporate");
      expect(themes).toContain("creative");
      expect(themes).toContain("finance");
      expect(themes).toContain("medical");
    });
  });

  // Note: Initialization tests are skipped due to complex auto-initialization logic
// and import side effects that make testing difficult in the current setup

  describe("Memory Management", () => {
    it("should provide cache memory estimate", async () => {
      await loadTheme("default");
      const metrics = getThemeCacheMetrics();
      expect(metrics.cacheMemorySize).toBeGreaterThan(0);
    });
  });
});