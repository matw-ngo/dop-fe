# Migration Plan: Insurance Features to Credit Cards

## Overview
This plan outlines the migration of enhanced insurance features to the credit cards section, focusing on:
- Enhanced comparison system (snackbar, panel, export/share functionality)
- Component organization patterns
- Theme integration consistency
- URL patterns and state management
- Advanced filtering UI patterns
- Enhanced user experience features

**Note**: All testing, story, and example file creation tasks have been excluded from this plan as requested.

## Current State Analysis

### Insurance Features (Source)
- Comprehensive comparison system with snackbar, panel, and detailed comparison view
- Export functionality (CSV, PDF, clipboard, print)
- Advanced filtering with collapsible sections
- Active filter management
- URL state synchronization for shareable links
- Theme-based organization with InsuranceThemeProvider
- Well-structured component hierarchy

### Credit Cards Current State (Target)
- Basic comparison functionality exists (CreditCardComparison.tsx)
- Theme integration via CreditCardsThemeProvider
- Store and URL sync partially implemented
- Missing: comparison snackbar, export features, advanced filter UI

## Implementation Plan

### Phase 1: Component Structure Enhancement (Total: 1-2 hours)

#### 1.1 Create New Component Structure
```
src/components/features/credit-cards/
├── compare/
│   ├── components/
│   │   ├── ComparisonEmptyState.tsx
│   │   ├── ComparisonHeader.tsx
│   │   ├── ComparisonLoading.tsx
│   │   └── ComparisonContent.tsx
│   ├── CreditCardComparisonPanel.tsx (enhanced)
│   ├── CreditCardComparisonSnackbar.tsx (new)
│   └── index.ts
├── detail/
│   ├── components/
│   │   ├── LoadingState.tsx
│   │   ├── ProductOverviewCard.tsx
│   │   ├── PaymentMethodCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ProductHeader.tsx
│   │   ├── ProductSidebar.tsx
│   │   └── tabs/
│   │       ├── BenefitsTab.tsx
│   │       ├── FeesTab.tsx
│   │       └── FeaturesTab.tsx
│   └── CreditCardDetails.tsx (enhanced)
├── CreditCardActiveFilters.tsx (new)
├── CreditCardFilterSidebar.tsx (new)
├── CreditCardFilterPanel.tsx (enhanced)
├── CreditCardPagination.tsx (new)
├── CreditCardResultsHeader.tsx (new)
├── CreditCardSearchBar.tsx (new)
├── CreditCardPageContent.tsx (new)
├── CreditCardPageControls.tsx (new)
├── CreditCardSortDropdown.tsx (new)
└── index.ts
```

### Phase 2: Enhanced Comparison System (Total: 6-7 hours)

#### 2.1 Credit Card Comparison Snackbar
**File**: `/src/components/features/credit-cards/compare/CreditCardComparisonSnackbar.tsx`
- Migrate from `InsuranceComparisonSnackbar.tsx`
- Credit card specific adaptations:
  - Use CreditCard icon instead of Shield icon
  - Update translations to use `creditCard.*` keys
  - Navigate to `/credit-cards/compare`
- Maintain same functionality:
  - Show selected cards count (e.g., "2/3")
  - Dropdown to view/remove cards
  - Quick access to comparison page

#### 2.2 Enhanced Credit Card Comparison Panel
**File**: `/src/components/features/credit-cards/compare/CreditCardComparisonPanel.tsx`
- Migrate from `InsuranceComparisonPanel.tsx`
- Credit card specific features:
  - Export fields: annual fee, interest rate, rewards rate, credit limit
  - Comparison criteria: cashback, points, miles, welcome bonuses
- Export functionality:
  - CSV: Include all card metrics and fees
  - PDF: Print-friendly comparison table
  - Clipboard: Formatted text for messaging
- Share functionality:
  - Native share API
  - Social media sharing
  - Copy comparison link

#### 2.3 Enhanced Comparison Table
**File**: `/src/components/features/credit-cards/compare/CreditCardComparison.tsx` (update existing)
- Add visual indicators for best values:
  - Lowest annual fee
  - Highest rewards rate
  - Best welcome bonus
  - Lowest interest rate
- Add scoring system based on user priorities
- Include application status and approval odds

#### 2.4 Comparison Data Hook
**File**: `/src/components/features/credit-cards/compare/hooks/useComparisonData.ts`
- Extract comparison logic into reusable hook
- Handle data fetching and state management
- Provide computed values for scoring

### Phase 3: Store and State Management Enhancement (Total: 3-4 hours)

#### 3.1 Update Credit Cards Store with Comparison State
**File**: `/src/store/use-credit-cards-store.ts`
Enhancements needed:
- Add comparison state structure:
  ```typescript
  comparison: {
    selectedCards: string[];
    maxCards: 3;
    canAddMore: boolean;
    isFull: boolean;
  }
  ```
