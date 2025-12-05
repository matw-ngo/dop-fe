# Implementation Plan: Insurance Feature

## Executive Summary

This plan outlines the implementation of a comprehensive insurance feature for the new application, migrating and enhancing functionality from the old project located at `docs/migration/old-project/code/app/bao-hiem`. The implementation follows the established credit cards architecture, including product listing, detail view, comparison view, and educational content specifically tailored for the Vietnamese insurance market.

### Key Features to Implement:
- **Advanced Filtering**: Insurance type, category, coverage limits, vehicle specifications
- **Smart Search**: Real-time search across insurance products
- **Multi-product Comparison**: Side-by-side comparison of up to 3 insurance products
- **Detailed Product Information**: Comprehensive insurance details with tabbed interface
- **Educational Content**: Tutorials, cost calculator, and regulation information
- **Vietnamese Market Focus**: Compliance with local insurance regulations
- **Redirect Tracking**: Partner link tracking with analytics

---

## Phase 1: Data Structure & Setup (Total: 4h)

| # | Task | Size | Files |
|---|------|------|-------|
| 1 | Create TypeScript interfaces for insurance products | M | `src/types/insurance.ts` |
| 2 | Set up mock data with Vietnamese insurance products | L | `src/data/insurance-products.ts` |
| 3 | Create insurance Zustand store with persistence | M | `src/store/use-insurance-store.ts` |
| 4 | Set up API endpoints structure | M | `src/lib/api/endpoints/insurance.ts` |
| 5 | Create constants and configurations | S | `src/constants/insurance.ts` |

---

## Phase 2: Base Components (Total: 8h)

| # | Task | Size | Files |
|---|------|------|-------|
| 6 | Create InsuranceProduct component (individual product card) | M | `src/components/features/insurance/InsuranceProduct.tsx` |
| 7 | Build InsuranceGrid component | M | `src/components/features/insurance/InsuranceGrid.tsx` |
| 8 | Create InsuranceSkeleton loader | S | `src/components/features/insurance/InsuranceSkeleton.tsx` |
| 9 | Build InsuranceFilterPanel component | L | `src/components/features/insurance/FilterPanel.tsx` |
| 10 | Create InsuranceSearchBar component | M | `src/components/features/insurance/SearchBar.tsx` |
| 11 | Implement SortDropdown for insurance | S | `src/components/features/insurance/SortDropdown.tsx` |
| 12 | Create Pagination component | M | `src/components/features/insurance/Pagination.tsx` |

---

## Phase 3: Main Listing Page (Total: 6h)

| # | Task | Size | Files |
|---|------|------|-------|
| 13 | Create main insurance page layout | L | `src/app/[locale]/insurance/page.tsx` |
| 14 | Implement filter sidebar with insurance-specific filters | L | `src/components/features/insurance/FilterSidebar.tsx` |
| 15 | Add filter state management | M | `src/components/features/insurance/hooks/useInsuranceFilters.ts` |
| 16 | Create active filters display | M | `src/components/features/insurance/ActiveFilters.tsx` |
| 17 | Implement URL synchronization for filters | M | `src/hooks/use-insurance-url-sync.ts` |
| 18 | Add results count and messaging | S | `src/components/features/insurance/ResultsHeader.tsx` |

---

## Phase 4: Detail Page (Total: 5h)

| # | Task | Size | Files |
|---|------|------|-------|
| 19 | Create insurance product detail page | L | `src/app/[locale]/insurance/[slug]/page.tsx` |
| 20 | Build comprehensive product info sections (5 tabs) | L | `src/components/features/insurance/ProductDetailSections.tsx` |
| 21 | Create tabbed interface for details | M | `src/components/features/insurance/DetailTabs.tsx` |
| 22 | Add comparison button integration | S | `src/components/features/insurance/AddToComparisonButton.tsx` |
| 23 | Implement related products suggestion | M | `src/components/features/insurance/RelatedProducts.tsx` |

---

## Phase 5: Comparison Page (Total: 7h)

