# Consent System - Comprehensive Report

**Project:** DOP Frontend  
**Date:** April 16, 2026  
**Status:** Production Ready with Minor Technical Debt  

---

## 📊 Executive Summary

Hệ thống consent của DOP Frontend là một implementation hoàn chỉnh với architecture phân tách rõ ràng giữa data layer, state management, business logic và UI components. Hệ thống tuân thủ GDPR thông qua lazy session initialization và cookie-based persistence.

| Aspect | Status |
|--------|--------|
| Architecture | ✅ Clean, well-layered |
| GDPR Compliance | ✅ Lazy init, 30-day expiry |
| Type Safety | ⚠️ Minor issues (`as any`) |
| Test Coverage | ⚠️ Missing hook tests |
| API Integration | ✅ Active endpoints working |
| Performance | ✅ Selectors, memoization |

---

## 🏗️ System Architecture

### Layer Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ConsentModal │ │ConsentForm  │ │TermsAgreement│ │ConsentManagementForm│   │
│  │  (orchestrator)│ │  (presenter) │ │  (inline)    │ │  (standalone)      │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
│         │               │               │                    │               │
│         └───────────────┴───────────────┴────────────────────┘               │
│                                    │                                        │
│                                    ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                            HOOKS LAYER                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │useConsentPurpose│ │useUserConsent│ │useConsentGrant│ │useConsentSession    │   │
│  │  (fetch)    │ │  (fetch)    │ │  (mutate)   │ │  (session mgmt)     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │useConsentLogs  │ │useDataCategories│ │useTermsContent│ │useConfigIds         │   │
│  │  (unused)   │ │  (unused)   │ │  (unused)   │ │  (unused)           │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                           STORE LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    use-consent-store.ts (Zustand)                       ││
│  │  • Cookie persistence (30-day)                                         ││
│  │  • Cross-tab sync                                                       ││
│  │  • Event-driven updates                                                 ││
│  │  • Granular selectors                                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│                            DATA LAYER                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────────────────┐│
│  │Cookie Storage│ │SessionStorage│ │    Consent Service API                ││
│  │  (active)   │ │  (legacy)    │ │    https://consent.datanest.vn        ││
│  └─────────────┘ └─────────────┘ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Inventory

### Active Components (8 files)

| File | Lines | Purpose | Consumers |
|------|-------|---------|-----------|
| `ConsentModal.tsx` | 197 | Main orchestrator | `ConsentGlobalProvider`, homepage |
| `ConsentForm.tsx` | 146 | Reusable form UI | `ConsentModal` |
| `ConsentDialog.tsx` | 121 | Dialog wrapper | `ConsentModal`, `TermsAgreement` |
| `ConsentTermsContent.tsx` | ~50 | Terms display | `ConsentModal`, `ConsentDialog` |
| `ConsentHistory.tsx` | 118 | Audit log UI | Lead generation forms |
| `ConsentGlobalProvider.tsx` | 63 | App-level provider | App root |
| `TermsAgreement.tsx` | 237 | Inline consent | Dynamic forms |
| `ConsentManagementForm.tsx` | 337 | Standalone management | Lead generation |

### Active Hooks (5 files)

| File | Lines | Purpose | Consumers |
|------|-------|---------|-----------|
| `use-consent-purpose.ts` | 55 | Fetch purpose config | Homepage, `ConsentModal` |
| `use-user-consent.ts` | 52 | Check user consent | Homepage, `ConsentModal` |
| `use-consent-grant.ts` | 106 | Grant consent | `ConsentModal` |
| `use-consent-session.ts` | 353 | Session management | Homepage, `ConsentModal` |
| `types.ts` | 28 | Type exports | All hooks |

### Unused Hooks (4 files - Dead Code)

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `use-consent-logs.ts` | 57 | Fetch audit logs | ❌ No consumers |
| `use-data-categories.ts` | 54 | Fetch categories | ❌ No consumers |
| `use-terms-content.ts` | 48 | Fetch terms | ❌ No consumers |
| `use-config-ids.ts` | 50 | Fetch config IDs | ❌ No consumers, uses `as any` |

