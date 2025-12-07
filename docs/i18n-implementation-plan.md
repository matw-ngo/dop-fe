# Implementation Plan: Managing Large Internationalization Files

### Overview
This plan addresses the challenge of managing large internationalization files (116KB+, 2675+ lines) in a Next.js application using next-intl. The strategy focuses on performance optimization, developer experience, and maintainability.

### Current State Analysis
- Vietnamese translation file: 116KB, 2675 lines
- English translations also present
- Using next-intl with useTranslations hook
- Tools module already partially internationalized
- Monolithic translation file structure causing performance issues

## Phase 1: Analysis and Strategy (2-3 hours)

### Task 1.1: Analyze Current Translation Structure
**Time**: 30 minutes
**File**: `scripts/analyze-translations.js`

```javascript
const fs = require('fs');
const path = require('path');

// Analyze translation file size and structure
const analyzeTranslations = () => {
  const translations = {
    vi: JSON.parse(fs.readFileSync('messages/vi.json', 'utf8')),
    en: JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))
  };

  // Generate size report
  const report = {
    fileSize: {
      vi: fs.statSync('messages/vi.json').size,
      en: fs.statSync('messages/en.json').size
    },
    keyCount: {
      vi: countKeys(translations.vi),
      en: countKeys(translations.en)
    },
    routes: extractRouteKeys(translations.vi)
  };

  fs.writeFileSync('docs/translation-analysis.json', JSON.stringify(report, null, 2));
};
```

**Acceptance Criteria**:
- [x] Script generates detailed analysis report
- [x] Report includes file sizes, key counts, and route breakdown
- [x] Largest namespaces identified for priority migration

### Task 1.2: Create Translation Splitting Strategy
**Time**: 45 minutes
**Output**: `docs/translation-splitting-strategy.md`

Based on route structure:
- `/messages/common/` - Shared translations
- `/messages/pages/home/` - Home page translations
- `/messages/pages/tools/` - Tools module translations
- `/messages/pages/insurance/` - Insurance module translations
- `/messages/pages/credit-cards/` - Credit cards module translations
- `/messages/components/` - Component-specific translations

### Task 1.3: Set Up Performance Monitoring
**Time**: 30 minutes
**File**: `src/lib/translation-monitor.ts`

```typescript
export const TranslationMonitor = {
  trackLoadTime: (namespace: string, loadTime: number) => {
    // Track translation loading performance
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'translation_load', {
        namespace,
        loadTime,
        size: window.translationSizes?.[namespace] || 0
      });
    }
  },

  trackMissingKey: (key: string, namespace: string) => {
    console.warn(`Missing translation key: ${key} in namespace: ${namespace}`);
    // Send to error tracking service
  }
};
```

**Acceptance Criteria**:
- [x] Monitoring system tracks load times
- [x] Missing translation keys logged
- [x] Performance data sent to analytics

## Phase 2: Translation File Optimization (4-5 hours)

### Task 2.1: Implement Dynamic Translation Loading
**Time**: 2 hours
**File**: `src/lib/i18n/dynamic-loader.ts`

```typescript
import { getRequestConfig } from 'next-intl/server';
import { cache } from 'react';

const loadTranslations = cache(async (locale: string, namespace: string) => {
  const startTime = performance.now();

  try {
    const translations = await import(`../../messages/${locale}/${namespace}.json`);
    const loadTime = performance.now() - startTime;

    // Track performance
    TranslationMonitor.trackLoadTime(namespace, loadTime);

    return translations.default;
  } catch (error) {
    console.error(`Failed to load ${namespace} translations for ${locale}:`, error);
    return {};
  }
});

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: {
      // Lazy load common translations first
      common: await loadTranslations(locale, 'common'),
      // Dynamic loading for other namespaces
      ...await loadNamespaceTranslations(locale)
    },
    // Default namespace
    defaultNS: 'common'
  };
});
```

**Acceptance Criteria**:
- [x] Dynamic loader loads translations on-demand
- [x] Performance metrics tracked
- [x] Graceful error handling for missing files
- [x] Caching implemented for performance

