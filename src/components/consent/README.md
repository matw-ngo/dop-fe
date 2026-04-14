# Consent Components

Simple, theme-aware consent management components inspired by Finzone legacy design.

## Components

### ConsentModal

Main consent modal with bottom banner positioning and optional terms detail view.

```tsx
import { ConsentModal } from "@/components/consent/ConsentModal";

function MyPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <ConsentModal
      open={isOpen}
      setOpen={setIsOpen}
      onSuccess={(consentId) => {
        console.log("Consent granted:", consentId);
        // Continue with user flow
      }}
      stepData={{
        consent_purpose_id: "your-consent-purpose-id",
      }}
    />
  );
}
```

### ConsentForm

Simplified consent form without category selection.

```tsx
import { ConsentForm } from "@/components/consent/ConsentForm";

function MyCustomModal() {
  return (
    <ConsentForm
      consentVersion={{
        version: "1.0",
        content: "Full terms and conditions...",
      }}
      onGrant={handleGrant}
      isSubmitting={false}
      onViewTerms={() => setShowTerms(true)}
    />
  );
}
```

### ConsentTermsContent

Terms detail view for modal.

```tsx
import { ConsentTermsContent } from "@/components/consent/ConsentForm";

function TermsModal() {
  return (
    <Dialog open={showTerms}>
      <DialogContent>
        <ConsentTermsContent
          consentVersion={{
            version: "1.0",
            content: "Full terms...",
          }}
        />
        <Button onClick={handleGrant}>Continue</Button>
      </DialogContent>
    </Dialog>
  );
}
```

## Features

### ✅ Simple UX
- No complex category selection
- Single "Continue" button
- Optional terms detail view

### ✅ Theme-Aware
- Uses CSS variables from theme config
- Supports custom themes
- No hardcoded colors

### ✅ i18n Support
- English and Vietnamese
- Easy to add more languages
- Structured translation keys

### ✅ Scalable
- Ready for multiple consent types (GTM, Analytics, etc.)
- Flexible UI variants
- Extensible architecture

### ✅ Mobile-First
- Responsive design
- Bottom banner on desktop
- Stacked layout on mobile

## Design

Based on Finzone legacy consent popup:
- Cookie icon + title
- Simple description
- Link to full terms
- Bottom positioning
- Horizontal layout

## API Integration

Works with existing consent API:
- `POST /consent` - Create consent
- `POST /consent-log` - Log action
- `PATCH /consent/{id}` - Update consent

## Styling

Uses CSS variables for theming:
```css
--consent-bg: Background color
--consent-fg: Text color
--consent-muted: Secondary text
--consent-border: Border color
--consent-surface: Surface color
--consent-primary: Primary color
--consent-error: Error color
```

## State Management

Uses Zustand store:
```tsx
import { useConsentStore } from "@/store/use-consent-store";

const {
  consentId,
  consentStatus,
  setConsentId,
  setConsentStatus,
} = useConsentStore();
```

## Future Enhancements

### Multiple Consent Types
```typescript
// GTM Consent
<ConsentModal
  type="gtm"
  variant="toggle-switch"
  required={false}
/>

// Marketing Consent
<ConsentModal
  type="marketing"
  variant="inline-checkbox"
  required={false}
/>
```

### Consent Management Page
- View all consent types
- Toggle individual consents
- View consent history
- Revoke consents

## Migration from Legacy

Old implementation backed up at:
`src/components/consent/ConsentTabsLegacy.tsx.bak`

Key changes:
- ❌ Removed data category selection
- ❌ Removed reject button
- ✅ Simplified to single continue button
- ✅ Bottom banner positioning
- ✅ Optional terms detail modal

## Testing

```bash
# Unit tests
pnpm test:run src/components/consent

# E2E tests
pnpm test:e2e
```

## Accessibility

- Semantic HTML
- Keyboard navigation
- Focus management
- ARIA labels
- Screen reader support

## Browser Support

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Documentation

See `docs/consent/redesign-2026-03.md` for detailed redesign documentation.