### Store & API

| File | Lines | Purpose |
|------|-------|---------|
| `use-consent-store.ts` | 761 | Zustand store with cookie persistence |
| `consent.ts` (service) | 56 | API client with middleware |
| `consent.ts` (MSW handlers) | 588 | Mock handlers for testing |

---

## 🔄 Consent Flows

### Flow 1: Homepage Consent Detection

```
User visits /
     │
     ▼
useFlowStep(FLOW_PAGES.INDEX)
     │
     ▼
Fetch consent_purpose_id from flow config
     │
     ▼
useConsentPurpose({ consentPurposeId }) → GET /consent-purpose/{id}
     │
     ▼
useUserConsent({ sessionId }) → GET /consent?session_id&action=grant
     │
     ▼
┌─────────────────────────────────────────────┐
│ Session exists?                             │
└──────────────┬──────────────────────────────┘
               │
          ┌────┴────┐
         YES       NO
          │         │
          ▼         ▼
    ┌──────────┐  ┌────────────────────────┐
    │ Check    │  │ openConsentModal()     │
    │ version  │  │ → ConsentModal opens   │
    │ match    │  │ → User clicks Continue │
    └────┬─────┘  │ → useConsentGrant()    │
         │       │ → POST /consent        │
    ┌────┴────┐  │ → POST /consent-log    │
   YES      NO  │ → Store updated        │
    │       │   └────────────────────────┘
    │       │
    ▼       ▼
┌──────────┐ ┌──────────┐
│ No modal │ │ Show modal│
└──────────┘ └──────────┘
```

### Flow 2: Loan Application Integration

```
DynamicLoanForm
     │
     ▼
useDynamicLoanFormOrchestrator
     │
     ├───► Input: hasConsent(), getConsentId(), openConsentModal()
     │
     ▼
onWizardComplete()
     │
     ▼
Check: input.indexStep.sendOtp ?
     │
     ▼
needsPhoneCollection && !hasConsent()
     │
     ▼
openPhoneModalWithConsent()
     │
     ▼
input.openConsentModal({ consentPurposeId, onSuccess: () => dispatch(NEED_PHONE) })
     │
     ▼
createLead({ consent_id: getConsentId() })
```

### Flow 3: Terms Agreement (Inline)

```
Dynamic Form
     │
     ▼
registerConsentField() maps "ConsentAgreement" → TermsAgreement
     │
     ▼
TermsAgreement renders:
     • Terms & Conditions link ──→ ConsentDialog (or external URL)
     • Privacy Policy link ───────→ ConsentDialog (or external URL)
     • Agree/Disagree radio buttons
     │
     ▼
Value: "1" (agree) / "0" (disagree)
```

---

## 🌐 API Integration

### Active Endpoints

| Method | Endpoint | Hook | Timeout | Status |
|--------|----------|------|---------|--------|
| GET | `/consent?session_id&action=grant` | `useUserConsent` | Default | ✅ Active |
| GET | `/consent-purpose/{id}` | `useConsentPurpose` | Default | ✅ Active |
| POST | `/consent` | `useConsentGrant` | 15s | ✅ Active |
| POST | `/consent-log` | `useConsentGrant` | 15s | ✅ Active |

### Unused Endpoints (Defined in MSW but not called)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/consent/{id}` | Not used |
| PATCH | `/consent/{id}` | Not used |
| DELETE | `/consent/{id}` | Not used |
| GET | `/consent-purpose` | Not used |
| POST | `/consent-purpose` | Not used |
| GET | `/consent-version` | Not used |
| POST | `/consent-version` | Not used |
| GET | `/consent-log?consent_id` | `useConsentLogs` unused |
| GET | `/data-category` | `useDataCategories` unused |
| GET | `/config/ids` | `useConfigIds` unused, `as any` |

---

## ✅ Strengths

