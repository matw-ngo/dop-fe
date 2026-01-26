# Draft: User Consent Flow Implementation Plan

## Requirements (confirmed)
- **Main Flow**: User Consent Grant and Revoke functionality
- **Scope**: USER FLOW only (not admin flow)
- **Core Features**:
  1. Display consent prompt with latest version
  2. Handle user GRANT action (create consent + link categories + log)
  3. Handle user REVOKE/UPDATE action (update status + log)
  4. Maintain audit trail (append-only logs)

## Technical Decisions

### API Requirements (from docs)
- **Endpoints**:
  - `GET /consent-version` - Load latest version
  - `GET /consent` - Check existing consent status
  - `POST /consent` - Create new consent
  - `POST /consent-data-category` - Link data categories
  - `PATCH /consent/{id}` - Update/revoke consent
  - `POST /consent-log` - Audit log
  - `DELETE /consent-data-category/{id}` - Remove category link

- **Required Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
  - `X-Client-Source: web-client-v1`

- **Critical IDs** (must fetch from config, not hardcode):
  - `controller_id` - Data controller ID
  - `processor_id` - Data processor ID

### Business Logic Requirements (from docs)

**Pre-check Logic**:
1. Get latest version ID from `GET /consent-version`
2. Check if user has consent for this version via `GET /consent`
3. Display prompt only if:
   - No consent exists (empty response)
   - User consented to old version (version ID mismatch)

**GRANT Flow** (3-step transaction):
1. Create Consent: `POST /consent` with action="grant"
2. Link Categories: `POST /consent-data-category` for each selected category
3. Log Action: `POST /consent-log` with action="grant"

**REVOKE/UPDATE Flow**:
1. Get current consent: `GET /consent`
2. Update status: `PATCH /consent/{id}` with action="revoke" or "update"
3. For partial updates:
   - PATCH consent with action="update"
   - DELETE removed categories via `DELETE /consent-data-category/{id}`
   - POST added categories (if any)
4. Log Action: `POST /consent-log` with action="revoke" or "update"

**Data Consistency Requirements**:
- Consent Log is append-only (never update/delete existing logs)
- Handle effective_date filtering for consent versions
- Support pagination for consent logs display
- Prevent duplicate submissions (debounce buttons)

**Error Handling**:
- Map error codes to user-friendly messages:
  - `not_found` - Data not available
  - `already_exists` - Already consented
  - `permission_denied` - Token expired or wrong user
  - `deadline_exceeded` - Network timeout (show retry)
  - `resource_exhausted` - Rate limiting (disable button temporarily)
  - `failed_precondition` - Missing config IDs (reload page)
  - `unauthenticated` - Token expired (redirect to login)
  - `data_loss` - Critical server error (log to tracking system)

## Research Findings

### 1. **CRITICAL FINDING**: Consent Store Already Exists! 🎉
**File**: `src/store/use-consent-store.ts`
- **GDPR Compliant**: Uses encrypted sessionStorage storage
- **State Structure**:
  ```typescript
  interface ConsentRecord {
    id: string;
    controller_id: string;
    processor_id: string;
    lead_id: string;
    consent_version_id: string;
    source: string;
    action: ConsentAction;
    created_at: string;
    updated_at: string;
  }
  ```
- **Status Tracking**: "pending" | "agreed" | "declined"
- **Event System**: Custom events for component updates (consent:id-updated, consent:status-updated)
- **Selectors**: Efficient subscriptions via hooks
- **TODO in code**: Proper encryption/decryption implementation (lines 60, 67, 80)

### 2. API Client Pattern
**File**: `src/lib/api/client.ts`
- **Base**: `openapi-fetch` for type-safe API calls
- **Auth**: `Authorization: Bearer ${token}` header auto-added
- **Retry Logic**: 3 retries with exponential backoff (3s → 6s → 10s)
- **Timeout Config**: Per-endpoint overrides in `timeouts/` directory
- **CSRF Protection**: Auto-added for POST/PUT/DELETE/PATCH
- **Error Handling**: Global toast notifications for 500+, 429, timeout errors

