import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearThemeCache,
  getAvailableThemes,
  getThemeCacheMetrics,
  isThemeCached,
  loadTheme,
  loadThemes,
  preloadThemes,
  themeCache,
} from "../lazy-loader";
import type { ThemeConfig } from "../types";

// Mock dynamic imports
const mockThemes = {
  corporate: {
    corporateTheme: {
      id: "corporate",
      name: "Corporate",
      description: "Professional corporate theme",
      group: "business",
      colors: {
        light: {
          background: "oklch(0.98 0.002 247.858)",
          foreground: "oklch(0.15 0.02 220)",
        },
        dark: {
          background: "oklch(0.15 0.02 220)",
          foreground: "oklch(0.98 0.002 247.858)",
        },
      },
    },
  },
  creative: {
    creativeTheme: {
      id: "creative",
      name: "Creative",
      description: "Vibrant artistic theme",
      group: "creative",
      colors: {
        light: { background: "oklch(1 0 0)", foreground: "oklch(0 0 0)" },
        dark: { background: "oklch(0 0 0)", foreground: "oklch(1 0 0)" },
      },
    },
  },
  default: {
    defaultTheme: {
      id: "default",
      name: "Default",
      description: "Default system theme",
      group: "system",
      colors: {
        light: {
          background: "oklch(0.98 0.01 240)",
          foreground: "oklch(0.1 0.02 240)",
        },
        dark: {
          background: "oklch(0.129 0.042 264.695)",
          foreground: "oklch(0.984 0.003 247.858)",
        },
      },
    },
  },
  finance: {
    financeTheme: {
      id: "finance",
      name: "Finance",
      description: "Professional finance theme",
      group: "business",
      colors: {
        light: {
          background: "oklch(0.98 0.01 240)",
          foreground: "oklch(0.1 0.02 240)",
        },
        dark: {
          background: "oklch(0.129 0.042 264.695)",
          foreground: "oklch(0.984 0.003 247.858)",
        },
      },
    },
  },
  medical: {
    medicalTheme: {
      id: "medical",
      name: "Medical",
      description: "Clean medical theme",
      group: "medical",
      colors: {
        light: { background: "oklch(1 0 0)", foreground: "oklch(0 0 0)" },
        dark: { background: "oklch(0 0 0)", foreground: "oklch(1 0 0)" },
      },
    },
  },
};

// Mock the import function
const mockImport = vi.fn();

