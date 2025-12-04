# Implementation Plan: Credit Cards Feature

## Executive Summary

This plan outlines the implementation of a comprehensive credit cards feature for the new application, migrating and enhancing functionality from the old project located at `docs/migration/old-project/code/app/the-tin-dung`. The implementation includes three main pages: list view, detail view, and comparison view, leveraging the existing tech stack (Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui, Zustand).

### Key Features to Implement:
- **Advanced Filtering**: Age, income, credit limit, province, category
- **Smart Search**: Real-time search with autocomplete
- **Multi-card Comparison**: Side-by-side comparison of up to 3 cards
- **Detailed Card Information**: Comprehensive card details with structured data
- **Redirect Tracking**: Partner link tracking with analytics
- **Responsive Design**: Mobile-first approach with breakpoints

---

## Phase 1: Project Setup & Data Structure (Total: 4h)

| # | Task | Size | Files |
|---|------|------|-------|
| 1 | Create TypeScript interfaces for credit cards | M | `src/types/credit-card.ts` |
| 2 | Set up mock data with Vietnamese credit cards | L | `src/data/credit-cards.ts` |
| 3 | Create credit cards Zustand store | M | `src/store/use-credit-cards-store.ts` |
| 4 | Set up API endpoints structure | M | `src/lib/api/endpoints/credit-cards.ts` |
| 5 | Create constants and configurations | S | `src/constants/credit-cards.ts` |

---

## Phase 2: Base Components (Total: 8h)

| # | Task | Size | Files |
|---|------|------|-------|
| 6 | Create CreditCard component (individual card) | M | `src/components/features/credit-card/CreditCard.tsx` |
| 7 | Build CreditCardGrid component | M | `src/components/features/credit-card/CreditCardGrid.tsx` |
| 8 | Create CreditCardSkeleton loader | S | `src/components/features/credit-card/CreditCardSkeleton.tsx` |
| 9 | Build FilterPanel component | L | `src/components/features/credit-card/FilterPanel.tsx` |
| 10 | Create SearchBar with autocomplete | M | `src/components/features/credit-card/SearchBar.tsx` |
| 11 | Implement SortDropdown | S | `src/components/features/credit-card/SortDropdown.tsx` |
| 12 | Create Pagination component | M | `src/components/features/credit-card/Pagination.tsx` |

---

## Phase 3: List Page Implementation (Total: 6h)

| # | Task | Size | Files |
|---|------|------|-------|
| 13 | Create main credit cards page layout | L | `src/app/[locale]/credit-cards/page.tsx` |
| 14 | Implement filter sidebar with all filters | L | `src/components/features/credit-card/FilterSidebar.tsx` |
| 15 | Add filter state management | M | `src/components/features/credit-card/hooks/useCreditCardFilters.ts` |
| 16 | Create active filters display | M | `src/components/features/credit-card/ActiveFilters.tsx` |
| 17 | Implement URL synchronization for filters | M | `src/components/features/credit-card/hooks/useFilterSync.ts` |
| 18 | Add results count and messaging | S | `src/components/features/credit-card/ResultsHeader.tsx` |

---

## Phase 4: Detail Page Implementation (Total: 5h)

| # | Task | Size | Files |
|---|------|------|-------|
| 19 | Create credit card detail page | L | `src/app/[locale]/credit-cards/[slug]/page.tsx` |
| 20 | Build comprehensive card info sections | L | `src/components/features/credit-card/CardDetailSections.tsx` |
| 21 | Create tabbed interface for details | M | `src/components/features/credit-card/DetailTabs.tsx` |
| 22 | Add comparison button integration | S | `src/components/features/credit-card/AddToComparisonButton.tsx` |
| 23 | Implement related cards suggestion | M | `src/components/features/credit-card/RelatedCards.tsx` |

---

## Phase 5: Comparison Page Implementation (Total: 7h)

| # | Task | Size | Files |
|---|------|------|-------|
| 24 | Create comparison page layout | L | `src/app/[locale]/credit-cards/compare/page.tsx` |
| 25 | Build comparison table component | L | `src/components/features/credit-card/ComparisonTable.tsx` |
| 26 | Create comparison panel for management | M | `src/components/features/credit-card/ComparisonPanel.tsx` |
| 27 | Implement add/remove cards logic | M | `src/components/features/credit-card/hooks/useComparisonState.ts` |
| 28 | Create card suggestions for comparison | M | `src/components/features/credit-card/ComparisonSuggestions.tsx` |
| 29 | Add comparison export/share functionality | S | `src/components/features/credit-card/ComparisonActions.tsx` |

---

## Phase 6: Advanced Features (Total: 6h)

| # | Task | Size | Files |
|---|------|------|-------|
| 30 | Implement card redirect tracking | M | `src/app/[locale]/credit-cards/redirect/page.tsx` |
| 31 | Create bookmark/favorite feature | M | `src/components/features/credit-card/BookmarkButton.tsx` |
| 32 | Add print-friendly comparison view | S | `src/components/features/credit-card/PrintableView.tsx` |
| 33 | Implement advanced search with filters | M | `src/components/features/credit-card/AdvancedSearch.tsx` |
| 34 | Create card recommendation engine | L | `src/components/features/credit-card/CardRecommendations.tsx` |

---

