# Application Pages and Components Migration

## Table of Contents
- [Overview](#overview)
- [I. Pages Migration](#i-pages-migration)
  - [1. Mapping Analysis](#1-mapping-analysis)
  - [2. Old Project Pages](#2-old-project-pages)
  - [3. New Project Pages Structure](#3-new-project-pages-structure)
  - [4. Pages Migration Table](#4-pages-migration-table)
- [II. Components Migration](#ii-components-migration)
  - [1. Component Categories](#1-component-categories)
  - [2. Old Project Components](#2-old-project-components)
  - [3. New Project Components Structure](#3-new-project-components-structure)
  - [4. Components Migration Table](#4-components-migration-table)
- [III. Migration Gaps and Conflicts](#iii-migration-gaps-and-conflicts)
  - [1. UI Migration Gaps](#1-ui-migration-gaps)
  - [2. Routing Conflicts](#2-routing-conflicts)
  - [3. Styling Conflicts](#3-styling-conflicts)
  - [4. State Management Conflicts](#4-state-management-conflicts)
- [IV. Migration Strategy](#iv-migration-strategy)
  - [1. Pages Migration Strategy](#1-pages-migration-strategy)
  - [2. Components Migration Strategy](#2-components-migration-strategy)
  - [3. Gap Resolution Strategy](#3-gap-resolution-strategy)
- [V. Implementation Examples](#v-implementation-examples)
  - [1. Page Migration Example](#1-page-migration-example)
  - [2. Component Migration Example](#2-component-migration-example)
- [VI. Cross-references](#vi-cross-references)

## Overview

This document provides a comprehensive migration guide for application pages and components from the old Finzone Frontend project to the new DOP-FE project. It includes detailed mapping analysis, identification of gaps and conflicts, and implementation strategies for successful migration.

The migration focuses on:
- Converting from Next.js Pages Router to App Router with internationalization
- Transitioning from SCSS/Bulma/Mantine to shadcn/ui with Tailwind CSS 4
- Adapting component architecture to the new data-driven UI system
- Integrating eKYC functionality and flow-based architecture

## I. Pages Migration

### 1. Mapping Analysis

Based on the [content mapping matrix](../final-project/content-mapping-matrix.md), the following key observations were made:

- **Fully Mapped**: Home Page, Navigation Components, Form Components, Display Components
- **Gap Identified**: Credit Cards Pages, Loan Pages, Insurance Pages, Tools Pages
- **Conflict Identified**: Routing system (Pages Router vs App Router), Styling approach (SCSS vs Tailwind)

### 2. Old Project Pages

| Old Path | File | Description | Main Components | Style File |
|----------|------|-------------|------------------|-------------|
| `/` | [`app/page.tsx`](../old-project/code/application_pages_and_components.md:50) | Main page providing overview of Finzone services | Hero section, TabDisplay, Blog section, Community section | [`app/Home.module.scss`](../old-project/code/application_pages_and_components.md:57) |
| `/the-tin-dung` | [`app/the-tin-dung/page.tsx`](../old-project/code/application_pages_and_components.md:60) | Page displaying all available credit cards | SearchBar, CardList with pagination, CardTutorial | [`app/the-tin-dung/card-list.module.scss`](../old-project/code/application_pages_and_components.md:66) |
| `/the-tin-dung/chi-tiet` | [`app/the-tin-dung/chi-tiet/page.tsx`](../old-project/code/application_pages_and_components.md:69) | Detailed view of a specific credit card | CardDetail, Review section, Suggestion section | [`app/the-tin-dung/chi-tiet/card-detail.module.scss`](../old-project/code/application_pages_and_components.md:75) |
| `/the-tin-dung/so-sanh` | [`app/the-tin-dung/so-sanh/page.tsx`](../old-project/code/application_pages_and_components.md:78) | Page for comparing multiple credit cards | Compare component, ComparingPanel | [`app/the-tin-dung/so-sanh/card-comparing.module.scss`](../old-project/code/application_pages_and_components.md:83) |
| `/the-tin-dung/chuyen-tiep` | [`app/the-tin-dung/chuyen-tiep/page.tsx`](../old-project/code/application_pages_and_components.md:86) | Redirect page for credit card applications | Redirect component | [`app/the-tin-dung/chuyen-tiep/card-redirect.module.scss`](../old-project/code/application_pages_and_components.md:90) |
| `/vay-tieu-dung` | [`app/vay-tieu-dung/page.tsx`](../old-project/code/application_pages_and_components.md:93) | Main page for consumer loan information | LoanModule, ApplyLoanForm | [`app/vay-tieu-dung/loan-page.module.scss`](../old-project/code/application_pages_and_components.md:98) |
| `/tim-kiem-vay` | [`app/tim-kiem-vay/page.tsx`](../old-project/code/application_pages_and_components.md:101) | Page for finding suitable loan products | LoanFinding component | [`app/tim-kiem-vay/loan-finding.module.scss`](../old-project/code/application_pages_and_components.md:105) |
| `/thong-tin-vay` | [`app/thong-tin-vay/page.tsx`](../old-project/code/application_pages_and_components.md:108) | Page for providing additional loan information | LoanExtraInfoForm | [`app/thong-tin-vay/loan-info.module.scss`](../old-project/code/application_pages_and_components.md:112) |
| `/ket-qua-vay` | [`app/ket-qua-vay/page.tsx`](../old-project/code/application_pages_and_components.md:115) | Page displaying loan application results | LoanResult, LoanListBox, LoanSuccessBox | [`app/ket-qua-vay/loan-result.module.scss`](../old-project/code/application_pages_and_components.md:121) |
| `/bao-hiem` | [`app/bao-hiem/page.tsx`](../old-project/code/application_pages_and_components.md:124) | Page displaying available insurance products | InsuranceModule, InsuranceList | [`app/bao-hiem/insurance.module.scss`](../old-project/code/application_pages_and_components.md:129) |
| `/bao-hiem-xe` | [`app/bao-hiem-xe/page.tsx`](../old-project/code/application_pages_and_components.md:132) | Page specifically for car insurance products | InsuranceModule with car insurance focus | [`app/bao-hiem-xe/bao-hiem.module.scss`](../old-project/code/application_pages_and_components.md:136) |
| `/cong-cu` | [`app/cong-cu/error.tsx`](../old-project/code/application_pages_and_components.md:139) | Main page for financial tools | Error component (placeholder) | [`app/cong-cu/error.module.scss`](../old-project/code/application_pages_and_components.md:143) |
| `/cong-cu/tinh-lai-tien-gui` | [`app/cong-cu/tinh-lai-tien-gui/page.tsx`](../old-project/code/application_pages_and_components.md:146) | Tool for calculating savings interest rates | InterestRate tool, IRBanner, IRContent | [`app/cong-cu/tinh-lai-tien-gui/style.module.scss`](../old-project/code/application_pages_and_components.md:152) |
| `/cong-cu/tinh-luong-gross-net` | [`app/cong-cu/tinh-luong-gross-net/page.tsx`](../old-project/code/application_pages_and_components.md:155) | Tool for converting between gross and net salary | SalaryConversion tool, SalaryBanner, SalaryContent | [`app/cong-cu/tinh-luong-gross-net/style.module.scss`](../old-project/code/application_pages_and_components.md:161) |
| `/cong-cu/tinh-toan-khoan-vay` | [`app/cong-cu/tinh-toan-khoan-vay/page.tsx`](../old-project/code/application_pages_and_components.md:164) | Tool for calculating loan installments | Loan calculator tool | [`app/cong-cu/tinh-toan-khoan-vay/style.module.scss`](../old-project/code/application_pages_and_components.md:168) |
| `/blog` | [`app/blog/page.tsx`](../old-project/code/application_pages_and_components.md:171) | Main blog page with article listings | Blog listing, Blog carousel | [`app/blog/style.module.scss`](../old-project/code/application_pages_and_components.md:176) |
| `/blog/[id]` | [`app/blog/[id]/page.tsx`](../old-project/code/application_pages_and_components.md:179) | Detailed view of a specific blog article | Blog article content | [`app/blog/[id]/style.module.scss`](../old-project/code/application_pages_and_components.md:183) |
| `/gioi-thieu` | [`app/gioi-thieu/page.tsx`](../old-project/code/application_pages_and_components.md:186) | Information about Finzone company | Company information | [`app/gioi-thieu/style.module.scss`](../old-project/code/application_pages_and_components.md:190) |
| `/lien-he` | [`app/lien-he/page.tsx`](../old-project/code/application_pages_and_components.md:193) | Contact information and form | Contact form, Contact information | [`app/lien-he/style.module.scss`](../old-project/code/application_pages_and_components.md:198) |
| `/dieu-khoan-su-dung` | [`app/dieu-khoan-su-dung/page.tsx`](../old-project/code/application_pages_and_components.md:201) | Terms of use and legal information | Terms content | [`app/dieu-khoan-su-dung/tc.module.scss`](../old-project/code/application_pages_and_components.md:205) |

### 3. New Project Pages Structure

| New Path | File | Description | Main Components | Implementation Notes |
|-----------|------|-------------|------------------|---------------------|
| `/[locale]/` | [`src/app/[locale]/page.tsx`](../../src/app/[locale]/page.tsx:8) | Homepage with internationalization | Homepage component with config-based rendering | Uses `getHomepageConfig(company)` for configuration |
| `/[locale]/user-onboarding` | `src/app/[locale]/user-onboarding/page.tsx` | Multi-step onboarding flow | MultiStepFormRenderer, FieldRenderer | Data-driven UI with form validation |
| `/[locale]/admin/(protected)` | `src/app/[locale]/admin/(protected)/` | Admin dashboard with protected routes | Admin components, DataTable, FlowManagement | Layout-based protection with (protected) groups |
| `/[locale]/admin/flows/[flowId]` | `src/app/[locale]/admin/flows/[flowId]/page.tsx` | Dynamic flow management page | Flow editor, form builder | Dynamic routing with [flowId] parameter |
| `/[locale]/onboarding-success` | `src/app/[locale]/onboarding-success/page.tsx` | Success page after onboarding | Success components, confirmation | Redirect target after form completion |
| `/[locale]/credit-cards` | `src/app/[locale]/credit-cards/page.tsx` | Credit cards listing (new) | CardList, SearchBar, Filters | Flow-based implementation |
| `/[locale]/credit-cards/[id]` | `src/app/[locale]/credit-cards/[id]/page.tsx` | Credit card detail (new) | CardDetail, Reviews, Suggestions | Dynamic routing with [id] parameter |
| `/[locale]/credit-cards/compare` | `src/app/[locale]/credit-cards/compare/page.tsx` | Credit card comparison (new) | ComparisonTable, CardComparison | Multi-card comparison functionality |
| `/[locale]/loans` | `src/app/[locale]/loans/page.tsx` | Loans listing (new) | LoanList, Calculator, Filters | With eKYC integration |
| `/[locale]/loans/apply` | `src/app/[locale]/loans/apply/page.tsx` | Loan application (new) | MultiStepFormRenderer, CustomEkyc | Flow-based application with eKYC |
| `/[locale]/loans/results` | `src/app/[locale]/loans/results/page.tsx` | Loan results (new) | LoanResults, Recommendations | Results display with options |
| `/[locale]/insurance` | `src/app/[locale]/insurance/page.tsx` | Insurance listing (new) | InsuranceList, Filters, Categories | Product catalog with filtering |
| `/[locale]/insurance/[id]` | `src/app/[locale]/insurance/[id]/page.tsx` | Insurance detail (new) | InsuranceDetail, Benefits, Apply | Detailed product information |
| `/[locale]/tools` | `src/app/[locale]/tools/page.tsx` | Financial tools index (new) | ToolGrid, Navigation | Tool selection interface |
| `/[locale]/tools/calculators` | `src/app/[locale]/tools/calculators/page.tsx` | Calculator tools (new) | InterestCalculator, LoanCalculator, SalaryConverter | Multiple calculator tools |
| `/[locale]/blog` | `src/app/[locale]/blog/page.tsx` | Blog listing (new) | BlogGrid, Pagination, Filters | Enhanced blog interface |
| `/[locale]/blog/[slug]` | `src/app/[locale]/blog/[slug]/page.tsx` | Blog article (new) | ArticleContent, RelatedPosts, Comments | Enhanced article reading experience |
| `/[locale]/about` | `src/app/[locale]/about/page.tsx` | About page (new) | CompanyInfo, Team, Mission | Enhanced company information |
| `/[locale]/contact` | `src/app/[locale]/contact/page.tsx` | Contact page (new) | ContactForm, ContactInfo, Map | Enhanced contact interface |
| `/[locale]/terms` | `src/app/[locale]/terms/page.tsx` | Terms of use (new) | TermsContent, TableOfContents | Enhanced terms interface |

### 4. Pages Migration Table

| Old Page | New Page | Migration Status | Implementation Notes | Gaps/Conflicts |
|----------|-----------|-----------------|---------------------|------------------|
| `/` | `/[locale]/` | ✅ Fully Mapped | Homepage with internationalization support | None |
| `/the-tin-dung` | `/[locale]/credit-cards` | 🔄 Partially Mapped | New flow-based implementation needed | Need flow integration |
| `/the-tin-dung/chi-tiet` | `/[locale]/credit-cards/[id]` | 🔄 Partially Mapped | Dynamic routing with enhanced features | Need data migration |
| `/the-tin-dung/so-sanh` | `/[locale]/credit-cards/compare` | 🔄 Partially Mapped | Enhanced comparison functionality | Need state management update |
| `/the-tin-dung/chuyen-tiep` | `/[locale]/credit-cards/apply` | 🔄 Partially Mapped | Integrated with flow system | Need eKYC integration |
| `/vay-tieu-dung` | `/[locale]/loans` | 🔄 Partially Mapped | Flow-based with eKYC integration | Need complete rewrite |
| `/tim-kiem-vay` | `/[locale]/loans` | 🔄 Partially Mapped | Integrated into loans page | Feature consolidation |
| `/thong-tin-vay` | `/[locale]/loans/apply` | 🔄 Partially Mapped | Integrated into application flow | Multi-step form integration |
| `/ket-qua-vay` | `/[locale]/loans/results` | 🔄 Partially Mapped | Enhanced results with recommendations | Need data mapping |
| `/bao-hiem` | `/[locale]/insurance` | 🔄 Partially Mapped | Enhanced product catalog | Need data migration |
| `/bao-hiem-xe` | `/[locale]/insurance/[id]` | 🔄 Partially Mapped | Integrated into insurance detail | Category filtering needed |
| `/cong-cu` | `/[locale]/tools` | 🔄 Partially Mapped | Enhanced tools interface | Need complete rewrite |
| `/cong-cu/tinh-lai-tien-gui` | `/[locale]/tools/calculators` | 🔄 Partially Mapped | Integrated into calculators page | Component migration needed |
| `/cong-cu/tinh-luong-gross-net` | `/[locale]/tools/calculators` | 🔄 Partially Mapped | Integrated into calculators page | Component migration needed |
| `/cong-cu/tinh-toan-khoan-vay` | `/[locale]/tools/calculators` | 🔄 Partially Mapped | Integrated into calculators page | Component migration needed |
| `/blog` | `/[locale]/blog` | 🔄 Partially Mapped | Enhanced blog interface | Component migration needed |
| `/blog/[id]` | `/[locale]/blog/[slug]` | 🔄 Partially Mapped | Enhanced article experience | Data migration needed |
| `/gioi-thieu` | `/[locale]/about` | 🔄 Partially Mapped | Enhanced company information | Content migration needed |
| `/lien-he` | `/[locale]/contact` | 🔄 Partially Mapped | Enhanced contact interface | Form migration needed |
| `/dieu-khoan-su-dung` | `/[locale]/terms` | 🔄 Partially Mapped | Enhanced terms interface | Content migration needed |

## II. Components Migration

### 1. Component Categories

#### Navigation Components
- **Old**: NavBar, Breadcrumb
- **New**: Header, Sidebar, Breadcrumb, NavigationMenu
- **Migration Status**: ✅ Fully Mapped with enhancements

#### Form Components
- **Old**: TextInput, SelectBox, Slider, TextAreaGroup, TextInputGroup
- **New**: Form components from shadcn/ui with react-hook-form integration
- **Migration Status**: 🔄 Partially Mapped - needs complete rewrite

#### Display Components
- **Old**: Card, Carousel, StarRating, ResponsiveImage
- **New**: Card, Carousel from shadcn/ui with enhancements
- **Migration Status**: 🔄 Partially Mapped - needs styling updates

#### Feedback Components
- **Old**: Button, Modal, Loading, Spinner, ErrorComponent
- **New**: Enhanced components from shadcn/ui
- **Migration Status**: 🔄 Partially Mapped - needs API updates

#### Layout Components
- **Old**: Footer, TabDisplay, BorderTab, CountdownTimer
- **New**: Enhanced layout components with theme support
- **Migration Status**: 🔄 Partially Mapped - needs theme integration

### 2. Old Project Components

#### Navigation Components
| Component | File | Description | Features | Style File |
|-----------|------|-------------|-----------|-------------|
| NavBar | [`components/NavBar/index.js`](../old-project/code/application_pages_and_components.md:212) | Main navigation component | Responsive design, active route highlighting, dropdown menus | [`components/NavBar/NavBar.module.scss`](../old-project/code/application_pages_and_components.md:218) |
| Breadcrumb | [`components/Breadcrumb/breadcrumb.tsx`](../old-project/code/application_pages_and_components.md:221) | Breadcrumb navigation | Dynamic generation, clickable links, event tracking | [`components/Breadcrumb/style.module.scss`](../old-project/code/application_pages_and_components.md:227) |

#### Form Components
| Component | File | Description | Features | Style File |
|-----------|------|-------------|-----------|-------------|
| TextInput | [`components/TextInput/text-input.tsx`](../old-project/code/application_pages_and_components.md:232) | Standard text input | Validation support, custom styling, error messages | [`components/TextInput/style.module.scss`](../old-project/code/application_pages_and_components.md:238) |
| SelectBox | [`components/SelectBox/select-box.tsx`](../old-project/code/application_pages_and_components.md:249) | Dropdown selection | Custom styling, search functionality, multiple selection | [`components/SelectBox/style.module.scss`](../old-project/code/application_pages_and_components.md:255) |
| Slider | [`components/Slider/index.tsx`](../old-project/code/application_pages_and_components.md:275) | Range slider | Custom range values, step control, visual feedback | [`components/Slider/style.module.scss`](../old-project/code/application_pages_and_components.md:281) |

#### Display Components
| Component | File | Description | Features | Style File |
|-----------|------|-------------|-----------|-------------|
| Card | [`components/Card/index.tsx`](../old-project/code/application_pages_and_components.md:286) | Reusable card component | Customizable content, hover effects, responsive design | N/A |
| Carousel | [`components/Carousel/carousel.tsx`](../old-project/code/application_pages_and_components.md:294) | Image/content carousel | Auto-play, custom navigation, touch/swipe support | [`components/Carousel/styles.module.scss`](../old-project/code/application_pages_and_components.md:300) |
| StarRating | [`components/StarRating/index.tsx`](../old-project/code/application_pages_and_components.md:306) | Star rating display | Read-only/interactive modes, custom star count, half-star support | [`components/StarRating/style.module.scss`](../old-project/code/application_pages_and_components.md:312) |

### 3. New Project Components Structure

#### UI Components (shadcn/ui)
| Component | File | Description | Features | Implementation Notes |
|-----------|------|-------------|-----------|---------------------|
| Button | [`src/components/ui/button.tsx`](../../src/components/ui/button.tsx:39) | Enhanced button component | Multiple variants, sizes, asChild support | Uses CVA for variant management |
| Card | [`src/components/ui/card.tsx`](../../src/components/ui/card.tsx:5) | Enhanced card component | Header, content, footer, action sections | Data-slot attributes for styling |
| Form | [`src/components/ui/form.tsx`](../../src/components/ui/form.tsx) | Form components with react-hook-form | FormField, FormControl, FormLabel, FormMessage | Integrated with Zod validation |
| Input | [`src/components/ui/input.tsx`](../../src/components/ui/input.tsx) | Enhanced input component | Multiple types, error states, validation | Consistent with other form components |

#### Feature Components
| Component | File | Description | Features | Implementation Notes |
|-----------|------|-------------|-----------|---------------------|
| FormRenderer | [`src/components/renderer/FormRenderer.tsx`](../../src/components/renderer/FormRenderer.tsx:52) | Data-driven form rendering | Dynamic field rendering, validation, async options | Core of data-driven UI system |
| MultiStepFormRenderer | [`src/components/renderer/MultiStepFormRenderer.tsx`](../../src/components/renderer/MultiStepFormRenderer.tsx:30) | Multi-step form system | Progress tracking, navigation, persistence | Enhanced user experience |
| CustomEkyc | [`src/components/wrappers/CustomEkyc.tsx`](../../src/components/wrappers/CustomEkyc.tsx:81) | eKYC integration wrapper | VNPT SDK integration, inline/modal modes | New eKYC functionality |

#### Homepage Components
| Component | File | Description | Features | Implementation Notes |
|-----------|------|-------------|-----------|---------------------|
| Hero | [`src/components/organisms/homepage/hero.tsx`](../../src/components/organisms/homepage/hero.tsx:11) | Homepage hero section | Config-based rendering, decorative icons | Enhanced with internationalization |
| Features | `src/components/organisms/homepage/features.tsx` | Features showcase | Grid layout, responsive design | shadcn/ui integration |
| Blog | `src/components/organisms/homepage/blog.tsx` | Blog section | Carousel, article cards | Enhanced with animations |

### 4. Components Migration Table

| Old Component | New Component | Migration Status | Implementation Notes | Gaps/Conflicts |
|----------------|----------------|-----------------|---------------------|------------------|
| NavBar | Header + Sidebar | 🔄 Partially Mapped | Split into responsive components | Need responsive behavior |
| Breadcrumb | Breadcrumb | ✅ Fully Mapped | Enhanced with shadcn/ui | None |
| TextInput | Input | ✅ Fully Mapped | Enhanced with validation | None |
| SelectBox | Select | ✅ Fully Mapped | Enhanced with search functionality | None |
| Slider | Slider | ✅ Fully Mapped | Enhanced with styling options | None |
| Card | Card | ✅ Fully Mapped | Enhanced with sections | None |
| Carousel | Carousel | ✅ Fully Mapped | Enhanced with touch support | None |
| StarRating | Rating | 🔄 Partially Mapped | New component implementation | Need feature parity |
| Button | Button | ✅ Fully Mapped | Enhanced with variants | None |
| Modal | Dialog | ✅ Fully Mapped | Enhanced with accessibility | None |
| Loading | Skeleton | ✅ Fully Mapped | Enhanced loading states | None |
| ErrorComponent | Alert | ✅ Fully Mapped | Enhanced error display | None |
| Footer | Footer | 🔄 Partially Mapped | Enhanced with theme support | Need content migration |
| TabDisplay | Tabs | ✅ Fully Mapped | Enhanced with animations | None |
| CustomEkyc | CustomEkyc | ➕ New Component | VNPT eKYC integration | New functionality |

## III. Migration Gaps and Conflicts

### 1. UI Migration Gaps

#### Styling System Migration
- **Gap**: SCSS modules to Tailwind CSS 4 migration
- **Impact**: All component styles need conversion
- **Resolution Strategy**: 
  - Use Tailwind utility classes for common patterns
  - Create custom components for complex styles
  - Implement CSS variables for theming

#### Component Library Migration
- **Gap**: Bulma/Mantine to shadcn/ui migration
- **Impact**: Component API changes, styling differences
- **Resolution Strategy**:
  - Map old components to shadcn/ui equivalents
  - Create wrapper components for missing functionality
  - Implement custom components for unique features

### 2. Routing Conflicts

#### Pages Router vs App Router
- **Conflict**: Next.js 13 Pages Router to App Router migration
- **Impact**: Route structure changes, data fetching patterns
- **Resolution Strategy**:
  - Convert file-based routing to App Router structure
  - Implement Server Components where appropriate
  - Update data fetching to use new patterns

#### Internationalization Integration
- **Conflict**: Adding i18n to existing routes
- **Impact**: URL structure changes, locale handling
- **Resolution Strategy**:
  - Implement [locale] dynamic segments
  - Use generateStaticParams for static generation
  - Update navigation to handle locale prefixes

### 3. Styling Conflicts

#### CSS-in-JS vs Utility-First
- **Conflict**: SCSS modules to Tailwind utility classes
- **Impact**: Component styling approach changes
- **Resolution Strategy**:
  - Use Tailwind utilities for 80% of styles
  - Create custom components for complex patterns
  - Implement CSS variables for dynamic styles

#### Responsive Design Patterns
- **Conflict**: Bulma responsive classes to Tailwind breakpoints
- **Impact**: Responsive behavior changes
- **Resolution Strategy**:
  - Map Bulma breakpoints to Tailwind
  - Update responsive components
  - Test across all device sizes

### 4. State Management Conflicts

#### Zustand vs React Query
- **Conflict**: Client state vs server state management
- **Impact**: Data fetching patterns, caching strategies
- **Resolution Strategy**:
  - Use Zustand for UI state
  - Use React Query for server state
  - Implement proper data synchronization

#### Form State Management
- **Conflict**: Custom form state to react-hook-form
- **Impact**: Form validation, submission patterns
- **Resolution Strategy**:
  - Implement react-hook-form with Zod validation
  - Create custom hooks for complex form logic
  - Migrate existing form patterns

## IV. Migration Strategy

### 1. Pages Migration Strategy

#### Phase 1: Core Pages
1. **Homepage Migration**
   - Convert to App Router with internationalization
   - Implement config-based rendering
   - Add theme support

2. **Layout Migration**
   - Create locale-aware layouts
   - Implement responsive navigation
   - Add theme switching

#### Phase 2: Business Pages
1. **Credit Cards Pages**
   - Implement flow-based architecture
   - Add eKYC integration
   - Create comparison functionality

2. **Loan Pages**
   - Implement multi-step application
   - Add eKYC verification
   - Create results display

3. **Insurance Pages**
   - Implement product catalog
   - Add filtering and search
   - Create detail pages

#### Phase 3: Supporting Pages
1. **Tools Pages**
   - Implement calculator tools
   - Add interactive features
   - Create unified interface

2. **Content Pages**
   - Migrate blog functionality
   - Implement enhanced contact forms
   - Create about and terms pages

### 2. Components Migration Strategy

#### Phase 1: Foundation Components
1. **UI Components**
   - Implement shadcn/ui components
   - Create custom variants
   - Add theme support

2. **Form Components**
   - Implement react-hook-form integration
   - Add Zod validation
   - Create custom field components

#### Phase 2: Feature Components
1. **Data-Driven UI**
   - Implement FormRenderer
   - Create FieldRenderer
   - Add conditional rendering

2. **eKYC Integration**
   - Implement CustomEkyc wrapper
   - Add VNPT SDK integration
   - Create error handling

#### Phase 3: Enhancement Components
1. **Homepage Components**
   - Implement enhanced hero section
   - Create feature showcases
   - Add interactive elements

2. **Admin Components**
   - Implement flow management
   - Create data tables
   - Add CRUD operations

### 3. Gap Resolution Strategy

#### UI Migration Resolution
1. **Styling System**
   - Create Tailwind component library
   - Implement CSS variables for theming
   - Add responsive utilities

2. **Component Library**
   - Map old components to new equivalents
   - Create wrapper components
   - Implement missing functionality

#### Routing Resolution
1. **Route Structure**
   - Implement App Router patterns
   - Add internationalization
   - Create dynamic routes

2. **Data Fetching**
   - Implement Server Components
   - Add caching strategies
   - Create error boundaries

## V. Implementation Examples

### 1. Page Migration Example

#### Old Credit Card List Page
```typescript
// app/the-tin-dung/page.tsx (Old)
import { CardList } from '../../../modules/CreditCard/List';
import { SearchBar } from '../../../modules/CreditCard/SearchBar';

export default function CreditCardsPage() {
  return (
    <div className="credit-cards-page">
      <SearchBar />
      <CardList />
    </div>
  );
}
```

#### New Credit Card List Page
```typescript
// src/app/[locale]/credit-cards/page.tsx (New)
import { CardList } from '@/components/features/credit-cards';
import { SearchFilters } from '@/components/features/credit-cards';
import { getCreditCardsConfig } from '@/configs/credit-cards-config';

export default function CreditCardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const config = getCreditCardsConfig(locale);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Credit Cards</h1>
      <SearchFilters config={config.filters} />
      <CardList config={config.list} />
    </div>
  );
}
```

### 2. Component Migration Example

#### Old TextInput Component
```typescript
// components/TextInput/text-input.tsx (Old)
import React from 'react';
import styles from './style.module.scss';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  error
}) => {
  return (
    <div className={styles.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ''}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
```

#### New Input Component
```typescript
// src/components/ui/input.tsx (New)
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

## VI. Cross-references

### Related Documentation
- [Business Flows and Processes](business-flows-and-processes.md) - Flow-based architecture implementation
- [Data Models and Structures](../final-project/data-models-and-structures.md) - Type definitions and schemas
- [Configuration and Environment Setup](../final-project/configuration-and-environment-setup.md) - Environment configuration
- [Dependencies and Integrations](../final-project/dependencies-and-integrations.md) - Library dependencies
- [Security Best Practices](../final-project/security-best-practices.md) - Security implementation details

### Implementation Resources
- [Content Mapping Matrix](../final-project/content-mapping-matrix.md) - Complete mapping analysis
- [Project Architecture Overview](../new-project/project-architecture-overview.md) - New architecture details
- [Application Replication Guide](../new-project/application-replication-guide.md) - Setup and deployment guide

### Component References
- [shadcn/ui Documentation](https://ui.shadcn.com/) - Component library documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework documentation
- [React Hook Form Documentation](https://react-hook-form.com/) - Form library documentation
- [Zod Documentation](https://zod.dev/) - Validation library documentation