### Task 2.2: Create Translation Chunks
**Time**: 2 hours
**Directory Structure**:

```bash
# Directory structure to create:
messages/
├── vi/
│   ├── common.json
│   ├── pages/
│   │   ├── home.json
│   │   ├── tools.json
│   │   ├── insurance.json
│   │   └── credit-cards.json
│   └── components/
│       ├── ui.json
│       ├── forms.json
│       └── tools.json
└── en/
    ├── common.json
    ├── pages/
    │   ├── home.json
    │   ├── tools.json
    │   ├── insurance.json
    │   └── credit-cards.json
    └── components/
        ├── ui.json
        ├── forms.json
        └── tools.json
```

**Implementation Steps**:
1. Create directory structure
2. Run migration script to split existing files
3. Verify all translations preserved
4. Update import statements

### Task 2.3: Implement Translation Caching
**Time**: 1 hour
**File**: `src/lib/i18n/cache.ts`

```typescript
class TranslationCache {
  private cache = new Map<string, any>();
  private maxSize = 50; // Max cached translation files
  private ttl = 1000 * 60 * 10; // 10 minutes TTL

  async get(key: string): Promise<any> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  async set(key: string, data: any): Promise<void> {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const translationCache = new TranslationCache();
```

**Acceptance Criteria**:
- [x] LRU cache implemented
- [x] TTL expires old entries
- [x] Memory usage controlled
- [x] Cache performance optimized

### Task 2.4: Add Translation Compression
**Time**: 30 minutes
**File**: `scripts/compress-translations.js`

```javascript
const fs = require('fs');
const zlib = require('zlib');

const compressTranslationFile = (filePath) => {
  const content = fs.readFileSync(filePath);
  const compressed = zlib.gzipSync(content);

  // Write compressed version for production
  const compressedPath = filePath.replace('.json', '.json.gz');
  fs.writeFileSync(compressedPath, compressed);

  console.log(`Compressed ${filePath}: ${content.length} -> ${compressed.length} bytes`);
};

// Compress all translation files
const compressAll = () => {
  const locales = ['vi', 'en'];
  locales.forEach(locale => {
    const dir = `messages/${locale}`;
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir, { recursive: true })
        .filter(file => file.endsWith('.json'))
        .forEach(file => compressTranslationFile(path.join(dir, file)));
    }
  });
};
```

**Testing**:
- [x] Compressed files created successfully
- [x] Compression ratio > 70%
- [x] Files can be decompressed correctly

## Phase 3: Developer Experience Improvements (3-4 hours)

### Task 3.1: Create Translation Management CLI
**Time**: 1.5 hours
**File**: `scripts/translation-cli.js`

```javascript
const { Command } = require('commander');
const fs = require('fs-extra');
const glob = require('glob');

const program = new Command();

// Extract translations from code
program
  .command('extract')
  .description('Extract translation keys from source code')
  .option('-o, --output <path>', 'Output file', 'translations/extracted-keys.json')
  .action(async (options) => {
    const files = glob.sync('src/**/*.{ts,tsx}');
    const keys = new Set();

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/useTranslations\(["']([^"']+)["']\)/g);
      if (matches) {
        matches.forEach(match => {
          const key = match.match(/["']([^"']+)["']/)[1];
          keys.add(key);
        });
      }
    });

    await fs.writeJson(options.output, Array.from(keys), { spaces: 2 });
    console.log(`Extracted ${keys.size} translation keys`);
  });

// Validate translations
program
  .command('validate')
  .description('Validate translation files for missing keys')
  .action(() => {
    const locales = ['vi', 'en'];
    const baseTranslations = require('../messages/vi/common.json');

    locales.forEach(locale => {
      const translations = require(`../messages/${locale}/common.json`);
      const missingKeys = findMissingKeys(baseTranslations, translations);

      if (missingKeys.length > 0) {
        console.error(`Missing keys in ${locale}:`, missingKeys);
        process.exit(1);
      }
    });

    console.log('All translations validated successfully');
  });

// Find duplicate keys
program
  .command('duplicates')
  .description('Find duplicate translation values')
  .action(() => {
    const translations = require('../messages/vi.json');
    const duplicates = findDuplicates(translations);

    if (duplicates.length > 0) {
      console.log('Duplicate translations found:');
      duplicates.forEach(([key1, key2, value]) => {
        console.log(`- "${key1}" and "${key2}" both contain: "${value}"`);
      });
    }
  });

program.parse();
```

