# Design Document: Internationalization File Management Architecture

## Overview

This document outlines the comprehensive architecture for managing large internationalization files in the DOP-FE project. The design addresses scalability, performance optimization, and developer experience while maintaining compatibility with the existing next-intl setup.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  React Components                                               │
│  ├─ useTranslations('pages.home')                               │
│  ├─ useTranslations('features.credit-cards')                    │
│  └─ useTranslations('common')                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    Translation Manager                           │
├─────────────────────────────────────────────────────────────────┤
│  ├─ Dynamic Loader (src/lib/i18n/dynamic-loader.ts)            │
│  ├─ Cache Manager (src/lib/i18n/cache.ts)                       │
│  ├─ Preloader (src/lib/i18n/preloader.ts)                       │
│  └─ Monitor (src/lib/translation-monitor.ts)                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     Storage Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ├─ File System (messages/[locale]/*.json)                      │
│  ├─ Memory Cache (LRU, 10min TTL)                               │
│  ├─ Browser Cache (Service Worker)                              │
│  └─ CDN Cache (Production)                                      │
└─────────────────────────────────────────────────────────────────┘
```

## File Organization Structure

### Proposed Namespace Structure

```
messages/
├── en/
│   ├── common/
│   │   ├── ui.json              # Buttons, labels, common UI elements
│   │   ├── navigation.json      # Navigation, breadcrumbs
│   │   ├── actions.json         # Common actions (save, cancel, delete)
│   │   ├── errors.json          # Error messages
│   │   ├── validation.json      # Form validation messages
│   │   └── formats.json         # Date, number, currency formats
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.json
│   │   │   └── register.json
│   │   ├── credit-cards/
│   │   │   ├── listing.json
│   │   │   ├── detail.json
│   │   │   └── comparison.json
│   │   ├── insurance/
│   │   │   ├── listing.json
│   │   │   ├── detail.json
│   │   │   └── comparison.json
│   │   ├── tools/
│   │   │   ├── loan-calculator.json
│   │   │   ├── savings-calculator.json
│   │   │   ├── gross-to-net.json
│   │   │   └── net-to-gross.json
│   │   └── onboarding/
│   │       ├── ekyc.json
│   │       ├── form.json
│   │       └── confirmation.json
│   ├── pages/
│   │   ├── home.json
│   │   ├── credit-cards.json
│   │   ├── insurance.json
│   │   ├── tools.json
│   │   └── admin.json
│   └── meta/
│       ├── seo.json             # SEO titles and descriptions
│       └── social.json          # Social media sharing
└── vi/
    └── [same structure as en/]
```

### Ownership Boundaries

```typescript
// Translation ownership mapping
const TRANSLATION_OWNERSHIP = {
  'common/*': 'core-team',           // Shared across all features
  'features/auth/*': 'auth-team',    // Authentication related
  'features/credit-cards/*': 'credit-card-team',
  'features/insurance/*': 'insurance-team',
  'features/tools/*': 'tools-team',
  'features/onboarding/*': 'onboarding-team',
  'pages/*': 'feature-owners',      // Page-specific content owned by feature teams
  'meta/*': 'seo-team'              // SEO and metadata
} as const;
```

## Migration Strategy

### Phase 1: Setup New Structure (Zero Downtime)

```bash
# Step 1: Create directory structure
mkdir -p messages/en/{common,features/{auth,credit-cards,insurance,tools,onboarding},pages,meta}
mkdir -p messages/vi/{common,features/{auth,credit-cards,insurance,tools,onboarding},pages,meta}

# Step 2: Create merge loader script
# messages/_merge-loader.ts
```

### Phase 2: Create Dynamic Merge Loader

```typescript
// messages/loader.ts
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface NestedMessages {
  [key: string]: string | NestedMessages;
}

async function loadNamespace(locale: string, namespace: string): Promise<NestedMessages> {
  const namespacePath = join(process.cwd(), 'messages', locale, namespace);
  const result: NestedMessages = {};

  try {
    const files = await readdir(namespacePath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const key = file.replace('.json', '');
        const filePath = join(namespacePath, file);
        const content = JSON.parse(await readFile(filePath, 'utf-8'));
        result[key] = content;
      }
    }
  } catch (error) {
    // Namespace doesn't exist, return empty object
  }

  return result;
}

export async function getMessages(locale: string): Promise<NestedMessages> {
  const [common, features, pages, meta] = await Promise.all([
    loadNamespace(locale, 'common'),
    loadNamespace(locale, 'features'),
    loadNamespace(locale, 'pages'),
    loadNamespace(locale, 'meta'),
  ]);

  return {
    ...common,
    ...features,
    ...pages,
    ...meta,
  };
}

// Fallback to monolithic files during migration
export async function getMessagesWithFallback(locale: string): Promise<NestedMessages> {
  try {
    // Try new structure first
    return await getMessages(locale);
  } catch {
    // Fallback to monolithic
    const legacyPath = join(process.cwd(), 'messages', `${locale}.json`);
    const content = await readFile(legacyPath, 'utf-8');
    return JSON.parse(content);
  }
}
```

### Phase 3: Update next-intl Configuration

```typescript
// next.config.js
const withNextIntl = require('next-intl')({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  async getMessageFallback({ namespace, key }) {
    // Enhanced fallback with key path logging
    console.warn(`Missing translation: ${namespace ? `${namespace}.` : ''}${key}`);
    return key;
  },
  loadLocale: (locale) => import(`./messages/loader`).then(m => m.getMessagesWithFallback(locale))
});

module.exports = withNextIntl({
  // ... your existing config
});
```

## Performance Optimization Architecture

### 1. Lazy Loading Strategy

```typescript
// src/lib/i18n/lazy-loader.ts
interface NamespaceLoader {
  [namespace: string]: () => Promise<any>;
}

const namespaceLoaders: NamespaceLoader = {
  'pages.home': () => import('../../messages/vi/pages/home.json'),
  'pages.tools': () => import('../../messages/vi/pages/tools.json'),
  'features.credit-cards': () => import('../../messages/vi/features/credit-cards/listing.json'),
  // ... other namespaces
};

export async function loadNamespace(locale: string, namespace: string): Promise<any> {
  const startTime = performance.now();

  try {
    const loader = namespaceLoaders[namespace];
    if (!loader) {
      console.warn(`No loader found for namespace: ${namespace}`);
      return {};
    }

    const translations = await loader();
    const loadTime = performance.now() - startTime;

    // Track performance
    trackLoadTime(namespace, loadTime);

    return translations.default;
  } catch (error) {
    console.error(`Failed to load namespace ${namespace}:`, error);
    return {};
  }
}
```

### 2. Caching Strategy

```typescript
// src/lib/i18n/cache.ts
import { LRUCache } from 'lru-cache';

type TranslationCache = LRUCache<string, any>;

export class TranslationCacheManager {
  private static instance: TranslationCacheManager;
  private cache: TranslationCache;
  private preloadQueue: string[] = [];

  private constructor() {
    this.cache = new LRUCache<string, any>({
      max: 500, // Max number of cached translations
      ttl: 1000 * 60 * 30, // 30 minutes
    });
  }

  static getInstance(): TranslationCacheManager {
    if (!TranslationCacheManager.instance) {
      TranslationCacheManager.instance = new TranslationCacheManager();
    }
    return TranslationCacheManager.instance;
  }

  async getTranslation(locale: string, namespace: string, key: string): Promise<string | undefined> {
    const cacheKey = `${locale}:${namespace}:${key}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch and cache
    const translation = await this.fetchTranslation(locale, namespace, key);
    if (translation) {
      this.cache.set(cacheKey, translation);
    }

    return translation;
  }

  preloadTranslations(keys: Array<{ locale: string; namespace: string; key: string }>) {
    this.preloadQueue.push(...keys.map(k => `${k.locale}:${k.namespace}:${k.key}`));
    this.processPreloadQueue();
  }

  private async processPreloadQueue() {
    // Process preload queue in batches
    const batch = this.preloadQueue.splice(0, 10);
    await Promise.all(batch.map(key => {
      const [locale, namespace, k] = key.split(':');
      return this.getTranslation(locale, namespace, k);
    }));

    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processPreloadQueue(), 100);
    }
  }

  private async fetchTranslation(locale: string, namespace: string, key: string): Promise<string | undefined> {
    // Implementation depends on your translation backend
    return undefined;
  }
}
```

### 3. Bundle Splitting Configuration

```typescript
// webpack.config.js (if using custom webpack)
module.exports = {
  webpack: (config) => {
    // Create separate chunks for translations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          translations: {
            test: /[\\/]messages[\\/]/,
            name: 'translations',
            chunks: 'all',
            priority: 10,
          },
          'translations-vi': {
            test: /[\\/]messages[\\/]vi[\\/]/,
            name: 'translations-vi',
            chunks: 'all',
            priority: 11,
          },
          'translations-en': {
            test: /[\\/]messages[\\/]en[\\/]/,
            name: 'translations-en',
            chunks: 'all',
            priority: 11,
          },
        },
      },
    };
    return config;
  },
};
```

## Developer Experience Design

### 1. Enhanced useTranslations Hook

```typescript
// src/hooks/useTranslations.ts
import { useTranslations as useNextIntlTranslations } from 'next-intl';
import type { EnTranslations, ViTranslations, TranslationNamespace } from '@/types/translations';

export function useTranslations<T extends TranslationNamespace>(
  namespace: T
): T extends keyof EnTranslations
  ? EnTranslations[T]
  : T extends keyof ViTranslations
    ? ViTranslations[T]
    : Record<string, any> {
  return useNextIntlTranslations(namespace) as any;
}

// Specialized hooks for common namespaces
export function useCommonTranslations() {
  return useTranslations('common');
}

export function useAuthTranslations() {
  return useTranslations('features.auth');
}

export function useCreditCardTranslations() {
  return useTranslations('features.credit-cards');
}
```

### 2. TypeScript Types Generation

```typescript
// scripts/generate-types.ts
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface TranslationSchema {
  [key: string]: any;
}

async function generateType(locale: string, path: string, prefix = ''): Promise<string> {
  let typeDefinition = '';

  const files = await readdir(path);
  for (const file of files.sort()) {
    if (file.endsWith('.json')) {
      const key = file.replace('.json', '');
      const content = JSON.parse(await readFile(join(path, file), 'utf-8'));
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof content === 'object' && content !== null) {
        typeDefinition += `  ${key}: {\n`;
        for (const [subKey, value] of Object.entries(content)) {
          if (typeof value === 'string') {
            typeDefinition += `    ${subKey}: string;\n`;
          } else {
            typeDefinition += `    ${subKey}: ${generateNestedType(value)};\n`;
          }
        }
        typeDefinition += `  };\n`;
      }
    }
  }

  return typeDefinition;
}

async function generateAllTypes() {
  const enTypes = await generateType('en', 'messages/en');
  const viTypes = await generateType('vi', 'messages/vi');

  const types = `// Generated translation types - DO NOT EDIT MANUALLY
export type TranslationNamespace =
  | 'common'
  | 'features.auth'
  | 'features.credit-cards'
  | 'features.insurance'
  | 'features.tools'
  | 'features.onboarding'
  | 'pages'
  | 'meta';

export interface EnTranslations {
  ${enTypes}
}

export interface ViTranslations {
  ${viTypes}
}

export type Translations = EnTranslations | ViTranslations;`;

  await writeFile('src/types/translations.ts', types);
}
```

### 3. IDE Integration Configuration

```json
// .vscode/settings.json
{
  "i18n-ally.keystyle": "nested",
  "i18n-ally.localesPaths": ["messages"],
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespace}.json",
  "i18n-ally.extract.autoDetect": true,
  "i18n-ally.extract.keygen": "default",
  "i18n-ally.extract.parsers": ["js", "jsx", "ts", "tsx"]
}
```

## Team Collaboration Design

### 1. Role-Based Access Control

```typescript
// scripts/translation-roles.ts
interface TranslationRole {
  canRead: string[];
  canWrite: string[];
  canApprove: string[];
}

const TRANSLATION_ROLES: Record<string, TranslationRole> = {
  translator: {
    canRead: ['**/*'],
    canWrite: ['features/**/*', 'pages/**/*'],
    canApprove: [],
  },
  developer: {
    canRead: ['**/*'],
    canWrite: ['**/*'],
    canApprove: ['common/**/*'],
  },
  translator_lead: {
    canRead: ['**/*'],
    canWrite: ['**/*'],
    canApprove: ['**/*'],
  },
};

