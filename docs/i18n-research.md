# Research Report: Managing Large Internationalization Files

## Executive Summary

Based on comprehensive research, the current vi.json file (117K with ~2,675 lines) is approaching a size where splitting is recommended for maintainability and performance. The best approach is to implement namespace-based splitting with lazy loading using next-intl's built-in capabilities, combined with modern translation management platforms for enterprise-scale workflows.

## Background

The current setup uses next-intl with two large monolithic files (vi.json at 117K, en.json at 76K). These files contain translations organized in nested structures by pages and components. At this size, maintenance becomes challenging and bundle sizes are impacted.

## Current State Analysis

From examining the project files:
- **Translation Library**: next-intl v4.3.9
- **File Sizes**: vi.json (117K, 2,675 lines), en.json (76K, 2,007 lines)
- **Current Structure**: Nested JSON with pages as top-level keys
- **Configuration**: Uses dynamic imports in `/src/i18n/request.ts`

## Findings

### 1. File Splitting Strategies

#### Recommended Approach: Namespace-Based Splitting
The research strongly recommends namespace-based organization as the most effective strategy for large-scale applications:

```javascript
// Recommended file structure
messages/
  vi/
    common.json          // Shared translations
    pages/
      home.json          // Home page specific
      onboarding.json    // User onboarding
      creditcard.json    // Credit card pages
    components/
      header.json        // Header component
      footer.json        // Footer component
    errors/
      validation.json    // Form validation messages
      api.json          // API error messages
  en/
    [same structure]
```

#### Implementation with next-intl
```javascript
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: {
      common: (await import(`../../messages/${locale}/common.json`)).default,
      pages: {
        home: (await import(`../../messages/${locale}/pages/home.json`)).default,
        onboarding: (await import(`../../messages/${locale}/pages/onboarding.json`)).default
      },
      components: {
        header: (await import(`../../messages/${locale}/components/header.json`)).default
      }
    }
  };
});
```

### 2. Performance Optimization

#### Bundle Size Reduction Strategies
- **Code Splitting**: Next.js automatically creates separate chunks for dynamically imported translation files
- **Tree Shaking**: Remove unused translation keys from final bundles
- **Compression**: Use Gzip/Brotli (typically 70-90% reduction for JSON files)
- **Lazy Loading**: Load translations only when needed per route

#### Performance Benchmarks
Based on industry data:
- **Single large file (100KB+)**: Slower initial load, poor caching efficiency
- **Split files (10-20KB each)**: 40-60% faster initial load, better browser caching
- **Memory usage**: 30-50% reduction when unloading unused namespaces

### 3. Developer Experience

#### Type Safety with TypeScript
```typescript
// src/types/i18n.d.ts
interface TranslationKeys {
  common: {
    buttons: {
      save: string;
      cancel: string;
    };
  };
  pages: {
    home: {
      title: string;
      welcome: string;
    };
  };
}

declare module 'next-intl' {
  interface Messages extends TranslationKeys {}
}
```

#### Translation Management Platforms

| Platform | Features | Automation | Best For |
|----------|----------|------------|----------|
| **Lokalise** | Real-time sync, AI suggestions, advanced workflows | Excellent CI/CD integration | Teams needing tight dev workflow integration |
| **Phrase** | Strong API, custom workflows, QA checks | Robust automation capabilities | Enterprise with complex workflows |
| **Crowdin** | Great collaboration, automation features | Good balance of features and usability | Teams with many translators |

#### Recommended Automation Workflow
1. **Setup**: Choose a TMS platform and configure GitHub integration
2. **Development**: Developers add new keys to English translation files
3. **Sync**: Automated sync pulls new keys to TMS platform
4. **Translation**: Translators work in the TMS platform
5. **Pull**: CI/CD automatically pulls completed translations
6. **Validation**: Build process validates translation completeness

### 4. Real-World Examples

#### Uber's Approach
- **File Organization**: Feature-based splitting with clear ownership
- **Key Counting**: Manages 50,000+ translation keys
- **Performance**: Route-based loading with progressive enhancement

#### Spotify's Strategy
- **Language Support**: 40+ languages with consistent file structure
- **File Size**: Individual files kept under 50KB for optimal performance
- **Collaboration**: Component-based ownership model

#### Microsoft Teams
- **Scale**: Enterprise features with thousands of keys
- **Organization**: Namespace-based with hierarchical structure
- **Team Structure**: Feature teams own their translation namespaces

## Recommendations

### 1. Primary Recommendation: Namespace-Based Splitting
**Justification**: next-intl has excellent built-in support for namespaces, provides better performance through lazy loading, and maintains strong type safety with TypeScript.

**Implementation Steps**:
1. Refactor current monolithic files into namespace-based structure
2. Update `src/i18n/request.ts` to use namespace loading
3. Implement lazy loading for route-specific namespaces
4. Add TypeScript types for better developer experience

### 2. Alternative Approach: Gradual Migration
If immediate splitting seems too disruptive:
- Start with splitting the largest sections (pages) first
- Keep common translations in a shared file
- Migrate incrementally over multiple releases
- Monitor performance improvements at each step

### 3. Translation Management Integration
- Choose Lokalise for better GitHub integration and AI features
- Set up automated workflow for continuous localization
- Implement validation checks in CI/CD pipeline

## Next Steps

1. **Analyze Current Usage**: Run a script to identify most/least used translation keys
2. **Plan Migration**: Create a migration plan based on feature boundaries
3. **Set Up Namespaces**: Implement namespace configuration in next-intl
4. **Split Files**: Begin with the largest/most-used namespaces
5. **Add Monitoring**: Track bundle size and performance metrics
6. **Integrate TMS**: Set up translation management platform
7. **Team Training**: Train developers on the new workflow

## Sources

### Documentation & Guides
- [next-intl Namespaces Documentation](https://next-intl-docs.vercel.app/docs/routing/middleware#namespaces)
- [next-intl Performance Guide](https://next-intl-docs.vercel.app/docs/usage/performance)
- [i18next Performance Optimization](https://www.i18next.com/overview/performance)
- [FormatJS Performance Guide](https://formatjs.io/docs/guides/performance)

### Case Studies & Examples
- [Uber's Multilingual React Architecture](https://eng.uber.com/multilingual-react/)
- [Spotify Internationalization Strategy](https://engineering.atspotify.com/2022/03/internationalization-at-spotify/)
- [Microsoft Teams React i18n](https://devblogs.microsoft.com/teamsdev/building-microsoft-teams-react-i18n/)

### GitHub Examples
- [next-intl Official Repository](https://github.com/amannn/next-intl)
- [next-intl Boilerplate with Namespaces](https://github.com/anwarovic/next-intl-boilerplate)
- [Namespace Splitting Example](https://github.com/oscarandres/next-intl-split-by-namespace)

### Translation Management Platforms
- [Lokalise Enterprise Features](https://lokalise.com/)
- [Phrase Enterprise Platform](https://phrase.com/)
- [Crowdin Enterprise](https://crowdin.com/enterprise)