| # | Task | Size | Files |
|---|------|------|-------|
| 24 | Create insurance comparison page layout | L | `src/app/[locale]/insurance/compare/page.tsx` |
| 25 | Build insurance comparison table component | L | `src/components/features/insurance/ComparisonTable.tsx` |
| 26 | Create comparison panel for management | M | `src/components/features/insurance/ComparisonPanel.tsx` |
| 27 | Implement add/remove products logic | M | `src/components/features/insurance/hooks/useComparisonState.ts` |
| 28 | Create product suggestions for comparison | M | `src/components/features/insurance/ComparisonSuggestions.tsx` |
| 29 | Add comparison export/share functionality | S | `src/components/features/insurance/ComparisonActions.tsx` |

---

## Phase 6: Educational Content (Total: 6h)

| # | Task | Size | Files |
|---|------|------|-------|
| 30 | Create InsuranceTutorial section | M | `src/components/features/insurance/InsuranceTutorial.tsx` |
| 31 | Build tutorial blog cards with horizontal scroll | M | `src/components/features/insurance/TutorialCards.tsx` |
| 32 | Create InsuranceCostCalculator component | L | `src/components/features/insurance/InsuranceCostCalculator.tsx` |
| 33 | Implement fee tables for vehicle types | M | `src/components/features/insurance/FeeTables.tsx` |
| 34 | Create expandable regulation content | M | `src/components/features/insurance/RegulationContent.tsx` |

---

## Detailed Implementation Notes

### Data Structure

```typescript
interface InsuranceProduct {
  // Identification
  id: string;
  slug: string;
  name: string;
  issuer: string;
  category: InsuranceCategory;
  type: InsuranceType; // Compulsory, Voluntary, etc.

  // Coverage Details
  coverage: {
    personalLimit: number;
    propertyLimit: number;
    thirdPartyLimit?: number;
    medicalLimit?: number;
  };

  // Pricing
  fee: number;
  feeType: 'annual' | 'monthly' | 'one-time';
  tax: number;

  // Target Audience
  target: string;
  requirements: {
    ageMin?: number;
    ageMax?: number;
    vehicleType?: VehicleType[];
    vehicleSeats?: number;
    vehicleWeight?: number; // tons
  };

  // Features & Benefits
  features: string[];
  benefits: string[];
  exclusions: string[];
  claimProcess: string[];
  documents: string[];

  // Regional
  provinces: string[];

  // Metadata
  rating: number;
  reviewCount: number;
  image: string;
  applyLink: string;
  isRecommended?: boolean;
  tags: string[];
}

enum InsuranceCategory {
  VEHICLE = 'vehicle',
  HEALTH = 'health',
  LIFE = 'life',
  TRAVEL = 'travel',
  PROPERTY = 'property',
}

enum InsuranceType {
  COMPULSORY = 'compulsory', // Bắt buộc
  VOLUNTARY = 'voluntary', // Tự nguyện
}

enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  TRUCK = 'truck',
  BUS = 'bus',
}
```

### Store Structure

```typescript
interface InsuranceStore {
  // Data
  products: InsuranceProduct[];
  categories: InsuranceCategory[];

  // Filters
  filters: InsuranceFilters;
  activeFiltersCount: number;

  // Comparison
  comparisonProducts: InsuranceProduct[];
  maxComparisonProducts: 3;

  // UI State
  searchQuery: string;
  sortBy: SortOption;
  currentPage: number;
  viewMode: 'grid' | 'list';

  // Actions
  setFilters: (filters: Partial<InsuranceFilters>) => void;
  clearFilters: () => void;
  addToComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (option: SortOption) => void;
  setCurrentPage: (page: number) => void;
}
```

### Filter Options

1. **Product Filters**
   - Insurance Category: Vehicle, Health, Life, Travel, Property
   - Insurance Type: Compulsory, Voluntary
   - Coverage Limits: 0-10 tỷ VND
   - Annual Fee: Free, <5M, 5-10M, >10M VND

2. **Vehicle-Specific Filters** (for vehicle insurance)
   - Vehicle Type: Car, Motorcycle, Truck, Bus
   - Seating Capacity: 4-5 seats, 7-9 seats, >9 seats
   - Vehicle Use: Personal, Business, Taxi, Training
   - Vehicle Weight: <1 ton, 1-5 tons, >5 tons

3. **Location**
   - Province/City: All 63 provinces in Vietnam

4. **Features**
   - 24/7 support
   - Mobile app
   - Online claims
   - Free towing
   - International coverage

### Vietnamese Market Specifics

1. **Compulsory Insurance Types**
   - Bảo hiểm TNDS bắt buộc xe ô tô (Compulsory civil liability auto insurance)
   - Bảo hiểm TNDS bắt buộc xe máy (Compulsory civil liability motorcycle insurance)

