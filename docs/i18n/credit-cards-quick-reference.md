# Credit Cards i18n Migration - Quick Reference

## Namespace Mapping

| Current Namespace | New Namespace | Component Types |
|------------------|----------------|-----------------|
| `pages.creditCard` | `features.credit-cards.listing` | Listing page, filters, search, grid |
| `pages.creditCard` | `features.credit-cards.detail` | Card details, benefits, fees |
| `pages.creditCard` | `features.credit-cards.comparison` | Compare cards feature |
| `creditCard` | `features.credit-cards.listing` | Search bar, sort dropdown |

## Component Update Patterns

### 1. Basic Update
```typescript
// Before
const t = useTranslations("pages.creditCard");

// After
const t = useTranslations("features.credit-cards.listing");
```

### 2. Multiple Namespaces
```typescript
// Before
const t = useTranslations("pages.creditCard");

// After
const t = useTranslations("features.credit-cards.listing");
const tCommon = useTranslations("common");
```

### 3. Empty State Component
```typescript
// Before
const t = useTranslations("pages.creditCard.emptyState");

// After
const t = useTranslations("features.credit-cards.listing");
// Update keys from "emptyState.title" to "emptyState.title"
```

## Key Files to Update

### Main Page
- `src/app/[locale]/credit-cards/page.tsx`
  ```typescript
  const t = useTranslations("features.credit-cards.listing");
  ```

### Listing Components (10 files)
```
src/components/features/credit-*/
├── CreditCardsPageHero.tsx
├── CreditCardsPageControls.tsx
├── CreditCardsPageResults.tsx
├── CreditCardFilterPanel.tsx
├── CreditCardGrid.tsx
├── CreditCardSearchBar.tsx
├── CreditCardSortDropdown.tsx
├── CreditCardPagination.tsx
├── FilterPanel.tsx
└── CreditCard.tsx
```

### Detail Components (11 files)
```
src/components/features/credit-cards/detail/
├── CreditCardDetails.tsx
├── ProductHeader.tsx
├── ProductSidebar.tsx
├── ProductOverviewCard.tsx
├── BenefitsTab.tsx
├── FeesTab.tsx
├── FeaturesTab.tsx
├── RequirementsTab.tsx
├── ReviewsTab.tsx
├── PaymentMethodCard.tsx
└── ServiceCard.tsx
```

### Comparison Components (7 files)
```
src/components/features/credit-cards/
├── CreditCardComparison.tsx
├── compare/
│   ├── CreditCardComparisonPanel.tsx
│   ├── CreditCardComparisonSnackbar.tsx
│   ├── ComparisonHeader.tsx
│   ├── ComparisonContent.tsx
│   ├── ComparisonEmptyState.tsx
│   └── ComparisonLoading.tsx
```

## Common Translation Keys

### Listing Page
```json
{
  "title": "Credit Cards",
  "search": {
    "placeholder": "Search credit cards..."
  },
  "filters": {
    "title": "Filters",
    "clearAll": "Clear all"
  },
  "pagination": {
    "showing": "Showing {start}-{end} of {total} cards"
  }
}
```

### Detail Page
```json
{
  "title": "Card Details",
  "applyNow": "Apply Now",
  "benefits": {
    "title": "Benefits"
  },
  "fees": {
    "title": "Fees",
    "annual": "Annual Fee"
  }
}
```

### Comparison
```json
{
  "title": "Compare Cards",
  "add": "Add to Compare",
  "remove": "Remove"
}
```

## Testing Checklist

### Before Migration
- [ ] Note current translation keys used
- [ ] Take screenshots of current UI

### After Migration
- [ ] Page loads without errors
- [ ] All text is translated
- [ ] No missing translation warnings
- [ ] Search works
- [ ] Filters apply
- [ ] Pagination works
- [ ] Detail view opens
- [ ] Comparison feature works
- [ ] Empty states display correctly

## Migration Commands

### 1. Extract Keys
```bash
node scripts/extract-credit-card-keys.js
```

### 2. Validate Translations
```bash
pnpm translations:validate
```

### 3. Check Statistics
```bash
pnpm translations:stats
```

## Troubleshooting

### Issue: Missing translations
**Symptom**: `[missing: "features.credit-cards.listing.title"]`
**Solution**: Check if key exists in `messages/vi/features/credit-cards/listing.json`

### Issue: Component not updating
**Symptom**: Old namespace still being used
**Solution**: Clear build cache
```bash
rm -rf .next
pnpm dev
```

### Issue: Uncategorized keys
**Solution**: Review `messages/[locale]/features/credit-cards/uncategorized.json`
Move keys to appropriate category files

## Rollback Plan

If issues arise:
1. Revert component changes to use old namespaces
2. Keep new translation files for future retry
3. Document issues encountered

## Support

- Reference: `docs/i18n/README.md`
- Scripts: `scripts/translation-cli.js`
- Validation: `pnpm translations:validate --json`