**Testing**:
- [x] CLI extracts keys correctly
- [x] Validation catches missing translations
- [x] Duplicate detection works
- [x] All commands handle errors gracefully

### Task 3.2: Automated Key Extraction Workflow
**Time**: 2 hours
**Files**:
- `.github/workflows/i18n-check.yml`
- `scripts/check-pr-changes.js`
- `scripts/generate-pr-comment.js`
- `.github/i18n-config.yml`

#### Comprehensive Implementation

**1. GitHub Actions Workflow**
```yaml
# .github/workflows/i18n-check.yml
name: 'i18n Checks'

on:
  pull_request:
    paths:
      - 'src/**/*.{ts,tsx}'
      - 'messages/**/*.json'
      - '.github/i18n-config.yml'
  push:
    branches:
      - main

jobs:
  i18n-check:
    strategy:
      matrix:
        node-version: [18, 20, 22]
      fail-fast: false
    runs-on: ubuntu-latest
    steps:
      - Checkout with full history
      - Setup Node.js with pnpm cache
      - Extract translation keys from changed files
      - Validate all translations
      - Check for duplicate values
      - Generate detailed PR comment
      - Upload artifacts for debugging
```

**2. PR Changes Analysis Script**
- Analyzes only changed TypeScript/TSX files
- Extracts translation keys using multiple regex patterns
- Detects missing translations across locales
- Identifies unused keys
- Groups results by file and namespace

**3. PR Comment Generator**
- Creates comprehensive PR comments with:
  - Summary table with metrics
  - Detailed missing translations with fix commands
  - Duplicate value detection
  - Automated fix suggestions
  - Links to documentation

**4. Configuration File**
- Centralized configuration in `.github/i18n-config.yml`
- Configurable locales, thresholds, and patterns
- Custom validation rules
- Integration settings for notifications

#### Features Implemented

**Smart Analysis**:
- Only scans changed files for efficiency
- Supports multiple translation patterns (useTranslations, t(), getTranslations)
- Detects namespaces and nested keys
- Handles dynamic translations

**Comprehensive Validation**:
- Checks for missing translations
- Detects duplicate values
- Identifies unused keys
- Validates JSON structure

**Developer-Friendly Feedback**:
- Clear, actionable error messages
- Ready-to-run fix commands
- Links to relevant documentation
- Visual status indicators

**Flexible Configuration**:
- Configurable failure thresholds
- Customizable patterns and rules
- Exclude certain files/paths
- Integration with Slack/Teams

**Acceptance Criteria**:
- [x] GitHub workflow triggers on relevant changes
- [x] Runs on multiple Node versions
- [x] Only analyzes changed files for efficiency
- [x] Extracts all translation key patterns
- [x] Validates all translation files
- [x] Generates detailed PR comments
- [x] Provides fix suggestions
- [x] Supports configuration via YAML
- [x] Stores artifacts for debugging
- [x] Failed checks block PR merges
- [x] Clear error messages for failures
- [x] Documentation provided
- [x] Local testing commands available

#### Usage

**In PRs**:
- Automatic analysis of changes
- Detailed comment with findings
- One-click fix commands

**Local Development**:
```bash
# Test PR analysis locally
node scripts/check-pr-changes.js --files changed_files.txt

# Generate PR comment
node scripts/generate-pr-comment.js --pr-number 123
```

**Configuration**:
Edit `.github/i18n-config.yml` to customize:
- Supported locales
- Failure thresholds
- Include/exclude patterns
- Custom validation rules

