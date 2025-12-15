/**
 * Example of how to integrate migration validation with the theme provider
 *
 * This file demonstrates how to use the migration validation system
 * to ensure robust theme migration handling.
 */

import React, { useEffect } from 'react';
import { initializeThemeMigration, loadAndValidateThemeState, saveThemeState } from './migration-utils';
import type { ThemeState } from './types';

// Example integration with ThemeProvider
export function ThemeProviderWithMigration({ children }: { children: React.ReactNode }) {
  // Initialize migration system on component mount
  useEffect(() => {
    // Initialize migration system
    initializeThemeMigration({
      storageKey: 'dop-theme-config',
      autoMigrate: true,
      enableDiagnostics: process.env.NODE_ENV === 'development',
    });
  }, []);

  // Example of loading theme state with validation
  const loadThemeState = () => {
    return loadAndValidateThemeState('dop-theme-config');
  };

  // Example of saving theme state with validation
  const saveThemeStateSafe = (state: ThemeState) => {
    const saved = saveThemeState(state, 'dop-theme-config');
    if (!saved) {
      console.error('Failed to save theme state - validation failed');
      // Handle error - maybe show user feedback
    }
    return saved;
  };

  // The rest of your theme provider implementation would go here
  return <>{children}</>;
}

// Example usage in a component
export function ThemeMigrationExample() {
  const handleThemeChange = (newTheme: string) => {
    // Load current state
    const currentState = loadAndValidateThemeState();

    // Create new state with updated theme
    const newState: ThemeState = {
      ...currentState,
      currentTheme: newTheme,
    };

    // Save with validation
    saveThemeState(newState);
  };

  const handleCustomizationChange = (colors: Partial<ThemeColors>) => {
    const currentState = loadAndValidateThemeState();

    const newState: ThemeState = {
      ...currentState,
      customizations: {
        ...currentState.customizations,
        ...colors,
      },
    };

    saveThemeState(newState);
  };

  // Example of migrating old theme data
  const migrateOldData = () => {
    // This would be called during app initialization
    const migrated = initializeThemeMigration();

    if (migrated) {
      console.log('Theme migration completed successfully');
    }
  };

  return (
    <div>
      {/* Your theme UI components here */}
    </div>
  );
}

// Example of using migration validation directly
export function DirectValidationExample() {
  import { validateMigratedData, sanitizeThemeColors } from './migration-validation';

  const validateThemeData = () => {
    const migrationData = {
      currentTheme: 'corporate',
      userGroup: 'business',
      customizations: {
        primary: 'oklch(0.623 0.188 259.815)',
        background: '#ffffff',
        invalidColor: 'not-a-color', // This will be flagged
      },
      mode: 'system' as const,
    };

    const availableThemes = ['default', 'corporate', 'creative', 'finance', 'medical'];
    const userGroups = [
      {
        id: 'business',
        name: 'Business',
        defaultTheme: 'corporate',
        availableThemes: ['corporate', 'finance'],
      },
    ];

    const validation = validateMigratedData(migrationData, availableThemes, userGroups);

    if (validation.isValid) {
      console.log('Theme data is valid');
    } else {
      console.warn('Theme data has issues:', validation.errors);
      if (validation.warnings.length > 0) {
        console.warn('Warnings:', validation.warnings);
      }
      // Use sanitized data
      console.log('Sanitized data:', validation.sanitizedData);
      console.log('Sanitized customizations:', validation.sanitizedCustomizations);
    }
  };

  const sanitizeColors = () => {
    const colors = {
      primary: 'oklch(0.623 0.188 259.815)', // Valid
      background: '#ffffff', // Valid
      invalid: 'not-a-color', // Invalid
    };

    const result = sanitizeThemeColors(colors, true); // Replace invalid colors

    console.log('Original colors:', colors);
    console.log('Sanitized colors:', result.colors);
    console.log('Invalid colors found:', result.invalidColors);
  };

  return (
    <div>
      <button onClick={validateThemeData}>Validate Theme Data</button>
      <button onClick={sanitizeColors}>Sanitize Colors</button>
    </div>
  );
}

// Example of error recovery
export function ErrorRecoveryExample() {
  import { recoverFromMigrationError } from './migration-validation';

  const handleMigrationError = () => {
    const error = new Error('Theme migration failed');
    const originalData = {
      currentTheme: 'nonexistent-theme',
      userGroup: 'invalid-group',
      customizations: { primary: 'invalid-color' },
      mode: 'system' as const,
    };

    const recovered = recoverFromMigrationError(
      error,
      originalData,
      ['default', 'corporate', 'creative', 'finance', 'medical'],
      [
        {
          id: 'system',
          name: 'System',
          defaultTheme: 'default',
          availableThemes: ['default', 'corporate'],
        },
      ]
    );

    console.log('Recovered data:', recovered);
    // This will have safe fallback values
  };

  return (
    <button onClick={handleMigrationError}>
      Test Error Recovery
    </button>
  );
}

// Example of diagnostics
export function DiagnosticsExample() {
  import { getThemeDiagnostics } from './migration-utils';

  const runDiagnostics = () => {
    const diagnostics = getThemeDiagnostics();

    console.log('Diagnostics:', diagnostics);

    if (diagnostics.hasStoredConfig && diagnostics.issues) {
      diagnostics.issues.forEach(issue => {
        console.log(`${issue.severity}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`  Suggestion: ${issue.suggestion}`);
        }
      });
    }
  };

  return (
    <button onClick={runDiagnostics}>
      Run Theme Diagnostics
    </button>
  );
}