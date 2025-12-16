# eKYC Migration Guide

This guide helps you migrate from the existing eKYC implementation to the new provider-agnostic system integrated with the form generation library.

## Overview of Changes

The new eKYC system provides:
- **Provider Abstraction**: Easy switching between providers
- **Form Integration**: Seamless auto-fill into form fields
- **Declarative Configuration**: All settings in field config
- **Multiple UI Modes**: Button, inline, modal, or custom
- **Better Error Handling**: Structured error management
- **Type Safety**: Full TypeScript support

## Migration Steps

### Step 1: Update Dependencies

No new dependencies are required. The eKYC system is now part of the form generation library.

### Step 2: Initialize the New System

Add this to your app initialization (e.g., `_app.tsx`):

```tsx
// OLD - Remove these imports
import { EkycDialog } from "@/components/ekyc/ekyc-dialog";
import { useEkycAutofill } from "@/hooks/features/ekyc/use-autofill";

// NEW - Add this
import { initializeVerification } from "@/lib/verification/init";

// Initialize the verification system
const isInitialized = await initializeVerification();
```

### Step 3: Replace eKYC Field with Form Field

#### OLD Implementation

```tsx
import { useState } from "react";
import { EkycDialog } from "@/components/ekyc/ekyc-dialog";
import { useEkycAutofill } from "@/hooks/features/ekyc/use-autofill";
import { Button } from "@/components/ui/button";

function MyForm() {
  const [showEkyc, setShowEkyc] = useState(false);
  const [ekycResult, setEkycResult] = useState(null);
  const { formData } = useEkycAutofill(ekycResult);

  const handleEkycComplete = (result) => {
    setEkycResult(result);
    setShowEkyc(false);
  };

  return (
    <form>
      <Button onClick={() => setShowEkyc(true)}>
        Verify Identity
      </Button>

      <EkycDialog
        open={showEkyc}
        onClose={() => setShowEkyc(false)}
        onComplete={handleEkycComplete}
      />

      <TextField value={formData.fullName} />
      <TextField value={formData.idNumber} />
      <TextField value={formData.dateOfBirth} />
    </form>
  );
}
```

#### NEW Implementation

```tsx
import { DynamicForm } from "@/components/form-generation";
import { FieldType } from "@/components/form-generation/types";

function MyForm() {
  const formConfig = {
    id: "my-form",
    fields: [
      {
        id: "identity_verification",
        name: "identity_verification",
        type: FieldType.EKYC,
        label: "Identity Verification",
        renderMode: "button", // or "inline", "modal", "custom"

        verification: {
          provider: "vnpt",
          providerOptions: {
            documentType: "CCCD_CHIP",
            flowType: "DOCUMENT_TO_FACE",
            enableLiveness: true,
            enableFaceMatch: true,
          },
          autofillMapping: {
            "full_name": "fullName",
            "national_id": "idNumber",
            "date_of_birth": "dateOfBirth",
          },
          buttonText: "Verify Identity",
          onVerified: (result) => {
            console.log("eKYC completed:", result);
          },
        },
      },
      {
        id: "full_name",
        name: "full_name",
        type: FieldType.TEXT,
        label: "Full Name",
        readOnly: true, // Auto-filled by eKYC
      },
      {
        id: "national_id",
        name: "national_id",
        type: FieldType.TEXT,
        label: "ID Number",
        readOnly: true,
      },
      {
        id: "date_of_birth",
        name: "date_of_birth",
        type: FieldType.DATE,
        label: "Date of Birth",
        readOnly: true,
      },
    ],
  };

  return <DynamicForm config={formConfig} />;
}
```

### Step 4: Update Data Mapping

#### OLD Manual Mapping

```tsx
// You had to manually map fields
const mappedData = {
  fullName: ekycResult.ocr?.object?.name,
  idNumber: ekycResult.ocr?.object?.id,
  dateOfBirth: convertVietnameseDate(ekycResult.ocr?.object?.birth_day),
};
```

#### NEW Automatic Mapping

```tsx
// Now it's automatic via configuration
autofillMapping: {
  "full_name": "fullName",           // Direct mapping
  "id_number": "idNumber",           // Direct mapping
  "birth_date": "dateOfBirth",        // Different field name
  "address": "address.fullAddress",   // Nested mapping
  "city": "address.city",             // Nested mapping
}
```

### Step 5: Update Callbacks

#### OLD Callback Pattern

```tsx
<EkycDialog
  onComplete={(result) => {
    if (result.code === 200) {
      // Handle success
      setEkycResult(result);
    } else {
      // Handle error
      setError(result.message);
    }
  }}
/>
```

#### NEW Callback Pattern

```tsx
verification: {
  onVerified: (result) => {
    // Already success - result is normalized
    console.log("Verified:", result);
    console.log("Name:", result.personalData.fullName);
    console.log("Confidence:", result.verificationData.confidence);
  },
  onError: (error) => {
    // Error object with details
    console.error("Verification failed:", error);
  },
}
```

## Feature Mapping

| Old Feature | New Implementation |
|-------------|-------------------|
| `EkycDialog` component | `renderMode: "modal"` |
| Manual state management | Automatic state in form |
| `useEkycAutofill` hook | `autofillMapping` config |
| Manual error handling | Built-in error states |
| Manual loading states | Built-in loading indicators |
| Direct VNPT SDK calls | Provider abstraction |
| Manual confidence checks | `confidenceThreshold` config |

## Advanced Migration Scenarios

### Scenario 1: Multiple eKYC Fields

#### OLD

