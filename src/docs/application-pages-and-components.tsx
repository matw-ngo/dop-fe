/**
 * DOP-FE Application Pages and Components Documentation
 *
 * This file contains comprehensive documentation about the application's
 * page structure, component hierarchy, patterns, and navigation.
 */

import React from "react";

export const ApplicationPagesAndComponentsDocumentation = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">
        DOP-FE Application Pages and Components
      </h1>

      {/* Pages Structure Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Pages Structure</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">App Router Organization</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Root Layout</strong>: src/app/page.tsx hoạt động như
              client-side redirect, chuyển hướng người dùng đến locale phù hợp
              dựa trên ngôn ngữ trình duyệt
            </li>
            <li>
              <strong>Route Structure</strong>: Sử dụng Next.js App Router với
              dynamic segments [locale] cho internationalization
            </li>
            <li>
              <strong>Dynamic Routes</strong>: Các routes động như [flowId] cho
              admin flow management
            </li>
            <li>
              <strong>Layout Hierarchy</strong>: Layout lồng nhau với locale
              layout → admin layout → protected layout
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Internationalization Routes</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Locale Routing</strong>: Sử dụng [locale] dynamic segment
              với generateStaticParams() cho static generation
            </li>
            <li>
              <strong>Default Locale</strong>: "vi" là locale mặc định
            </li>
            <li>
              <strong>Locale Switching</strong>: Chuyển đổi locale thông qua
              navigation với getLocalizedPath()
            </li>
            <li>
              <strong>URL Structure</strong>: /[locale]/[page] pattern với
              locale prefix cho tất cả routes
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Key Application Pages</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Homepage</strong>: src/app/[locale]/page.tsx sử dụng
              Homepage component với config-based rendering
            </li>
            <li>
              <strong>User Onboarding</strong>:
              src/app/[locale]/user-onboarding/page.tsx với multi-step form
              system
            </li>
            <li>
              <strong>Admin Pages</strong>: src/app/[locale]/admin/(protected)/
              với sidebar navigation và protected routes
            </li>
            <li>
              <strong>Error Pages</strong>: src/app/not-found.tsx với
              internationalization support
            </li>
          </ul>
        </div>
      </section>

      {/* Component Hierarchy Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Component Hierarchy</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Atomic Design Structure</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Atoms</strong>: UI components cơ bản trong
              src/components/ui/ (Button, Input, etc.)
            </li>
            <li>
              <strong>Molecules</strong>: Component combinations trong
              src/components/molecules/ và src/components/wrappers/
            </li>
            <li>
              <strong>Organisms</strong>: Complex component sections trong
              src/components/organisms/ và src/components/features/
            </li>
            <li>
              <strong>Templates</strong>: Page templates trong src/app/ với
              layout components
            </li>
            <li>
              <strong>Pages</strong>: Final page compositions với data-driven
              rendering
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">UI Components (shadcn/ui)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Base Components</strong>: Button, Input, Card, Dialog với
              Radix UI foundation
            </li>
            <li>
              <strong>Form Components</strong>: Form, FormField, FormControl với
              react-hook-form integration
            </li>
            <li>
              <strong>Navigation Components</strong>: Sidebar, Breadcrumb,
              NavigationMenu với responsive design
            </li>
            <li>
              <strong>Feedback Components</strong>: Alert, Toast, Skeleton với
              loading states
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Feature Components</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Onboarding Components</strong>: MultiStepFormRenderer,
              FieldRenderer với data-driven UI
            </li>
            <li>
              <strong>Admin Components</strong>: DataTable, FlowManagement với
              CRUD operations
            </li>
            <li>
              <strong>eKYC Components</strong>: CustomEkyc, EkycSdkWrapper với
              third-party integration
            </li>
            <li>
              <strong>Homepage Components</strong>: OnboardingCard, Hero,
              Features với marketing focus
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Custom Wrappers</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Form Wrappers</strong>: CustomSelect, CustomDatePicker với
              enhanced functionality
            </li>
            <li>
              <strong>Input Wrappers</strong>: CustomInputOTP, CustomRadioGroup
              với validation
            </li>
            <li>
              <strong>Confirmation Wrappers</strong>: CustomConfirmation với
              success handling
            </li>
            <li>
              <strong>Integration Wrappers</strong>: CustomEkyc với third-party
              SDK integration
            </li>
          </ul>
        </div>
      </section>

      {/* Component Patterns Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Component Patterns</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Composition Patterns</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Component Composition</strong>: Sử dụng compound component
              pattern trong Form, Sidebar
            </li>
            <li>
              <strong>Prop Passing</strong>: Controlled components với
              value/onChange pattern
            </li>
            <li>
              <strong>Children Prop Usage</strong>: Flexible composition với
              children và render props
            </li>
            <li>
              <strong>Render Props</strong>: Dynamic rendering trong
              FieldRenderer và DataTable
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">State Management Patterns</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Local State</strong>: useState và useReducer cho
              component-specific state
            </li>
            <li>
              <strong>Global State</strong>: Zustand stores cho application
              state
            </li>
            <li>
              <strong>State Lifting</strong>: Context providers cho theme và
              auth state
            </li>
            <li>
              <strong>Custom Hooks</strong>: Reusable logic trong hooks/
              directory
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Data Flow Patterns</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Props vs Context</strong>: Props cho component
              communication, Context cho global state
            </li>
            <li>
              <strong>Event Handling</strong>: Consistent event patterns với
              proper typing
            </li>
            <li>
              <strong>Data Fetching</strong>: React Query cho server state
              management
            </li>
            <li>
              <strong>Error Boundaries</strong>: Error handling với
              AdminErrorBoundary
            </li>
          </ul>
        </div>
      </section>

      {/* Navigation Structure Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Navigation Structure</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Desktop Navigation</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Header Navigation</strong>: Config-based navigation với
              dropdown support
            </li>
            <li>
              <strong>Sidebar Navigation</strong>: Collapsible sidebar với
              keyboard shortcuts
            </li>
            <li>
              <strong>Breadcrumb Navigation</strong>: Hierarchical navigation
              trong admin section
            </li>
            <li>
              <strong>Footer Navigation</strong>: Company-specific footer
              configuration
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Mobile Navigation</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Mobile Header</strong>: Responsive header với hamburger
              menu
            </li>
            <li>
              <strong>Hamburger Menu</strong>: Slide-out navigation cho mobile
              devices
            </li>
            <li>
              <strong>Tab Navigation</strong>: Bottom navigation cho mobile
              flows
            </li>
            <li>
              <strong>Gesture Navigation</strong>: Touch-friendly interactions
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Routing Logic</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Route Protection</strong>: ProtectedRoute component với
              auth checking
            </li>
            <li>
              <strong>Route Guards</strong>: Layout-based protection với
              (protected) groups
            </li>
            <li>
              <strong>Redirect Logic</strong>: Locale-aware redirects với
              getLocalizedRedirect()
            </li>
            <li>
              <strong>Route Transitions</strong>: Smooth transitions với loading
              states
            </li>
          </ul>
        </div>
      </section>

      {/* Component Libraries Integration Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Component Libraries Integration
        </h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">shadcn/ui Usage</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Component Selection</strong>: Core components từ shadcn/ui
              với customization
            </li>
            <li>
              <strong>Customization</strong>: Tailwind CSS classes với design
              tokens
            </li>
            <li>
              <strong>Theme Integration</strong>: CSS variables với dark/light
              mode support
            </li>
            <li>
              <strong>Accessibility</strong>: ARIA attributes và keyboard
              navigation
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Custom Component Extensions</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Extended Components</strong>: Wrapper components extending
              shadcn/ui
            </li>
            <li>
              <strong>Variant System</strong>: CVA (class-variance-authority)
              cho component variants
            </li>
            <li>
              <strong>Size Variations</strong>: Responsive size props với
              consistent scaling
            </li>
            <li>
              <strong>Style Overrides</strong>: Tailwind utility classes với
              design system
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Styling Patterns</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>CSS-in-JS</strong>: Limited usage với Tailwind preference
            </li>
            <li>
              <strong>Utility Classes</strong>: Tailwind utility-first approach
            </li>
            <li>
              <strong>Component Styles</strong>: Component-specific styling với
              cn() utility
            </li>
            <li>
              <strong>Responsive Design</strong>: Mobile-first responsive
              breakpoints
            </li>
          </ul>
        </div>
      </section>

      {/* Component Accessibility Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Component Accessibility</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">ARIA Implementation</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>ARIA Labels</strong>: Proper aria-label và aria-labelledby
              usage
            </li>
            <li>
              <strong>Screen Reader Support</strong>: Semantic HTML với proper
              landmarks
            </li>
            <li>
              <strong>Keyboard Navigation</strong>: Tab order và keyboard
              shortcuts
            </li>
            <li>
              <strong>Focus Management</strong>: Focus trapping trong modals và
              proper focus indicators
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Accessibility Testing</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Automated Testing</strong>: ESLint rules cho accessibility
            </li>
            <li>
              <strong>Manual Testing</strong>: Keyboard navigation testing
            </li>
            <li>
              <strong>Accessibility Tools</strong>: Screen reader testing
            </li>
            <li>
              <strong>Compliance Level</strong>: WCAG 2.1 AA compliance target
            </li>
          </ul>
        </div>
      </section>

      {/* Key Observations Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Key Observations</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">
            Component Architecture Strengths
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Data-driven UI system với ComponentRegistry cho dynamic rendering
            </li>
            <li>Consistent design system với shadcn/ui foundation</li>
            <li>Strong TypeScript integration với proper typing</li>
            <li>Comprehensive internationalization support</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Reusable Patterns Identified</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Compound component pattern trong form và navigation components
            </li>
            <li>Wrapper pattern cho third-party integrations</li>
            <li>Config-driven rendering cho theme và navigation</li>
            <li>Error boundary pattern cho graceful error handling</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Potential Improvements</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Enhanced component documentation với Storybook integration</li>
            <li>Automated accessibility testing integration</li>
            <li>Performance optimization với lazy loading</li>
            <li>Component testing với Jest và React Testing Library</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Component Documentation Needs</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>API documentation cho custom components</li>
            <li>Usage examples cho complex patterns</li>
            <li>Design system guidelines</li>
            <li>Component lifecycle documentation</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">Performance Considerations</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Code splitting với dynamic imports</li>
            <li>Image optimization với Next.js Image component</li>
            <li>Bundle optimization với tree shaking</li>
            <li>Render optimization với React.memo và useMemo</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ApplicationPagesAndComponentsDocumentation;