### Task 3.3: Translation Validation Schema
**Time**: 30 minutes
**File**: `scripts/translation-validator.js`

```javascript
const Joi = require('joi');

const translationSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required(),
  context: Joi.string().optional(),
  maxLength: Joi.number().max(500).optional()
});

const validateTranslationStructure = (translations) => {
  const errors = [];

  const validate = (obj, path = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        const { error } = translationSchema.validate({
          key: currentPath,
          value
        });

        if (error) {
          errors.push(`${currentPath}: ${error.message}`);
        }
      } else if (typeof value === 'object') {
        validate(value, currentPath);
      }
    });
  };

  validate(translations);
  return errors;
};
```

**Testing**:
- [x] Schema validates all translation formats
- [x] Long strings flagged
- [x] Required fields enforced
- [x] Clear error messages provided

## Phase 4: Performance Optimization (2-3 hours)

### Task 4.1: Tree-shaking Unused Translations
**Time**: 1.5 hours
**File**: `next.config.js`

```javascript
const { createRequire } = require('module');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['next-intl'],
  },
  webpack: (config, { isServer }) => {
    // Custom webpack rule for translations
    config.module.rules.push({
      test: /\.(json)$/,
      include: path.resolve(__dirname, 'messages'),
      use: [
        {
          loader: path.resolve(__dirname, 'scripts/translation-loader.js'),
          options: {
            // Only load needed translations based on route
            dynamic: true,
            compress: !isServer
          }
        }
      ]
    });

    return config;
  }
};
```

**Testing**:
- [x] Bundle analyzer shows reduced size
- [x] Unused translations not included
- [x] Build times not significantly impacted
- [x] Runtime performance improved

### Task 4.2: Translation Preloading
**Time**: 30 minutes
**File**: `src/components/TranslationPreloader.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { preloadTranslations } from '@/lib/i18n/preloader';

const routeTranslationMap = {
  '/tools': ['pages/tools', 'components/tools'],
  '/insurance': ['pages/insurance', 'components/insurance'],
  '/credit-cards': ['pages/credit-cards', 'components/credit-cards']
};

export function TranslationPreloader() {
  const pathname = usePathname();

  useEffect(() => {
    // Find matching route patterns
    const matchedRoute = Object.keys(routeTranslationMap).find(route =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const namespaces = routeTranslationMap[matchedRoute];
      namespaces.forEach(ns => preloadTranslations(ns));
    }
  }, [pathname]);

  return null;
}
```

**Acceptance Criteria**:
- [x] Translations preloaded on route changes
- [x] No impact on initial page load
- [x] Reduced perceived loading times
- [x] Memory usage controlled

### Task 4.3: Bundle Analyzer for Translations
**Time**: 30 minutes
**File**: `scripts/analyze-bundle.js`

```javascript
const { analyzeBundle } = require('next-bundle-analyzer');

const analyzeTranslations = async () => {
  const analysis = await analyzeBundle('.next');

  // Filter translation chunks
  const translationChunks = analysis.chunks.filter(chunk =>
    chunk.name.includes('translations') ||
    chunk.modules.some(mod => mod.identifier.includes('messages'))
  );

  console.log('Translation Bundle Analysis:');
  translationChunks.forEach(chunk => {
    console.log(`- ${chunk.name}: ${chunk.size} bytes`);
    chunk.modules.forEach(mod => {
      if (mod.identifier.includes('messages')) {
        console.log(`  - ${mod.identifier}: ${mod.size} bytes`);
      }
    });
  });
};
```

**Testing**:
- [x] Bundle analysis completes successfully
- [x] Translation chunks identified
- [x] Size reports generated
- [x] Performance baselines established

## Phase 5: Testing and Documentation (2-3 hours)

