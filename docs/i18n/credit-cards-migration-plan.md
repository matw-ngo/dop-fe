# Migration Plan: Credit Cards i18n to New Folder Structure

## Overview

This plan outlines the migration of credit-cards page and all nested components from the monolithic i18n structure to the new namespace-based folder structure.

## Current State

### Existing Translation Structure
- **Monolithic files**: `messages/vi.json` and `messages/en.json`
- **Primary namespace**: `pages.creditCard` (198+ keys)
- **Secondary namespace**: `creditCard` (used by some components)
- **Sub-namespace**: `pages.creditCard.emptyState`

### Components Using i18n
1. **Main page**: `src/app/[locale]/credit-cards/page.tsx`
2. **Feature components**: 30+ components across:
   - `/src/components/features/credit-card/` (13 components)
   - `/src/components/features/credit-cards/` (18+ components)
   - Sub-modules: `compare/` and `detail/`

## Target Structure

### New Folder Structure
```
messages/
├── vi/
│   └── features/
│       └── credit-cards/
│           ├── main.json      # Common/shared translations
│           ├── listing.json    # Grid/listing page
│           ├── detail.json     # Card details page
│           └── comparison.json # Comparison feature
└── en/
    └── features/
        └── credit-cards/
            ├── main.json
            ├── listing.json
            ├── detail.json
            └── comparison.json
```

### Namespace Mapping
| Current Namespace | New Namespace | Purpose |
|------------------|----------------|---------|
| `pages.creditCard` (listing) | `features.credit-cards.listing` | Grid view, filters, pagination |
| `pages.creditCard` (detail) | `features.credit-cards.detail` | Card details, benefits, fees |
| `pages.creditCard` (comparison) | `features.credit-cards.comparison` | Compare cards feature |
| `creditCard` | `features.credit-cards.listing` | Align with primary pattern |
| `pages.creditCard.emptyState` | `features.credit-cards.listing` | Part of listing feature |

## Migration Tasks

### Phase 1: Preparation (Day 1)

#### Task 1.1: Extract and categorize all translation keys
```bash
# Run extraction script
node scripts/extract-credit-card-keys.js

# Review generated files
- messages/vi/features/credit-cards/listing.json
- messages/vi/features/credit-cards/detail.json
- messages/vi/features/credit-cards/comparison.json
- uncategorized-keys.json (manual review needed)
```

#### Task 1.2: Verify key completeness
- Cross-reference extracted keys with original `pages.creditCard` namespace
- Ensure no keys are missing
- Validate English translations exist

### Phase 2: Update Components (Days 2-4)

#### Task 2.1: Update main page
**File**: `src/app/[locale]/credit-cards/page.tsx`
```typescript
// From:
const t = useTranslations("pages.creditCard");

// To:
const t = useTranslations("features.credit-cards.listing");
const tCommon = useTranslations("common");
```

#### Task 2.2: Update listing components
**Files to update**:
- `CreditCardsPageHero.tsx`
- `CreditCardsPageControls.tsx`
- `CreditCardsPageResults.tsx`
- `CreditCardFilterPanel.tsx`
- `CreditCardGrid.tsx`
- `CreditCardSearchBar.tsx`
- `CreditCardSortDropdown.tsx`
- `CreditCardPagination.tsx`
- `FilterPanel.tsx`
- `CreditCard.tsx`

**Change pattern**:
```typescript
// From:
const t = useTranslations("pages.creditCard");
// OR
const t = useTranslations("creditCard");

// To:
const t = useTranslations("features.credit-cards.listing");
```

#### Task 2.3: Update detail components
**Files to update**:
- `CreditCardDetails.tsx`
- `detail/ProductHeader.tsx`
- `detail/ProductSidebar.tsx`
- `detail/ProductOverviewCard.tsx`
- `detail/BenefitsTab.tsx`
- `detail/FeesTab.tsx`
- `detail/FeaturesTab.tsx`
- `detail/RequirementsTab.tsx`
- `detail/ReviewsTab.tsx`
- `detail/PaymentMethodCard.tsx`
- `detail/ServiceCard.tsx`

**Change pattern**:
```typescript
// From:
const t = useTranslations("pages.creditCard");

// To:
const t = useTranslations("features.credit-cards.detail");
```

#### Task 2.4: Update comparison components
**Files to update**:
- `CreditCardComparison.tsx`
- `compare/CreditCardComparisonPanel.tsx`
- `compare/CreditCardComparisonSnackbar.tsx`
- `compare/ComparisonHeader.tsx`
- `compare/ComparisonContent.tsx`
- `compare/ComparisonEmptyState.tsx`
- `compare/ComparisonLoading.tsx`

**Change pattern**:
```typescript
// From:
const t = useTranslations("pages.creditCard");

// To:
const t = useTranslations("features.credit-cards.comparison");
```

#### Task 2.5: Handle special cases
**EmptyState component**:
```typescript
// From:
const t = useTranslations("pages.creditCard.emptyState");

// To:
const t = useTranslations("features.credit-cards.listing");
// Update key references from "emptyState.*" to "emptyState.*"
```

### Phase 3: Testing (Day 5)

