# useTheme Hook Usage Inventory

**Generated on:** 2025-12-14
**Phase:** C.1 - Find all useTheme hook usage
**Total files found:** 38

## Summary

This inventory documents all instances where the `useTheme` hook is used throughout the codebase. The usage patterns have been categorized to help with the migration to the new unified ThemeProvider API.

## Usage Categories

### 1. Core Theme System Files (Internal Implementation)
These files are part of the theme system implementation and should be excluded from migration.

| File | Usage Pattern | Notes |
|------|---------------|-------|
| `src/components/renderer/theme/context.tsx` | Internal implementation | Core context provider |
| `src/components/renderer/theme/theme-provider.tsx` | Internal implementation | Main theme provider |
| `src/components/renderer/theme/use-theme.ts` | Internal implementation | Hook definition |
| `src/components/renderer/theme/index.tsx` | Internal implementation | Public exports |
| `src/lib/theme/context.tsx` | Alternative implementation | Legacy context (to be evaluated) |
| `src/lib/theme-performance-integration.ts` | Performance integration | Uses theme for monitoring |

### 2. Test Files (Safe to Update)
These files contain theme-related tests and will need to be updated to work with the new API.

| File | Test Type | Priority |
|------|-----------|----------|
| `src/components/renderer/theme/__tests__/accessibility.test.tsx` | Accessibility tests | Medium |
| `src/components/renderer/theme/__tests__/dark-mode-data-attribute.test.tsx` | Data attribute tests | High |
| `src/components/renderer/theme/__tests__/debounce.test.tsx` | Performance tests | Medium |
| `src/components/renderer/theme/__tests__/migration-helper.test.tsx` | Migration tests | High |
| `src/components/renderer/theme/__tests__/security.test.tsx` | Security tests | Medium |
| `src/components/renderer/theme/__tests__/theme-provider.optimization.test.tsx` | Optimization tests | Medium |
| `src/components/renderer/theme/__tests__/unified-provider.test.tsx` | Provider tests | High |
| `vitest.setup.ts` | Global test setup | Low |

### 3. Feature-Specific Theme Providers (High Priority)
These files provide theme context to specific features and will need migration.

| File | Current API Usage | Theme Properties Used |
|------|-------------------|----------------------|
| `src/components/features/credit-card/CreditCardsThemeProvider.tsx` | `userGroup, setUserGroup, setTheme` | Basic theme management |
| `src/components/features/insurance/InsuranceThemeProvider.tsx` | `userGroup, setUserGroup, setTheme` | Basic theme management |
| `src/components/features/tools/ToolsThemeProvider.tsx` | `userGroup, setUserGroup, setTheme, currentTheme` | Extended theme management |

### 4. Feature Components (High Priority)
These are feature components that directly consume theme context.

| File | Current API Usage | Theme Properties Used |
|------|-------------------|----------------------|
| `src/components/features/credit-card/CreditCardsPageHero.tsx` | To be analyzed | Likely theme colors |
| `src/components/features/credit-card/CreditCardsPageControls.tsx` | To be analyzed | Likely theme controls |
| `src/components/features/insurance/InsurancePageHero.tsx` | To be analyzed | Likely theme colors |
| `src/components/features/insurance/InsurancePageControls.tsx` | To be analyzed | Likely theme controls |
| `src/components/features/insurance/InsurancePageContent.tsx` | To be analyzed | Theme-aware content |
| `src/components/features/tools/ToolsPageLayout.tsx` | To be analyzed | Layout theming |
| `src/components/features/tools/ToolsThemeToggle.tsx` | `currentTheme, userGroup, availableThemes, setTheme, setUserGroup` | Full theme switching UI |

### 5. Feature-Specific Hooks (High Priority)
These hooks extend theme functionality for specific features.

| File | Current API Usage | Purpose |
|------|-------------------|---------|
| `src/hooks/features/credit-card/useCreditCardsNavbarTheme.ts` | `themeConfig, userGroup` + `next-themes` | Navbar theming |
| `src/hooks/features/insurance/useInsuranceTheme.ts` | To be analyzed | Insurance-specific theming |
| `src/hooks/features/insurance/useInsuranceNavbarTheme.ts` | To be analyzed | Navbar theming |

### 6. UI Components (Medium Priority)
Reusable UI components that consume theme context.

| File | Current API Usage | Notes |
|------|-------------------|-------|
| `src/components/ui/sonner/index.tsx` | To be analyzed | Toast notification theming |
| `src/components/renderer/layouts/Flex.tsx` | Uses `useThemeUtils` (not useTheme directly) | Layout spacing |
| `src/components/renderer/layouts/Stack.tsx` | Uses `useThemeUtils` (not useTheme directly) | Layout spacing |
| `src/components/renderer/layouts/Grid.tsx` | Uses `useThemeUtils` (not useTheme directly) | Layout spacing |
| `src/components/renderer/layouts/Container.tsx` | Uses `useThemeUtils` (not useTheme directly) | Layout spacing |

### 7. Theme Customization Components (Medium Priority)
Components for theme customization and selection.

| File | Current API Usage | Purpose |
|------|-------------------|---------|
| `src/components/theme/theme-customizer.tsx` | To be analyzed | Theme customization UI |
| `src/components/theme/theme-selector.tsx` | To be analyzed | Theme selection UI |
| `src/components/theme/theme-switcher.tsx` | To be analyzed | Theme switching UI |
| `src/components/theme/theme-system.stories.tsx` | Storybook stories | Component documentation |

### 8. Migration Helper (Special Category)
This file assists with the migration process.

| File | Current API Usage | Notes |
|------|-------------------|-------|
| `src/components/renderer/theme/migration-helper.tsx` | Provides backward compatibility | Will be deprecated post-migration |

## Migration Priority Matrix

### Priority 1 (Critical - Core Features)
- Feature Theme Providers (3 files)
- Feature Components (6 files)
- Feature Hooks (3 files)
- Migration-dependent tests (3 files)

### Priority 2 (High - UI Components)
- Theme Customization Components (4 files)
- Layout Components (4 files - note: useThemeUtils, not useTheme)
- Core Theme Tests (4 files)

### Priority 3 (Medium)
- Remaining test files (4 files)
- UI components (1 file)

## Common Usage Patterns Found

1. **Basic Theme Management**
   ```typescript
   const { userGroup, setUserGroup, setTheme } = useTheme();
   ```

2. **Extended Theme Management**
   ```typescript
   const { currentTheme, userGroup, availableThemes, setTheme, setUserGroup } = useTheme();
   ```

3. **Theme Configuration Access**
   ```typescript
   const { themeConfig, userGroup } = useTheme();
   ```

4. **Mixed with next-themes**
   ```typescript
   const { themeConfig, userGroup } = useTheme();
   const { resolvedTheme } = useNextTheme();
   ```

## Next Steps

1. Analyze each file to understand exact usage patterns
2. Map old API properties to new API properties
3. Update Priority 1 files first
4. Run tests after each batch of updates
5. Update migration helper to guide developers

## Notes

- Layout components use `useThemeUtils` instead of `useTheme` - these may not need migration
- Several files have `.bak` backups which indicate they've already been partially migrated
- The migration helper file will need to be updated to reflect the new API
- Test files will need to be updated to match the new hook behavior