### 1. Architecture
- **Clean separation**: Data → Store → Hooks → Components
- **Composable UI**: `ConsentDialog` + `ConsentForm` + `ConsentTermsContent`
- **Single responsibility**: Each hook does one thing

### 2. GDPR Compliance
- **Lazy initialization**: Session only created on user action
- **30-day expiry**: Cookie max-age = 2592000 seconds
- **Secure cookies**: SameSite=Lax, auto-migration from localStorage

### 3. Performance
- **Selector hooks**: `useConsentId()`, `useConsentStatus()` prevent re-renders
- **Granular subscriptions**: `subscribeWithSelector` middleware
- **Memoization**: `ConsentGlobalProvider` uses `useMemo`, `useCallback`

### 4. Developer Experience
- **Centralized exports**: `hooks/consent/index.ts`
- **Type safety**: OpenAPI-generated types (mostly)
- **MSW integration**: Comprehensive mock handlers
- **Event system**: Cross-component communication via CustomEvents

### 5. Testing
- **Component tests**: `ConsentModal.test.tsx`, `ConsentForm.test.tsx`
- **Interaction tests**: `ConsentModal.interaction.test.tsx`
- **MSW handlers**: Full API mocking support

---

## ⚠️ Issues & Technical Debt

### Critical Issues (Fixed - File Deleted)

~~`credit-card-consent.ts` chứa hardcoded IDs đã được xóa.~~

### High Priority Issues

| Issue | File | Impact | Fix |
|-------|------|--------|-----|
| `as any` type bypass | `use-config-ids.ts:30` | Loses type safety | Fix endpoint path or update OpenAPI spec |
| Unused param | `use-data-categories.ts` | `consentPurposeId` not used in query | Add filter to queryFn |
| Unused hooks | 4 hook files | Dead code | Either use or remove |

### Medium Priority Issues

| Issue | File | Impact | Fix |
|-------|------|--------|-----|
| Silent undefined | `use-consent-purpose.ts:26-29` | Silent failures | Throw error or log warning |
| Store selector | `ConsentModal.tsx:42-44` | Potential re-renders | Use granular selectors |
| Missing timeouts | `endpoint-config.ts` | Suboptimal defaults | Add consent endpoints |
| Return full response | `use-consent-logs.ts:13` | Unnecessary data | Return `data?.consent_logs` only |

### Low Priority Issues

| Issue | File | Impact | Fix |
|-------|------|--------|-----|
| Backup file | `ConsentTabsLegacy.tsx.bak` | Clutter | Delete |
| Return type | `use-consent-logs.ts` | API ergonomics | Return array instead of response object |
| JSDoc | Multiple | Documentation | Add missing JSDoc comments |

---

## 📈 Statistics

### Code Volume

| Category | Files | Lines | Percentage |
|----------|-------|-------|------------|
| Components | 8 | ~2,500 | 47% |
| Hooks | 9 | ~800 | 15% |
| Store | 1 | 761 | 14% |
| Tests & Mocks | 5 | ~1,000 | 19% |
| API & Utils | 2 | ~106 | 2% |
| **Total** | **25** | **~5,300** | **100%** |

### Usage Statistics

| Component/Hook | Used By | Status |
|----------------|---------|--------|
| ConsentModal | 2 components | ✅ Active |
| ConsentForm | 1 component | ✅ Active |
| TermsAgreement | Dynamic forms | ✅ Active |
| ConsentManagementForm | Lead gen | ✅ Active |
| useConsentPurpose | 2 places | ✅ Active |
| useUserConsent | 2 places | ✅ Active |
| useConsentGrant | 1 place | ✅ Active |
| useConsentSession | 2 places | ✅ Active |
| useConsentLogs | 0 places | ⚠️ Unused |
| useDataCategories | 0 places | ⚠️ Unused |
| useTermsContent | 0 places | ⚠️ Unused |
| useConfigIds | 0 places | ⚠️ Unused |

### Test Coverage

