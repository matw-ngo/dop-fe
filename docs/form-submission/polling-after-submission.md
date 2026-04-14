# Polling Module — Integration Guide

## Files created / updated

| Path | Status | Notes |
|------|--------|-------|
| `src/lib/polling/types.ts` | **NEW** | Core interfaces — no framework deps |
| `src/lib/polling/PollingController.ts` | **NEW** | Vanilla TS class, reusable outside React |
| `src/lib/polling/usePolling.ts` | **NEW** | React hook with Page Visibility auto-pause |
| `src/lib/polling/useLeadPolling.ts` | **NEW** | Business-layer hook for `GET /leads/{id}` |
| `src/lib/polling/index.ts` | **NEW** | Barrel / public API |
| `src/lib/polling/__tests__/usePolling.test.ts` | **NEW** | 12 unit tests, >80% coverage |
| `src/components/loan-application/LoanSearching/LoanSearchingScreenWithPolling.tsx` | **NEW** | Drop-in replacement for LoanSearchingScreen |
| `src/store/use-loan-search-store.ts` | **UPDATED** | Removed `setTimeout(3000)` |

---

## Architecture

```
PollingController (pure TS)
        │ subscribe()
        ▼
   usePolling()  ──── Page Visibility API (auto-pause/resume)
        │
   useLeadPolling()   ← fetcher = GET /leads/{id}
        │              ← predicate = terminal distribution_status
        │
LoanSearchingScreenWithPolling
        │ onComplete callback
        ▼
  useLoanSearchStore  (setForwardStatus, setResult)
```

---

## How to swap out the old screen

In whatever parent renders the loan-searching overlay, replace:

```tsx
// Before
import { LoanSearchingScreen } from ".../LoanSearchingScreen";
<LoanSearchingScreen />

// After
import { LoanSearchingScreenWithPolling } from ".../LoanSearchingScreenWithPolling";
<LoanSearchingScreenWithPolling />
```

The new component is a strict superset — it accepts the same `message` and
`className` props as the original.

---

## Reusing the module in other flows (ekyc, payment, …)

```tsx
import { usePolling } from "@/lib/polling";

const { data, status, start, stop } = usePolling({
  fetcher: () => myApiClient.GET("/some-async-job/{id}", { params: { path: { id } } }),
  predicate: (data) => data.status === "complete" || data.status === "failed",
  interval: 3000,
  maxRetries: 40,
  timeout: 2 * 60 * 1000,
  backoff: "exponential",
  onComplete: (data) => { /* handle terminal state */ },
});

// Start manually or call start() in a useEffect.
```

---

## i18n keys required

Add to your `pages.form.finding_loan` namespace:

```json
{
  "message": "Đang tìm kiếm sản phẩm phù hợp…",
  "partnerMatch": "Chúng tôi đã tìm thấy đối tác: {partner}",
  "noMatch": "Không tìm thấy sản phẩm phù hợp.",
  "checkingStatus": "Đang kiểm tra (lần {attempt})…"
}
```

---

## Running the tests

```bash
pnpm vitest run src/lib/polling
```

All tests use `vi.useFakeTimers()` — no real network calls are made.
