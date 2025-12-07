# Credit Cards i18n Migration Plan

## Overview
This document outlines the migration strategy for credit-cards internationalization from the monolithic `pages.creditCard` namespace to the new modular structure under `features/credit-cards/`.

## Current State

### Existing Translation Structure
- **Monolithic files**: `messages/en.json` and `messages/vi.json` with `pages.creditCard` namespace
- **Total keys**: ~198 keys in the creditCard section
- **Sub-namespace**: `pages.creditCard.emptyState` (some components)

### Current Component Usage

#### Using `pages.creditCard` namespace:
1. **Listing/Grid Components**:
   - `CreditCardActiveFilters.tsx`
   - `CreditCardFilterPanel.tsx`
   - `CreditCardFilterSidebar.tsx`
   - `CreditCardPagination.tsx`
   - `EmptyState.tsx`

2. **Comparison Components**:
   - `CreditCardComparisonPanel.tsx`
   - `CreditCardComparisonSnackbar.tsx`
   - `compare/components/ComparisonContent.tsx`
   - `compare/components/ComparisonEmptyState.tsx`
   - `compare/components/ComparisonHeader.tsx`

3. **Detail Components**:
   - `CreditCardDetails.tsx`
   - `detail/components/PaymentMethodCard.tsx`
   - `detail/components/ProductHeader.tsx`
   - `detail/components/ProductOverviewCard.tsx`
   - `detail/components/ProductSidebar.tsx`
   - `detail/components/ServiceCard.tsx`
   - `detail/components/tabs/*.tsx` (all tabs)

#### Using `creditCard` namespace (without pages):
1. `CreditCardPageContent.tsx`
2. `CreditCardPageControls.tsx`
3. `CreditCardResultsHeader.tsx`
4. `CreditCardSearchBar.tsx`
5. `CreditCardSortDropdown.tsx`

## New Translation Structure

### File Organization
```
messages/[locale]/features/credit-cards/
├── main.json          # Main/shared translations
├── listing.json       # Listing/grid page specific
├── detail.json        # Detail page specific
├── comparison.json    # Comparison feature specific
├── search.json        # Search functionality
├── results.json       # Results display
├── view-mode.json     # View mode options
├── categories.json    # Card categories
├── fee-types.json     # Fee types
├── interest-types.json # Interest types
├── credit-limit-tiers.json # Credit limit tiers
├── comparison-snackbar.json # Comparison snackbars
├── csv-headers.json   # CSV export headers
└── pdf-headers.json   # PDF export headers
```

## Migration Mapping

### 1. Component Namespace Updates

#### Listing/Grid Components (→ `features.credit-cards.listing`)
- `useTranslations("pages.creditCard")` → `useTranslations("features.credit-cards.listing")`
- `useTranslations("pages.creditCard.emptyState")` → `useTranslations("features.credit-cards.listing")`

**Components to update:**
- `CreditCardActiveFilters.tsx`
- `CreditCardFilterPanel.tsx`
- `CreditCardFilterSidebar.tsx`
- `CreditCardPagination.tsx`
- `EmptyState.tsx`
- `CreditCardPageContent.tsx` (if it uses listing keys)
- `CreditCardPageControls.tsx`
- `CreditCardResultsHeader.tsx`
- `CreditCardSearchBar.tsx`
- `CreditCardSortDropdown.tsx`

#### Detail Components (→ `features.credit-cards.detail`)
- `useTranslations("pages.creditCard")` → `useTranslations("features.credit-cards.detail")`

**Components to update:**
- `CreditCardDetails.tsx`
- `detail/components/PaymentMethodCard.tsx`
- `detail/components/ProductHeader.tsx`
- `detail/components/ProductOverviewCard.tsx`
- `detail/components/ProductSidebar.tsx`
- `detail/components/ServiceCard.tsx`
- `detail/components/tabs/BenefitsTab.tsx`
- `detail/components/tabs/FeaturesTab.tsx`
- `detail/components/tabs/FeesTab.tsx`
- `detail/components/tabs/RequirementsTab.tsx`
- `detail/components/tabs/ReviewsTab.tsx`

#### Comparison Components (→ `features.credit-cards.comparison`)
- `useTranslations("pages.creditCard")` → `useTranslations("features.credit-cards.comparison")`

**Components to update:**
- `CreditCardComparisonPanel.tsx`
- `CreditCardComparisonSnackbar.tsx`
- `compare/components/ComparisonContent.tsx`
- `compare/components/ComparisonEmptyState.tsx`
- `compare/components/ComparisonHeader.tsx`

### 2. Key Migration Strategy

#### From `pages.creditCard` to New Files:

**main.json** (already exists, contains common/shared keys):
- Basic UI elements
- Common terminology
- General actions

**listing.json** (newly created):
- Grid display keys
- Pagination
- Filter controls
- Sorting
- Empty state messages
- Selection state