2. **Fee Structure**
   - Based on vehicle type, seating capacity, and weight
   - Special rates for taxis and training vehicles
   - Day-based premium calculations

3. **Regulatory Compliance**
   - Vietnamese Insurance Business Law
   - Ministry of Finance regulations
   - Local compensation limits

### Comparison Features

- Up to 3 products side-by-side
- 15+ comparison criteria
- Visual indicators for better/worse values
- Smart suggestions based on selected products
- Export to PDF/Email functionality
- Print-friendly layout

### Performance Optimizations

1. **Data Fetching**
   - Implement React Query for caching
   - Use pagination for large datasets
   - Implement infinite scroll option

2. **Rendering**
   - Virtualize long lists
   - Lazy load product images
   - Implement skeleton states

3. **Bundle Size**
   - Code split by route
   - Dynamic imports for heavy components
   - Optimize images with next/image

### SEO Considerations

1. **Meta Tags**
   - Dynamic titles based on filters
   - Structured data for insurance products
   - Canonical URLs

2. **URL Structure**
   ```
   /insurance                           # Main listing
   /insurance?category=vehicle         # Filtered view
   /insurance/compare                  # Comparison page
   /insurance/btns-xe-oto              # Product details
   ```

3. **Open Graph**
   - Product images for social sharing
   - Dynamic descriptions

### Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly text
- High contrast mode support
- Focus management in modals

### Analytics Tracking

- Page views with filter context
- Product clicks and redirects
- Comparison usage
- Search queries
- Conversion tracking
- Tutorial engagement

### Cost Calculator Features

1. **Vehicle Insurance Calculations**
   - Based on vehicle type and capacity
   - Special rates for different use cases
   - Tax calculations
   - Multi-year discounts

2. **Fee Tables**
   - Complete tables for all vehicle types
   - Printable format
   - Vietnamese regulation references

3. **Educational Content**
   - Insurance tutorials
   - Regulation explanations
   - Claim process guides

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex regulatory requirements | High | Regular updates, legal review |
| Data accuracy for insurance fees | High | Official sources, validation |
| Multiple insurance types complexity | Medium | Clear categorization, filtering |
| User education needs | Medium | Tutorial section, cost calculator |
| Partner link changes | Low | Regular link validation, fallback handling |

---

## Success Criteria

- [ ] All pages implemented with full functionality
- [ ] Vietnamese regulatory compliance
- [ ] Cost calculator accurate for Vietnamese market
- [ ] Responsive design works on all devices
- [ ] Page load time under 2 seconds
- [ ] 100% TypeScript coverage
- [ ] 80%+ test coverage
- [ ] Accessibility audit passes
- [ ] SEO score above 90
- [ ] User acceptance testing complete

---

## Timeline Estimate

**Total Estimated Time: 47 hours**

- Phase 1: 4h (Setup)
- Phase 2: 8h (Components)
- Phase 3: 6h (Listing Page)
- Phase 4: 5h (Detail Page)
- Phase 5: 7h (Comparison)
- Phase 6: 6h (Educational Content)
- Phase 7: 6h (Advanced Features)
- Phase 8: 5h (Testing)

**Recommended Sprint Distribution:**
- Sprint 1: Phases 1-2 (12h)
- Sprint 2: Phases 3-4 (11h)
- Sprint 3: Phases 5-6 (13h)
- Sprint 4: Phases 7-8 (11h)

---

## Migration Strategy

### From Old System

1. **Data Migration**
   - Convert existing insurance products to new structure
   - Preserve Vietnamese content and regulations
   - Enhance with additional metadata

2. **Feature Migration**
   - Maintain all existing functionality
   - Enhance with new filtering capabilities
   - Add comparison features

3. **Content Migration**
   - Preserve tutorial content
   - Update cost calculator with current regulations
   - Enhance fee tables with more detail

### Enhancements Over Old System

1. **Improved User Experience**
   - Better filtering and search
   - Comparison functionality
   - Mobile-responsive design

2. **Enhanced Features**
   - URL synchronization
   - Bookmark/favorites
   - Shareable comparisons
   - Advanced analytics

3. **Technical Improvements**
   - Modern React patterns
   - TypeScript safety
   - Performance optimizations
   - Better accessibility