# DOP-FE Project Architecture Overview

## Technology Stack

### Core Frameworks and Languages
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.x (strict mode enabled)
- **Build Tools**: Turbopack (next build --turbopack), Biome 2.2.0 for linting/formatting
- **React Version**: React 19.1.0

### UI and Styling
- **Styling**: Tailwind CSS 4.0 with PostCSS
- **UI Library**: shadcn/ui (new-york style)
- **CSS Framework**: Tailwind CSS 4 with CSS variables for theming
- **Icons**: Lucide React
- **Animations**: Framer Motion 12.23.24, tailwindcss-animate

### State Management and Utilities
- **State Management**: Zustand 5.0.8 with devtools and persistence
- **HTTP Client**: @tanstack/react-query 5.90.2 with optimized configuration
- **Form Handling**: react-hook-form 7.63.0 with @hookform/resolvers 5.2.2
- **Validation**: Zod 4.1.11 for schema validation
- **Data Tables**: @tanstack/react-table 8.21.3
- **Date Handling**: date-fns 4.1.0, react-day-picker 9.11.0

### Internationalization and Features
- **i18n**: next-intl 4.3.9 (supports vi/en)
- **Theming**: next-themes 0.4.6 for dark/light mode
- **eKYC Integration**: VNPT SDK integration with custom wrapper
- **Multi-step Forms**: Custom implementation with data persistence
- **Charts**: Recharts 2.15.4

### Development Tools
- **Code Quality**: Biome 2.2.0 (linting + formatting)
- **Testing**: Vitest 3.2.4 with Playwright 1.55.1 for E2E
- **Documentation**: Storybook 8.6.14
- **API Generation**: openapi-typescript 7.9.1
- **Git Hooks**: Husky 9.1.7 with lint-staged 16.2.3

## Directory Structure and Purposes

### Root Configuration
```
/
├── next.config.ts          # Next.js config with static export and i18n
├── tsconfig.json           # TypeScript strict mode configuration
├── components.json         # shadcn/ui configuration (new-york style)
├── biome.json             # Biome linting and formatting rules
├── postcss.config.mjs     # PostCSS with Tailwind CSS 4
├── package.json           # Dependencies and scripts
└── messages/             # i18n translation files (vi.json, en.json)
```

### App Router Structure
```
src/app/
├── [locale]/             # Internationalized routes
│   ├── layout.tsx        # Root layout with i18n provider
│   ├── page.tsx          # Homepage
│   ├── user-onboarding/  # Multi-step onboarding flow
│   │   ├── page.tsx
│   │   ├── components/    # Page-specific components
│   │   └── hooks/       # Page-specific hooks
│   └── onboarding-success/ # Success page
├── globals.css           # Global styles with Tailwind CSS 4
├── not-found.tsx        # 404 page
└── favicon.ico          # Site favicon
```

### Component Organization
```
src/components/
├── ui/                  # shadcn/ui base components (50+ components)
├── admin/               # Admin-specific components
│   ├── flow-management/
│   ├── error-handling/
│   └── loading-states/
├── ekyc/                # eKYC integration components
├── features/            # Feature-specific components
├── feedback/            # Error states, skeletons, loading
├── layout/              # Header, footer, providers
├── molecules/           # Small component compositions
├── organisms/           # Large component compositions
│   └── homepage/       # Homepage sections
├── renderer/           # Form rendering system
│   ├── FieldRenderer.tsx
│   ├── FormRenderer.tsx
│   └── MultiStepFormRenderer.tsx
├── theme/              # Theme management
└── wrappers/           # Custom component wrappers
```

### Core Libraries and Utilities
```
src/lib/
├── api/                # API client and types
│   ├── admin-api.ts
│   ├── client.ts
│   ├── schema.yaml
│   └── v1.d.ts
├── ekyc/               # eKYC SDK integration
│   ├── sdk-manager.ts
│   ├── config-manager.ts
│   ├── sdk-events.ts
│   └── data-mapper.ts
├── theme/              # Theme system
│   ├── themes/
│   │   ├── default.ts
│   │   ├── corporate.ts
│   │   ├── creative.ts
│   │   └── medical.ts
│   ├── context.tsx
│   └── types.ts
├── builders/           # Form builders
│   ├── multi-step-form-builder.ts
│   ├── field-builder.ts
│   ├── zod-generator.ts
│   └── condition-builder.ts
├── admin/              # Admin utilities
└── utils.ts            # Common utilities
```

### State Management
```
src/store/
├── use-admin-flow-store.ts     # Admin flow management with pending changes
├── use-multi-step-form-store.ts # Multi-step form state with persistence
├── use-auth-store.ts          # Authentication state
├── use-ekyc-store.ts         # eKYC state
└── use-onboarding-form-store.ts # Onboarding form state
```

### Custom Hooks
```
src/hooks/
├── admin/              # Admin-specific hooks
├── features/           # Feature-specific hooks
│   ├── ekyc/         # eKYC hooks
│   └── navbar/       # Navbar configuration
├── form/              # Form management hooks
├── flow/              # Flow management hooks
└── ui/                # UI utility hooks
```

### Type Definitions
```
src/types/
├── admin.ts                    # Admin panel types
├── component-props.d.ts        # Component prop types
├── data-driven-ui.d.ts         # Dynamic form types
├── field-conditions.ts         # Field condition logic
└── multi-step-form.d.ts        # Multi-step form types
```

## Architecture Patterns

### Design Patterns Applied
- **Data-Driven UI**: Dynamic form rendering based on configuration
- **Builder Pattern**: Fluent API for building multi-step forms
- **Observer Pattern**: Zustand stores with devtools integration
- **Strategy Pattern**: Multiple validation strategies with Zod
- **Factory Pattern**: Component registry for dynamic rendering
- **Repository Pattern**: API client abstraction layer
- **Command Pattern**: Form action handlers