- Add pagination state matching insurance patterns
- Add UI state (sidebar open/close, mobile filters)
- Add selectors for:
  - `useCreditCardComparison()`
  - `useCreditCardActions()`
  - `useFilteredCreditCards()`
  - `usePaginatedCreditCards()`
- Persist comparison and filter state

#### 3.2 URL Synchronization Hook Enhancement
**File**: `/src/hooks/features/credit-card/use-credit-cards-url-sync.ts`
Add support for:
- Comparison state: `?cards=id1,id2,id3`
- Advanced filters with ranges
- Search and sort parameters
- Match insurance URL patterns

### Phase 4: Advanced Filter System (Total: 5-6 hours)

#### 4.1 Enhanced Filter Panel
**File**: `/src/components/features/credit-cards/CreditCardFilterPanel.tsx`
Migrate from `InsuranceFilterPanel.tsx` with credit card specifics:

**Filter Sections**:
1. **Card Types**: Personal, Business, Student, Premium
2. **Card Networks**: Visa, Mastercard, JCB, Amex
3. **Annual Fee**: Range slider (Free, <100k, 100k-500k, >500k)
4. **Interest Rates**: Purchase APR, Cash Advance APR
5. **Credit Limit Tiers**: Under 50M, 50M-100M, 100M+
6. **Income Requirements**: Range slider
7. **Reward Programs**: Cashback, Points, Miles, Hybrid
8. **Digital Features**: Mobile payments, NFC, Virtual cards
9. **Insurance Benefits**: Travel, Purchase protection, Medical
10. **Issuers**: Bank selection

Each section should have:
- Icon and title
- Collapsible content
- Clear selection option
- Active count badge

#### 4.2 Active Filters Component
**File**: `/src/components/features/credit-cards/CreditCardActiveFilters.tsx`
- Display selected filters as pills
- Individual filter removal
- Clear all filters
- Filter count badge

#### 4.3 Filter Sidebar
**File**: `/src/components/features/credit-cards/CreditCardFilterSidebar.tsx`
- Mobile-first design
- Drawer/overlay implementation
- Filter apply/reset actions
- Responsive breakpoint handling

#### 4.4 Filter Hook
**File**: `/src/components/features/credit-cards/hooks/useCreditCardFilters.ts`
- Extract filter logic into reusable hook
- Handle filter state and validation

### Phase 5: Page Structure Enhancement (Total: 4-5 hours)

#### 5.1 Enhanced Page Controls
**File**: `/src/components/features/credit-cards/CreditCardPageControls.tsx`
Components to include:
- Search bar with autocomplete
- Sort dropdown (featured, annual fee, rewards, rating)
- View mode toggle (grid, list, compact)
- Mobile filter toggle button
- Results count display

#### 5.2 Results Header
**File**: `/src/components/features/credit-cards/CreditCardResultsHeader.tsx`
- Breadcrumb navigation
- Results title with count
- Active filters summary
- Sort controls

#### 5.3 Enhanced Search
**File**: `/src/components/features/credit-cards/CreditCardSearchBar.tsx`
- Search suggestions
- Recent searches history
- Popular searches
- Clear and close buttons

#### 5.4 Sort Dropdown
**File**: `/src/components/features/credit-cards/CreditCardSortDropdown.tsx`
Sort options:
- Featured
- Lowest Annual Fee
- Highest Rewards Rate
- Best Welcome Bonus
- Highest Rating
- Lowest Interest Rate
- Newest Cards

#### 5.5 Page Content Wrapper
**File**: `/src/components/features/credit-cards/CreditCardPageContent.tsx`
- Combine all page components
- Handle responsive layout
- Manage state integration

### Phase 6: Detail Page Enhancement (Total: 3-4 hours)

#### 6.1 Enhanced Card Details
**File**: `/src/components/features/credit-cards/CreditCardDetails.tsx`
Enhancements:
- Tabbed content layout matching insurance pattern
- Overview tab with card image and key features
- Benefits tab with reward programs details
- Fees tab with comprehensive fee structure
- Features tab with digital capabilities
- Requirements tab (income, age, documents)
- Reviews and ratings section
- Related cards suggestions

#### 6.2 Detail Components
Create these components for detail page:
- `/src/components/features/credit-cards/detail/components/ProductOverviewCard.tsx` - Card visual and quick facts
- `/src/components/features/credit-cards/detail/components/PaymentMethodCard.tsx` - Fee structure visualization
- `/src/components/features/credit-cards/detail/components/ServiceCard.tsx` - Customer service information
- `/src/components/features/credit-cards/detail/components/ProductHeader.tsx` - Card name, issuer, rating
- `/src/components/features/credit-cards/detail/components/ProductSidebar.tsx` - Apply button and quick info

