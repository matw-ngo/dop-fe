# Theme Storage Migration Guide

This guide explains how to use the theme storage migration system to handle migration from old theme storage formats to the new structured format.

## Overview

The migration system automatically handles the transition from old theme storage formats to the new structured format. It includes:

- **Automatic detection** of old theme data
- **Data validation** and error handling
- **Rollback capability** in case of issues
- **Version tracking** to prevent re-migration
- **Manual migration** controls

## Old Storage Format

The migration system detects and migrates from these old localStorage keys:

### Simple Theme Values
- `theme`: `'light' | 'dark' | 'corporate' | 'creative' | 'finance' | 'medical'`
- `theme-mode`: `'light' | 'dark' | 'system'`

### Complex Theme Configuration
- `theme-config`: Object with theme settings
- `user-theme`: Custom theme object
- `custom-theme`: Custom theme configuration
- `theme-settings`: Additional theme preferences
- `theme-preferences`: User preferences
- `renderer-theme`: Old renderer provider theme
- `v2-theme`: V2 provider theme

## New Storage Format

The migration converts data to the new structured format:

```json
// dop-theme-config
{
  "currentTheme": "corporate",
  "userGroup": "business",
  "customizations": {
    "primary": "#0f172a",
    "background": "#ffffff"
  }
}

// dop-theme-config-mode
"system"

// dop-theme-migration-version
"1.0.0"
```

## Usage

### 1. Automatic Migration (Recommended)

The easiest way is to use the `ThemeProviderWithMigration` component:

```tsx
import { ThemeProviderWithMigration } from '@/components/renderer/theme';

function App() {
  return (
    <ThemeProviderWithMigration
      defaultTheme="system"
      defaultUserGroup="system"
      enableAutoMigration={true}
      onMigrationComplete={(result) => {
        console.log('Migration completed:', result);
      }}
      onMigrationError={(error) => {
        console.error('Migration failed:', error);
      }}
    >
      <YourApp />
    </ThemeProviderWithMigration>
  );
}
```

### 2. Manual Migration

If you need more control, you can run migration manually:

```tsx
import { runThemeMigration, isThemeMigrationNeeded } from '@/components/renderer/theme';

function App() {
  useEffect(() => {
    if (isThemeMigrationNeeded()) {
      const result = runThemeMigration();
      if (result.success) {
        console.log('Migration successful');
      } else {
        console.error('Migration failed:', result.errors);
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 3. Early Initialization

For optimal performance, initialize migration early in your app:

```tsx
// In your app entry point (e.g., _app.tsx, main.tsx)
import { initializeThemeMigration } from '@/components/renderer/theme';

// Call this before rendering your app
initializeThemeMigration();
```

## Theme Name Mapping

The migration system automatically maps old theme names to new theme IDs:

| Old Theme Name | New Theme ID | User Group |
|----------------|--------------|------------|
| `light` | `default` | `system` |
| `dark` | `default` | `system` |
| `corporate` | `corporate` | `business` |
| `business` | `corporate` | `business` |
| `finance` | `finance` | `finance` |
| `medical` | `medical` | `healthcare` |
| `healthcare` | `medical` | `healthcare` |
| `creative` | `creative` | `creative` |

## User Group Detection

The system automatically detects the appropriate user group based on:

1. **Theme Selection**: Maps theme to corresponding user group
2. **Custom Colors**: Analyzes color values to infer user group
   - Blue tones → Business
   - Green tones → Finance
   - Red tones → Healthcare
   - Purple/vibrant tones → Creative

## Advanced Usage

### Migration Status

Check migration status at any time:

```tsx
import { useThemeMigration } from '@/components/renderer/theme';