#### Task 3.1: Component testing
For each updated component:
- [ ] Component renders without errors
- [ ] All translations display correctly
- [ ] No missing translation warnings
- [ ] Pluralization works (if applicable)

#### Task 3.2: Page flow testing
- [ ] Credit cards listing page loads
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Pagination works
- [ ] Card detail view opens
- [ ] Comparison feature works
- [ ] All UI text is translated

#### Task 3.3: Cross-browser testing
- Chrome, Firefox, Safari
- Mobile responsive view
- Different locales (vi/en)

### Phase 4: Cleanup (Day 6)

#### Task 4.1: Remove old translations
From `messages/vi.json` and `messages/en.json`:
- Remove all `pages.creditCard.*` keys
- Remove all `creditCard.*` keys
- Keep only if used elsewhere

#### Task 4.2: Update documentation
- Update i18n workflow guide
- Add credit-cards as example
- Document namespace decisions

## Key Distribution by File

### main.json
```json
{
  "title": "Credit Cards",
  "description": "Compare and find the best credit cards",
  "loading": "Loading...",
  "error": "Failed to load credit cards",
  "retry": "Retry"
}
```

### listing.json
```json
{
  "title": "Credit Cards",
  "search": {
    "placeholder": "Search credit cards...",
    "noResults": "No cards found"
  },
  "filters": {
    "title": "Filters",
    "clearAll": "Clear all",
    "categories": {
      "title": "Categories",
      "cashback": "Cashback",
      "travel": "Travel",
      "shopping": "Shopping"
    }
  },
  "sort": {
    "label": "Sort by",
    "options": {
      "recommended": "Recommended",
      "annualFee": "Annual Fee",
      "cashback": "Cashback Rate"
    }
  },
  "pagination": {
    "showing": "Showing {start}-{end} of {total} cards",
    "previous": "Previous",
    "next": "Next"
  },
  "emptyState": {
    "noResults": {
      "title": "No credit cards found",
      "description": "Try adjusting your filters",
      "action": "Clear filters"
    }
  }
}
```

### detail.json
```json
{
  "title": "Card Details",
  "applyNow": "Apply Now",
  "backToCards": "← Back to all cards",
  "overview": "Overview",
  "benefits": {
    "title": "Benefits",
    "welcome": "Welcome Bonus",
    "travel": "Travel Benefits",
    "lifestyle": "Lifestyle Benefits",
    "dining": "Dining Privileges"
  },
  "fees": {
    "title": "Fees",
    "annual": "Annual Fee",
    "primary": "Primary Card",
    "supplementary": "Supplementary Card",
    "replacement": "Replacement Fee",
    "late": "Late Payment Fee"
  },
  "features": {
    "title": "Features",
    "installment": "Installment Plans",
    "insurance": "Insurance Coverage",
    "emergency": "Emergency Assistance"
  },
  "requirements": {
    "title": "Requirements",
    "income": "Minimum Income",
    "age": "Minimum Age",
    "documents": "Required Documents"
  },
  "reviews": {
    "title": "Reviews",
    "rating": "Rating",
    "noReviews": "No reviews yet"
  }
}
```

### comparison.json
```json
{
  "title": "Compare Credit Cards",
  "subtitle": "Select up to 4 cards to compare",
  "addToCompare": "Add to Compare",
  "removeFromCompare": "Remove",
  "maxCards": "Maximum 4 cards can be compared",
  "clearAll": "Clear All",
  "compareNow": "Compare Selected",
  "noComparison": {
    "title": "No cards selected",
    "description": "Select cards to compare features"
  },
  "export": {
    "title": "Export Comparison",
    "button": "Export as PDF"
  },
  "criteria": {
    "title": "Comparison Criteria",
    "annualFee": "Annual Fee",
    "cashback": "Cashback Rate",
    "welcomeBonus": "Welcome Bonus",
    "travelBenefits": "Travel Benefits"
  }
}
```

## Rollout Strategy

### Option 1: Big Bang (Recommended)
- Complete all updates in a single branch
- Test thoroughly
- Deploy all changes at once
- Advantages: Consistent state, simpler rollback
- Disadvantages: Larger change, more testing needed

### Option 2: Incremental
- Migrate one component group at a time
- Use feature flags
- Advantages: Smaller changes, easier to review
- Disadvantages: Temporary inconsistencies, more complex deployment

## Risk Mitigation

1. **Backup**: Create backup of current translations
2. **Testing**: Comprehensive test plan (see Phase 3)
3. **Rollback**: Keep old files until migration is verified
4. **Documentation**: Document all changes for future reference

## Success Criteria

- [ ] All 30+ components updated successfully
- [ ] No missing translation warnings
- [ ] All pages render correctly in both locales
- [ ] Old translation keys removed
- [ ] Documentation updated
- [ ] Team trained on new structure

## Timeline

- **Day 1**: Preparation and key extraction
- **Days 2-4**: Component updates (10 components/day)
- **Day 5**: Testing and validation
- **Day 6**: Cleanup and documentation

**Total estimated time**: 6 days

## Next Steps

1. Review and approve this plan
2. Run the extraction script
3. Start with Phase 1: Preparation
4. Update components following the mapping
5. Test thoroughly before deployment