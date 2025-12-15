/**
 * Theme Storage Migration Script
 *
 * Handles migration from old theme storage format to new structured format.
 * Supports automatic migration during provider initialization and manual triggering.
 *
 * Old format examples:
 * - 'theme': 'light' | 'dark' | 'corporate' | 'creative' | 'finance' | 'medical'
 * - 'theme-mode': 'light' | 'dark' | 'system'
 * - 'theme-config': { currentTheme: string, mode: string, ... }
 * - 'user-theme': custom theme object
 * - 'custom-theme': custom theme configuration
 *
 * New format:
 * - 'dop-theme-config': { currentTheme: string, userGroup: string, customizations?: {...} }
 * - 'dop-theme-config-mode': 'light' | 'dark' | 'system'
 * - 'dop-theme-migration-version': string
 */

import type { ThemeState, ThemeMode } from './types';

// Migration configuration
const MIGRATION_VERSION = '1.0.0';
const MIGRATION_VERSION_KEY = 'dop-theme-migration-version';
const MAIN_STORAGE_KEY = 'dop-theme-config';
const MODE_STORAGE_KEY = 'dop-theme-config-mode';

// Old localStorage keys to check for migration
const OLD_STORAGE_KEYS = [
  'theme',
  'theme-mode',
  'theme-config',
  'user-theme',
  'custom-theme',
  'theme-settings',
  'theme-preferences',
  'renderer-theme', // From old renderer provider
  'v2-theme', // From v2 provider
  // Project-specific legacy keys
  'finzone-theme',
  'finzone-user-group',
  'color-mode',
];

// Theme name mapping from old names to new theme IDs
const THEME_NAME_MAP: Record<string, string> = {
  // Simple light/dark mapping
  'light': 'default',
  'dark': 'default',

  // Direct theme name mappings
  'corporate': 'corporate',
  'creative': 'creative',
  'finance': 'finance',
  'medical': 'medical',
  'business': 'corporate', // business theme maps to corporate
  'healthcare': 'medical', // healthcare theme maps to medical
  'default': 'default',
  'system': 'default',
};

// User group detection based on theme selection
const THEME_TO_USER_GROUP: Record<string, string> = {
  'corporate': 'business',
  'business': 'business',
  'finance': 'finance',
  'medical': 'medical',
  'healthcare': 'healthcare',
  'creative': 'creative',
  'default': 'system',
  'light': 'system',
  'dark': 'system',
};

// Migration result interface
interface MigrationResult {
  success: boolean;
  migrated: boolean;
  oldDataFound: boolean;
  errors: string[];
  warnings: string[];
  migratedKeys: string[];
  rollbackData?: Record<string, any>;
}

// Rollback data interface
interface RollbackData {
  timestamp: number;
  version: string;
  removedKeys: Array<{ key: string; value: any }>;
  newKeys: Array<{ key: string; value: any }>;
}

/**
 * Storage migration class for handling theme data migration
 */
export class ThemeStorageMigration {
  /**
   * Check if migration has already been run
   */
  static isMigrationComplete(): boolean {
    try {
      const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
      const hasNewConfig = localStorage.getItem(MAIN_STORAGE_KEY);

      // Consider migration complete if we have both version and config
      return currentVersion === MIGRATION_VERSION && hasNewConfig !== null;
    } catch (error) {
      console.warn('Failed to check migration status:', error);
      return false;
    }
  }

