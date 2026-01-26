## Cleanup: Removed Duplicate ConsentForm

### Issue
- Stray duplicate file found: `src/components/features/consent/ConsentForm.tsx` (9.9KB)
- Correct implementation: `src/components/consent/ConsentForm.tsx` (2.9KB)

### Resolution
**Date:** 2026-01-26
- Deleted duplicate file `src/components/features/consent/ConsentForm.tsx`
- Verified zero imports in codebase (safe to remove)
- Confirmed correct file remains intact at `src/components/consent/ConsentForm.tsx`

### Impact
- No breaking changes (file was unused)
- Reduced codebase size by 9.9KB
- Eliminated confusion between two ConsentForm implementations

