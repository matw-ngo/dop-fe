# Extending Theme Properties

**Guide:** How to add new properties to tenant themes  
**Date:** 2026-03-03

## Overview

Hệ thống theme được thiết kế để dễ dàng mở rộng. Bạn có thể thêm properties mới mà không ảnh hưởng đến code hiện tại.

## Scenario: Thêm Properties Mới

Giả sử bạn muốn thêm:
- Custom font families
- Animation speeds
- Shadow styles
- Custom component variants

## Step-by-Step Guide

### 1. Update Theme Type Definition

**File:** `src/components/form-generation/themes/types.ts`

```typescript
export interface FormTheme {
  name: string;
  colors: { /* existing */ };
  borderRadius: { /* existing */ };
  spacing: { /* existing */ };
  typography: { /* existing */ };
  sizes: { /* existing */ };
  focusRing: { /* existing */ };
  fieldOptions?: { /* existing */ };
  
  // ✨ NEW PROPERTIES
  fonts?: {
    /**
     * Font family for headings
     */
    heading?: string;
    
    /**
     * Font family for body text
     */
    body?: string;
    
    /**
     * Font family for monospace (code)
     */
    mono?: string;
  };
  
  animations?: {
    /**
     * Duration for fast animations (ms)
     */
    fast?: number;
    
    /**
     * Duration for normal animations (ms)
     */
    normal?: number;
    
    /**
     * Duration for slow animations (ms)
     */
    slow?: number;
    
    /**
     * Easing function
     */
    easing?: string;
  };
  
  shadows?: {
    /**
     * Small shadow for subtle elevation
     */
    sm?: string;
    
    /**
     * Medium shadow for cards
     */
    md?: string;
    
    /**
     * Large shadow for modals
     */
    lg?: string;
  };
  
  // Existing properties...
  components?: { /* existing */ };
}
```

### 2. Update Default Theme

**File:** `src/components/form-generation/themes/default.ts`

```typescript
export const defaultTheme: FormTheme = {
  name: "default",
  colors: { /* existing */ },
  borderRadius: { /* existing */ },
  spacing: { /* existing */ },
  typography: { /* existing */ },
  sizes: { /* existing */ },
  focusRing: { /* existing */ },
  
  // ✨ ADD NEW DEFAULTS
  fonts: {
    heading: "var(--font-geist-sans)",
    body: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
  
  // Existing properties...
};
```

### 3. Update Tenant Theme

**File:** `src/configs/themes/finzone-theme.ts`

```typescript
export const finzoneTheme: FormTheme = {
  name: "finzone",
  colors: { /* existing */ },
  borderRadius: { /* existing */ },
  spacing: { /* existing */ },
  typography: { /* existing */ },
  sizes: { /* existing */ },
  focusRing: { /* existing */ },
  fieldOptions: { /* existing */ },
  
  // ✨ ADD TENANT-SPECIFIC VALUES
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  
  animations: {
    fast: 150,
    normal: 200, // Faster than default
    slow: 400,
    easing: "ease-in-out",
  },
  
  shadows: {
    sm: "0 1px 3px rgba(1, 120, 72, 0.1)",
    md: "0 4px 8px rgba(1, 120, 72, 0.15)",
    lg: "0 10px 20px rgba(1, 120, 72, 0.2)",
  },
  
  // Existing properties...
};
```

### 4. Update ThemeProvider CSS Variables

**File:** `src/components/form-generation/themes/ThemeProvider.tsx`

```typescript
const themeCssVars = useMemo(() => {
  const textPrimary = currentTheme.colors.textPrimary || "#0f172a";
  const textSecondary = currentTheme.colors.textSecondary || "#64748b";

  return {
    // Existing variables...
    "--color-primary": currentTheme.colors.primary,
    "--form-primary": currentTheme.colors.primary,
    // ... other existing vars
    
    // ✨ ADD NEW CSS VARIABLES
    "--font-heading": currentTheme.fonts?.heading || "inherit",
    "--font-body": currentTheme.fonts?.body || "inherit",
    "--font-mono": currentTheme.fonts?.mono || "monospace",
    
    "--animation-fast": `${currentTheme.animations?.fast || 150}ms`,
    "--animation-normal": `${currentTheme.animations?.normal || 300}ms`,
    "--animation-slow": `${currentTheme.animations?.slow || 500}ms`,
    "--animation-easing": currentTheme.animations?.easing || "ease",
    
    "--shadow-sm": currentTheme.shadows?.sm || "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--shadow-md": currentTheme.shadows?.md || "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "--shadow-lg": currentTheme.shadows?.lg || "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    
    colorScheme: "light",
  } as CSSProperties;
}, [currentTheme]);
```

