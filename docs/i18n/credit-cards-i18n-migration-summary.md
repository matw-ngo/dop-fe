# Credit Cards i18n Migration Summary

## Quick Migration Guide

### 1. Files Created
✅ `messages/en/features/credit-cards/listing.json`
✅ `messages/vi/features/credit-cards/listing.json`
✅ `messages/en/features/credit-cards/detail.json`
✅ `messages/vi/features/credit-cards/detail.json`
✅ `messages/en/features/credit-cards/comparison.json`
✅ `messages/vi/features/credit-cards/comparison.json`
✅ `scripts/extract-credit-card-keys.js` - Extraction utility script

### 2. Component Migration Map

| Component | Current Namespace | New Namespace |
|-----------|------------------|---------------|
| **Listing Components** |
| CreditCardActiveFilters | `pages.creditCard` | `features.credit-cards.listing` |
| CreditCardFilterPanel | `pages.creditCard` | `features.credit-cards.listing` |
| CreditCardFilterSidebar | `pages.creditCard` | `features.credit-cards.listing` |
| CreditCardPagination | `pages.creditCard` | `features.credit-cards.listing` |
| EmptyState | `pages.creditCard.emptyState` | `features.credit-cards.listing` |
| CreditCardPageContent | `creditCard` | `features.credit-cards.listing` |
| CreditCardPageControls | `creditCard` | `features.credit-cards.listing` |
| CreditCardResultsHeader | `creditCard` | `features.credit-cards.listing` |
| CreditCardSearchBar | `creditCard` | `features.credit-cards.listing` |
| CreditCardSortDropdown | `creditCard` | `features.credit-cards.listing` |

| **Detail Components** |
| CreditCardDetails | `pages.creditCard` | `features.credit-cards.detail` |
| detail/components/PaymentMethodCard | `pages.creditCard` | `features.credit-cards.detail` |
| detail/components/ProductHeader | `pages.creditCard` | `features.credit-cards.detail` |
| detail/components/ProductOverviewCard | `pages.creditCard` | `features.credit-cards.detail` |
| detail/components/ProductSidebar | `pages.creditCard` | `features.credit-cards.detail` |
| detail/components/ServiceCard | `pages.creditCard` | `features.credit-cards.detail` |
| detail/components/tabs/* | `pages.creditCard` | `features.credit-cards.detail` |

| **Comparison Components** |
| CreditCardComparisonPanel | `pages.creditCard` | `features.credit-cards.comparison` |
| CreditCardComparisonSnackbar | `pages.creditCard` | `features.credit-cards.comparison` |
| compare/components/ComparisonContent | `pages.creditCard` | `features.credit-cards.comparison` |
| compare/components/ComparisonEmptyState | `pages.creditCard` | `features.credit-cards.comparison` |
| compare/components/ComparisonHeader | `pages.creditCard` | `features.credit-cards.comparison` |

### 3. Migration Commands

#### Run the extraction script to verify all keys:
```bash
node scripts/extract-credit-card-keys.js
```

#### Update a component example:
```tsx
// Before:
const t = useTranslations("pages.creditCard");

// After:
const t = useTranslations("features.credit-cards.listing");
// or
const t = useTranslations("features.credit-cards.detail");
// or
const t = useTranslations("features.credit-cards.comparison");
```

### 4. Key Categories

#### listing.json - Grid/Paging/Filtering
- Pagination controls
- Filter UI
- Search results
- Empty states
- Card selection states

#### detail.json - Card Information
- Card details
- Application requirements
- Features and benefits
- Fees and charges
- Reviews and ratings

#### comparison.json - Comparison Tool
- Comparison panel
- Export functionality
- Share functionality
- Comparison progress

### 5. Testing Checklist
- [ ] All components render without translation errors
- [ ] No missing key warnings in console
- [ ] All languages display correctly
- [ ] Export/share functionality works
- [ ] Search and filter functionality works
- [ ] Comparison feature works correctly

### 6. Common Migration Patterns

#### Pattern 1: Simple namespace change
```tsx
// src/components/features/credit-cards/CreditCardFilterSidebar.tsx
- const t = useTranslations("pages.creditCard");
+ const t = useTranslations("features.credit-cards.listing");
```

#### Pattern 2: Handling empty state
```tsx
// src/components/features/credit-cards/EmptyState.tsx
- const t = useTranslations("pages.creditCard.emptyState");
+ const t = useTranslations("features.credit-cards.listing");
```

#### Pattern 3: Mixed usage components
Some components might need multiple namespaces:
```tsx
const tListing = useTranslations("features.credit-cards.listing");
const tMain = useTranslations("features.credit-cards.main");
```

### 7. Validation Script

Create a simple validation script to check all translations are loaded:
```typescript
// scripts/validate-i18n-migration.ts
import { allTranslations } from '@/lib/i18n';

export function validateCreditCardsTranslations() {
  const requiredKeys = {
    listing: ['noCardsFound', 'tryAdjustingFilters', 'filter', 'sort'],
    detail: ['cardDetails', 'applyNow', 'requirementsAndApplication'],
    comparison: ['comparisonPanel', 'noCardsInComparison', 'exportComparison']
  };

  Object.entries(requiredKeys).forEach(([namespace, keys]) => {
    keys.forEach(key => {
      if (!allTranslations[`features.credit-cards.${namespace}.${key}`]) {
        console.error(`Missing key: features.credit-cards.${namespace}.${key}`);
      }
    });
  });
}
```

## Next Steps

1. **Run the extraction script** to verify all keys are properly categorized
2. **Update components one by one** using the mapping above
3. **Test each component** after updating
4. **Remove old keys** from monolithic files once all components are updated
5. **Update documentation** to reflect new structure

## Rollback Plan

If issues arise:
1. Revert component namespace changes
2. Keep new files for future use
3. Address issues and retry migration

## Benefits of Migration

1. **Better organization**: Related translations grouped together
2. **Easier maintenance**: Smaller, focused files
3. **Improved performance**: Only load needed translations
4. **Better developer experience**: Clear namespace structure
5. **Scalability**: Easy to add new features