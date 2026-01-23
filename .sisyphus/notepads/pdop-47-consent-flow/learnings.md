# Learnings - Consent Flow Implementation

## Task 1: Create Consent Store (Zustand)

### Zustand Store Pattern

**Pattern used**: Followed exact structure from `use-ekyc-store.ts`:
1. Import `create` from zustand and middleware: `createJSONStorage`, `persist`, `subscribeWithSelector`
2. Define state interface with fields and actions/getters
3. Use `create<StateType>()(persist((set, get) => ({ ... }), { ... }))` pattern
4. Apply persistence with encrypted sessionStorage

### TypeScript Import Pattern for Generated Types

**Issue**: Types from auto-generated `v1/consent.d.ts` are nested under `components["schemas"]`
**Solution**: Import as:
```typescript
import type { components } from "../lib/api/v1/consent";
type ConsentAction = components["schemas"]["ConsentAction"];
```

**Note**: The `@/lib/api/v1/consent` path resolution failed. Had to use relative path `../lib/api/v1/consent`

### Persistence Configuration

**Encrypted Session Storage Pattern**:
```typescript
storage: createJSONStorage(() => ({
  getItem: (key) => { /* decrypt TODO */ },
  setItem: (key, value) => { /* encrypt TODO */ },
  removeItem: (key) => { /* simple remove */ },
}))
```

**Partialize Pattern**: Only persist non-sensitive data, exclude `isLoading` and `error`

### Custom Events Dispatching

Following pattern from eKYC store, dispatched events:
- `consent:id-updated`
- `consent:status-updated`
- `consent:data-updated`
- `consent:error`

These allow components to react to consent state changes without direct store subscription.

### Getters Implementation

Getters use `get()` to access state, not direct property access:
```typescript
hasConsent: () => {
  const state = get();
  return state.consentId !== null;
}
```

### Exported Selectors

For efficient subscriptions, exported typed selectors:
- `useConsentId` → `state.consentId`
- `useConsentStatus` → `state.consentStatus`
- `useConsentData` → `state.consentData`
- `useConsentError` → `state.error`
- `useIsLoadingConsent` → `state.isLoading`
- `useHasConsent` → `state.hasConsent()`
- `useIsConsentValid` → `state.isConsentValid()`