### 5. Update Theme Helpers (Optional)

**File:** `src/components/form-generation/themes/theme-helpers.ts`

```typescript
export function mergeThemes(
  baseTheme: FormTheme,
  overrides: Partial<FormTheme>,
): FormTheme {
  return {
    ...baseTheme,
    ...overrides,
    colors: { ...baseTheme.colors, ...overrides.colors },
    borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
    spacing: { ...baseTheme.spacing, ...overrides.spacing },
    typography: { ...baseTheme.typography, ...overrides.typography },
    sizes: { ...baseTheme.sizes, ...overrides.sizes },
    focusRing: { ...baseTheme.focusRing, ...overrides.focusRing },
    fieldOptions: { ...baseTheme.fieldOptions, ...overrides.fieldOptions },
    
    // ✨ ADD NEW PROPERTIES
    fonts: { ...baseTheme.fonts, ...overrides.fonts },
    animations: { ...baseTheme.animations, ...overrides.animations },
    shadows: { ...baseTheme.shadows, ...overrides.shadows },
    
    components: { ...baseTheme.components, ...overrides.components },
  };
}
```

### 6. Update useThemeCssVars Hook (Optional)

**File:** `src/components/form-generation/themes/ThemeProvider.tsx`

```typescript
export function useThemeCssVars(): Record<string, string> {
  const { theme } = useFormTheme();

  return useMemo(() => {
    const textPrimary = theme.colors.textPrimary || "#0f172a";
    const textSecondary = theme.colors.textSecondary || "#64748b";

    return {
      // Existing vars...
      "--color-primary": theme.colors.primary,
      "--form-primary": theme.colors.primary,
      // ... other existing
      
      // ✨ ADD NEW VARS
      "--font-heading": theme.fonts?.heading || "inherit",
      "--font-body": theme.fonts?.body || "inherit",
      "--font-mono": theme.fonts?.mono || "monospace",
      "--animation-fast": `${theme.animations?.fast || 150}ms`,
      "--animation-normal": `${theme.animations?.normal || 300}ms`,
      "--animation-slow": `${theme.animations?.slow || 500}ms`,
      "--shadow-sm": theme.shadows?.sm || "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--shadow-md": theme.shadows?.md || "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "--shadow-lg": theme.shadows?.lg || "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    };
  }, [theme]);
}
```

## Usage Examples

### Using New Font Properties

```tsx
function MyComponent() {
  const { theme } = useFormTheme();
  
  return (
    <div>
      <h1 style={{ fontFamily: theme.fonts?.heading }}>
        Heading with custom font
      </h1>
      <p style={{ fontFamily: theme.fonts?.body }}>
        Body text with custom font
      </p>
      <code style={{ fontFamily: theme.fonts?.mono }}>
        const code = 'monospace';
      </code>
    </div>
  );
}
```

### Using CSS Variables

```tsx
function MyComponent() {
  return (
    <div className="font-[var(--font-heading)]">
      <h1>Heading</h1>
    </div>
  );
}
```

### Using Animation Properties

```tsx
function AnimatedCard() {
  const { theme } = useFormTheme();
  
  return (
    <div
      style={{
        transition: `all var(--animation-normal) var(--animation-easing)`,
        boxShadow: 'var(--shadow-md)',
      }}
      className="hover:shadow-[var(--shadow-lg)]"
    >
      Card with themed animation
    </div>
  );
}
```

### Using Shadows

```tsx
function Card() {
  return (
    <div className="shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]">
      Card with themed shadows
    </div>
  );
}
```

## Backward Compatibility

✅ **All existing code continues to work!**

New properties are optional (`?` in TypeScript), so:
- Existing themes without new properties work fine
- Default values are provided
- No breaking changes

## Validation

Update validation if needed:

