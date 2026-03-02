# Consent Modal Redesign - Migration Checklist

## ✅ Completed Tasks

### 1. UI Components
- [x] Redesigned `ConsentModal.tsx` with bottom positioning
- [x] Simplified `ConsentForm.tsx` without categories
- [x] Added `ConsentTermsContent` component for detail view
- [x] Removed category selection UI
- [x] Added Cookie icon component
- [x] Horizontal layout (desktop) / Stacked (mobile)

### 2. Translations
- [x] Updated `messages/en/features/consent/main.json`
- [x] Updated `messages/vi/features/consent/main.json`
- [x] Removed category-related keys
- [x] Added new simplified keys
- [x] Added terms modal keys

### 3. Type Definitions
- [x] Created `src/types/consent.ts`
- [x] Defined `ConsentPurposeType` enum
- [x] Defined `ConsentUIVariant` types
- [x] Added scalability for future consent types (GTM, Analytics, etc.)
- [x] Documented consent architecture

### 4. Code Quality
- [x] All lint checks passing
- [x] All type checks passing
- [x] Code formatted with Biome
- [x] Accessibility improvements (SVG titles, ARIA labels)
- [x] Removed unused imports

### 5. Documentation
- [x] Created `docs/consent/redesign-2026-03.md`
- [x] Created `src/components/consent/README.md`
- [x] Created this migration checklist
- [x] Backed up old implementation

### 6. Backward Compatibility
- [x] API integration unchanged
- [x] Store structure unchanged
- [x] Props interface compatible
- [x] Hooks unchanged

## 🔄 Testing Required

### Manual Testing
- [ ] Test consent modal appears at bottom
- [ ] Test horizontal layout on desktop (>768px)
- [ ] Test stacked layout on mobile (<768px)
- [ ] Test "View terms" link opens detail modal
- [ ] Test "Continue" button grants consent
- [ ] Test loading state shows spinner
- [ ] Test theme colors apply correctly
- [ ] Test English translations
- [ ] Test Vietnamese translations
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test screen reader announcements

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Integration Testing
- [ ] Test in user onboarding flow
- [ ] Test with real consent purpose ID
- [ ] Test API calls (POST /consent)
- [ ] Test API calls (POST /consent-log)
- [ ] Test consent state persistence
- [ ] Test session ID handling

### Edge Cases
- [ ] Test without consent purpose ID
- [ ] Test with missing consent content
- [ ] Test with network error
- [ ] Test with API timeout
- [ ] Test rapid clicking "Continue"
- [ ] Test closing modal before consent
- [ ] Test reopening modal after consent

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Run full test suite: `pnpm test:run`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Validate translations: `pnpm translations:validate`
- [ ] Check for missing keys: `pnpm translations:missing`
- [ ] Build production: `pnpm build`
- [ ] Test production build locally

### Deployment
- [ ] Deploy to staging environment
- [ ] Test on staging
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Monitor consent grant rates

### Post-Deployment
- [ ] Verify consent modal appears correctly
- [ ] Check analytics/tracking
- [ ] Monitor user feedback
- [ ] Check consent grant success rate
- [ ] Verify no console errors

## 🔮 Future Enhancements

### Phase 2: Multiple Consent Types
- [ ] Implement GTM consent
- [ ] Implement Analytics consent
- [ ] Implement Marketing consent
- [ ] Create consent management page
- [ ] Add toggle switches for each type

### Phase 3: Advanced Features
- [ ] Consent history timeline
- [ ] Consent export (GDPR compliance)
- [ ] Consent revocation flow
- [ ] Email notifications for consent changes
- [ ] Admin dashboard for consent analytics

### Phase 4: Optimization
- [ ] A/B test different copy
- [ ] Optimize consent grant rate
- [ ] Add consent reminder logic
- [ ] Implement consent expiration
- [ ] Add consent version migration

## 📝 Notes

### Breaking Changes
- None - fully backward compatible

### Known Issues
- None currently

### Dependencies
- No new dependencies added
- Uses existing UI components
- Uses existing API client

### Performance Impact
- Positive: Removed unused category logic
- Positive: Simpler component tree
- Positive: Faster render time

### Security Considerations
- Consent data still encrypted in sessionStorage
- API calls still use authentication
- No sensitive data in localStorage

## 🆘 Rollback Plan

If issues occur:

1. **Quick Rollback:**
   ```bash
   git revert <commit-hash>
   pnpm build
   # Deploy
   ```

2. **Restore Old Files:**
   ```bash
   mv src/components/consent/ConsentTabsLegacy.tsx.bak \
      src/components/consent/ConsentTabsLegacy.tsx
   # Restore old translations from git history
   git checkout HEAD~1 -- messages/
   ```

3. **Verify Rollback:**
   - Test old consent flow
   - Check category selection works
   - Verify API calls succeed

## 📞 Support

For questions or issues:
- Check `docs/consent/redesign-2026-03.md`
- Check `src/components/consent/README.md`
- Review old implementation: `ConsentTabsLegacy.tsx.bak`
- Contact: [Your Team/Email]

---

**Last Updated:** March 2, 2026
**Status:** ✅ Ready for Testing