| Category | Has Tests | Coverage Level |
|----------|-----------|----------------|
| Components | 4/8 | Medium (interaction tests) |
| Hooks | 0/9 | ❌ None |
| Store | 0/1 | ❌ None |

---

## 🔗 Integration Points

### 1. Flow Configuration
```typescript
// FlowStep từ backend
interface FlowStep {
  id: string;
  page: string;
  consent_purpose_id?: string;  // ← Per-step consent config
  sendOtp?: boolean;
  fields: {...};
}
```

### 2. Lead Creation
```typescript
createLead({
  flowId: string;
  tenant: string;
  deviceInfo: object;
  trackingParams: object;
  info: LeadInfo;
  consent_id?: string;  // ← Links consent to lead
});
```

### 3. Tracking Privacy (Different System!)
```typescript
// lib/tracking/privacy.ts - SEPARATE from consent system
hasUserConsent();  // ← localStorage, NOT cookie
setUserConsent();  // ← For analytics tracking only
```

⚠️ **Important**: `lib/tracking/privacy.ts` quản lý **tracking consent** (analytics), không phải **data processing consent** (GDPR).

---

## 🎯 Recommendations

### Immediate Actions
1. ✅ ~~Xóa `credit-card-consent.ts`~~ - Đã xong
2. 🔧 Fix `use-config-ids.ts` type issue
3. 🔧 Fix `use-data-categories.ts` để filter đúng
4. 🗑️ Xóa 4 unused hooks hoặc integrate vào flow

### Short Term
1. 🧪 Thêm unit tests cho hooks
2. 🧪 Thêm tests cho store
3. 📚 Thêm JSDoc cho public APIs
4. ⏱️ Cập nhật timeout config cho consent endpoints

### Long Term
1. 🔍 Audit `lib/tracking/privacy.ts` vs consent system - có thể merge?
2. 🌐 Thêm support cho consent revocation (API đã có PATCH/DELETE)
3. 📊 Thêm consent analytics dashboard
4. 🔄 Consider auto-refresh consent khi version outdated

---

## 📋 Appendix: File Locations

### Source Files
```
src/
├── components/consent/
│   ├── ConsentModal.tsx              # Main orchestrator
│   ├── ConsentForm.tsx               # Form UI
│   ├── ConsentDialog.tsx             # Dialog wrapper
│   ├── ConsentTermsContent.tsx       # Terms display
│   ├── ConsentHistory.tsx            # Audit logs UI
│   ├── ConsentGlobalProvider.tsx     # App provider
│   └── README.md                     # Documentation
│
├── components/lead-generation/
│   └── ConsentManagementForm.tsx     # Standalone management
│
├── components/loan-application/
│   └── ApplyLoanForm/components/
│       └── TermsAgreement.tsx        # Inline consent
│
├── hooks/consent/
│   ├── index.ts                      # Centralized exports
│   ├── types.ts                      # Type re-exports
│   ├── use-consent-grant.ts          # Grant consent
│   ├── use-consent-purpose.ts        # Fetch purpose
│   ├── use-consent-session.ts        # Session mgmt
│   ├── use-user-consent.ts           # Check consent
│   ├── use-consent-logs.ts           # ⚠️ Unused
│   ├── use-data-categories.ts        # ⚠️ Unused
│   ├── use-terms-content.ts          # ⚠️ Unused
│   └── use-config-ids.ts             # ⚠️ Unused
│
├── store/
│   └── use-consent-store.ts          # Zustand store
│
├── lib/api/services/
│   └── consent.ts                    # API client
│
└── __tests__/msw/handlers/
    └── consent.ts                    # Mock handlers
```

### Test Files
```
src/
├── components/consent/
│   ├── ConsentModal.test.tsx
│   ├── ConsentForm.test.tsx
│   └── __tests__/
│       └── ConsentModal.interaction.test.tsx
│
└── __tests__/
    ├── domain-specific.edge-cases.test.ts
    └── test-data/
        └── consent-data.ts
```

---

*Report generated: April 16, 2026*  
*Updated to reflect deletion of credit-card-consent.ts*