```typescript
function validateThemeConfig(theme: FormTheme): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Existing validations...
  if (!theme.name) errors.push("Theme name is required");
  
  // ✨ ADD NEW VALIDATIONS (optional)
  if (theme.fonts?.heading && !isValidFontFamily(theme.fonts.heading)) {
    errors.push(`Invalid font family: ${theme.fonts.heading}`);
  }
  
  if (theme.animations?.fast && theme.animations.fast < 0) {
    errors.push("Animation duration must be positive");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidFontFamily(font: string): boolean {
  // Basic validation
  return font.length > 0 && !font.includes(';');
}
```

## Real-World Example

### Scenario: Add Brand-Specific Illustrations

```typescript
// 1. Update types
export interface FormTheme {
  // ... existing
  
  illustrations?: {
    success?: string;  // URL or path
    error?: string;
    loading?: string;
    empty?: string;
  };
}

// 2. Update finzone theme
export const finzoneTheme: FormTheme = {
  // ... existing
  
  illustrations: {
    success: "/images/finzone/success.svg",
    error: "/images/finzone/error.svg",
    loading: "/images/finzone/loading.svg",
    empty: "/images/finzone/empty.svg",
  },
};

// 3. Use in components
function SuccessScreen() {
  const { theme } = useFormTheme();
  
  return (
    <div>
      {theme.illustrations?.success && (
        <img src={theme.illustrations.success} alt="Success" />
      )}
      <h2>Success!</h2>
    </div>
  );
}
```

## Best Practices

### 1. Use Optional Properties

```typescript
// ✅ Good - Optional
fonts?: {
  heading?: string;
}

// ❌ Bad - Required (breaks existing themes)
fonts: {
  heading: string;
}
```

### 2. Provide Defaults

```typescript
// ✅ Good - Has fallback
const heading = theme.fonts?.heading || "inherit";

// ❌ Bad - No fallback
const heading = theme.fonts.heading; // Error if undefined
```

### 3. Document New Properties

```typescript
/**
 * Custom font families for the theme
 */
fonts?: {
  /**
   * Font family for headings
   * @default "inherit"
   */
  heading?: string;
}
```

### 4. Update Validation

```typescript
// Add validation for new properties
if (theme.fonts?.heading && !isValidFontFamily(theme.fonts.heading)) {
  errors.push(`Invalid font family: ${theme.fonts.heading}`);
}
```

### 5. Update Helpers

```typescript
// Update mergeThemes to handle new properties
export function mergeThemes(base: FormTheme, overrides: Partial<FormTheme>) {
  return {
    ...base,
    ...overrides,
    // Deep merge all nested objects
    fonts: { ...base.fonts, ...overrides.fonts },
  };
}
```

## Migration Checklist

When adding new theme properties:

- [ ] Update `FormTheme` type in `types.ts`
- [ ] Add defaults to `default.ts`
- [ ] Update tenant themes (e.g., `finzone-theme.ts`)
- [ ] Add CSS variables to `ThemeProvider.tsx`
- [ ] Update `useThemeCssVars` hook (if needed)
- [ ] Update `mergeThemes` helper
- [ ] Add validation (if needed)
- [ ] Document new properties
- [ ] Add usage examples
- [ ] Test with existing themes
- [ ] Update migration guide

## Testing

```typescript
import { finzoneTheme } from '@/configs/themes/finzone-theme';

describe('Extended Theme Properties', () => {
  it('should have new font properties', () => {
    expect(finzoneTheme.fonts).toBeDefined();
    expect(finzoneTheme.fonts?.heading).toBe('Inter, sans-serif');
  });
  
  it('should work without new properties', () => {
    const minimalTheme: FormTheme = {
      name: 'minimal',
      colors: { /* required only */ },
      // No fonts, animations, shadows
    };
    
    // Should not throw
    expect(() => mergeThemes(defaultTheme, minimalTheme)).not.toThrow();
  });
  
  it('should merge new properties correctly', () => {
    const merged = mergeThemes(finzoneTheme, {
      fonts: { heading: 'Custom Font' }
    });
    
    expect(merged.fonts?.heading).toBe('Custom Font');
    expect(merged.fonts?.body).toBe('Inter, sans-serif'); // Preserved
  });
});
```

## Summary

Thêm properties mới vào theme rất đơn giản:

1. ✅ Update type definition (optional properties)
2. ✅ Add defaults
3. ✅ Update tenant themes
4. ✅ Add CSS variables (if needed)
5. ✅ Update helpers
6. ✅ Test backward compatibility

Hệ thống được thiết kế để mở rộng dễ dàng mà không ảnh hưởng code hiện tại!