**detail.json** (newly created):
- Card detail information
- Application requirements
- Features and benefits
- Fees and charges
- Review sections

**comparison.json** (newly created):
- Comparison panel
- Export functionality
- Share functionality
- Comparison progress

### 3. Backward Compatibility Strategy

To ensure smooth migration without breaking changes:

1. **Phase 1**: Create all new translation files
2. **Phase 2**: Update components one by one
3. **Phase 3**: Keep old keys in main files with fallback values
4. **Phase 4**: Remove old keys after all components are updated

## Implementation Steps

### Step 1: Migration Script
Create a script to extract and organize keys from monolithic files:

```javascript
// migration-script.js
const fs = require('fs');
const path = require('path');

// Load existing translations
const enTranslations = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const viTranslations = JSON.parse(fs.readFileSync('messages/vi.json', 'utf8'));

// Extract creditCard keys
const creditCardKeys = enTranslations.pages.creditCard;

// Categorize keys into files
const keyCategories = {
  listing: [
    'noCardsFound', 'tryAdjustingFilters', 'showingResults',
    'filter', 'sort', 'clearFilters', 'activeFilters',
    // ... more listing keys
  ],
  detail: [
    'cardDetails', 'applyNow', 'requirementsAndApplication',
    'feesAndCharges', 'rewardsAndBenefits',
    // ... more detail keys
  ],
  comparison: [
    'comparisonPanel', 'compareDescription', 'exportComparison',
    'shareComparison', 'noCardsInComparison',
    // ... more comparison keys
  ]
};

// Generate files based on categories
Object.entries(keyCategories).forEach(([category, keys]) => {
  const enFile = {};
  const viFile = {};

  keys.forEach(key => {
    if (creditCardKeys[key]) {
      enFile[key] = creditCardKeys[key];
      viFile[key] = viTranslations.pages.creditCard[key];
    }
  });

  // Write to files
  fs.writeFileSync(
    `messages/en/features/credit-cards/${category}.json`,
    JSON.stringify(enFile, null, 2)
  );
  fs.writeFileSync(
    `messages/vi/features/credit-cards/${category}.json`,
    JSON.stringify(viFile, null, 2)
  );
});
```

### Step 2: Component Updates Priority

**High Priority** (Core functionality):
1. Listing components
2. Detail components
3. Comparison components

**Medium Priority** (Supporting features):
1. Search components
2. Filter components
3. Sort components

**Low Priority** (Nice-to-have):
1. Export functionality
2. Share functionality

### Step 3: Testing Strategy

1. **Unit Tests**: Verify each component loads correct translations
2. **Integration Tests**: Test complete user flows
3. **Visual Regression**: Ensure no UI changes
4. **E2E Tests**: Verify all functionality works

### Step 4: Rollback Plan

If migration causes issues:
1. Keep backup of original translation files
2. Implement feature flag to toggle between old/new structure
3. Quick revert script to restore old namespaces

## Validation Checklist

- [ ] All components updated to use new namespaces
- [ ] No translation keys are lost
- [ ] All new translation files are complete
- [ ] Backward compatibility maintained
- [ ] Tests pass for all affected components
- [ ] No console errors related to missing translations
- [ ] UI displays correctly in all languages
- [ ] Export/share functionality works
- [ ] Search and filter functionality works

## Post-Migration Cleanup

After successful migration:
1. Remove old translation keys from `messages/en.json` and `messages/vi.json`
2. Update any documentation referencing old namespaces
3. Update i18n guidelines for developers
4. Remove migration scripts and temporary files

## Best Practices for Future

1. **Feature-based organization**: Keep translations organized by feature
2. **Consistent naming**: Use clear, descriptive keys
3. **Avoid nesting**: Keep key structure flat
4. **Regular cleanup**: Remove unused keys periodically
5. **Documentation**: Maintain documentation of translation structure

## Timeline Estimate

- **Phase 1** (Preparation): 1-2 days
  - Create migration scripts
  - Set up new translation files

- **Phase 2** (Implementation): 3-5 days
  - Update all components
  - Test each component

- **Phase 3** (Testing & QA): 2-3 days
  - Comprehensive testing
  - Bug fixes

- **Phase 4** (Deployment): 1 day
  - Deploy changes
  - Monitor for issues

- **Phase 5** (Cleanup): 1 day
  - Remove old keys
  - Update documentation

**Total Estimated Time**: 8-12 days

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing translation keys | High | Thorough key mapping and validation |
| Broken functionality | High | Component-by-component testing |
| Performance impact | Medium | Monitor bundle sizes |
| Developer confusion | Medium | Clear documentation and examples |

## Conclusion

This migration will improve maintainability, scalability, and developer experience for the credit-cards feature. The modular structure allows for better organization and easier management of translations as the feature grows.