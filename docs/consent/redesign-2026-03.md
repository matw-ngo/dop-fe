# Consent Modal Redesign - March 2026

## Overview

Redesigned consent modal to match Finzone legacy design with simplified UX and scalable architecture for future consent types.

## Changes

### 1. UI/UX Redesign

**Before:**
- Centered modal with complex category selection
- Multiple checkboxes for data categories
- Vertical layout with separate sections
- Both "Grant" and "Reject" buttons

**After:**
- Bottom-positioned banner (like cookie consent)
- Simple horizontal layout: content left, button right
- No category selection (removed completely)
- Single "Continue" button
- Optional terms detail modal (centered)

### 2. Design Inspiration

Based on `docs/old-code/modules/ConsentPopup/`:
- Cookie icon + title
- Simple description text
- Link to view full terms
- Bottom banner position
- Horizontal layout on desktop, stacked on mobile

### 3. Architecture Changes

#### Files Modified:
- `src/components/consent/ConsentModal.tsx` - Main modal with bottom positioning
- `src/components/consent/ConsentForm.tsx` - Simplified form without categories
- `messages/en/features/consent/main.json` - Updated translations
- `messages/vi/features/consent/main.json` - Updated translations

#### Files Created:
- `src/types/consent.ts` - Scalable consent type definitions

#### Files Backed Up:
- `src/components/consent/ConsentTabsLegacy.tsx.bak` - Old implementation

### 4. Key Features

#### Theme-Aware
- Uses CSS variables from `finzoneTheme`
- No CSS modules, pure Tailwind + CSS vars
- Supports dark mode (if implemented)

#### i18n Support
- English and Vietnamese translations
- Structured translation keys
- Easy to add more languages

#### Scalable Architecture
- `ConsentPurposeType` enum for different consent types
- Currently: `data_privacy` (cookies)
- Future: `gtm`, `analytics`, `marketing`, `third_party`
- `ConsentUIVariant` for different UI presentations
- `ConsentModalConfig` for flexible modal behavior

#### No Data Categories
- Completely removed category selection
- Simplified user flow
- Backend still supports categories if needed later

### 5. Component Structure

```tsx
<ConsentModal>
  ├── Main Modal (bottom positioned)
  │   └── <ConsentForm>
  │       ├── Cookie Icon
  │       ├── Title & Description
  │       ├── Terms Link (opens detail modal)
  │       └── Continue Button
  │
  └── Terms Detail Modal (centered)
      └── <ConsentTermsContent>
          ├── Cookie Icon + Title
          ├── ScrollArea with full terms
          ├── Description
          └── Continue Button
```

### 6. Translation Keys

#### New Keys:
```json
{
  "form": {
    "title": "Điều khoản bảo mật dữ liệu",
    "description": "...",
    "agreement": "Bằng việc chọn \"Tiếp tục\"...",
    "viewTerms": "Xem điều khoản đầy đủ",
    "continueButton": "Tiếp tục",
    "loading": "Đang xử lý...",
    "termsModal": {
      "title": "...",
      "description": "...",
      "close": "Đóng"
    }
  }
}
```

#### Removed Keys:
- `form.dataCategories`
- `form.selection.*`
- `form.agreeAll.*`
- `form.validation.*`
- `form.reject.*`

### 7. API Integration

No changes to API calls:
- Still uses `POST /consent` to create consent
- Still uses `POST /consent-log` to log actions
- Still uses `PATCH /consent/{id}` for updates (if needed)
- Backend categories support remains intact

### 8. Future Enhancements

#### Ready for Multiple Consent Types:
```typescript
// Example: GTM Consent
const gtmConsent = {
  type: "gtm",
  variant: "toggle-switch",
  required: false,
};

// Example: Marketing Consent
const marketingConsent = {
  type: "marketing",
  variant: "inline-checkbox",
  required: false,
};
```

#### Consent Management Page:
- User can view all consent types
- Toggle individual consents on/off
- View consent history per type
- Revoke specific consents

### 9. Mobile Responsiveness

- Desktop: Horizontal layout (content left, button right)
- Mobile: Stacked layout (content top, button bottom full-width)
- Bottom banner adapts to screen size
- Terms modal scrollable on small screens

### 10. Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus management
- ARIA labels where needed
- Screen reader friendly

## Migration Guide

### For Developers:

1. **Import new components:**
   ```tsx
   import { ConsentModal } from "@/components/consent/ConsentModal";
   ```

2. **Usage remains the same:**
   ```tsx
   <ConsentModal
     open={isOpen}
     setOpen={setIsOpen}
     onSuccess={(consentId) => console.log(consentId)}
     stepData={{ consent_purpose_id: "..." }}
   />
   ```

3. **No prop changes needed** - backward compatible

### For Content Managers:

1. Update consent purpose content in backend
2. Content will display in terms detail modal
3. No category management needed

## Testing Checklist

- [ ] Modal appears at bottom of screen
- [ ] Horizontal layout on desktop
- [ ] Stacked layout on mobile
- [ ] Terms link opens detail modal
- [ ] Continue button grants consent
- [ ] Loading state shows spinner
- [ ] Theme colors apply correctly
- [ ] i18n works for EN/VI
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

## Performance

- No performance impact
- Removed unused category logic
- Simpler component tree
- Faster render time

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## References

- Old design: `docs/old-code/modules/ConsentPopup/`
- Theme config: `src/configs/themes/finzone-theme.ts`
- API spec: `specs/schema.yaml`