```tsx
function MultipleEkycForm() {
  const [primaryEkyc, setPrimaryEkyc] = useState(null);
  const [secondaryEkyc, setSecondaryEkyc] = useState(null);

  return (
    <form>
      <EkycDialog onComplete={setPrimaryEkyc} />
      <EkycDialog onComplete={setSecondaryEkyc} />
    </form>
  );
}
```

#### NEW

```tsx
const formConfig = {
  fields: [
    {
      id: "primary_verification",
      type: FieldType.EKYC,
      verification: {
        provider: "vnpt",
        providerOptions: { documentType: "CCCD_CHIP" },
        autofillMapping: { "primary_id": "idNumber" },
      },
    },
    {
      id: "secondary_verification",
      type: FieldType.EKYC,
      verification: {
        provider: "vnpt",
        providerOptions: { documentType: "PASSPORT" },
        autofillMapping: { "passport_no": "idNumber" },
      },
    },
  ],
};
```

### Scenario 2: Custom UI

#### OLD

```tsx
function CustomEkycUI() {
  return (
    <div className="my-custom-ekyc">
      <EkycDialog
        customUI={MyCustomComponent}
        // ... other props
      />
    </div>
  );
}
```

#### NEW

```tsx
{
  id: "custom_ekyc",
  type: FieldType.EKYC,
  renderMode: "custom",
  customRender: ({ startVerification, isVerifying, result }) => (
    <div className="my-custom-ekyc">
      {isVerifying ? (
        <MyCustomLoading />
      ) : result ? (
        <MyCustomSuccess result={result} />
      ) : (
        <MyCustomButton onClick={startVerification}>
          Start Verification
        </MyCustomButton>
      )}
    </div>
  ),
  verification: {
    // ... verification config
  },
}
```

### Scenario 3: Conditional Verification

#### OLD

```tsx
function ConditionalEkyc() {
  const [needsEkyc, setNeedsEkyc] = useState(false);
  const [ekycResult, setEkycResult] = useState(null);

  return (
    <form>
      <Checkbox
        checked={needsEkyc}
        onChange={(e) => setNeedsEkyc(e.target.checked)}
      >
        Need identity verification?
      </Checkbox>

      {needsEkyc && (
        <EkycDialog onComplete={setEkycResult} />
      )}
    </form>
  );
}
```

#### NEW

```tsx
const formConfig = {
  fields: [
    {
      id: "needs_verification",
      type: FieldType.CHECKBOX,
      label: "Need identity verification?",
    },
    {
      id: "identity_verification",
      type: FieldType.EKYC,
      dependencies: [
        {
          conditions: [
            {
              fieldId: "needs_verification",
              operator: "equals",
              value: true,
            },
          ],
          action: "show",
        },
      ],
      verification: {
        // ... config
      },
    },
  ],
};
```

## Testing Migration

### Update Your Tests

#### OLD Test

```tsx
test("eKYC dialog opens", async () => {
  render(<MyComponent />);

  const button = screen.getByText("Verify");
  fireEvent.click(button);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
```

#### NEW Test

```tsx
test("eKYC field renders", () => {
  const config = {
    fields: [
      {
        id: "ekyc",
        type: FieldType.EKYC,
        verification: {
          provider: "vnpt",
          autofillMapping: {},
        },
      },
    ],
  };

  render(<DynamicForm config={config} />);

  expect(screen.getByText("Verify Identity")).toBeInTheDocument();
});
```

## Troubleshooting Migration

### Issue: Field not auto-filling

**Check:**
1. Verify `autofillMapping` keys match your field IDs exactly
2. Ensure field paths are correct (e.g., `address.city` for nested)
3. Confirm fields are not disabled by other validation rules

### Issue: Provider not found

**Solution:**
```tsx
// Ensure initialization is complete
await initializeVerification();

// Check provider registration
const health = await verificationManager.healthCheck();
console.log("Health:", health);
```

### Issue: Custom render not working

**Check:**
1. `renderMode` is set to `"custom"`
2. `customRender` function is provided
3. Function returns valid React elements

## Performance Considerations

The new system provides better performance:

1. **Lazy Loading**: SDK loads only when needed
2. **Singleton Provider**: One instance per app
3. **Efficient State**: Shared state management
4. **Memoized Components**: Prevent unnecessary re-renders

### Monitor Performance

```tsx
import { getVerificationStats } from "@/lib/verification/init";

function checkPerformance() {
  const stats = getVerificationStats();

  console.log("Average time:", stats.averageProcessingTime);
  console.log("Success rate:", stats.successfulVerifications / stats.totalAttempts);

  // Alert if performance is poor
  if (stats.averageProcessingTime > 10000) {
    console.warn("eKYC verification is slow");
  }
}
```

## Rollback Plan

If you need to rollback quickly:

1. Keep old imports commented out
2. Have a feature flag ready
3. Store old components in `legacy` folder

```tsx
// Quick rollback flag
const USE_NEW_EKYC = process.env.REACT_APP_NEW_EKYC === "true";

function EkycComponent() {
  if (USE_NEW_EKYC) {
    return <EkycField />;
  } else {
    return <EkycDialog />;
  }
}
```

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Planning | 1 day | Review current usage, plan migration |
| Development | 2-3 days | Update components, update configs |
| Testing | 1-2 days | Unit tests, integration tests |
| Deployment | 1 day | Feature flags, monitoring |
| Cleanup | 1 day | Remove old code, update docs |

## Support

For migration issues:

1. Check this guide first
2. Review the [eKYC Integration Guide](./ekyc-integration.md)
3. Check console for specific error messages
4. Test with the provided examples
5. Contact the development team with specific issues

---

**Remember**: The new system is backward compatible. You can migrate incrementally and run both systems in parallel during transition.