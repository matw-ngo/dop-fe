# i18n Workflow Guide

## 📁 File Structure

```
messages/
├── vi/
│   ├── features/
│   │   ├── insurance/main.json      # Insurance related translations
│   │   ├── credit-cards/main.json   # Credit cards related
│   │   ├── tools/main.json          # Tools calculators
│   │   └── admin/main.json          # Admin panel
│   ├── pages/
│   │   ├── userOnboardingPage.json  # Onboarding flow
│   │   ├── grossToNetCalculator.json
│   │   └── [other pages].json
│   └── common/
│       └── common.json              # Shared translations
└── en/                              # English with same structure
```

## 🚀 Quick Workflow

### 1. Adding New Translations

#### Option A: Use CLI (Recommended)
```bash
# Interactive mode - will prompt for key, value, namespace
pnpm translations:add

# Non-interactive mode
pnpm translations:add --key="features.insurance.newFeature" --value="New Feature" --locale=vi
```

#### Option B: Edit JSON Files Directly
```bash
# Edit the appropriate file
vim messages/vi/features/insurance/main.json

# Add your translations
{
  "newFeature": "Tính năng mới",
  "newFeatureDescription": "Mô tả tính năng mới..."
}
```

### 2. Validating Translations

```bash
# Check all translations for issues
pnpm translations:validate

# Output shows:
# ✓ All translations valid
# ✅ No missing keys found
# ✅ No duplicates detected
```

### 3. Finding Missing Translations

```bash
# Check what's missing in English
pnpm translations:missing --base=vi --target=en

# This will show:
# Missing in EN:
# - features.insurance.newFeature (VI: "Tính năng mới")
# - pages.userOnboardingPage.step3 (VI: "Bước 3")
```

### 4. Checking Statistics

```bash
# Get overview of translations
pnpm translations:stats

# Output:
# VI: 2008 keys, 113.83 KB
# EN: 1478 keys, 74.1 KB
# Missing in EN: 530 keys
```

## 📝 Daily Workflow

### When Adding a New Feature:

1. **Add translations first**
   ```bash
   pnpm translations:add --key="features.newFeature.title" --value="Tiêu đề" --locale=vi
   pnpm translations:add --key="features.newFeature.title" --value="Title" --locale=en
   ```

2. **Use in code**
   ```typescript
   const t = useTranslations('features.newFeature');
   return <h1>{t('title')}</h1>;
   ```

3. **Validate when done**
   ```bash
   pnpm translations:validate
   ```

### When Updating Existing Translations:

1. **Edit the JSON file directly**
2. **Run validation**
   ```bash
   pnpm translations:validate
   ```

### Before Deploying:

1. **Check for missing translations**
   ```bash
   pnpm translations:missing
   ```

2. **Find duplicates to clean up**
   ```bash
   pnpm translations:duplicates
   ```

3. **Final validation**
   ```bash
   pnpm translations:validate --strict
   ```

## 🛠️ Advanced Usage

### Extract All Used Keys
```bash
# Find all translation keys used in code
pnpm translations:extract

# Save to file for review
pnpm translations:extract --output=used-keys.json
```

### Batch Operations
```bash
# Add multiple keys from a file
cat new-keys.json | pnpm translations:add --batch

# Validate specific locale only
pnpm translations:validate --locale=vi
```

## 🔍 Troubleshooting

### Translation Not Showing?
1. Check if the key exists:
   ```bash
   pnpm translations:stats | grep "your.key"
   ```

2. Verify you're using the correct namespace:
   ```typescript
   // WRONG
   useTranslations('pages') // When it's in features

   // RIGHT
   useTranslations('features.insurance')
   ```

3. Check cache (restart dev server if needed)

### Validation Errors?
```bash
# Get detailed error report
pnpm translations:validate --format json > docs/i18n/validation-report.json

# Review the report for specific issues
cat docs/i18n/validation-report.json
```

### Performance Issues?
- The loader caches translations for 5 minutes
- Only loads needed namespaces
- Check if you're loading too many namespaces at once

## 📋 Best Practices

1. **Keep files small** - Aim for < 100 keys per file
2. **Use descriptive namespaces** - `features.insurance.calculator` is better than `page1`
3. **Validate regularly** - At least before each release
4. **Commit translations separately** - Different commit from code changes
5. **Use English as base** - Add English first, then translate to Vietnamese

## 🗂️ File Organization Tips

### Features vs Pages
- **Features**: Reusable components (insurance, credit-cards, tools)
- **Pages**: One-time pages (home, about, contact)

### Common Translations
Put shared translations in `common/`:
- Buttons, labels, actions
- Error messages
- Navigation items
- Form validation messages

### Namespace Naming
```typescript
// Good
useTranslations('features.insurance.calculator')
useTranslations('pages.homePage')
useTranslations('common.buttons')

// Avoid
useTranslations('insurance')
useTranslations('page1')
```

## 📚 Reference

### Available Commands
| Command | What it does | When to use |
|---------|--------------|-------------|
| `pnpm translations:add` | Add new translation | Adding new features |
| `pnpm translations:validate` | Check for errors | Before deploying |
| `pnpm translations:missing` | Find missing keys | Ensuring completeness |
| `pnpm translations:duplicates` | Find duplicate values | Cleaning up |
| `pnpm translations:stats` | Show statistics | Quick overview |
| `pnpm translations:extract` | Find used keys | Code analysis |

### File Locations
- **Translations**: `messages/[locale]/`
- **CLI Tool**: `scripts/translation-cli.js`
- **Loader**: `src/lib/i18n/split-loader.ts`
- **Config**: `src/i18n/request.ts`

This workflow keeps things simple while ensuring translations are properly managed and validated!