# Theme System Migration Guide

This guide helps developers migrate from the old theme system to the new enhanced system with security, performance, and architectural improvements.

## Table of Contents

1. [Overview of Changes](#overview-of-changes)
2. [Breaking Changes](#breaking-changes)
3. [Migration Steps](#migration-steps)
4. [Code Examples](#code-examples)
5. [Security Integration](#security-integration)
6. [Performance Optimization](#performance-optimization)
7. [Testing Considerations](#testing-considerations)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

## Overview of Changes

### Security Enhancements

- **CSS Sanitization**: New `sanitize-css.ts` utility prevents CSS injection attacks
- **Input Validation**: Color validation with caching for performance
- **Safe Property Whitelist**: Only allowed CSS properties are accepted
- **XSS Prevention**: Blocked dangerous patterns and JavaScript URLs

### Performance Improvements

- **Lazy Loading**: Theme modules are loaded on-demand
- **Debounced Updates**: Theme changes are batched to reduce DOM thrashing
- **CSS Variable Optimization**: Only changed variables are updated
- **Performance Monitoring**: Built-in metrics tracking and analysis
- **Caching**: Validation results and computed themes are cached

### Architectural Changes

- **Unified Provider**: Single `ThemeProvider` replaces multiple context providers
- **Data Attributes**: Theme state stored in `data-*` attributes instead of classes
- **Type Safety**: Improved TypeScript definitions
- **Modular Structure**: Better separation of concerns

## Breaking Changes

### 1. Provider Consolidation

**Before:**
```typescript
// Multiple providers needed
<ThemeContextProvider>
  <CustomThemeProvider>
    <App />
  </CustomThemeProvider>
</ThemeContextProvider>
```

**After:**
```typescript
// Single unified provider
<ThemeProvider>
  <App />
</ThemeProvider>
```

### 2. Theme Detection

**Before:**
```css
/* CSS classes */
.theme-dark { /* styles */ }
.theme-light { /* styles */ }
```

**After:**
```css
/* Data attributes */
[data-theme="dark"] { /* styles */ }
[data-theme="light"] { /* styles */ }
[data-color-scheme="dark"] { /* styles */ }
```

### 3. Hook API Changes

**Before:**
```typescript
const { theme, setTheme } = useTheme();
```

**After:**
```typescript
const {
  theme,
  setTheme,
  setThemeByName,
  setThemeById,
  userGroup,
  setUserGroup,
  mode,
  setMode
} = useTheme();
```

### 4. Theme Storage

**Before:**
```typescript
// Stored as simple string
localStorage.setItem('theme', 'dark');
```

**After:**
```typescript
// Stored as structured config
localStorage.setItem('dop-theme-config', JSON.stringify({
  currentTheme: 'dark',
  userGroup: 'admin',
  customizations: { primary: '#ff0000' }
}));
```

## Migration Steps

### Step 1: Update Provider Setup

1. Replace all theme provider instances with the unified `ThemeProvider`

```typescript
// src/app/layout.tsx
import { ThemeProvider } from '@/components/renderer/theme';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider
          defaultTheme="system"
          defaultUserGroup="user"
          enableSystem={true}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2: Update CSS Selectors

1. Find all references to theme-based CSS classes
2. Replace with data attribute selectors

```bash
# Find theme class usage
grep -r "\.theme-" src/
grep -r "theme-" src/ | grep "\.class"
```

3. Update your CSS files:

```css
/* Before */
.component.theme-dark .title {
  color: white;
}

/* After */
.component[data-theme="dark"] .title {
  color: white;
}

/* Or use color-scheme for generic dark/light */
.component[data-color-scheme="dark"] .title {
  color: white;
}
```

### Step 3: Update Component Code

1. Update hook usage in components:

```typescript
// Before
import { useTheme } from '@/components/renderer/theme/context';

function Header() {
  const { theme, isDark } = useTheme();
  // ...
}

// After
import { useTheme } from '@/components/renderer/theme';

function Header() {
  const {
    theme,
    isDark,
    resolvedTheme,
    mode,
    setMode
  } = useTheme();
  // ...
}
```

2. Update theme switching logic:

```typescript
// Before
const toggleTheme = () => {
  setTheme(isDark ? lightTheme : darkTheme);
};

// After
const toggleTheme = () => {
  setMode(prev => prev === 'light' ? 'dark' : 'light');
};
```

### Step 4: Add Security Validation

1. Import and use validation utilities:

```typescript
import { isValidColor } from '@/lib/validate-colors';
import { sanitizeCSS } from '@/lib/sanitize-css';

// Validate user input
if (isValidColor(userColor)) {
  setCustomizations({ primary: userColor });
}

// Sanitize CSS input
const safeCSS = sanitizeCSS(userCSS);
```

### Step 5: Enable Performance Monitoring

1. Initialize monitoring in development:

```typescript
import { debugUtils } from '@/lib/theme-performance';

// In your app initialization
if (process.env.NODE_ENV === 'development') {
  debugUtils.enableDevelopmentMode();
}
```

2. Add performance tracking to theme operations:

```typescript
import { measureThemeOperation } from '@/lib/theme-performance';

const applyTheme = (theme) => {
  measureThemeOperation('theme-apply', () => {
    // Your theme application logic
  });
};
```

## Code Examples

### Migrating a Theme Switch Component

**Before:**
```typescript
import { useTheme } from '@/components/renderer/theme/context';

export function ThemeSwitch() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <button onClick={() => setTheme(isDark ? lightTheme : darkTheme)}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
```

**After:**
```typescript
import { useTheme } from '@/components/renderer/theme';

export function ThemeSwitch() {
  const { mode, setMode, resolvedTheme } = useTheme();

  const handleToggle = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Migrating Custom Theme Application

**Before:**
```typescript
// Direct CSS injection
const style = document.createElement('style');
style.textContent = userCSS;
document.head.appendChild(style);
```

**After:**
```typescript
import { sanitizeCSS } from '@/lib/sanitize-css';

// Sanitized CSS application
const safeCSS = sanitizeCSS(userCSS);
if (safeCSS) {
  const style = document.createElement('style');
  style.textContent = safeCSS;
  style.setAttribute('data-sanitized', 'true');
  document.head.appendChild(style);
}
```

### Migrating Theme Customization

**Before:**
```typescript
// Unrestricted color setting
const customizeTheme = (colors) => {
  Object.assign(theme.colors, colors);
  applyTheme(theme);
};
```

**After:**
```typescript
import { isValidColor } from '@/lib/validate-colors';
import { useTheme } from '@/components/renderer/theme';

const ThemeCustomizer = () => {
  const { setCustomizations, userGroupConfig } = useTheme();

  const handleColorChange = (property, value) => {
    if (!userGroupConfig?.customizations?.allowCustomColors) {
      console.warn('Custom colors not allowed for this user group');
      return;
    }

    if (isValidColor(value)) {
      setCustomizations({ [property]: value });
    } else {
      console.error(`Invalid color: ${value}`);
    }
  };

  // ...
};
```

## Security Integration

### 1. Required Imports

Add these security utilities to your theme-related files:

```typescript
import { sanitizeCSS, isSafeCSS } from '@/lib/sanitize-css';
import { isValidColor } from '@/lib/validate-colors';
```

### 2. Input Validation Pattern

Always validate user input before applying:

```typescript
const safeThemeUpdate = (input) => {
  // Validate colors
  if (input.primary && !isValidColor(input.primary)) {
    throw new Error('Invalid primary color');
  }

  // Sanitize CSS
  if (input.customCSS && !isSafeCSS(input.customCSS)) {
    input.customCSS = sanitizeCSS(input.customCSS);
  }

  // Apply validated input
  setCustomizations(input);
};
```

### 3. Content Security Policy

Update your CSP to allow dynamic theme updates:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               style-src 'self' 'unsafe-inline';
               script-src 'self';">
```

## Performance Optimization

### 1. Enable Lazy Loading

```typescript
import { lazyLoader } from '@/components/renderer/theme/lazy-loader';

// Preload critical themes
lazyLoader.preloadThemes(['dark', 'light']);

// Load theme on demand
const loadTheme = async (themeId) => {
  const theme = await lazyLoader.loadTheme(themeId);
  setThemeById(themeId);
};
```

### 2. Batch DOM Updates

```typescript
import { debounce } from '@/components/renderer/theme/utils';

const debouncedThemeUpdate = debounce((newTheme) => {
  // Theme updates are batched
  setTheme(newTheme);
}, 100);
```

### 3. Monitor Performance

```typescript
import { getPerformanceMonitor } from '@/lib/theme-performance';

// Check performance metrics
const monitor = getPerformanceMonitor();
const metrics = monitor.getMetrics();

if (metrics.lastThemeSwitchTime > 16) {
  console.warn('Slow theme switch detected');
}
```

## Testing Considerations

### 1. Update Test Setup

```typescript
// jest.config.js or vitest.config.js
setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
```

```typescript
// src/test-setup.ts
import { enableMockThemeSystem } from '@/components/renderer/theme/__tests__/utils';

enableMockThemeSystem();
```

### 2. Test Theme Switching

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/renderer/theme';

test('should apply dark theme', async () => {
  const { container } = render(
    <ThemeProvider defaultTheme="dark">
      <App />
    </ThemeProvider>
  );

  expect(container.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(container.documentElement).toHaveAttribute('data-color-scheme', 'dark');
});
```

### 3. Test Security

```typescript
import { sanitizeCSS, isValidColor } from '@/lib/validate-colors';

test('should sanitize malicious CSS', () => {
  const malicious = 'body { background: url("javascript:alert(1)"); }';
  const safe = sanitizeCSS(malicious);
  expect(safe).not.toContain('javascript');
});

test('should validate colors', () => {
  expect(isValidColor('#ff0000')).toBe(true);
  expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
  expect(isValidColor('javascript:alert(1)')).toBe(false);
});
```

### 4. Test Performance

```typescript
import { measureThemeOperation } from '@/lib/theme-performance';

test('theme switch should be fast', () => {
  const duration = measureThemeOperation('switch-test', () => {
    // Perform theme switch
  });

  expect(duration).toBeLessThan(16); // 60fps threshold
});
```

## Troubleshooting

### Common Issues

#### 1. Theme Not Applying

**Symptoms:**
- CSS variables not set
- UI stays in default theme

**Solutions:**
```typescript
// Check if provider is wrapping the app
console.log(document.documentElement.dataset.theme);

// Verify theme configuration
const { themeConfig } = useTheme();
console.log('Theme config:', themeConfig);

// Ensure CSS is loaded
const hasThemeStyles = document.querySelector('link[href*="theme"]');
if (!hasThemeStyles) {
  console.error('Theme styles not loaded');
}
```

#### 2. Performance Issues

**Symptoms:**
- Slow theme switching
- UI jank during transitions

**Solutions:**
```typescript
// Enable performance monitoring
const monitor = getPerformanceMonitor({ enableDebugLogging: true });

// Check for bottlenecks
const report = monitor.generatePerformanceReport();
console.log('Performance report:', report);

// Reduce DOM updates
const disableTransitions = true;
<ThemeProvider disableTransitionOnChange={disableTransitions}>
  <App />
</ThemeProvider>
```

#### 3. Validation Errors

**Symptoms:**
- Custom colors not applying
- Console warnings about invalid colors

**Solutions:**
```typescript
// Check color format
const testColor = '#ff0000';
if (!isValidColor(testColor)) {
  console.error('Invalid color format:', testColor);
}

// Use color conversion utility
import { hexToRgb } from '@/lib/color-conversion';
const rgbColor = hexToRgb(testColor);
```

#### 4. Memory Leaks

**Symptoms:**
- Increasing memory usage
- Slow performance over time

**Solutions:**
```typescript
// Clear performance history
monitor.reset();

// Check for uncached themes
const cache = new Map();
// Implement cache size limits
if (cache.size > 100) {
  cache.clear();
}
```

## Rollback Procedures

### Quick Rollback

If you need to quickly revert to the old system:

1. **Restore old provider**:
```bash
git checkout HEAD~1 -- src/components/renderer/theme/
```

2. **Update imports**:
```bash
# Find new imports
grep -r "from '@/components/renderer/theme'" src/

# Replace with old imports
sed -i 's/from "@\/components\/renderer\/theme"/from "@\/components\/renderer\/theme\/theme-provider"/g'
```

3. **Restore CSS**:
```bash
git checkout HEAD~1 -- src/components/renderer/styles/themes.css
```

### Gradual Migration

For a phased rollback:

1. **Phase 1: Keep new provider, use legacy APIs**
```typescript
<ThemeProvider useLegacyMode={true}>
  <App />
</ThemeProvider>
```

2. **Phase 2: Migrate components incrementally**
3. **Phase 3: Switch off legacy mode**

### Data Migration

Rolling back theme settings in localStorage:

```typescript
// Backup current settings
const currentSettings = localStorage.getItem('dop-theme-config');

// Restore old format
if (currentSettings) {
  const parsed = JSON.parse(currentSettings);
  const oldTheme = parsed.currentTheme === 'default'
    ? (parsed.mode || 'light')
    : parsed.currentTheme;
  localStorage.setItem('renderer-theme', oldTheme);
}
```

## Additional Resources

- [Theme System Architecture](./README.md)
- [Security Best Practices](../security.md)
- [Performance Optimization Guide](../performance.md)
- [API Reference](./api-reference.md)
- [Examples and Recipes](./examples.md)

## Support

For migration assistance:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [existing issues](https://github.com/your-org/repo/issues)
3. Create a new issue with the tag `migration-help`
4. Contact the frontend team at frontend@yourcompany.com

Remember to test thoroughly in a staging environment before deploying to production!