### State Management Approach
- **Zustand**: Lightweight state management with TypeScript support
- **Store Segmentation**: Separate stores for different domains (admin, forms, auth, eKYC)
- **Persistence**: Selected stores use localStorage persistence
- **DevTools Integration**: Full debugging capabilities
- **Optimistic Updates**: React Query for server state with optimistic updates
- **Computed Selectors**: Efficient derived state computation

### Component Organization
- **Atomic Design**: molecules, organisms, and templates structure
- **Feature-Based**: Components organized by business features
- **Reusable UI**: Comprehensive shadcn/ui component library
- **Custom Wrappers**: Extended functionality for base components
- **Storybook Integration**: Component documentation and testing

### Data Flow Architecture
- **Unidirectional Data Flow**: React hooks → state → UI
- **Server State**: React Query for API data management
- **Client State**: Zustand for UI state and form data
- **Form State**: react-hook-form with Zod validation
- **Event-Driven**: eKYC SDK integration with event handlers
- **Mapper Pattern**: Data transformation between layers

## Key Design Decisions

### Technology Stack Choices
- **Next.js App Router**: Latest React features with improved routing
- **Static Export**: Deployment flexibility without server requirements
- **TypeScript Strict Mode**: Enhanced type safety and developer experience
- **Tailwind CSS 4**: Latest version with improved performance
- **shadcn/ui**: Modern, accessible component library
- **Zustand over Redux**: Simpler API with TypeScript-first approach
- **React Query**: Sophisticated server state management
- **Zod**: Runtime type validation with TypeScript integration

### Architecture Decisions
- **Data-Driven Forms**: Backend-driven UI configuration for flexibility
- **Multi-Theme System**: User group-based theming with customization
- **eKYC Integration**: VNPT SDK with comprehensive error handling
- **Internationalization**: next-intl for seamless multi-language support
- **Component Composition**: Reusable components with prop-based configuration
- **Progressive Enhancement**: Core functionality without JavaScript dependencies

### Trade-offs Considered
- **Static Export vs SSR**: Chose static for deployment simplicity over server-side rendering benefits
- **Bundle Size**: Comprehensive UI library vs custom components - chose shadcn/ui for development speed
- **State Management**: Zustand vs Redux - chose Zustand for simplicity and TypeScript support
- **Form Handling**: react-hook-form vs Formik - chose react-hook-form for performance and TypeScript integration
- **Validation**: Zod vs Yup - chose Zod for TypeScript-first approach and better inference

## Performance Considerations

### Optimization Strategies
- **Turbopack**: Next.js's new bundler for faster builds
- **Code Splitting**: Automatic route-based and component-based splitting
- **Tree Shaking**: Unused dependency elimination
- **Image Optimization**: Disabled for static export (manual optimization required)
- **CSS Optimization**: Tailwind CSS 4 with purging of unused styles
- **Bundle Analysis**: Built-in webpack bundle analyzer

### Bundle Size Considerations
- **Dependency Management**: Careful selection of lightweight libraries
- **Dynamic Imports**: Lazy loading for heavy components
- **Conditional Loading**: eKYC SDK loaded only when needed
- **Icon Optimization**: Lucide React with tree-shaking support
- **Font Optimization**: Next.js font optimization with Google Fonts

### Lazy Loading Implementation
- **Route-Level**: Automatic with Next.js App Router
- **Component-Level**: React.lazy() for heavy components
- **eKYC SDK**: Dynamic loading with error boundaries
- **Admin Components**: On-demand loading for admin features
- **Form Components**: Dynamic import based on configuration

### Caching Strategies
- **React Query**: 5-minute stale time with intelligent refetching
- **Static Assets**: Long-term caching for static assets
- **API Responses**: ETag and cache-control headers
- **Form Data**: localStorage persistence with sensitive data filtering
- **Theme Preferences**: Persistent theme selection

### Memory Management
- **Cleanup Functions**: Proper eKYC SDK cleanup
- **Event Listeners**: Removal on component unmount
- **Store Subscriptions**: Selective subscriptions to prevent unnecessary re-renders
- **Large Lists**: Virtualization with react-window for performance
- **Image Assets**: Optimized formats and lazy loading

## Key Observations

- **Modern Stack**: Project uses cutting-edge technologies (Next.js 15.5.4, React 19, Tailwind CSS 4)
- **Type Safety**: Comprehensive TypeScript implementation with strict mode
- **Accessibility**: shadcn/ui components with built-in accessibility features
- **Internationalization**: Full i18n support with Vietnamese as primary language
- **Enterprise Features**: Admin panel, user management, and eKYC integration
- **Performance Focus**: Multiple optimization strategies implemented
- **Developer Experience**: Excellent tooling with Storybook, Biome, and hot reload
- **Scalability**: Modular architecture supporting future growth
- **Security**: eKYC data handling with proper cleanup and validation
- **Testing Infrastructure**: Comprehensive testing setup with unit and E2E tests

## Related Documentation
- **[Data Models and Structures](data-models-and-structures.md)** - Detailed type definitions and data structures
- **[Dependencies and Integrations](dependencies-and-integrations.md)** - Complete analysis of dependencies
- **[Application Pages and Components](../src/docs/application-pages-and-components.tsx)** - Component hierarchy and structure
- **[Configuration and Environment Setup](configuration-and-environment-setup.md)** - Setup and configuration details
- **[Performance Optimization](performance-optimization.md)** - Performance optimization strategies
- **[Security Best Practices](security-best-practices.md)** - Security implementation details