#### 6.3 Tab Components
**Files**:
- `/src/components/features/credit-cards/detail/components/tabs/BenefitsTab.tsx`
- `/src/components/features/credit-cards/detail/components/tabs/FeesTab.tsx`
- `/src/components/features/credit-cards/detail/components/tabs/FeaturesTab.tsx`

### Phase 7: Enhanced User Experience (Total: 2-3 hours)

#### 7.1 Loading States
- Skeleton cards matching credit card design
- Loading spinners for async operations
- Shimmer effects for filters
- Progress indicators for comparisons

#### 7.2 Empty States
- No search results illustration
- No comparison cards guidance
- Suggested cards based on profile
- Clear filters call-to-action

#### 7.3 Enhanced Pagination
**File**: `/src/components/features/credit-cards/CreditCardPagination.tsx`
- Page navigation with ellipsis
- Items per page selector (12, 24, 48)
- Total results display
- Previous/Next buttons

### Phase 8: Theme and Styling Consistency (Total: 1-2 hours)

#### 8.1 Review Theme Provider
**File**: `/src/components/features/credit-card/CreditCardsThemeProvider.tsx`
- Already implemented with business user group
- Ensure consistency with insurance theme patterns
- Same color scheme and spacing

#### 8.2 Component Styling
- Use same design tokens as insurance
- Maintain responsive breakpoints
- Consistent hover states and transitions
- Business/corporate color palette

### Phase 9: Page Integration (Total: 2-3 hours)

#### 9.1 Main Listing Page
**File**: `/src/app/[locale]/credit-cards/page.tsx`
Updates needed:
- Add CreditCardComparisonSnackbar
- Replace CreditCardCatalog with CreditCardPageContent
- Add error boundaries
- Implement loading states

#### 9.2 Comparison Page
**File**: `/src/app/[locale]/credit-cards/compare/page.tsx`
Enhancements:
- Add CreditCardComparisonPanel
- Enhanced URL parameter handling
- Back to browsing navigation
- Share comparison options

#### 9.3 Detail Page
**File**: `/src/app/[locale]/credit-cards/[slug]/page.tsx`
Enhancements:
- Add CreditCardComparisonSnackbar integration
- Enhanced metadata for SEO
- Related cards section
- Breadcrumb navigation

### Phase 10: Performance Optimization (Total: 1-2 hours)

#### 10.1 Performance Optimizations
- Virtualization for large card lists
- Debounced search and filter inputs
- Lazy loading for images
- Memoization for expensive calculations

## Implementation Dependencies

### Prerequisites
1. Update translation files with new keys
2. Ensure credit card types are fully defined
3. Prepare mock data for testing
4. Update routing if needed

### Recommended Libraries
- `file-saver` - For file downloads (CSV export)
- `react-beautiful-dnd` - For reordering comparison items (optional)
- `date-fns` - For date formatting

## Critical Files to Modify

1. `/src/store/use-credit-cards-store.ts` - Core state management
2. `/src/components/features/credit-cards/compare/CreditCardComparisonPanel.tsx` - Enhanced comparison
3. `/src/components/features/credit-cards/compare/CreditCardComparisonSnackbar.tsx` - New comparison notification
4. `/src/components/features/credit-cards/CreditCardFilterPanel.tsx` - Advanced filtering
5. `/src/app/[locale]/credit-cards/page.tsx` - Main page integration
6. `/src/hooks/features/credit-card/use-credit-cards-url-sync.ts` - URL state management

## Migration Checklist

- [ ] Create component structure and index files
- [ ] Implement comparison snackbar
- [ ] Create enhanced comparison panel with export/share
- [ ] Update comparison table with visual indicators
- [ ] Update credit cards store with comparison state
- [ ] Enhance URL synchronization hook
- [ ] Create advanced filter panel
- [ ] Implement active filters component
- [ ] Create filter sidebar
- [ ] Build page control components
- [ ] Enhance search and sort functionality
- [ ] Update card details page with tabs
- [ ] Create detail page components
- [ ] Add loading and empty states
- [ ] Implement enhanced pagination
- [ ] Ensure theme consistency
- [ ] Integrate components into main pages
- [ ] Optimize for performance

## Success Criteria

1. Feature parity with insurance comparison system
2. Consistent user experience across both features
3. Maintainable component structure
4. Performance optimization
5. Accessibility compliance
6. Mobile responsiveness

This migration should be executed incrementally, testing each phase before proceeding to the next. The goal is to achieve feature parity while maintaining the unique aspects of the credit cards feature.

## Total Estimated Time
**30-40 hours** (excluding all testing, story, and example file creation)