# Simplified i18n Setup

## What We Have

After cleanup, we now have a clean, simple i18n setup:

### 1. Split Translation Files ✅
```
messages/
├── vi/
│   ├── features/
│   │   ├── insurance/main.json
│   │   ├── credit-cards/main.json
│   │   ├── tools/main.json
│   │   └── admin/main.json
│   ├── pages/
│   │   └── [various pages].json
│   └── common/
│       └── common.json
└── en/
    └── [same structure]
```

### 2. Minimal Scripts (package.json)
- `pnpm translations:stats` - View statistics
- `pnpm translations:validate` - Check for issues
- `pnpm translations:duplicates` - Find duplicates
- `pnpm translations:add` - Add new translations

### 3. Essential Files
- `src/lib/i18n/split-loader.ts` - Loads split files with cache
- `src/i18n/request.ts` - next-intl configuration
- `scripts/translation-cli.js` - CLI tool for management
- `scripts/simple-migration.js` - Migration script (for reference)

## How It Works

### Loading Translations
1. **Cache first** - Check if translations are cached (5min TTL)
2. **Load from split files** - Load only needed namespaces
3. **Fallback** - Use original flat files if split files don't exist
4. **Performance** - Automatic caching for fast subsequent loads

### Adding New Translations
```bash
# Interactive mode
pnpm translations:add

# Or edit JSON files directly
# messages/vi/features/insurance/new-feature.json
```

### Validating Translations
```bash
# Check all translations
pnpm translations:validate

# Find duplicates
pnpm translations:duplicates

# View statistics
pnpm translations:stats
```

## Benefits

1. **Simple to understand** - No complex CI/CD, no automated workflows
2. **Fast** - Local cache, lazy loading
3. **Maintainable** - Small, focused files
4. **Flexible** - Works with both split and flat structure

## When to Use

- **Local development** - Perfect for everyday work
- **Small to medium teams** - No need for complex automation
- **When you want control** - Manual validation when needed, not forced

## What Was Removed (and why)

1. **CI/CD workflow** - Not needed for local development
2. **Compression** - Minimal benefit, adds build time
3. **Automated validation** - Manual validation is sufficient
4. **Complex monitoring** - Simple stats are enough
5. **Excessive reporting** - Not necessary for day-to-day work

## Tips

1. Keep translation files small (< 100 keys per file)
2. Use descriptive namespaces
3. Validate before major releases
4. Commit translation changes separately from code changes
5. Use the CLI tool for bulk operations

This simplified setup gives you everything you need without the complexity!