# Phase 1: Discovery & Structure - Theme System

## Overview
This codebase implements a sophisticated, multi-layered theme system with support for both dark/light modes, user group-specific themes, and theme customization capabilities. The system uses CSS custom properties (CSS variables) as the primary mechanism for theming, enabling dynamic theme switching without requiring CSS rebuilds.

## Architecture Structure

### 1. Core Theme Providers

#### A. Renderer Theme Provider
- **Location**: `src/components/renderer/theme/theme-provider.tsx`
- **Features**:
  - Dark/light mode switching
  - System preference detection
  - localStorage persistence
  - CSS custom property application
  - Theme class management (`theme-light`, `theme-dark`)
- **Approach**: Direct CSS variable application to `document.documentElement`

#### B. Advanced Theme Context
- **Location**: `src/components/renderer/theme/context.tsx`
- **Features**:
  - User group-based theming
  - Theme customization capabilities
  - next-themes compatibility
  - Bridge between `next-themes` and custom theme system
  - Advanced theme state management

### 2. Theme Definition Structure

#### A. Default Themes
- **Location**: `src/components/renderer/theme/default-themes.ts`
- **Color System**: Comprehensive 10-step color scale (50-950) for primary, secondary, and gray colors
- **Semantic Colors**: Success, warning, error, info
- **Background/Text System**: Hierarchical text and background colors
- **Typography**: Complete font stack definitions with Inter as primary sans-serif
- **Spacing**: Comprehensive spacing scale from 0 to 96
- **Border Radius**: 7-step radius scale (none to full)
- **Shadows**: 7-level shadow system
- **Animations**: Duration and easing function definitions

#### B. Specialized Themes
- **Location**: `src/components/renderer/theme/themes/`
- **Available Themes**:
  - Corporate: Professional blue-based theme for business users
  - Creative: Vibrant theme for creative professionals
  - Medical: Healthcare-focused theme
  - Finance: Financial industry theme
  - Default: Standard all-purpose theme

All specialized themes use **OKLCH color space** for perceptual uniformity and accessibility.

### 3. User Group System

- **Location**: `src/components/renderer/theme/themes.ts`
- **Configuration**:
  ```typescript
  export const userGroups: Record<string, UserGroup> = {
    system: { general users, all themes available },
    business: { corporate focus, branding required },
    creative: { design users, full customization },
    finance: { financial users, restricted themes },
    healthcare: { medical focus, fixed theme }
  }
  ```

### 4. Theme Utilities and Hooks

#### A. use-theme Hook
- **Location**: `src/components/renderer/theme/use-theme.ts`
- **Utilities**:
  - Theme-aware color access (`getColor`)
  - Spacing utilities (`getSpacing`)
  - Font size retrieval (`getFontSize`)
  - Shadow and animation utilities
  - CSS variable generation (`cssVar`)
  - Predefined style shortcuts

#### B. Feature-Specific Hooks
- `useInsuranceTheme`: Ensures healthcare group and medical theme
- `useInsuranceNavbarTheme`: Navbar-specific theming
- `useCreditCardsNavbarTheme`: Credit cards section theming

### 5. CSS Integration

#### A. Tailwind Configuration
- **Location**: `tailwind.config.ts`
- **Features**:
  - `darkMode: "class"`: Class-based dark mode switching
  - CSS Variable Integration: All colors, spacing, and typography use CSS variables
  - Custom Utilities: Field container and input size utilities
  - Animation Support: Custom keyframes and animations

#### B. Global Styles
- **Location**: `src/components/renderer/styles/themes.css`
- **Features**:
  - CSS Variable Definitions: Complete variable system
  - Theme Classes: `.theme-light` and `.theme-dark` classes
  - Smooth Transitions: 200ms transitions for all theme properties
  - Accessibility: High contrast mode support
  - Print Styles: Optimized print styles
  - Custom Scrollbars: Theme-aware scrollbar styling

### 6. Theme Switching UI Components

#### A. Theme Switcher
- **Location**: `src/components/theme/theme-switcher.tsx`
- **Features**:
  - Simple toggle with sun/moon icons
  - Uses `next-themes` for system integration