## Phase 7: Testing & Optimization (Total: 5h)

| # | Task | Size | Files |
|---|------|------|-------|
| 35 | Write unit tests for components | L | `src/components/features/credit-card/__tests__/` |
| 36 | Create integration tests for pages | M | `src/app/[locale]/credit-cards/__tests__/` |
| 37 | Add E2E tests for user flows | M | `tests/e2e/credit-cards.spec.ts` |
| 38 | Implement performance optimizations | M | Various |
| 39 | Add error boundaries and handling | S | `src/components/features/credit-card/ErrorBoundary.tsx` |

---

## Detailed Implementation Notes

### Data Structure

```typescript
interface CreditCard {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  cardType: 'visa' | 'mastercard' | 'jcb' | 'amex';
  category: 'personal' | 'business' | 'premium' | 'student' | 'cashback';

  // Financial details
  annualFee: number;
  annualFeeWaiver: string;
  interestRate: number;
  creditLimitMin: number;
  creditLimitMax: number;

  // Requirements
  ageRequiredMin: number;
  ageRequiredMax: number;
  incomeRequired: number;
  provinces: string[];

  // Features
  features: string[];
  benefits: string[];
  welcomeOffer?: string;

  // Fees
  withdrawalFee: number;
  foreignExchangeFee: number;
  latePaymentFee: number;
  overLimitFee: number;

  // Metadata
  image: string;
  applyLink: string;
  rating: number;
  reviewCount: number;
  isRecommended?: boolean;
  tags: string[];
}
```

### Store Structure

```typescript
interface CreditCardsStore {
  // Data
  cards: CreditCard[];
  categories: CardCategory[];

  // Filters
  filters: CreditCardFilters;
  activeFiltersCount: number;

  // Comparison
  comparisonCards: CreditCard[];
  maxComparisonCards: 3;

  // UI State
  searchQuery: string;
  sortBy: SortOption;
  currentPage: number;
  viewMode: 'grid' | 'list';

  // Actions
  setFilters: (filters: Partial<CreditCardFilters>) => void;
  clearFilters: () => void;
  addToComparison: (cardId: string) => void;
  removeFromComparison: (cardId: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (option: SortOption) => void;
  setCurrentPage: (page: number) => void;
}
```

### Filter Options

1. **Personal Filters**
   - Age range: 18-80 years
   - Monthly income: 3-200 million VND
   - Desired credit limit: 10-500 million VND

2. **Card Features**
   - Annual fee: Free / Paid / Waiver available
   - Card category: Personal / Business / Premium / Student
   - Card benefits: Cashback / Points / Travel / Shopping

3. **Location**
   - Province/State: All 63 provinces in Vietnam
   - National availability: Yes/Partial

4. **Special Requirements**
   - Documents required: ID card / Income proof / etc.
   - Employment type: Full-time / Part-time / Business owner

### Comparison Features

- Up to 3 cards side-by-side
- 14+ comparison criteria
- Visual indicators for better/worse values
- Smart suggestions based on selected cards
- Export to PDF/Email functionality
- Print-friendly layout

### Performance Optimizations

1. **Data Fetching**
   - Implement React Query for caching
   - Use pagination for large datasets
   - Implement infinite scroll option

2. **Rendering**
   - Virtualize long lists
   - Lazy load card images
   - Implement skeleton states

3. **Bundle Size**
   - Code split by route
   - Dynamic imports for heavy components
   - Optimize images with next/image

### SEO Considerations

1. **Meta Tags**
   - Dynamic titles based on filters
   - Structured data for cards
   - Canonical URLs

2. **URL Structure**
   ```
   /credit-cards                    # Main listing
   /credit-cards?category=cashback # Filtered view
   /credit-cards/compare           # Comparison page
   /credit-cards/visa-infinite     # Card details
   ```

3. **Open Graph**
   - Card images for social sharing
   - Dynamic descriptions

### Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly text
- High contrast mode support
- Focus management in modals

### Analytics Tracking

- Page views with filter context
- Card clicks and redirects
- Comparison usage
- Search queries
- Conversion tracking

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data accuracy | High | Regular data validation, user feedback system |
| Performance on mobile | Medium | Lazy loading, pagination, optimized images |
| Complex filter state | Medium | URL sync, clear reset options |
| Partner link changes | Low | Regular link validation, fallback handling |

---

## Success Criteria

- [ ] All three pages implemented with full functionality
- [ ] Responsive design works on all devices
- [ ] Page load time under 2 seconds
- [ ] 100% TypeScript coverage
- [ ] 80%+ test coverage
- [ ] Accessibility audit passes
- [ ] SEO score above 90
- [ ] User acceptance testing complete

---

## Timeline Estimate

**Total Estimated Time: 41 hours**

- Phase 1: 4h (Setup)
- Phase 2: 8h (Components)
- Phase 3: 6h (List Page)
- Phase 4: 5h (Detail Page)
- Phase 5: 7h (Comparison)
- Phase 6: 6h (Advanced Features)
- Phase 7: 5h (Testing)

**Recommended Sprint Distribution:**
- Sprint 1: Phases 1-2 (12h)
- Sprint 2: Phases 3-4 (11h)
- Sprint 3: Phases 5-6 (13h)
- Sprint 4: Phase 7 + Buffer (5h + 5h buffer)