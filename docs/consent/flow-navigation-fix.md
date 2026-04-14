# Flow Navigation and Consent Modal Fixes

**Date:** 2026-03-03
**Status:** ✅ Completed

## Problems Fixed

### 1. Navigation Issue: Button "Tiếp tục" Not Working

**Problem:**
- When `send_otp = false`, clicking "Tiếp tục" button didn't navigate to the next page
- Form submitted successfully but user stayed on the same page

**Root Cause:**
- `DynamicLoanForm.handleFormComplete` only called `onSubmitSuccess` callback
- No navigation logic for non-OTP flows

**Solution:**
Added automatic navigation to next step when `sendOtp = false`:

```typescript
// Find next step and navigate
const currentStepIndex = flowData.steps.findIndex(
  (s) => s.id === indexStep.id,
);
const nextStep = flowData.steps[currentStepIndex + 1];

if (nextStep) {
  console.log("[DynamicLoanForm] Navigating to next step:", {
    currentPage: page,
    nextPage: nextStep.page,
    nextStepId: nextStep.id,
  });
  router.push(nextStep.page);
}
```

**Files Changed:**
- `src/components/loan-application/DynamicLoanForm.tsx`

---

### 2. Duplicate Consent Modal at `/loan-info`

**Problem:**
- After giving consent in previous step, `/loan-info` page showed consent modal again
- User had to consent twice for the same flow

**Root Cause:**
- `/loan-info` page has its own consent check logic in `useEffect`
- Didn't check if user already has valid consent in the store
- Only checked API response for consent status

**Solution:**
Added consent store check before showing modal:

```typescript
// Skip consent check if user already has valid consent in store
if (hasConsent() && isConsentValid()) {
  console.log(
    "[LoanInfoPage] User already has valid consent, skipping modal",
  );
  return;
}
```

**Files Changed:**
- `src/app/[locale]/loan-info/page.tsx`

---

## Flow Diagram

### Before Fix:
```
Step 1 (/index)
  ↓ [send_otp: false]
  ↓ Click "Tiếp tục"
  ↓ Form submits
  ✗ No navigation (stays on /index)
```

### After Fix:
```
Step 1 (/index)
  ↓ [send_otp: false]
  ↓ Click "Tiếp tục"
  ↓ Form submits
  ✓ Navigate to Step 2 (/submit-info)
```

---

## Consent Flow

### Before Fix:
```
Step 1 (/index)
  ↓ Give consent
  ↓ Navigate to /loan-info
  ✗ Consent modal shows again (duplicate)
```

### After Fix:
```
Step 1 (/index)
  ↓ Give consent (stored in consent store)
  ↓ Navigate to /loan-info
  ✓ Check consent store first
  ✓ Skip modal if already consented
```

---

## Testing

### Test Case 1: Navigation with send_otp = false
1. Start flow at `/index` with `send_otp: false`
2. Fill form and click "Tiếp tục"
3. **Expected:** Navigate to next step page
4. **Actual:** ✅ Navigates correctly

### Test Case 2: Consent Modal Not Duplicated
1. Start flow at `/index` with consent required
2. Give consent in modal
3. Navigate to `/loan-info`
4. **Expected:** No consent modal shown
5. **Actual:** ✅ Modal skipped

### Test Case 3: Navigation with send_otp = true
1. Start flow at `/index` with `send_otp: true`
2. Fill form and click "Tiếp tục"
3. Enter phone number
4. Verify OTP
5. **Expected:** Navigate to `/loan-info` with leadId and token
6. **Actual:** ✅ Works as before (no regression)

---

## Technical Details

### Navigation Logic
- Uses `flowData.steps` array to find current step index
- Gets next step by incrementing index
- Navigates to `nextStep.page` using Next.js router
- Logs navigation for debugging

### Consent Store Integration
- `hasConsent()`: Checks if `consentId` exists
- `isConsentValid()`: Checks if status is "agreed"
- Both must be true to skip modal
- Falls back to API check if store is empty

---

## Related Files

### Modified:
- `src/components/loan-application/DynamicLoanForm.tsx`
- `src/app/[locale]/loan-info/page.tsx`

### Referenced:
- `src/store/use-consent-store.ts` (consent state management)
- `src/hooks/flow/use-flow.ts` (flow data fetching)
- `src/mappers/flowMapper.ts` (flow structure mapping)

---

## Notes

- Navigation only happens when `sendOtp = false`
- When `sendOtp = true`, existing OTP flow is used (no changes)
- Consent check happens on every page load but skips modal if already consented
- Console logs added for debugging navigation and consent decisions