function checkPermission(userRole: string, action: 'read' | 'write' | 'approve', path: string): boolean {
  const role = TRANSLATION_ROLES[userRole];
  if (!role) return false;

  const permissions = role[`can${action.charAt(0).toUpperCase() + action.slice(1)}`] as string[];
  return permissions.some(pattern => matchPath(pattern, path));
}
```

### 2. Automated Validation Pipeline

```typescript
// scripts/validate-translations.ts
interface ValidationResult {
  file: string;
  issues: Array<{
    type: 'missing' | 'unused' | 'invalid_format' | 'inconsistent';
    key: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

class TranslationValidator {
  async validateAll(): Promise<ValidationResult[]> {
    const locales = ['en', 'vi'];
    const results: ValidationResult[] = [];

    // Check for consistency between locales
    for (const locale of locales) {
      const files = await this.getTranslationFiles(locale);

      for (const file of files) {
        const result = await this.validateFile(file, locale);
        results.push(result);
      }
    }

    // Cross-locale consistency check
    const consistencyResult = await this.checkConsistency();
    results.push(...consistencyResult);

    return results;
  }

  private async validateFile(file: string, locale: string): Promise<ValidationResult> {
    const content = JSON.parse(await readFile(file, 'utf-8'));
    const issues = [];

    // Check for empty values
    this.checkEmptyValues(content, '', issues);

    // Check for missing placeholders
    this.checkPlaceholders(content, issues);

    // Check length constraints
    this.checkLengthConstraints(content, issues, locale);

    return { file, issues };
  }
}
```

## Performance Monitoring

### 1. Translation Analytics

```typescript
// src/lib/translation-analytics.ts
interface TranslationMetrics {
  namespace: string;
  locale: string;
  loadTime: number;
  cacheHit: boolean;
  error?: string;
}

export class TranslationAnalytics {
  private metrics: TranslationMetrics[] = [];

  recordTranslationLoad(metric: TranslationMetrics) {
    this.metrics.push(metric);

    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'translation_load', {
        event_category: 'i18n',
        event_label: `${metric.locale}:${metric.namespace}`,
        value: metric.loadTime,
        custom_map: {
          cache_hit: metric.cacheHit,
          error: metric.error,
        },
      });
    }
  }

  getMetricsByNamespace(namespace: string): TranslationMetrics[] {
    return this.metrics.filter(m => m.namespace === namespace);
  }

  getAverageLoadTime(): number {
    const total = this.metrics.reduce((sum, m) => sum + m.loadTime, 0);
    return total / this.metrics.length;
  }
}
```

### 2. Performance Metrics to Track

- Bundle size per namespace
- Translation loading time
- Cache hit rate
- Number of translation requests per page
- Unused translation keys percentage
- Memory usage

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Create new directory structure
2. Set up dynamic merge loader
3. Create migration script
4. Set up TypeScript type generation

### Phase 2: Migration (Week 2-3)
1. Migrate common translations
2. Migrate feature-by-feature
3. Update all import statements
4. Implement lazy loading for heavy features

### Phase 3: Tooling & Workflow (Week 4)
1. Set up IDE integration
2. Implement validation pipeline
3. Create pre-commit hooks
4. Build translation dashboard

### Phase 4: Performance & Monitoring (Week 5)
1. Implement caching strategy
2. Add performance monitoring
3. Optimize bundle splitting
4. Set up analytics

This architecture provides a scalable, maintainable solution for managing large internationalization files while ensuring developer productivity and application performance.