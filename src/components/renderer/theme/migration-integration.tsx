/**
 * Theme Provider Integration with Migration
 *
 * This file shows how to integrate the storage migration script
 * with the theme provider initialization.
 */

import React, { useEffect, useState } from 'react';
import { ThemeProvider as UnifiedThemeProvider } from './index';
import { ThemeStorageMigration, runThemeMigration, isThemeMigrationNeeded } from './storage-migration';
import type { UnifiedThemeProviderProps } from './index';

interface MigrationState {
  isMigrating: boolean;
  migrationComplete: boolean;
  migrationError: string | null;
  canRollback: boolean;
}

interface MigrationProviderProps {
  children: React.ReactNode;
  onMigrationComplete?: (result: any) => void;
  onMigrationError?: (error: string) => void;
  enableAutoMigration?: boolean;
}

/**
 * Migration provider component that handles theme migration before rendering theme provider
 */
export function MigrationProvider({
  children,
  onMigrationComplete,
  onMigrationError,
  enableAutoMigration = true,
}: MigrationProviderProps) {
  const [migrationState, setMigrationState] = useState<MigrationState>({
    isMigrating: false,
    migrationComplete: false,
    migrationError: null,
    canRollback: false,
  });

  useEffect(() => {
    // Skip if migration is already complete
    if (ThemeStorageMigration.isMigrationComplete()) {
      setMigrationState(prev => ({
        ...prev,
        migrationComplete: true,
      }));
      return;
    }

    // Skip if auto migration is disabled
    if (!enableAutoMigration) {
      setMigrationState(prev => ({
        ...prev,
        migrationComplete: true,
      }));
      return;
    }

    // Check if migration is needed
    if (!isThemeMigrationNeeded()) {
      setMigrationState(prev => ({
        ...prev,
        migrationComplete: true,
      }));
      return;
    }

    // Run migration
    setMigrationState(prev => ({ ...prev, isMigrating: true }));

    try {
      const result = runThemeMigration();

      if (result.success) {
        setMigrationState(prev => ({
          ...prev,
          isMigrating: false,
          migrationComplete: true,
          canRollback: !!result.rollbackData,
        }));

        onMigrationComplete?.(result);

        // Log migration in development
        if (process.env.NODE_ENV === 'development') {
          console.info('Theme migration completed:', {
            migrated: result.migrated,
            oldDataFound: result.oldDataFound,
            migratedKeys: result.migratedKeys,
            warnings: result.warnings,
          });
        }
      } else {
        const errorMessage = result.errors.join(', ');
        setMigrationState(prev => ({
          ...prev,
          isMigrating: false,
          migrationError: errorMessage,
        }));

        onMigrationError?.(errorMessage);

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Theme migration failed:', result.errors);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown migration error';
      setMigrationState(prev => ({
        ...prev,
        isMigrating: false,
        migrationError: errorMessage,
      }));

      onMigrationError?.(errorMessage);

      console.error('Theme migration error:', error);
    }
  }, [enableAutoMigration, onMigrationComplete, onMigrationError]);

  // Show loading state during migration
  if (migrationState.isMigrating) {
    return (
      <div className="theme-migration-loading">
        <div className="loading-spinner" />
        <p>Migrating theme settings...</p>
      </div>
    );
  }

  // Show error state if migration failed
  if (migrationState.migrationError) {
    return (
      <div className="theme-migration-error">
        <h3>Theme Migration Failed</h3>
        <p>{migrationState.migrationError}</p>
        <button
          onClick={() => {
            // Retry migration
            setMigrationState({
              isMigrating: false,
              migrationComplete: false,
              migrationError: null,
              canRollback: false,
            });
          }}
        >
          Retry
        </button>
        <button
          onClick={() => {
            // Rollback if possible
            if (ThemeStorageMigration.rollbackMigration()) {
              setMigrationState({
                isMigrating: false,
                migrationComplete: true,
                migrationError: null,
                canRollback: false,
              });
            }
          }}
        >
          Rollback
        </button>
      </div>
    );
  }

  // Render children with theme provider once migration is complete
  return <>{children}</>;
}

/**
 * Enhanced Theme Provider with automatic migration
 */
export function ThemeProviderWithMigration(props: UnifiedThemeProviderProps & MigrationProviderProps) {
  return (
    <MigrationProvider
      onMigrationComplete={props.onMigrationComplete}
      onMigrationError={props.onMigrationError}
      enableAutoMigration={props.enableAutoMigration}
    >
      <UnifiedThemeProvider {...props} />
    </MigrationProvider>
  );
}

/**
 * Hook to access migration status and controls
 */
export function useThemeMigration() {
  const [status, setStatus] = React.useState(ThemeStorageMigration.getMigrationStatus());

  React.useEffect(() => {
    // Update status when localStorage changes (you might want to add a more sophisticated solution)
    const interval = setInterval(() => {
      const newStatus = ThemeStorageMigration.getMigrationStatus();
      setStatus(newStatus);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    migrate: () => runThemeMigration(true), // Force migration
    rollback: () => ThemeStorageMigration.rollbackMigration(),
    clearRollback: () => ThemeStorageMigration.clearRollbackData(),
    forceRemigration: () => ThemeStorageMigration.forceRemigration(),
  };
}

/**
 * Development-only migration debugging component
 */
export function MigrationDebugger() {
  const { isMigrated, hasOldData, oldKeys, canRollback, migrate, rollback } = useThemeMigration();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="migration-debugger" style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Theme Migration Debug</h4>
      <p>Migrated: {isMigrated ? 'Yes' : 'No'}</p>
      <p>Old Data: {hasOldData ? 'Found' : 'None'}</p>
      <p>Old Keys: {oldKeys.join(', ') || 'None'}</p>
      <p>Can Rollback: {canRollback ? 'Yes' : 'No'}</p>
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={migrate}
          style={{ marginRight: '5px', padding: '2px 5px' }}
        >
          Migrate
        </button>
        <button
          onClick={rollback}
          disabled={!canRollback}
          style={{ padding: '2px 5px' }}
        >
          Rollback
        </button>
      </div>
    </div>
  );
}

/**
 * Initialize theme migration early in app startup
 * Call this in your app's entry point (e.g., _app.tsx, main.tsx)
 */
export function initializeThemeMigration() {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Check if migration is needed
  if (isThemeMigrationNeeded()) {
    console.info('Theme migration is needed, will run during provider initialization');
  }

  // Pre-warm migration status
  const status = ThemeStorageMigration.getMigrationStatus();

  if (process.env.NODE_ENV === 'development') {
    console.info('Theme migration status:', status);
  }
}

export default MigrationProvider;