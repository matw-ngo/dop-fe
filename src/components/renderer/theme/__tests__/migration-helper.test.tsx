import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

// Import migration helper exports
import {
  ThemeMigrationHelper,
  LegacyThemeProvider,
  useLegacyTheme,
  initializeMigration,
  ThemeProvider,
  useTheme
} from '../migration-helper';

describe('Migration Helper', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock console.warn
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Set up a basic DOM environment
    document.documentElement.setAttribute = vi.fn();
    document.documentElement.removeAttribute = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ThemeMigrationHelper', () => {
    it('should be exported as a class', () => {
      expect(ThemeMigrationHelper).toBeDefined();
      expect(typeof ThemeMigrationHelper).toBe('function');
    });

    it('should have migrateLocalStorage method', () => {
      expect(ThemeMigrationHelper.migrateLocalStorage).toBeDefined();
      expect(typeof ThemeMigrationHelper.migrateLocalStorage).toBe('function');
    });

    it('should have clearOldStorage method', () => {
      expect(ThemeMigrationHelper.clearOldStorage).toBeDefined();
      expect(typeof ThemeMigrationHelper.clearOldStorage).toBe('function');
    });

    it('should have createComponentReplacementMap method', () => {
      expect(ThemeMigrationHelper.createComponentReplacementMap).toBeDefined();
      expect(typeof ThemeMigrationHelper.createComponentReplacementMap).toBe('function');
    });

    it('should migrate localStorage correctly', () => {
      // Set up old theme storage
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('theme-mode', 'light');

      // Run migration
      ThemeMigrationHelper.migrateLocalStorage();

      // Check new storage format
      const newStorage = localStorage.getItem('dop-theme-config');
      expect(newStorage).toBeTruthy();

      const parsed = JSON.parse(newStorage!);
      expect(parsed.currentTheme).toBe('default'); // Default is 'default' after migration
    });

    it('should clear old storage entries', () => {
      // Set up old theme storage
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('theme-mode', 'light');
      localStorage.setItem('user-theme', 'custom');

      // Run migration and clear
      ThemeMigrationHelper.migrateLocalStorage();
      ThemeMigrationHelper.clearOldStorage();

      // Check old storage is cleared
      expect(localStorage.getItem('theme')).toBeNull();
      expect(localStorage.getItem('theme-mode')).toBeNull();
      expect(localStorage.getItem('user-theme')).toBeNull();

      // New storage should still exist
      expect(localStorage.getItem('dop-theme-config')).toBeTruthy();
    });

    it('should create component replacement map', () => {
      const replacementMap = ThemeMigrationHelper.createComponentReplacementMap();

      expect(replacementMap).toBeDefined();
      expect(typeof replacementMap).toBe('object');
      expect(replacementMap['ThemeProvider']).toBeTruthy();
      expect(replacementMap['useTheme']).toBeTruthy();
    });
  });

  describe('LegacyThemeProvider', () => {
    it('should render children without errors', () => {
      render(
        <LegacyThemeProvider>
          <div>Test Content</div>
        </LegacyThemeProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should show deprecation warning in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <LegacyThemeProvider>
          <div>Test</div>
        </LegacyThemeProvider>
      );

      expect(console.warn).toHaveBeenCalledWith(
        "LegacyThemeProvider is deprecated. Please use the new ThemeProvider from @/components/renderer/theme instead.",
        "See migration guide: docs/theme-system/migration-guide.md"
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show warning in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <LegacyThemeProvider>
          <div>Test</div>
        </LegacyThemeProvider>
      );

      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('LegacyThemeProvider is deprecated')
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('useLegacyTheme', () => {
    it('should return legacy theme context values', () => {
      const TestComponent = () => {
        const legacyTheme = useLegacyTheme();

        return (
          <div data-testid="theme-values">
            <span data-testid="is-dark">{legacyTheme.isDark ? 'true' : 'false'}</span>
            <span data-testid="resolved-theme">{legacyTheme.resolvedTheme || 'light'}</span>
          </div>
        );
      };

      render(
        <LegacyThemeProvider>
          <TestComponent />
        </LegacyThemeProvider>
      );

      const isDark = screen.getByTestId('is-dark');
      const resolvedTheme = screen.getByTestId('resolved-theme');

      expect(['true', 'false']).toContain(isDark.textContent);
      expect(['light', 'dark']).toContain(resolvedTheme.textContent);
    });

    it('should show deprecation warning when calling deprecated methods', () => {
      const TestComponent = () => {
        const legacyTheme = useLegacyTheme();

        React.useEffect(() => {
          legacyTheme.setTheme({ colors: {} });
          legacyTheme.toggleTheme();
        }, [legacyTheme]);

        return <div>Test</div>;
      };

      render(
        <LegacyThemeProvider>
          <TestComponent />
        </LegacyThemeProvider>
      );

      expect(console.warn).toHaveBeenCalledWith(
        "setTheme is deprecated. Use setThemeByName or setMode instead.",
        "See migration guide: docs/theme-system/migration-guide.md"
      );

      expect(console.warn).toHaveBeenCalledWith(
        "toggleTheme is deprecated. Use setMode instead.",
        "See migration guide: docs/theme-system/migration-guide.md"
      );
    });
  });

  describe('initializeMigration', () => {
    it('should be exported as a function', () => {
      expect(initializeMigration).toBeDefined();
      expect(typeof initializeMigration).toBe('function');
    });

    it('should run migration helper and log completion', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Spy on the method
      const spy = vi.spyOn(ThemeMigrationHelper, 'migrateLocalStorage');

      act(() => {
        initializeMigration();
      });

      expect(spy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Theme migration helper initialized. Please update your components to use the new ThemeProvider API. See migration guide for details.'
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Re-exports', () => {
    it('should re-export ThemeProvider', () => {
      expect(ThemeProvider).toBeDefined();
      expect(typeof ThemeProvider).toBe('function');
    });

    it('should re-export useTheme', () => {
      expect(useTheme).toBeDefined();
      expect(typeof useTheme).toBe('function');
    });
  });
});