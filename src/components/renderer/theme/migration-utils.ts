/**
 * Migration utilities for theme provider integration
 *
 * This module provides helper functions to integrate the migration validation
 * system with the theme provider and ensure smooth migration handling.
 *
 * @fileoverview Theme migration utilities
 * @author Theme System
 * @version 1.0.0
 */

import { validateMigratedData, recoverFromMigrationError, diagnoseMigrationData } from './migration-validation';
import type { MigrationData, ValidationResult } from './migration-validation';
import type { ThemeState } from './types';

/**
 * Load and validate theme state from localStorage
 *
 * @param storageKey - The localStorage key for theme configuration
 * @returns Validated and sanitized theme state
 */
export function loadAndValidateThemeState(storageKey: string = 'dop-theme-config'): ThemeState {
  if (typeof window === 'undefined') {
    // Return default state on server-side
    return {
      currentTheme: 'default',
      userGroup: 'system',
    };
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {
        currentTheme: 'default',
        userGroup: 'system',
      };
    }

    // Parse stored data
    const parsed = JSON.parse(stored);

    // Handle both old and new formats
    const migrationData: MigrationData = {
      currentTheme: parsed.currentTheme || parsed.theme || 'default',
      userGroup: parsed.userGroup || 'system',
      customizations: parsed.customizations,
      mode: parsed.mode || 'system',
    };

    // Get available themes (using default list)
    const themeIds = ['default', 'corporate', 'creative', 'finance', 'medical'];

    // Validate the data
    const validation = validateMigratedData(
      migrationData,
      themeIds,
      []
    );

    // If validation fails, try to recover
    if (!validation.isValid) {
      console.warn('Invalid theme configuration, attempting recovery:', validation.errors);
      const recovered = recoverFromMigrationError(
        new Error('Validation failed'),
        migrationData,
        themeIds,
        []
      );

      // Save recovered state
      localStorage.setItem(storageKey, JSON.stringify(recovered));

      return {
        currentTheme: recovered.currentTheme,
        userGroup: recovered.userGroup,
        customizations: recovered.customizations,
      };
    }

    // Return validated state with sanitized data
    return {
      currentTheme: validation.sanitizedData?.id || migrationData.currentTheme,
      userGroup: validation.sanitizedData?.group || migrationData.userGroup,
      customizations: validation.sanitizedCustomizations,
      mode: migrationData.mode,
    };
  } catch (error) {
    console.error('Failed to load theme configuration:', error);

    // Return safe default state
    return {
      currentTheme: 'default',
      userGroup: 'system',
    };
  }
}

/**
 * Save theme state to localStorage with validation
 *
 * @param state - The theme state to save
 * @param storageKey - The localStorage key
 * @returns True if saved successfully, false otherwise
 */
export function saveThemeState(state: ThemeState, storageKey: string = 'dop-theme-config'): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Validate before saving
    const migrationData: MigrationData = {
      currentTheme: state.currentTheme,
      userGroup: state.userGroup,
      customizations: state.customizations,
      mode: state.mode,
    };

    // Get available themes
    const themeIds = ['default', 'corporate', 'creative', 'finance', 'medical'];

    // Basic validation
    const validation = validateMigratedData(
      migrationData,
      themeIds,
      []
    );

    if (!validation.isValid) {
      console.error('Attempted to save invalid theme state:', validation.errors);
      return false;
    }

    // Save sanitized version
    const toSave = {
      currentTheme: validation.sanitizedData?.id || state.currentTheme,
      userGroup: validation.sanitizedData?.group || state.userGroup,
      customizations: validation.sanitizedCustomizations || state.customizations,
      mode: state.mode,
    };

    localStorage.setItem(storageKey, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Failed to save theme configuration:', error);
    return false;
  }
}

/**
 * Migrate old theme configuration to new format
 *
 * @param oldStorageKey - The old localStorage key
 * @param newStorageKey - The new localStorage key
 * @returns True if migration was successful
 */