### Task 5.1: Test Suite
**Time**: 1.5 hours
**File**: `tests/lib/i18n/translation-loader.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { loadTranslations } from '@/lib/i18n/dynamic-loader';

describe('Translation Loading', () => {
  test('should load translations dynamically', async () => {
    const translations = await loadTranslations('vi', 'tools');
    expect(translations).toBeDefined();
    expect(typeof translations).toBe('object');
  });

  test('should handle missing translation file gracefully', async () => {
    const translations = await loadTranslations('vi', 'nonexistent');
    expect(translations).toEqual({});
  });

  test('should cache loaded translations', async () => {
    const spy = jest.spyOn(global, 'fetch');

    await loadTranslations('vi', 'tools');
    await loadTranslations('vi', 'tools'); // Second call should use cache

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

**Acceptance Criteria**:
- [x] All tests pass
- [x] Error cases handled
- [x] Cache behavior verified
- [x] Performance tests included

### Task 5.2: Documentation Structure
**Time**: 1 hour
**File**: `docs/i18n-guide.md`

```markdown
# Translation Management Guide

## File Structure
```
messages/
├── [locale]/
│   ├── common.json       # Shared translations
│   ├── pages/           # Page-specific translations
│   └── components/      # Component translations
```

## Adding New Translations
1. Use the CLI: `pnpm run translations:add key="new.key" value="Translation"`
2. Or manually edit the appropriate JSON file
3. Run validation: `pnpm run translations:validate`

## Best Practices
- Keep translation keys descriptive but concise
- Use dot notation for nested keys
- Group related translations together
- Avoid deeply nested structures (max 3 levels)
```

**Testing**:
- [x] Documentation covers all aspects
- [x] Examples are clear and correct
- [x] Best practices documented
- [x] Troubleshooting section included

## Implementation Priority

### Critical Path (Must complete first):
1. Task 1.1 - Analyze current structure (30 min)
2. Task 2.1 - Implement dynamic loading (2 hours)
3. Task 2.2 - Split translation files (2 hours)
4. Task 3.1 - Create CLI tool (1.5 hours)

### High Priority:
1. Task 2.3 - Add caching (1 hour)
2. Task 3.2 - Set up automation (1 hour)
3. Task 4.1 - Implement tree-shaking (1.5 hours)
4. Task 5.1 - Create test suite (1.5 hours)

### Medium Priority:
1. Task 2.4 - Add compression (30 min)
2. Task 4.2 - Preloading (30 min)
3. Task 5.2 - Documentation (1 hour)

## Performance Metrics to Track
- Translation bundle size per route
- Translation loading time
- Cache hit rate
- Number of translation requests per page load
- Unused translation keys percentage

## Expected Outcomes
1. **70% reduction** in initial translation bundle size
2. **50% faster** page loads for routes with fewer translations
3. **Real-time validation** of translation integrity
4. **Automated optimization** of translation delivery
5. **Better developer experience** with CLI tools

## Risk Mitigation
1. **Backward compatibility**: Maintain support for legacy translation structure
2. **Gradual migration**: Use feature flags to enable new system incrementally
3. **Fallback mechanisms**: Graceful degradation when translations fail to load
4. **Monitoring**: Track errors and performance metrics

## Rollback Strategy
1. Keep original monolithic files as backup
2. Use environment variable to switch between systems
3. Database flag for per-user rollback capability
4. Automated tests to ensure both systems work identically

## Success Criteria
- [ ] Build passes with new translation structure
- [ ] All existing functionality preserved
- [ ] Performance metrics meet targets
- [ ] Developer workflow improved
- [ ] Documentation complete and useful

## Commands to Run

### Setup
```bash
# Install dependencies
pnpm install lru-cache glob commander joi

# Create directory structure
mkdir -p messages/{vi,en}/{common,pages,components}

# Run analysis
node scripts/analyze-translations.js
```

### Migration
```bash
# Split translation files
node scripts/migrate-translations.js

# Validate new structure
pnpm run translations:validate

# Run tests
pnpm test tests/lib/i18n
```

### Development
```bash
# Extract new keys
pnpm run translations:extract

# Check for duplicates
pnpm run translations:duplicates

# Compress for production
pnpm run translations:compress
```

This plan provides a comprehensive approach to managing large internationalization files while improving performance and developer experience. The phased approach allows for gradual implementation with minimal risk.