vi.mock("../lazy-loader", async () => {
  const actual =
    await vi.importActual<typeof import("../lazy-loader")>("../lazy-loader");
  return {
    ...actual,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  clearThemeCache();

  // Reset the import mock
  mockImport.mockImplementation((path: string) => {
    const themeName = path.replace("./themes/", "").replace(".ts", "");
    return Promise.resolve(
      mockThemes[themeName as keyof typeof mockThemes] || {},
    );
  });

  // Mock the dynamic import
  global.import = mockImport as any;
});

afterEach(() => {
  vi.restoreAllMocks();
  clearThemeCache();
});

describe("Lazy Theme Loading", () => {
  describe("loadTheme", () => {
    it("should load a theme successfully", async () => {
      const theme = await loadTheme("corporate");

      expect(theme).toBeDefined();
      expect(theme.id).toBe("corporate");
      expect(theme.name).toBe("Corporate");
      expect(mockImport).toHaveBeenCalledWith("./themes/corporate.ts");
    });

    it("should cache loaded themes", async () => {
      const theme = await loadTheme("corporate");
      expect(isThemeCached("corporate")).toBe(true);

      // Load again - should use cache
      const theme2 = await loadTheme("corporate");
      expect(mockImport).toHaveBeenCalledTimes(1); // Only called once
      expect(theme).toBe(theme2); // Same object reference
    });

    it("should handle non-existent themes", async () => {
      mockImport.mockRejectedValue(
        new Error("Cannot find module './themes/nonexistent.ts'"),
      );

      await expect(loadTheme("nonexistent")).rejects.toThrow(
        "Theme not found: nonexistent. Available themes: corporate, creative, default, finance, medical",
      );
    });

    it("should handle invalid theme structure", async () => {
      mockImport.mockResolvedValue({
        corporateTheme: { id: "corporate" }, // Missing required fields
      });

      await expect(loadTheme("corporate")).rejects.toThrow(
        "Invalid theme structure for: corporate",
      );
    });

    it("should validate theme ID", async () => {
      await expect(loadTheme("")).rejects.toThrow("Invalid theme ID");
      await expect(loadTheme(null as any)).rejects.toThrow("Invalid theme ID");
      await expect(loadTheme(undefined as any)).rejects.toThrow(
        "Invalid theme ID",
      );
    });

    it("should handle missing theme exports", async () => {
      mockImport.mockResolvedValue({
        // No theme exports
      });

      await expect(loadTheme("corporate")).rejects.toThrow(
        "Theme configuration not found for: corporate",
      );
    });
  });

  describe("loadThemes", () => {
    it("should load multiple themes in parallel", async () => {
      const themes = await loadThemes(["corporate", "creative", "default"]);

      expect(themes).toHaveLength(3);
      expect(themes[0].id).toBe("corporate");
      expect(themes[1].id).toBe("creative");
      expect(themes[2].id).toBe("default");
      expect(mockImport).toHaveBeenCalledTimes(3);
    });

    it("should use cached themes when available", async () => {
      // Pre-load one theme
      await loadTheme("corporate");

      // Load multiple themes
      const themes = await loadThemes(["corporate", "creative"]);

      expect(themes).toHaveLength(2);
      expect(mockImport).toHaveBeenCalledTimes(1); // Only for creative theme
    });

    it("should handle duplicate theme IDs", async () => {
      const themes = await loadThemes(["corporate", "corporate", "creative"]);

      expect(themes).toHaveLength(2); // Duplicates removed
      expect(mockImport).toHaveBeenCalledTimes(2);
    });

    it("should handle empty array", async () => {
      const themes = await loadThemes([]);
      expect(themes).toHaveLength(0);
    });
  });

  describe("preloadThemes", () => {
    it("should preload critical themes by default", async () => {
      const result = await preloadThemes();

      expect(result.requested).toBe(2); // default and corporate
      expect(result.loaded).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.themes).toContain("default");
      expect(result.themes).toContain("corporate");
    });

    it("should preload specified themes", async () => {
      const result = await preloadThemes(["creative", "finance", "medical"]);

      expect(result.requested).toBe(3);
      expect(result.loaded).toBe(3);
      expect(result.failed).toBe(0);
    });

    it("should handle preload failures gracefully", async () => {
      mockImport.mockRejectedValueOnce(new Error("Module not found"));

      const result = await preloadThemes(["nonexistent", "corporate"]);

      expect(result.requested).toBe(2);
      expect(result.loaded).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe("Cache Management", () => {
    it("should track cache metrics", async () => {
      // Initial state
      let metrics = getThemeCacheMetrics();
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.cacheSize).toBe(0);

      // Load a theme (miss)
      await loadTheme("corporate");
      metrics = getThemeCacheMetrics();
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.cacheSize).toBe(1);

      // Load again (hit)
      await loadTheme("corporate");
      metrics = getThemeCacheMetrics();
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.hitRate).toBe(50);
    });

    it("should clear cache", async () => {
      await loadTheme("corporate");
      await loadTheme("creative");
      expect(isThemeCached("corporate")).toBe(true);
      expect(isThemeCached("creative")).toBe(true);

      clearThemeCache();

      expect(isThemeCached("corporate")).toBe(false);
      expect(isThemeCached("creative")).toBe(false);

      const metrics = getThemeCacheMetrics();
      expect(metrics.cacheSize).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
    });

    it("should check if theme is cached", () => {
      expect(isThemeCached("corporate")).toBe(false);

      // Manually add to cache
      themeCache.corporate = {
        theme: mockThemes.corporate.corporateTheme as ThemeConfig,
        loadTime: Date.now(),
        lastAccessed: Date.now(),
      };

      expect(isThemeCached("corporate")).toBe(true);
    });

    it("should handle expired cache entries", async () => {
      // Add expired entry
      const oldTime = Date.now() - 6 * 60 * 1000; // 6 minutes ago
      themeCache.corporate = {
        theme: mockThemes.corporate.corporateTheme as ThemeConfig,
        loadTime: oldTime,
        lastAccessed: oldTime,
      };

      expect(isThemeCached("corporate")).toBe(false);

      // Should trigger a reload
      await loadTheme("corporate");
      expect(mockImport).toHaveBeenCalledTimes(1);
    });
  });

  describe("Utility Functions", () => {
    it("should get available themes", () => {
      const themes = getAvailableThemes();
      expect(themes).toEqual([
        "corporate",
        "creative",
        "default",
        "finance",
        "medical",
      ]);
    });

    it("should provide cache memory size estimate", async () => {
      await loadTheme("corporate");
      const metrics = getThemeCacheMetrics();
      expect(metrics.cacheMemorySize).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should provide clear error messages", async () => {
      mockImport.mockRejectedValue(new Error("Network error"));

      try {
        await loadTheme("corporate");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          'Failed to load theme "corporate"',
        );
      }
    });

    it("should handle import errors with fallback messages", async () => {
      mockImport.mockRejectedValue(new Error("Cannot find module"));

      try {
        await loadTheme("unknown");
      } catch (error) {
        expect((error as Error).message).toContain("Available themes:");
      }
    });
  });

  describe("Performance Characteristics", () => {
    it("should load themes quickly", async () => {
      const startTime = performance.now();
      await loadThemes([
        "corporate",
        "creative",
        "default",
        "finance",
        "medical",
      ]);
      const duration = performance.now() - startTime;

      // Should complete quickly (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it("should respect cache size limits", async () => {
      // Load many themes to exceed cache limit
      const themes = Array.from({ length: 25 }, (_, i) => `theme${i}`);

      // Mock these themes
      for (const theme of themes) {
        mockImport.mockResolvedValueOnce({
          [`${theme}Theme`]: {
            id: theme,
            name: theme,
            group: "test",
            colors: {
              light: { background: "#fff" },
              dark: { background: "#000" },
            },
          },
        });
      }

      await loadThemes(themes);

      const metrics = getThemeCacheMetrics();
      expect(metrics.cacheSize).toBeLessThanOrEqual(20); // CACHE_MAX_SIZE
    });

    it("should handle concurrent requests efficiently", async () => {
      const promises = Array.from({ length: 10 }, () => loadTheme("corporate"));
      const results = await Promise.all(promises);

      // All should return the same theme
      expect(results).toHaveLength(10);
      results.forEach((theme) => {
        expect(theme.id).toBe("corporate");
      });

      // But only one import should happen
      expect(mockImport).toHaveBeenCalledTimes(1);
    });
  });
});