### 3. Auth Store Pattern
**File**: `src/store/use-auth-store.ts`
- **Pattern**: Zustand + persist middleware
- **User ID Access**: `const { user } = useAuth(); const userId = user?.id`
- **Storage**: localStorage for user, session for OTP (no OTP persisted)
- **Hydration**: `isHydrated` flag tracks state loading

### 4. Test Infrastructure
**Framework**: Vitest (unit) + Playwright (E2E)
**Scripts**:
- `pnpm test:run` - Vitest unit tests
- `pnpm test:e2e` - Playwright E2E tests
- `pnpm test:ui` - Vitest UI mode
- `pnpm test:e2e:ui` - Playwright UI mode

### 5. Existing OpenAPI Types for Consent
**File**: `src/lib/api/v1/consent.d.ts` (generated, DO NOT EDIT)
- Contains types for all consent endpoints
- Must regenerate with `pnpm gen:api:consent` if schema changes

### 6. Project Conventions
- **Linting**: Biome (not ESLint)
- **Styling**: Tailwind CSS + shadcn/ui components
- **i18n**: next-intl with `messages/[locale]/features/*.json`
- **State**: Zustand stores with persist middleware
- **API Queries**: TanStack Query (`@tanstack/react-query`)

### 7. Component Architecture Decision

**ConsentModal Component Structure**:
- **File**: `src/components/features/consent/ConsentModal.tsx`
- **Dependencies**: 
  - useConsentStore (existing store)
  - useAuthStore (to get user ID)
  - React Query hooks (to call API)
- **Tabs**:
  - Tab 1: ConsentForm (GRANT/REVOKE/UPDATE actions)
  - Tab 2: ConsentHistory (audit log display with pagination)
- **Modal Trigger**: Auto-show on homepage when consent needed

## Open Questions

### Critical Implementation Questions - DECIDED:

1. **✅ Trigger Location**: Trang chủ `src/app/[locale]/page.tsx`
   - Hiển thị luôn ở trang chủ (homepage)
   - Điều kiện: Nếu user chưa consent hoặc consent phiên bản cũ

2. **✅ Consent Categories**: Gọi API `GET /data-categories`
   - Tự động fetch danh sách categories từ backend
   - Cache với React Query (tanstack/query)

3. **✅ Consent History UI**: Tích hợp vào ConsentModal với Smart Context
   - Modal có 2 tabs: [Consent Form] + [Consent History]
   - **Smart Tab Switching**:
     - Nếu user chưa có consent → Default tab: Consent Form
     - Nếu user đã có consent → Default tab: Consent History
   - Tab History hiển thị audit log có pagination (GET /consent-log)
   - User có thể thủ động switch giữa tabs

4. **ℹ️ Store Enhancement**: Giữ TODO encryption như placeholder
   - Không implement AES-256 trong plan này
   - Lấy làm tech debt cho giai đoạn sau

5. **ℹ️ i18n Messages**: Sử dụng pattern project
   - `messages/[locale]/features/consent.json` - Tạo file mới
   - Follow structure translation files khác

## Scope Boundaries

### INCLUDE:
- User-facing consent UI (modal/prompt for new consent)
- GRANT flow implementation (create consent + link categories + log)
- REVOKE/UPDATE flow implementation (patch consent + delete categories + log)
- Consent history display (audit log with pagination)
- React Query hooks for consent API calls
- i18n translations for consent UI
- Unit tests (Vitest) for hooks and logic
- E2E tests (Playwright) for user flows
- Fetch controller/processor IDs from config API (searchDataControllers, searchDataProcessors)
- Pre-check logic (GET /consent-version vs GET /consent version comparison)

### EXCLUDE:
- Admin flow for managing consent versions (separate scope)
- Data controller/processor configuration (backend responsibility)
- Encryption implementation enhancement (TODO in existing store, defer)
- Backend OpenAPI schema changes (frontend assumes API exists)
- Transaction rollback logic (user chose: báo lỗi, không rollback)
- Granular category selection (user chose: tất cả hoặc không)