export function migrateOldThemeConfig(
  oldStorageKey: string = 'theme',
  newStorageKey: string = 'dop-theme-config'
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const oldConfig = localStorage.getItem(oldStorageKey);
    if (!oldConfig) {
      return false; // Nothing to migrate
    }

    // Check if new config already exists
    if (localStorage.getItem(newStorageKey)) {
      console.log('New theme configuration already exists, skipping migration');
      return true;
    }

    // Parse old config
    let parsed: any;
    try {
      parsed = JSON.parse(oldConfig);
    } catch {
      // Handle simple string values (e.g., just 'dark' or 'light')
      parsed = { theme: oldConfig };
    }

    // Convert to new format
    const migrationData: MigrationData = {
      currentTheme: parsed.theme || parsed.currentTheme || 'default',
      userGroup: parsed.userGroup || 'system',
      customizations: parsed.customizations,
      mode: parsed.mode || parsed.theme === 'dark' ? 'dark' : 'system',
    };

    // Get available themes
    const themeIds = ['default', 'corporate', 'creative', 'finance', 'medical'];

    // Validate and sanitize
    const validation = validateMigratedData(
      migrationData,
      themeIds,
      []
    );

    // Save migrated data
    const finalState: ThemeState = {
      currentTheme: validation.sanitizedData?.id || migrationData.currentTheme,
      userGroup: validation.sanitizedData?.group || migrationData.userGroup,
      customizations: validation.sanitizedCustomizations,
      mode: migrationData.mode,
    };

    localStorage.setItem(newStorageKey, JSON.stringify(finalState));

    // Remove old config
    localStorage.removeItem(oldStorageKey);

    console.log('Successfully migrated theme configuration');
    return true;
  } catch (error) {
    console.error('Failed to migrate theme configuration:', error);
    return false;
  }
}

/**
 * Get theme configuration diagnostics
 *
 * @param storageKey - The localStorage key
 * @returns Diagnostic report
 */
export function getThemeDiagnostics(storageKey: string = 'dop-theme-config') {
  if (typeof window === 'undefined') {
    return {
      canLoad: false,
      error: 'Not in browser environment',
    };
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {
        canLoad: true,
        hasStoredConfig: false,
      };
    }

    const parsed = JSON.parse(stored);
    const migrationData: MigrationData = {
      currentTheme: parsed.currentTheme || parsed.theme || 'default',
      userGroup: parsed.userGroup || 'system',
      customizations: parsed.customizations,
      mode: parsed.mode || 'system',
    };

    const themeIds = ['default', 'corporate', 'creative', 'finance', 'medical'];

    const diagnostics = diagnoseMigrationData(
      migrationData,
      themeIds,
      []
    );

    return {
      canLoad: true,
      hasStoredConfig: true,
      isHealthy: diagnostics.isHealthy,
      issues: diagnostics.issues,
      recommendations: diagnostics.recommendations,
      rawData: migrationData,
    };
  } catch (error) {
    return {
      canLoad: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Initialize theme migration on app startup
 *
 * This function should be called early in the app lifecycle to ensure
 * proper migration handling and validation.
 *
 * @param options - Initialization options
 */
export function initializeThemeMigration(options: {
  storageKey?: string;
  autoMigrate?: boolean;
  enableDiagnostics?: boolean;
} = {}) {
  const {
    storageKey = 'dop-theme-config',
    autoMigrate = true,
    enableDiagnostics = process.env.NODE_ENV === 'development',
  } = options;

  // Auto-migrate old configuration if enabled
  if (autoMigrate) {
    migrateOldThemeConfig('theme', storageKey);
    migrateOldThemeConfig('theme-config', storageKey);
  }

  // Run diagnostics in development
  if (enableDiagnostics) {
    const diagnostics = getThemeDiagnostics(storageKey);

    if (diagnostics.hasStoredConfig && diagnostics.issues) {
      console.group('Theme Configuration Diagnostics');
      console.log('Health:', diagnostics.isHealthy ? '✓ Healthy' : '⚠ Issues found');

      if (diagnostics.issues.length > 0) {
        console.group('Issues');
        diagnostics.issues.forEach(issue => {
          console.log(
            `${issue.severity.toUpperCase()} [${issue.category}]: ${issue.message}`,
            issue.suggestion ? `\n  Suggestion: ${issue.suggestion}` : ''
          );
        });
        console.groupEnd();
      }

      if (diagnostics.recommendations.length > 0) {
        console.group('Recommendations');
        diagnostics.recommendations.forEach(rec => console.log(`• ${rec}`));
        console.groupEnd();
      }

      console.groupEnd();
    }
  }
}