#### B. Theme Selector
- **Location**: `src/components/theme/theme-selector.tsx`
- **Features**:
  - User Group Selection: Dropdown for user groups
  - Theme Selection: Visual theme picker with color previews
  - Mode Selection: Light/dark/system mode
  - Theme Customization: Modal-based color customizer
  - Export Functionality: Export theme as CSS

### 7. State Management

#### A. Local Storage
- Theme preferences saved in localStorage
- Persistent across sessions
- Separate keys for different contexts

#### B. Context API
- React Context for theme state
- No global state management libraries
- Efficient state updates with proper selectors

### 8. Development Support

#### A. Storybook Theming
- **Location**: `.storybook/theme-decorator.tsx`
- **Features**:
  - Theme decorator for Storybook
  - Debug logging for theme application
  - Multiple theme testing capabilities

## Key Technical Patterns

### 1. CSS Custom Properties Pattern
```css
:root {
  --color-primary-500: #3b82f6;
  --bg-primary: #ffffff;
  --text-primary: #111827;
}
```

### 2. OKLCH Color Space Usage
Modern, perceptually uniform color space:
```typescript
primary: "oklch(0.25 0.08 220)" // Lightness, Chroma, Hue
```

### 3. Type-Safe Theme System
Comprehensive TypeScript definitions for all theme properties.

### 4. Hybrid Approach
Combines `next-themes` for system-level theming with custom theme system for advanced features.

## Dependencies and Libraries

### Core Dependencies
- `next-themes`: System preference detection and persistence
- `tailwindcss`: Utility-first CSS framework with theme integration
- `react`: UI component library

### Optional Dependencies
- `lucide-react`: Icons for theme UI
- `@tailwindcss/forms`: Form styling plugins

## File Inventory

### Core Theme Files
- `src/components/renderer/theme/theme-provider.tsx` - Main theme provider
- `src/components/renderer/theme/context.tsx` - Advanced theme context
- `src/components/renderer/theme/default-themes.ts` - Theme definitions
- `src/components/renderer/theme/themes.ts` - User group configuration
- `src/components/renderer/theme/use-theme.ts` - Theme utilities hook

### Theme Definitions
- `src/components/renderer/theme/themes/corporate.ts` - Corporate theme
- `src/components/renderer/theme/themes/creative.ts` - Creative theme
- `src/components/renderer/theme/themes/default.ts` - Default theme
- `src/components/renderer/theme/themes/finance.ts` - Finance theme
- `src/components/renderer/theme/themes/medical.ts` - Medical theme

### UI Components
- `src/components/theme/theme-switcher.tsx` - Simple theme toggle
- `src/components/theme/theme-selector.tsx` - Advanced theme selector
- `src/components/theme/theme-customizer.tsx` - Theme customization modal

### Styling
- `src/components/renderer/styles/themes.css` - Global theme styles
- `tailwind.config.ts` - Tailwind CSS configuration

### Feature-Specific Hooks
- `src/hooks/insurance/use-insurance-theme.ts` - Insurance theme hook
- `src/hooks/insurance/use-insurance-navbar-theme.ts` - Insurance navbar theme
- `src/hooks/credit-cards/use-credit-cards-navbar-theme.ts` - Credit cards navbar theme

### Development Tools
- `.storybook/theme-decorator.tsx` - Storybook theme support
- `src/components/renderer/theme/types.ts` - TypeScript type definitions

## Architecture Flow

```
User Interaction
       ↓
Theme Selector/Customizer
       ↓
Theme Context (use-theme)
       ↓
CSS Variables Update
       ↓
Tailwind CSS (via variables)
       ↓
Styled Components
```

## Phase 1 Summary

The theme system demonstrates a mature, production-ready implementation with:
- Comprehensive dark/light mode support
- User group-based theming
- Extensive customization capabilities
- Excellent TypeScript integration
- Smooth transitions and animations
- Accessibility considerations
- Development tooling support

The architecture provides both simplicity for basic use cases and advanced features for complex requirements, making it suitable for a diverse application landscape.