/**
 * Tests for theme storage migration
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  isThemeMigrationNeeded,
  runThemeMigration,
  ThemeStorageMigration,
} from "../storage-migration";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ThemeStorageMigration", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("isMigrationComplete", () => {
    it("should return false when no migration has occurred", () => {
      expect(ThemeStorageMigration.isMigrationComplete()).toBe(false);
    });

    it("should return true when migration is complete", () => {
      localStorageMock.setItem(
        "dop-theme-config",
        JSON.stringify({ currentTheme: "default", userGroup: "system" }),
      );
      localStorageMock.setItem("dop-theme-config-mode", "system");
      localStorageMock.setItem("dop-theme-migration-version", "1.0.0");

      expect(ThemeStorageMigration.isMigrationComplete()).toBe(true);
    });

    it("should return false when version mismatch", () => {
      localStorageMock.setItem(
        "dop-theme-config",
        JSON.stringify({ currentTheme: "default", userGroup: "system" }),
      );
      localStorageMock.setItem("dop-theme-migration-version", "0.9.0");

      expect(ThemeStorageMigration.isMigrationComplete()).toBe(false);
    });
  });

  describe("scanOldData", () => {
    it("should find old theme data", () => {
      localStorageMock.setItem("theme", "dark");
      localStorageMock.setItem("theme-mode", "light");
      localStorageMock.setItem(
        "theme-config",
        JSON.stringify({ currentTheme: "corporate", mode: "dark" }),
      );

      const oldData = ThemeStorageMigration.scanOldData();

      expect(oldData).toEqual({
        theme: "dark",
        "theme-mode": "light",
        "theme-config": { currentTheme: "corporate", mode: "dark" },
      });
    });

    it("should handle JSON parse errors gracefully", () => {
      localStorageMock.setItem("theme-config", "invalid-json");

      const oldData = ThemeStorageMigration.scanOldData();

      expect(oldData["theme-config"]).toBe("invalid-json");
    });

    it("should return empty object when no old data exists", () => {
      const oldData = ThemeStorageMigration.scanOldData();
      expect(oldData).toEqual({});
    });
  });

  describe("migrateFromOldFormat", () => {
    it("should skip migration when already complete", () => {
      localStorageMock.setItem(
        "dop-theme-config",
        JSON.stringify({ currentTheme: "default", userGroup: "system" }),
      );
      localStorageMock.setItem("dop-theme-migration-version", "1.0.0");

      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(false);
      expect(result.warnings).toContain("Migration already completed");
    });

    it("should migrate simple theme string", () => {
      localStorageMock.setItem("theme", "corporate");

      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.oldDataFound).toBe(true);

      // Check new format was created
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dop-theme-config",
        expect.stringContaining('"currentTheme":"corporate"'),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dop-theme-config",
        expect.stringContaining('"userGroup":"business"'),
      );
    });

    it("should migrate theme config object", () => {
      const oldConfig = {
        currentTheme: "creative",
        userGroup: "creative",
        mode: "dark",
        customizations: { primary: "#7c3aed" },
      };
      localStorageMock.setItem("theme-config", JSON.stringify(oldConfig));

      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);

      const newConfig = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (call) => call[0] === "dop-theme-config",
        )?.[1],
      );
      expect(newConfig.currentTheme).toBe("creative");
      expect(newConfig.userGroup).toBe("creative");
      expect(newConfig.mode).toBe("dark");
      expect(newConfig.customizations).toEqual({ primary: "#7c3aed" });
    });

    it("should migrate separate theme and mode keys", () => {
      localStorageMock.setItem("theme", "finance");
      localStorageMock.setItem("theme-mode", "light");

      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dop-theme-config-mode",
        "light",
      );
    });

    it("should handle custom theme migration", () => {
      const customTheme = {
        colors: {
          primary: "#059669",
          background: "#ffffff",
        },
        name: "Custom Finance Theme",
      };
      localStorageMock.setItem("user-theme", JSON.stringify(customTheme));

      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);

      const newConfig = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (call) => call[0] === "dop-theme-config",
        )?.[1],
      );
      expect(newConfig.currentTheme).toBe("custom");
      expect(newConfig.userGroup).toBe("finance");
      expect(newConfig.customizations).toEqual(customTheme.colors);
    });

    it("should clean up old keys after migration", () => {
      localStorageMock.setItem("theme", "medical");
      localStorageMock.setItem("theme-mode", "dark");

      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migratedKeys).toContain("theme");
      expect(result.migratedKeys).toContain("theme-mode");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("theme");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("theme-mode");
    });

    it("should handle migration with no old data", () => {
      const result = ThemeStorageMigration.migrateFromOldFormat();

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(false);
      expect(result.warnings).toContain("No old theme data found");
    });

    it("should handle corrupted old data", () => {
      localStorageMock.setItem("theme-config", '{"invalid": json}');

      const result = ThemeStorageMigration.migrateFromOldFormat();

      // Should still succeed but treat as string value
      expect(result.success).toBe(true);
    });
  });

  describe("rollbackMigration", () => {
    it("should rollback successfully when rollback data exists", () => {
      // Setup rollback data
      const rollbackData = {
        timestamp: Date.now(),
        version: "1.0.0",
        removedKeys: [
          { key: "theme", value: "corporate" },
          { key: "theme-mode", value: "dark" },
        ],
        newKeys: [],
      };
      localStorageMock.setItem(
        "dop-theme-rollback",
        JSON.stringify(rollbackData),
      );

      // Simulate migration
      localStorageMock.setItem(
        "dop-theme-config",
        JSON.stringify({ currentTheme: "default" }),
      );

      const result = ThemeStorageMigration.rollbackMigration();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "dop-theme-config",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "theme",
        "corporate",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "theme-mode",
        "dark",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "dop-theme-rollback",
      );
    });

    it("should return false when no rollback data exists", () => {
      const result = ThemeStorageMigration.rollbackMigration();
      expect(result).toBe(false);
    });
  });

  describe("getMigrationStatus", () => {
    it("should return correct migration status", () => {
      localStorageMock.setItem("theme", "dark");

      const status = ThemeStorageMigration.getMigrationStatus();

      expect(status.isMigrated).toBe(false);
      expect(status.version).toBeNull();
      expect(status.hasOldData).toBe(true);
      expect(status.oldKeys).toContain("theme");
      expect(status.canRollback).toBe(false);
    });

    it("should detect rollback capability", () => {
      localStorageMock.setItem("dop-theme-rollback", "{}");

      const status = ThemeStorageMigration.getMigrationStatus();
      expect(status.canRollback).toBe(true);
    });
  });

  describe("theme name mapping", () => {
    it("should map theme names correctly", () => {
      const testCases = [
        { input: "light", expected: "default" },
        { input: "dark", expected: "default" },
        { input: "corporate", expected: "corporate" },
        { input: "business", expected: "corporate" },
        { input: "healthcare", expected: "medical" },
        { input: "invalid-theme", expected: "default" },
        { input: "", expected: "default" },
        { input: null, expected: "default" },
        { input: undefined, expected: "default" },
      ];

      testCases.forEach(({ input, expected }) => {
        localStorageMock.setItem("theme", input as any);
        const result = ThemeStorageMigration.migrateFromOldFormat();

        if (result.success && result.migrated) {
          const newConfig = JSON.parse(
            localStorageMock.setItem.mock.calls.find(
              (call) => call[0] === "dop-theme-config",
            )?.[1],
          );
          expect(newConfig.currentTheme).toBe(expected);
        }

        // Clean up for next test
        localStorageMock.clear();
        jest.clearAllMocks();
      });
    });
  });

  describe("user group detection", () => {
    it("should detect user groups based on theme", () => {
      const testCases = [
        { theme: "corporate", expectedGroup: "business" },
        { theme: "finance", expectedGroup: "finance" },
        { theme: "medical", expectedGroup: "healthcare" },
        { theme: "creative", expectedGroup: "creative" },
        { theme: "default", expectedGroup: "system" },
      ];

      testCases.forEach(({ theme, expectedGroup }) => {
        localStorageMock.setItem("theme", theme);
        const result = ThemeStorageMigration.migrateFromOldFormat();

        if (result.success && result.migrated) {
          const newConfig = JSON.parse(
            localStorageMock.setItem.mock.calls.find(
              (call) => call[0] === "dop-theme-config",
            )?.[1],
          );
          expect(newConfig.userGroup).toBe(expectedGroup);
        }

        // Clean up for next test
        localStorageMock.clear();
        jest.clearAllMocks();
      });
    });

    it("should detect user group from custom theme colors", () => {
      const testCases = [
        {
          theme: { colors: { primary: "#0f172a" } },
          expectedGroup: "business",
        },
        {
          theme: { colors: { primary: "#059669" } },
          expectedGroup: "finance",
        },
        {
          theme: { colors: { primary: "#dc2626" } },
          expectedGroup: "healthcare",
        },
        {
          theme: { colors: { primary: "#7c3aed" } },
          expectedGroup: "creative",
        },
      ];

      testCases.forEach(({ theme, expectedGroup }) => {
        localStorageMock.setItem("user-theme", JSON.stringify(theme));
        const result = ThemeStorageMigration.migrateFromOldFormat();

        if (result.success && result.migrated) {
          const newConfig = JSON.parse(
            localStorageMock.setItem.mock.calls.find(
              (call) => call[0] === "dop-theme-config",
            )?.[1],
          );
          expect(newConfig.userGroup).toBe(expectedGroup);
        }

        // Clean up for next test
        localStorageMock.clear();
        jest.clearAllMocks();
      });
    });
  });
});

describe("Convenience functions", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("runThemeMigration should work correctly", () => {
    localStorageMock.setItem("theme", "corporate");
    const result = runThemeMigration();

    expect(result.success).toBe(true);
    expect(result.migrated).toBe(true);
  });

  it("isThemeMigrationNeeded should detect migration need", () => {
    localStorageMock.setItem("theme", "dark");
    expect(isThemeMigrationNeeded()).toBe(true);

    localStorageMock.setItem(
      "dop-theme-config",
      JSON.stringify({ currentTheme: "default" }),
    );
    localStorageMock.setItem("dop-theme-migration-version", "1.0.0");
    expect(isThemeMigrationNeeded()).toBe(false);
  });
});
