# i18n Migration Guide: Monolithic to Folder Structure

## Quick Steps to Migrate a Page

### 1. Create Folder Structure
```bash
mkdir -p messages/{locale}/features/{featureName}
# Example: messages/vi/features/calculator/
```

### 2. Run Extraction Script
```bash
# Create a custom extraction script based on your page's keys
# See scripts/extract-insurance-keys.js as reference
node scripts/extract-{yourPage}-keys.js
```

### 3. Update Component Imports
```bash
# Use the update script - adjust oldNamespace and newNamespace
node scripts/update-{yourPage}-i18n.js
```

### 4. Fix Missing Keys
```bash
# Copy keys from main.json to appropriate category files
node scripts/fix-{yourPage}-listing-keys.js
```

## Namespace Mapping

| Old Namespace | New Namespace |
|---------------|---------------|
| `pages.{pageName}` | `features.{featureName}.{category}` |
| `{pageName}` | `features.{featureName}.main` |

## Common Categories

- `main` - Page titles, descriptions, common UI text
- `listing` - Grid/list view, filters, pagination
- `detail` - Product details, tabs, specifications
- `comparison` - Comparison features, actions

## Example: Migrating Calculator Page

```javascript
// Old
const t = useTranslations("pages.calculator");

// New
const t = useTranslations("features.calculator.main");
```

## Key Script Templates

### Extract Keys Script
```javascript
const CATEGORIES = {
  main: ['title', 'description', 'loading', 'error'],
  listing: ['noResults', 'sortBy', 'filters'],
  detail: ['specifications', 'features']
};
```

### Update Script
```javascript
const oldNamespace = "pages.calculator";
const newNamespace = "features.calculator.main";
```

### Fix Keys Script
```javascript
const LISTING_KEYS = [
  'pageTitle',
  'pageDescription',
  'searchPlaceholder',
  // Add all required keys
];
```

## Verification

1. Restart dev server
2. Check page loads without errors
3. Verify no raw translation keys visible
4. Test both locales (en/vi)

## Important Notes

- Always backup original files before migration
- Test thoroughly after each step
- Ensure keys are in correct category files
- Check for INSUFFICIENT_PATH errors (objects vs strings)