function MigrationStatus() {
  const { isMigrated, hasOldData, oldKeys, canRollback } = useThemeMigration();

  return (
    <div>
      <p>Migrated: {isMigrated ? 'Yes' : 'No'}</p>
      <p>Old Data Found: {hasOldData ? 'Yes' : 'No'}</p>
      <p>Old Keys: {oldKeys.join(', ')}</p>
      <p>Can Rollback: {canRollback ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Manual Controls

For advanced scenarios, you can manually control migration:

```tsx
import { ThemeStorageMigration } from '@/components/renderer/theme';

// Force re-migration
const result = ThemeStorageMigration.forceRemigration();

// Rollback migration
const rollbackSuccess = ThemeStorageMigration.rollbackMigration();

// Clear rollback data
ThemeStorageMigration.clearRollbackData();

// Get detailed migration status
const status = ThemeStorageMigration.getMigrationStatus();
```

### Development Debugging

In development mode, you can use the built-in debugger:

```tsx
import { MigrationDebugger } from '@/components/renderer/theme';

function App() {
  return (
    <>
      <MigrationDebugger />
      <YourApp />
    </>
  );
}
```

This shows a floating debug panel with migration status and controls.

## Error Handling

The migration system includes comprehensive error handling:

### Validation Errors
- Invalid theme names
- Missing required fields
- Corrupted JSON data
- Theme-user group incompatibility

### Storage Errors
- localStorage quota exceeded
- Storage access denied
- Corrupted storage

### Recovery Options
- Automatic rollback on failure
- Manual rollback capability
- Partial migration handling
- Data corruption detection

## Testing

The migration system includes comprehensive tests:

```bash
# Run migration tests
npm test -- storage-migration.test.tsx
```

Test coverage includes:
- Old data detection
- Theme name mapping
- User group detection
- Data validation
- Rollback functionality
- Error scenarios

## Best Practices

### 1. Early Initialization
Always initialize migration early in your app lifecycle to ensure theme settings are available before rendering.

### 2. Error Monitoring
Implement error monitoring for migration failures:

```tsx
<ThemeProviderWithMigration
  onMigrationError={(error) => {
    // Report to error tracking service
    trackError('Theme migration failed', { error });
  }}
>
  <App />
</ThemeProviderWithMigration>
```

### 3. Progressive Enhancement
Design your app to work with or without migrated data:

```tsx
const { currentTheme, userGroup } = useTheme();

// Fallback to defaults if migration hasn't run yet
const effectiveTheme = currentTheme || 'default';
const effectiveUserGroup = userGroup || 'system';
```

### 4. Cleanup
After confirming successful migration, clean up rollback data:

```tsx
const { clearRollback } = useThemeMigration();

// Call this after app startup
setTimeout(() => {
  clearRollback();
}, 10000); // Wait 10 seconds
```

## Troubleshooting

### Migration Not Running
- Check if `enableAutoMigration` is enabled
- Verify old data exists in localStorage
- Check if migration already completed

### Theme Not Applied
- Verify theme name mapping
- Check user group compatibility
- Validate migrated data structure

### Rollback Issues
- Ensure rollback data exists
- Check for storage permission errors
- Verify rollback data integrity

### Performance Issues
- Use early initialization
- Avoid repeated migration checks
- Clean up rollback data

## Migration Flow Diagram

```
┌─────────────────┐
│   App Start     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Check Migration │
│    Status       │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌───────────┐ ┌─────────────┐
│Migrated?  │ │Old Data?    │
└─────┬─────┘ └──────┬──────┘
      │               │
     Yes│            No│
      ▼               ▼
┌───────────┐   ┌─────────────┐
│Use Existing│   │Skip         │
│Theme Config│   │Migration    │
└─────┬─────┘   └─────────────┘
      │
      ▼
┌─────────────────┐
│Run Migration    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│Validate Data    │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌───────────┐ ┌─────────────┐
│Valid?     │ │Invalid?     │
└─────┬─────┘ └──────┬──────┘
      │               │
     Yes│            Yes│
      ▼               ▼
┌───────────┐   ┌─────────────┐
│Save New   │   │Rollback or  │
│Config     │   │Error        │
└─────┬─────┘   └─────────────┘
      │
      ▼
┌─────────────────┐
│Clean Old Keys  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│Save Rollback    │
│Data             │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│Complete         │
└─────────────────┘
```

## API Reference

### Classes

#### `ThemeStorageMigration`

Static class providing migration functionality.

**Methods:**
- `isMigrationComplete(): boolean` - Check if migration is complete
- `scanOldData(): Record<string, any>` - Scan for old theme data
- `migrateFromOldFormat(manual?: boolean): MigrationResult` - Run migration
- `rollbackMigration(): boolean` - Rollback migration
- `getMigrationStatus(): MigrationStatus` - Get migration status
- `clearRollbackData(): void` - Clear rollback data
- `forceRemigration(): MigrationResult` - Force re-migration

### Components

#### `MigrationProvider`

Provider component that handles migration before rendering children.

**Props:**
- `children: React.ReactNode` - Child components
- `onMigrationComplete?: (result: MigrationResult) => void` - Success callback
- `onMigrationError?: (error: string) => void` - Error callback
- `enableAutoMigration?: boolean` - Enable automatic migration

#### `ThemeProviderWithMigration`

Enhanced ThemeProvider with built-in migration support.

Accepts all ThemeProvider props plus MigrationProvider props.

#### `MigrationDebugger`

Development-only debugging component.

### Hooks

#### `useThemeMigration()`

Hook for accessing migration status and controls.

**Returns:**
- `isMigrated: boolean` - Migration completion status
- `hasOldData: boolean` - Old data presence
- `oldKeys: string[]` - Detected old keys
- `canRollback: boolean` - Rollback availability
- `migrate() => void` - Trigger migration
- `rollback() => void` - Trigger rollback
- `clearRollback() => void` - Clear rollback data
- `forceRemigration() => void` - Force re-migration

### Functions

#### `runThemeMigration(manual?: boolean): MigrationResult`

Convenience function to run migration.

#### `isThemeMigrationNeeded(): boolean`

Check if migration is needed.

#### `getThemeMigrationStatus(): MigrationStatus`

Get migration status information.

#### `rollbackThemeMigration(): boolean`

Rollback migration.

#### `clearMigrationRollback(): void`

Clear rollback data.

#### `initializeThemeMigration(): void`

Initialize migration early in app lifecycle.

### Types

#### `MigrationResult`

```typescript
interface MigrationResult {
  success: boolean;
  migrated: boolean;
  oldDataFound: boolean;
  errors: string[];
  warnings: string[];
  migratedKeys: string[];
  rollbackData?: RollbackData;
}
```

#### `RollbackData`

```typescript
interface RollbackData {
  timestamp: number;
  version: string;
  removedKeys: Array<{ key: string; value: any }>;
  newKeys: Array<{ key: string; value: any }>;
}
```

#### `MigrationStatus`

```typescript
interface MigrationStatus {
  isMigrated: boolean;
  version: string | null;
  hasOldData: boolean;
  oldKeys: string[];
  canRollback: boolean;
}
```

## Migration Examples

### Example 1: Basic App Setup

```tsx
import { ThemeProviderWithMigration, initializeThemeMigration } from '@/components/renderer/theme';

// Initialize early
initializeThemeMigration();

export default function App() {
  return (
    <ThemeProviderWithMigration>
      <div className="app">
        <h1>My App</h1>
        {/* Your app content */}
      </div>
    </ThemeProviderWithMigration>
  );
}
```

### Example 2: Advanced Configuration

```tsx
import {
  ThemeProviderWithMigration,
  useThemeMigration,
  MigrationDebugger
} from '@/components/renderer/theme';

function AppWithMigration() {
  const { isMigrated, hasOldData } = useThemeMigration();

  return (
    <>
      <ThemeProviderWithMigration
        defaultTheme="system"
        defaultUserGroup="system"
        enableAutoMigration={true}
        onMigrationComplete={(result) => {
          // Track successful migration
          analytics.track('theme_migration_success', {
            migratedKeys: result.migratedKeys.length,
            warnings: result.warnings.length,
          });
        }}
        onMigrationError={(error) => {
          // Track migration errors
          analytics.track('theme_migration_error', {
            error,
            hasOldData,
          });
        }}
      >
        <div className="app">
          {process.env.NODE_ENV === 'development' && <MigrationDebugger />}
          {/* Your app content */}
        </div>
      </ThemeProviderWithMigration>
    </>
  );
}
```

### Example 3: Custom Migration Logic

```tsx
import { ThemeStorageMigration } from '@/components/renderer/theme';

function CustomMigrationHandler() {
  const handleMigration = () => {
    // Check custom conditions
    const shouldMigrate = checkCustomConditions();

    if (shouldMigrate) {
      const result = ThemeStorageMigration.migrateFromOldFormat(true);

      if (result.success) {
        // Handle success
        console.log('Custom migration completed');

        // Clear rollback data after confirmation
        setTimeout(() => {
          ThemeStorageMigration.clearRollbackData();
        }, 5000);
      } else {
        // Handle errors
        console.error('Custom migration failed:', result.errors);

        // Attempt rollback
        if (ThemeStorageMigration.rollbackMigration()) {
          console.log('Migration rolled back successfully');
        }
      }
    }
  };

  return <button onClick={handleMigration}>Run Custom Migration</button>;
}

function checkCustomConditions(): boolean {
  // Your custom logic here
  return true;
}
```

## Conclusion

The theme storage migration system provides a robust solution for transitioning from old theme storage formats to the new structured format. With automatic detection, comprehensive error handling, and rollback capabilities, it ensures a smooth migration experience for your users.

For questions or issues, refer to the test files or create an issue in the project repository.