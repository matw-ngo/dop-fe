# Theme System - Quick Reference

**Quick guide for common theme operations**

## 📖 Table of Contents

- [Access Theme](#access-theme)
- [Add New Tenant](#add-new-tenant)
- [Extend Theme Properties](#extend-theme-properties)
- [Create Theme Variant](#create-theme-variant)
- [Use Theme in Components](#use-theme-in-components)
- [Utilities](#utilities)

---

## Access Theme

### In Components

```tsx
import { useFormTheme } from '@/components/form-generation/themes';

function MyComponent() {
  const { theme, setTheme, isTransitioning } = useFormTheme();
  
  return <div style={{ color: theme.colors.primary }}>...</div>;
}
```

### Get CSS Variables

```tsx
import { useThemeCssVars } from '@/components/form-generation/themes';

function MyComponent() {
  const cssVars = useThemeCssVars();
  
  return <div style={{ color: cssVars['--form-primary'] }}>...</div>;
}
```

### Via CSS Classes

```tsx
<div className="text-[var(--form-text)] bg-[var(--form-bg)]">
  Themed content
</div>
```

---

## Add New Tenant

### 1. Create Theme

```typescript
// src/configs/themes/newtenant-theme.ts
import type { FormTheme } from "@/components/form-generation/themes/types";

export const newTenantTheme: FormTheme = {
  name: "newtenant",
  colors: {
    primary: "#0066cc",
    border: "#e0e0e0",
    borderFocus: "#0066cc",
    background: "#ffffff",
    placeholder: "#999999",
    error: "#ff0000",
    disabled: "#f5f5f5",
    readOnly: "#fafafa",
    textPrimary: "#333333",
    textSecondary: "#666666",
  },
  borderRadius: { control: "4px" },
  spacing: { paddingHorizontal: "12px", paddingVertical: "16px" },
  typography: { fontSize: "14px", labelFontSize: "12px", labelFontWeight: "500" },
  sizes: { sm: "36px", md: "44px", lg: "52px" },
  focusRing: { width: "2px", color: "#0066cc", opacity: "20" },
  fieldOptions: { internalLabel: false },
};
```

### 2. Create Tenant Config

```typescript
// src/configs/tenants/newtenant.ts
import { newTenantTheme } from "@/configs/themes";
import type { TenantConfig } from "./types";

export const newTenantConfig: TenantConfig = {
  id: "newtenant",
  uuid: "22222222-2222-2222-2222-222222222222",
  name: "New Tenant",
  theme: newTenantTheme,
  i18nNamespace: "tenants.newtenant",
  branding: { logoUrl: "/images/newtenant-logo.png" },
  products: { /* ... */ },
  stats: { /* ... */ },
  features: { /* ... */ },
  legal: { /* ... */ },
};
```

### 3. Register Tenant

```typescript
// src/configs/tenants/index.ts
import { finzoneConfig } from "./finzone";
import { newTenantConfig } from "./newtenant";

const tenants: Record<string, TenantConfig> = {
  finzone: finzoneConfig,
  newtenant: newTenantConfig, // Add here
};

export function getTenantIdFromHostname(hostname: string): string {
  if (hostname.includes("finzone")) return "finzone";
  if (hostname.includes("newtenant")) return "newtenant"; // Add mapping
  return "finzone";
}
```

**Done!** Theme automatically applies when visiting tenant's domain.

---

## Extend Theme Properties

### 1. Update Type

```typescript
// src/components/form-generation/themes/types.ts
export interface FormTheme {
  // ... existing
  
  customProperty?: {
    value1?: string;
    value2?: number;
  };
}
```

### 2. Update Default Theme

```typescript
// src/components/form-generation/themes/default.ts
export const defaultTheme: FormTheme = {
  // ... existing
  
  customProperty: {
    value1: "default",
    value2: 100,
  },
};
```

### 3. Update Tenant Theme

```typescript
// src/configs/themes/finzone-theme.ts
export const finzoneTheme: FormTheme = {
  // ... existing
  
  customProperty: {
    value1: "custom",
    value2: 200,
  },
};
```

### 4. Add CSS Variables (Optional)

```typescript
// src/components/form-generation/themes/ThemeProvider.tsx
const themeCssVars = useMemo(() => ({
  // ... existing
  "--custom-value": currentTheme.customProperty?.value1 || "default",
}), [currentTheme]);
```

---

## Create Theme Variant

### Dark Mode Variant

```typescript
import { createDarkVariant } from '@/components/form-generation/themes/theme-helpers';

const finzoneDark = createDarkVariant(finzoneTheme);
```

### Custom Variant

```typescript
import { mergeThemes } from '@/components/form-generation/themes/theme-helpers';

const blueVariant = mergeThemes(finzoneTheme, {
  name: 'finzone-blue',
  colors: {
    primary: '#0066cc',
    borderFocus: '#0066cc',
  },
});
```

### Color Adjustments

```typescript
import { lightenColor, darkenColor } from '@/components/form-generation/themes/theme-helpers';

const lighterPrimary = lightenColor(finzoneTheme.colors.primary, 20);
const darkerPrimary = darkenColor(finzoneTheme.colors.primary, 20);
```

---

## Use Theme in Components

### Method 1: useFormTheme Hook

```tsx
import { useFormTheme } from '@/components/form-generation/themes';

function MyComponent() {
  const { theme } = useFormTheme();
  
  return (
    <div style={{
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.control,
    }}>
      Content
    </div>
  );
}
```

### Method 2: CSS Variables (Recommended)

```tsx
function MyComponent() {
  return (
    <div className={cn(
      "text-[var(--form-text)]",
      "bg-[var(--form-bg)]",
      "border-[var(--form-border)]",
      "rounded-[var(--radius)]"
    )}>
      Content
    </div>
  );
}
```

### Method 3: useThemeCssVars Hook

```tsx
import { useThemeCssVars } from '@/components/form-generation/themes';

function MyComponent() {
  const vars = useThemeCssVars();
  
  return (
    <div style={{
      color: vars['--form-text'],
      backgroundColor: vars['--form-bg'],
    }}>
      Content
    </div>
  );
}
```

---

## Utilities

### Color Manipulation

```typescript
import {
  lightenColor,
  darkenColor,
  hexToRgb,
  rgbToHex,
} from '@/components/form-generation/themes/theme-helpers';

// Lighten/darken
const lighter = lightenColor('#017848', 20); // 20% lighter
const darker = darkenColor('#017848', 20);   // 20% darker

// Convert
const rgb = hexToRgb('#017848');  // { r: 1, g: 120, b: 72 }
const hex = rgbToHex(1, 120, 72); // '#017848'
```

### Accessibility

```typescript
import {
  getContrastRatio,
  meetsWCAGStandards,
} from '@/components/form-generation/themes/theme-helpers';

// Check contrast
const ratio = getContrastRatio('#017848', '#ffffff'); // 4.8

// WCAG compliance
const isAccessible = meetsWCAGStandards(
  '#017848',  // foreground
  '#ffffff',  // background
  'AA'        // level: 'AA' or 'AAA'
); // true
```

### Color Palette

```typescript
import { generateColorPalette } from '@/components/form-generation/themes/theme-helpers';

const palette = generateColorPalette('#017848');
// Returns: { 50: '#...', 100: '#...', ..., 900: '#...' }
```

### Theme Operations

```typescript
import {
  mergeThemes,
  serializeTheme,
  deserializeTheme,
  areThemesEqual,
  getThemeDisplayName,
} from '@/components/form-generation/themes/theme-helpers';

// Merge
const merged = mergeThemes(baseTheme, overrides);

// Serialize/Deserialize
const json = serializeTheme(theme);
const theme = deserializeTheme(json);

// Compare
const isSame = areThemesEqual(theme1, theme2);

// Display name
const name = getThemeDisplayName('finzone-dark'); // 'Finzone Dark'
```

---

## Available CSS Variables

```css
/* Colors */
--color-primary
--color-border
--color-background
--color-foreground
--color-muted
--color-accent
--color-destructive

/* Form-specific */
--form-primary
--form-border
--form-bg
--form-text
--form-text-secondary
--form-radio-border

/* Layout */
--radius

/* Shadcn/UI */
--color-card
--color-popover
--color-muted-foreground
--color-accent-foreground
```

---

## Common Patterns

### Theme Switcher

```tsx
function ThemeSwitcher() {
  const { theme, setTheme, isTransitioning } = useFormTheme();
  
  return (
    <select
      value={theme.name}
      onChange={(e) => {
        const newTheme = themes.find(t => t.name === e.target.value);
        if (newTheme) setTheme(newTheme);
      }}
      disabled={isTransitioning}
    >
      {themes.map(t => (
        <option key={t.name} value={t.name}>
          {getThemeDisplayName(t.name)}
        </option>
      ))}
    </select>
  );
}
```

### Conditional Styling

```tsx
function MyComponent() {
  const { theme } = useFormTheme();
  const isFinzone = theme.name === 'finzone';
  
  return (
    <div className={cn(
      "p-4",
      isFinzone && "special-finzone-styles"
    )}>
      Content
    </div>
  );
}
```

### Dynamic Theme Loading

```tsx
function App() {
  const { setTheme } = useFormTheme();
  
  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved) {
      const theme = deserializeTheme(saved);
      if (theme) setTheme(theme);
    }
  }, []);
  
  return <YourApp />;
}
```

---

## Troubleshooting

### Theme not applying?
1. Check TenantThemeProvider is in Providers
2. Verify tenant config has theme property
3. Check console for validation errors

### CSS variables not working?
1. Ensure component is inside FormThemeProvider
2. Check variable name spelling
3. Inspect element to verify variables are injected

### Type errors?
1. Run `pnpm type-check`
2. Ensure theme matches FormTheme interface
3. Check for missing required properties

---

## Resources

- [Migration Guide](./tenant-aware-theme-migration.md)
- [Enhancement Documentation](./theme-enhancements.md)
- [Integration Verification](./integration-verification.md)
- [Extending Properties](./extending-theme-properties.md)