  /**
   * Scan for old theme data in localStorage
   */
  static scanOldData(): Record<string, any> {
    const oldData: Record<string, any> = {};

    OLD_STORAGE_KEYS.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          // Try to parse as JSON first, fallback to string
          try {
            oldData[key] = JSON.parse(value);
          } catch {
            oldData[key] = value;
          }
        }
      } catch (error) {
        console.warn(`Failed to read old data from key ${key}:`, error);
      }
    });

    return oldData;
  }

  /**
   * Migrate old theme data to new format
   */
  static migrateFromOldFormat(manual = false): MigrationResult {
    const result: MigrationResult = {
      success: false,
      migrated: false,
      oldDataFound: false,
      errors: [],
      warnings: [],
      migratedKeys: [],
    };

    try {
      // Check if migration is already complete
      if (!manual && this.isMigrationComplete()) {
        result.success = true;
        result.migrated = false;
        result.warnings.push('Migration already completed');
        return result;
      }

      // Scan for old data
      const oldData = this.scanOldData();
      const oldKeys = Object.keys(oldData);

      if (oldKeys.length === 0) {
        result.success = true;
        result.migrated = false;
        result.warnings.push('No old theme data found');
        return result;
      }

      result.oldDataFound = true;

      // Store rollback data before migration
      const rollbackData: RollbackData = {
        timestamp: Date.now(),
        version: MIGRATION_VERSION,
        removedKeys: [],
        newKeys: [],
      };

      // Extract theme information from old data
      const migrationState = this.extractThemeState(oldData);

      // Validate migrated data
      const validationResult = this.validateMigratedData(migrationState);
      if (!validationResult.isValid) {
        result.errors.push(...validationResult.errors);
        return result;
      }

      // Apply warnings from validation
      result.warnings.push(...validationResult.warnings);

      // Save rollback data for existing new keys
      try {
        const existingNewConfig = localStorage.getItem(MAIN_STORAGE_KEY);
        const existingNewMode = localStorage.getItem(MODE_STORAGE_KEY);

        if (existingNewConfig) {
          rollbackData.newKeys.push({
            key: MAIN_STORAGE_KEY,
            value: existingNewConfig,
          });
        }

        if (existingNewMode) {
          rollbackData.newKeys.push({
            key: MODE_STORAGE_KEY,
            value: existingNewMode,
          });
        }
      } catch (error) {
        result.warnings.push('Failed to backup existing new format data');
      }

      // Save new format data
      try {
        localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(migrationState));
        localStorage.setItem(MODE_STORAGE_KEY, migrationState.mode || 'system');
        localStorage.setItem(MIGRATION_VERSION_KEY, MIGRATION_VERSION);

        result.migratedKeys.push(MAIN_STORAGE_KEY, MODE_STORAGE_KEY, MIGRATION_VERSION_KEY);
      } catch (error) {
        result.errors.push('Failed to save new theme configuration');
        return result;
      }

      // Store rollback data
      try {
        localStorage.setItem('dop-theme-rollback', JSON.stringify(rollbackData));
      } catch (error) {
        result.warnings.push('Failed to save rollback data');
      }

      // Clean up old keys
      const cleanedKeys = this.cleanupOldKeys(oldKeys);
      result.migratedKeys.push(...cleanedKeys);

      result.success = true;
      result.migrated = true;
      result.rollbackData = rollbackData;

      console.info('Theme migration completed successfully', {
        migratedFrom: oldKeys,
        migratedTo: result.migratedKeys,
        newState: migrationState,
      });

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Theme migration failed:', error);
    }

    return result;
  }

  /**
   * Extract theme state from old data
   */
  private static extractThemeState(oldData: Record<string, any>): ThemeState {
    let currentTheme = 'default';
    let userGroup = 'system';
    let mode: ThemeMode = 'system';
    let customizations: any = undefined;

    // Priority 0: Check for project-specific legacy keys (finzone)
    if (oldData['finzone-theme']) {
      currentTheme = this.mapThemeName(oldData['finzone-theme']);
      userGroup = oldData['finzone-user-group'] || this.detectUserGroup(currentTheme);

      // Determine mode from theme name or use color-mode if available
      if (oldData['color-mode']) {
        mode = this.normalizeMode(oldData['color-mode']);
      } else {
        // Infer mode from theme name
        mode = currentTheme === 'corporate' || oldData['finzone-theme'] === 'dark' ? 'dark' : 'light';
      }

      // Check for custom colors
      if (oldData['custom-theme']) {
        customizations = this.extractCustomizations(oldData['custom-theme']);
      }
    }
    // Priority 1: Check for structured theme-config
    else if (oldData['theme-config']) {
      const config = oldData['theme-config'];
      currentTheme = this.mapThemeName(config.currentTheme || config.theme || currentTheme);
      userGroup = config.userGroup || this.detectUserGroup(currentTheme);
      mode = this.normalizeMode(config.mode || config.themeMode || mode);
      customizations = config.customizations;
    }

    // Priority 2: Check for separate theme and theme-mode keys
    else {
      if (oldData['theme']) {
        currentTheme = this.mapThemeName(oldData['theme']);
        userGroup = this.detectUserGroup(currentTheme);
      }

      if (oldData['theme-mode']) {
        mode = this.normalizeMode(oldData['theme-mode']);
      }

      // Priority 3: Check for user-custom themes
      if (oldData['user-theme'] || oldData['custom-theme']) {
        const customTheme = oldData['user-theme'] || oldData['custom-theme'];
        currentTheme = 'custom';
        userGroup = this.detectUserGroupFromCustomTheme(customTheme);
        customizations = this.extractCustomizations(customTheme);
      }
    }

    return {
      currentTheme,
      userGroup,
      customizations,
      mode,
    };
  }

  /**
   * Map old theme names to new theme IDs
   */
  private static mapThemeName(oldTheme: any): string {
    if (typeof oldTheme !== 'string') {
      return 'default';
    }

    const normalized = oldTheme.toLowerCase().trim();
    return THEME_NAME_MAP[normalized] || 'default';
  }

  /**
   * Detect user group based on theme selection
   */
  private static detectUserGroup(themeName: string): string {
    return THEME_TO_USER_GROUP[themeName] || 'system';
  }

  /**
   * Detect user group from custom theme properties
   */
  private static detectUserGroupFromCustomTheme(customTheme: any): string {
    if (!customTheme || typeof customTheme !== 'object') {
      return 'system';
    }

    // Check for clues in the custom theme
    if (customTheme.colors) {
      const colors = customTheme.colors;

      // Professional blue tones might indicate business
      if (colors.primary?.includes('0f172a') || colors.primary?.includes('1e40af')) {
        return 'business';
      }

      // Green tones might indicate finance
      if (colors.primary?.includes('059669') || colors.primary?.includes('10b981')) {
        return 'finance';
      }

      // Red tones might indicate medical
      if (colors.primary?.includes('dc2626') || colors.primary?.includes('ef4444')) {
        return 'healthcare';
      }

      // Purple/vibrant tones might indicate creative
      if (colors.primary?.includes('7c3aed') || colors.primary?.includes('a855f7')) {
        return 'creative';
      }
    }

    return 'system';
  }

  /**
   * Normalize theme mode to valid values
   */
  private static normalizeMode(mode: any): ThemeMode {
    if (typeof mode !== 'string') {
      return 'system';
    }

    const normalized = mode.toLowerCase().trim();
    if (['light', 'dark', 'system'].includes(normalized)) {
      return normalized as ThemeMode;
    }

    return 'system';
  }

  /**
   * Extract customizations from custom theme
   */
  private static extractCustomizations(customTheme: any): any {
    if (!customTheme || typeof customTheme !== 'object') {
      return undefined;
    }

    // Extract color customizations if they exist
    if (customTheme.colors) {
      return customTheme.colors;
    }

    return undefined;
  }

  /**
   * Validate migrated theme state
   */
  private static validateMigratedData(state: ThemeState): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate currentTheme
    if (!state.currentTheme || typeof state.currentTheme !== 'string') {
      errors.push('Invalid currentTheme in migrated data');
    }

    // Validate userGroup
    if (!state.userGroup || typeof state.userGroup !== 'string') {
      errors.push('Invalid userGroup in migrated data');
    }

    // Validate mode
    const validModes: ThemeMode[] = ['light', 'dark', 'system'];
    if (!state.mode || !validModes.includes(state.mode)) {
      errors.push('Invalid mode in migrated data');
    }

    // Validate theme-user group compatibility
    const validThemes = {
      system: ['default', 'corporate', 'creative', 'medical'],
      business: ['default', 'corporate'],
      creative: ['default', 'creative'],
      finance: ['default', 'finance', 'corporate'],
      healthcare: ['default', 'medical'],
    };

    const allowedThemes = validThemes[state.userGroup as keyof typeof validThemes];
    if (allowedThemes && !allowedThemes.includes(state.currentTheme)) {
      warnings.push(`Theme "${state.currentTheme}" may not be available for user group "${state.userGroup}"`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clean up old localStorage keys
   */
  private static cleanupOldKeys(keys: string[]): string[] {
    const cleanedKeys: string[] = [];

    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
        cleanedKeys.push(key);
      } catch (error) {
        console.warn(`Failed to remove old key ${key}:`, error);
      }
    });

    return cleanedKeys;
  }

  /**
   * Rollback migration if issues occur
   */
  static rollbackMigration(): boolean {
    try {
      const rollbackDataString = localStorage.getItem('dop-theme-rollback');
      if (!rollbackDataString) {
        console.warn('No rollback data found');
        return false;
      }

      const rollbackData: RollbackData = JSON.parse(rollbackDataString);

      // Remove new keys
      [MAIN_STORAGE_KEY, MODE_STORAGE_KEY, MIGRATION_VERSION_KEY].forEach(key => {
        localStorage.removeItem(key);
      });

      // Restore old keys
      rollbackData.removedKeys.forEach(({ key, value }) => {
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
          console.warn(`Failed to restore old key ${key}:`, error);
        }
      });

      // Restore previous new keys if they existed
      rollbackData.newKeys.forEach(({ key, value }) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn(`Failed to restore previous new key ${key}:`, error);
        }
      });

      // Clean up rollback data
      localStorage.removeItem('dop-theme-rollback');

      console.info('Migration rollback completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to rollback migration:', error);
      return false;
    }
  }

  /**
   * Get migration status and information
   */
  static getMigrationStatus(): {
    isMigrated: boolean;
    version: string | null;
    hasOldData: boolean;
    oldKeys: string[];
    canRollback: boolean;
  } {
    const isMigrated = this.isMigrationComplete();
    const version = localStorage.getItem(MIGRATION_VERSION_KEY);
    const oldData = this.scanOldData();
    const oldKeys = Object.keys(oldData);
    const canRollback = localStorage.getItem('dop-theme-rollback') !== null;

    return {
      isMigrated,
      version,
      hasOldData: oldKeys.length > 0,
      oldKeys,
      canRollback,
    };
  }

  /**
   * Clear rollback data (call after confirming successful migration)
   */
  static clearRollbackData(): void {
    try {
      localStorage.removeItem('dop-theme-rollback');
    } catch (error) {
      console.warn('Failed to clear rollback data:', error);
    }
  }

  /**
   * Force re-migration (use with caution)
   */
  static forceRemigration(): MigrationResult {
    // Clear migration markers
    localStorage.removeItem(MIGRATION_VERSION_KEY);
    localStorage.removeItem('dop-theme-rollback');

    // Run migration again
    return this.migrateFromOldFormat(true);
  }
}

/**
 * Convenience function to run migration automatically
 */
export function runThemeMigration(manual = false): MigrationResult {
  return ThemeStorageMigration.migrateFromOldFormat(manual);
}

/**
 * Check if theme migration is needed
 */
export function isThemeMigrationNeeded(): boolean {
  const status = ThemeStorageMigration.getMigrationStatus();
  return !status.isMigrated && status.hasOldData;
}

/**
 * Get migration status for debugging
 */
export function getThemeMigrationStatus() {
  return ThemeStorageMigration.getMigrationStatus();
}

/**
 * Rollback theme migration if needed
 */
export function rollbackThemeMigration(): boolean {
  return ThemeStorageMigration.rollbackMigration();
}

/**
 * Clear migration rollback data
 */
export function clearMigrationRollback(): void {
  ThemeStorageMigration.clearRollbackData();
}

// Export types for external use
export type { MigrationResult, RollbackData };
export { MIGRATION_VERSION };