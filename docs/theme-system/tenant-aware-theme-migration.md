# Tenant-Aware Theme Migration

**Date:** 2026-03-03  
**Status:** ✅ Completed

## Overview

Migrated the entire application from hardcoded `legacyLoanTheme` to tenant-aware theming system. Now all form components automatically use the theme configured for the current tenant.

## Changes Made

### 1. Global Theme Provider Setup

**File:** `src/components/layout/providers.tsx`

Added `TenantThemeProvider` to the global provider hierarchy:

```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <ThemeProvider>
      <TenantThemeProvider>  {/* ← Added */}
        {children}
        <ConsentGlobalProvider />
        <Toaster />
      </TenantThemeProvider>
    </ThemeProvider>
  </AuthProvider>
</QueryClientProvider>
```

### 2. Removed Hardcoded Theme Imports

Removed all imports of `legacyLoanTheme` and `FormThemeProvider` from:

- ✅ `src/app/[locale]/loan-info/page.tsx`
- ✅ `src/app/[locale]/loan-wizard/page.tsx`
- ✅ `src/components/loan-application/DynamicLoanForm.tsx`
- ✅ `src/components/loan-application/FlowFormDialog.tsx`
- ✅ `src/components/loan-application/DynamicLoanForm/DynamicLoanForm.stories.tsx`

### 3. Updated Storybook Stories

**File:** `src/components/loan-application/DynamicLoanForm/DynamicLoanForm.stories.tsx`

Changed all story wrappers from:
```tsx
<FormThemeProvider theme={legacyLoanTheme}>
  <StepWizard config={config} />
</FormThemeProvider>
```

To:
```tsx
<TenantThemeProvider>
  <StepWizard config={config} />
</TenantThemeProvider>
```

## How It Works

### Tenant Detection Flow

```
1. User visits site
   ↓
2. useTenant() hook detects hostname
   ↓
3. getTenantIdFromHostname() maps hostname → tenant ID
   ↓
4. getTenantConfig() loads tenant configuration
   ↓
5. TenantThemeProvider wraps app with tenant.theme
   ↓
6. All form components use useFormTheme() to access theme
```

### Tenant Configuration

**File:** `src/configs/tenants/finzone.ts`

```typescript
export const finzoneConfig: TenantConfig = {
  id: "finzone",
  theme: finzoneTheme,  // ← Theme linked here
  // ... other config
};
```

**File:** `src/configs/themes/finzone-theme.ts`

```typescript
export const finzoneTheme: FormTheme = {
  name: "finzone",
  colors: {
    primary: "#017848",
    border: "#bfd1cc",
    // ... other colors
  },
  fieldOptions: {
    internalLabel: true,
  },
  // ... other theme config
};
```

## Benefits

### ✅ Automatic Theme Switching
- Theme changes automatically based on hostname
- No manual theme selection needed
- Consistent theming across entire app

### ✅ Multi-Tenant Ready
- Easy to add new tenants with different themes
- Each tenant can have unique branding
- Theme configuration centralized in tenant config

### ✅ Simplified Component Code
- Components no longer need to import/specify theme
- Reduced boilerplate in every form component
- Single source of truth for theming

### ✅ Better Maintainability
- Theme changes in one place affect entire app
- No scattered theme imports to update
- Easier to test different tenant themes

## Adding a New Tenant

To add a new tenant with custom theme:

### 1. Create Theme Configuration

**File:** `src/configs/themes/newtenant-theme.ts`

```typescript
import type { FormTheme } from "@/components/form-generation/themes/types";

export const newTenantTheme: FormTheme = {
  name: "newtenant",
  colors: {
    primary: "#YOUR_PRIMARY_COLOR",
    border: "#YOUR_BORDER_COLOR",
    // ... customize colors
  },
  // ... other theme properties
};
```

### 2. Create Tenant Configuration

**File:** `src/configs/tenants/newtenant.ts`

```typescript
import { newTenantTheme } from "@/configs/themes";
import type { TenantConfig } from "./types";

export const newTenantConfig: TenantConfig = {
  id: "newtenant",
  uuid: "YOUR-UUID-HERE",
  name: "New Tenant",
  theme: newTenantTheme,  // ← Link theme here
  // ... other config
};
```

### 3. Register Tenant

**File:** `src/configs/tenants/index.ts`

```typescript
import { finzoneConfig } from "./finzone";
import { newTenantConfig } from "./newtenant";

const tenants: Record<string, TenantConfig> = {
  finzone: finzoneConfig,
  newtenant: newTenantConfig,  // ← Add here
};

export function getTenantIdFromHostname(hostname: string): string {
  if (hostname.includes("finzone")) return "finzone";
  if (hostname.includes("newtenant")) return "newtenant";  // ← Add mapping
  return "finzone"; // default
}
```

### 4. Done!

The new tenant theme will automatically apply when users visit the tenant's hostname.

## Testing

### Manual Testing

1. **Local Development:**
   ```bash
   pnpm dev
   # Visit http://localhost:3001
   # Should use finzone theme (default)
   ```

2. **Test Different Tenants:**
   - Modify `getTenantIdFromHostname()` to return different tenant IDs
   - Or use hostname mapping in `/etc/hosts`

### Automated Testing

```bash
# Type checking
pnpm type-check  # ✅ Passed

# Linting
pnpm lint  # ✅ Passed (minor warnings unrelated to changes)

# Unit tests
pnpm test:run

# E2E tests
pnpm test:e2e
```

## Migration Checklist

- [x] Add `TenantThemeProvider` to global providers
- [x] Remove all `legacyLoanTheme` imports
- [x] Remove all `FormThemeProvider` wrappers with hardcoded theme
- [x] Update Storybook stories to use `TenantThemeProvider`
- [x] Verify type checking passes
- [x] Verify linting passes
- [x] Test theme application in development
- [x] Document migration process

## Rollback Plan

If issues arise, rollback by:

1. Revert `src/components/layout/providers.tsx`
2. Re-add `FormThemeProvider` wrappers with `legacyLoanTheme`
3. Re-add theme imports to affected files

## Related Files

### Core Theme System
- `src/components/form-generation/themes/ThemeProvider.tsx` - Theme context provider
- `src/components/form-generation/themes/types.ts` - Theme type definitions
- `src/components/layout/TenantThemeProvider.tsx` - Tenant-aware wrapper

### Tenant Configuration
- `src/configs/tenants/index.ts` - Tenant registry
- `src/configs/tenants/types.ts` - Tenant config types
- `src/configs/tenants/finzone.ts` - Finzone tenant config

### Theme Configuration
- `src/configs/themes/finzone-theme.ts` - Finzone theme
- `src/configs/themes/index.ts` - Theme exports

### Hooks
- `src/hooks/tenant/use-tenant.ts` - Tenant detection hook
- `src/components/form-generation/themes/ThemeProvider.tsx` - `useFormTheme()` hook

## Notes

- All form field components already support theme via `useFormTheme()` hook
- No changes needed to individual field components
- Theme CSS variables are automatically applied via `ThemeProvider`
- Storybook stories now use tenant-aware theming for consistency

## Future Enhancements

- [ ] Add theme preview in admin panel
- [ ] Support runtime theme switching (without page reload)
- [ ] Add theme validation in CI/CD
- [ ] Create theme testing utilities
- [ ] Add theme documentation generator
