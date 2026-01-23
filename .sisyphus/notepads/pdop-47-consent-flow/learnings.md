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

## Task 2: Create ConsentModal Component

### shadcn/ui Dialog Component Pattern

**Import structure** from `@/components/ui/dialog`:
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
```

**Component structure** (following Dialog API):
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Chính sách bảo mật</DialogTitle>
      <DialogDescription asChild>
        {/* Rich HTML content via asChild prop */}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Từ chối</Button>
      <Button>Đồng ý</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Modal Props Interface

**Standard modal props pattern**:
```typescript
interface ConsentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (consentId: string) => void;
}
```

### Button Pattern for Modal Actions

**Secondary/Decline button**: `variant="outline"`
**Primary/Agree button**: default variant with `disabled={isLoading}` state
**Loading text**: Conditional `isLoading ? "Đang xử lý..." : "Đồng ý"`

### State Management Integration

**Store usage pattern**:
```typescript
const { setError, clearError, error } = useConsentStore();
const [isLoading, setIsLoading] = useState(false);
```

**Error handling**:
- Use `setError()` to display error in store
- Use `clearError()` before API call
- Display error from store: `{error && <div className="text-red-500 text-sm">{error}</div>}`

### Vietnamese GDPR-Compliant Text Structure

**Static text structure** (no dynamic fetching):
- Introduction paragraph
- Bulleted list of data handling rules
- Confirmation question

**Key points covered**:
- Data collection purpose
- Legal compliance (Vietnam law + GDPR)
- Data usage limitations
- Third-party sharing restrictions

### DialogDescription asChild Pattern

For rich content in DialogDescription, use `asChild` prop:
```tsx
<DialogDescription asChild>
  <div className="space-y-3 text-sm leading-relaxed">
    {/* HTML content with div, ul, li, p tags */}
  </div>
</DialogDescription>
```

This allows proper HTML structure and Tailwind classes.

### TypeScript Import Handling for Wrapper Functions

**Expected error** when importing wrapper function that doesn't exist yet:
- Task 3 will create `submitCreditCardConsent()` in `@/lib/consent/credit-card-consent`
- This import error is expected and will be resolved in Task 3
- Linter passes but TypeScript reports module not found

### Dialog Default Behavior

**Built-in accessibility**:
- ESC key closes modal (Radix UI default)
- Clicking outside closes modal (DialogPrimitive.Overlay)
- Close button in top-right (shown by default in DialogContent)
- Focus management handled automatically
