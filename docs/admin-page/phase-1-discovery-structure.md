# Admin Page - Phase 1: Discovery & Structure

## Overview

This document captures the discovery phase of the admin page functionality in the Dop FE codebase. The admin system is built with Next.js 13+ App Router, TypeScript, and follows modern React patterns.

## File Inventory

### Core Admin Pages (App Router Structure)

| File | Description |
|------|-------------|
| `/src/app/[locale]/admin/layout.tsx` | Main admin layout with sidebar navigation |
| `/src/app/[locale]/admin/(protected)/layout.tsx` | Protected route wrapper for admin pages |
| `/src/app/[locale]/admin/(protected)/page.tsx` | Admin dashboard/home page |
| `/src/app/[locale]/admin/(protected)/flows/page.tsx` | Flow management listing page |
| `/src/app/[locale]/admin/(protected)/flows/[flowId]/page.tsx` | Individual flow detail page |
| `/src/app/[locale]/admin/(protected)/flows/[flowId]/wrapper.tsx` | Flow page wrapper |
| `/src/app/[locale]/admin/login/page.tsx` | Admin login page |
| `/src/app/[locale]/admin/unauthorized/page.tsx` | Unauthorized access page |

### Admin Components

| File | Description |
|------|-------------|
| `/src/components/admin/admin-page-wrapper.tsx` | HOC for admin page protection |
| `/src/components/admin/admin-error-boundary.tsx` | Error boundary for admin pages |
| `/src/components/admin/breadcrumb.tsx` | Breadcrumb navigation |
| `/src/components/admin/flow-actions.tsx` | Flow action buttons (edit, delete, duplicate) |
| `/src/components/admin/flow-filters.tsx` | Flow filtering controls |
| `/src/components/admin/flow-status-badge.tsx` | Status display component |
| `/src/components/admin/step-management-dialog.tsx` | Step management modal |
| `/src/components/admin/field-visibility-toggle.tsx` | Field visibility control |
| `/src/components/admin/loading-states.tsx` | Loading skeletons |
| `/src/components/admin/error-states.tsx` | Error display components |
| `/src/components/admin/retryable-error-boundary.tsx` | Retry-enabled error boundary |

### Admin API and Data Layer

| File | Description |
|------|-------------|
| `/src/lib/api/admin-api.ts` | Admin API service with full CRUD operations |
| `/src/lib/api/admin-types.d.ts` | TypeScript definitions for admin API |
| `/src/hooks/admin/use-admin-flows.ts` | React Query hooks for flow management |
| `/src/store/use-admin-flow-store.ts` | Zustand store for admin state management |
| `/src/types/admin.ts` | Admin domain types |

### Admin Utilities

| File | Description |
|------|-------------|
| `/src/lib/admin/admin-toast.ts` | Toast notification utilities |
| `/src/lib/admin/field-utils.ts` | Field manipulation utilities |

## Architecture

### Layered Architecture

1. **Presentation Layer**: React components with TypeScript
2. **State Management Layer**: Zustand store + React Query
3. **Service Layer**: API service abstractions
4. **Data Layer**: Type definitions and utilities

### Key Architectural Decisions

- **App Router**: Using Next.js 13+ app directory structure
- **Route Protection**: Multi-layer authentication (middleware + component-level)
- **State Management**: Hybrid approach with Zustand (UI state) + React Query (server state)
- **Mock API Support**: Built-in mock responses for development
- **Internationalization**: next-intl for multi-language support

## Routing Structure

```
/admin
├── /login (public)
├── /unauthorized (public)
└── /(protected) - Requires authentication
    ├── / - Dashboard
    ├── /flows - Flow management
    │   └── /[flowId] - Flow details
    ├── /users (planned)
    ├── /settings (planned)
    └── /analytics (planned)
```

## Data Flow

### Data Fetching Flow
1. Component mounts → React Query hook called
2. API service (mock/real) → HTTP request
3. Response cached → Component re-renders
4. Optimistic updates → UI feedback
5. Error handling → Toast notifications

### State Management Flow
- **Server State**: Managed by React Query with caching
- **UI State**: Managed by Zustand store
- **Form State**: Pending changes tracked locally
- **Auth State**: Context-based with persistence

## Authentication & Authorization

### Multi-Layer Security
1. **Middleware**: Server-side route protection
2. **ProtectedRoute Component**: Client-side route guard
3. **Role-Based Access**: Admin-only routes validation
4. **Token-Based Auth**: JWT with localStorage persistence

## Dependencies

### Core Dependencies
- Next.js 13+
- React Query
- Zustand
- TypeScript
- next-intl

### UI Dependencies
- Tailwind CSS
- Lucide React
- Sonner
- Radix UI (shadcn/ui)

## Component Hierarchy

```
AdminLayout
├── Sidebar (navigation)
├── Header (breadcrumbs + user info)
└── AdminPageWrapper
    └── ProtectedRoute
        └── Page Components
            ├── DataTable (flows listing)
            ├── FlowActions (individual actions)
            ├── StepManagementDialog (modal)
            └── FieldVisibilityToggle (field controls)
```

## Key Features

### Flow Management
- List flows with filtering and search
- CRUD operations for flows
- Duplicate flows with configuration
- Bulk operations
- Status management

### Step Management
- List and manage flow steps
- Reorder with drag-and-drop
- Configure eKYC and OTP integration
- Step-level status control

### Field Management
- Dynamic field configuration
- Field visibility toggle
- Requirement settings
- Validation rules
- Bulk field updates