# eKYC Integration with Form Generation

## Overview

This guide explains how to integrate eKYC (electronic Know Your Customer) verification into your forms using the form generation library. The implementation provides a provider-agnostic system that allows switching between different eKYC providers (VNPT, CitizenID, AWS, etc.) without changing your form configuration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Field Configuration](#field-configuration)
4. [Render Modes](#render-modes)
5. [Provider Configuration](#provider-configuration)
6. [Auto-fill Mapping](#auto-fill-mapping)
7. [Examples](#examples)
8. [Advanced Usage](#advanced-usage)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Install Required Packages

```bash
# The form generation library should already be installed
# eKYC is integrated as a built-in field type

# Install VNPT eKYC SDK (if using VNPT provider)
# The SDK is loaded dynamically, no need to install
```

### 2. Initialize the Verification System

```tsx
// In your app initialization (e.g., _app.tsx)
import { initializeVerification } from "@/lib/verification/init";

// Initialize the verification system
const isInitialized = await initializeVerification();
if (!isInitialized) {
  console.error("Failed to initialize verification system");
}
```

### 3. Add eKYC Field to Your Form

```tsx
import { DynamicForm } from "@/components/form-generation";
import { FieldType } from "@/components/form-generation/types";

const formConfig = {
  id: "my-form",
  fields: [
    {
      id: "identity_verification",
      name: "identity_verification",
      type: FieldType.EKYC,
      label: "Identity Verification",

      verification: {
        provider: "vnpt",
        providerOptions: {
          documentType: "CCCD_CHIP",
          flowType: "DOCUMENT_TO_FACE",
        },
        autofillMapping: {
          "full_name": "fullName",
          "id_number": "idNumber",
        },
      },
    },
  ],
};

<DynamicForm config={formConfig} />
```

## Architecture

### Provider Abstraction Layer

The eKYC system uses a provider abstraction pattern that allows:

- **Provider Independence**: Switch providers without changing form code
- **Consistent API**: All providers implement the same interface
- **Easy Testing**: Mock providers for testing
- **Future-Proof**: Add new providers easily

```
Form ──► EkycField ──► VerificationManager ──► VerificationProvider
                                       │
                                       ├── VNPTProvider
                                       ├── CitizenIDProvider
                                       ├── AWSProvider
                                       └── CustomProvider
```

### Data Flow

1. **Initialization**: Provider is registered with configuration
2. **User Trigger**: User clicks verification button
3. **Verification**: Provider handles the verification process
4. **Result**: Normalized result is returned
5. **Auto-fill**: Form fields are populated with verified data
6. **Completion**: Form can be submitted with verified data

## Field Configuration

### Basic eKYC Field

```tsx
{
  id: "ekyc_field",
  name: "ekyc_field",
  type: FieldType.EKYC,
  label: "Identity Verification",

  verification: {
    provider: "vnpt",                     // Required: Provider name
    providerOptions: {                   // Optional: Provider-specific options
      documentType: "CCCD_CHIP",         // Document type
      flowType: "DOCUMENT_TO_FACE",     // Verification flow
      enableLiveness: true,              // Enable liveness detection
      enableFaceMatch: true,             // Enable face comparison
    },
    autofillMapping: {                   // Required: Map results to form fields
      "full_name": "fullName",
      "id_number": "idNumber",
      "address": "address.fullAddress",
    },
  },
}
```

### Complete Configuration Options

```tsx
{
  id: "ekyc_field",
  name: "ekyc_field",
  type: FieldType.EKYC,
  renderMode: "button",                  // "button" | "inline" | "modal" | "custom"

  verification: {
    // Provider configuration
    provider: "vnpt",
    providerOptions: {
      documentType: "CCCD_CHIP",
      flowType: "DOCUMENT_TO_FACE",
      enableLiveness: true,
      enableFaceMatch: true,
      enableAuthenticityCheck: true,
      metadata: { customField: "value" },
    },

    // Auto-fill configuration
    autofillMapping: {
      "form_field_id": "personalData.field",
      "nested_field": "address.city",
    },

    // Callbacks
    onVerified: (result) => {
      console.log("Verified:", result);
      // Track event, update state, etc.
    },
    onError: (error) => {
      console.error("Verification failed:", error);
      // Handle error, show message, etc.
    },

    // UI configuration
    buttonText: "Verify Identity",
    required: false,                       // Require verification before submit
    confidenceThreshold: 70,              // Min confidence to accept
    showResultPreview: true,              // Show verification result
    allowManualOverride: false,           // Allow editing verified data

    // Modal configuration (for modal mode)
    modalConfig: {
      title: "Identity Verification",
      size: "lg",                          // "sm" | "md" | "lg" | "xl"
      closeOnOverlayClick: false,
    },

    // UI behavior
    uiConfig: {
      theme: "light",                      // "light" | "dark"
      showProgress: true,
      allowRetry: true,
      maxRetries: 3,
    },
  },

  // Custom render function (for custom mode)
  customRender: ({ startVerification, isVerifying, result }) => (
    <MyCustomUI
      onVerify={startVerification}
      loading={isVerifying}
      result={result}
    />
  ),
}
```

## Render Modes

### Button Mode (Default)

Shows a simple button that triggers verification:

```tsx
{
  renderMode: "button",
  verification: {
    buttonText: "Verify Identity",
  },
}
```

### Inline Mode

Embedded verification UI within the form:

```tsx
{
  renderMode: "inline",
  verification: {
    uiConfig: {
      showProgress: true,
    },
  },
}
```

### Modal Mode

Opens verification in a modal dialog:

```tsx
{
  renderMode: "modal",
  verification: {
    modalConfig: {
      title: "Identity Verification",
      size: "lg",
    },
  },
}
```

### Custom Mode

Provide your own UI component:

```tsx
{
  renderMode: "custom",
  customRender: ({ startVerification, isVerifying, result }) => (
    <div>
      {isVerifying ? (
        <LoadingSpinner />
      ) : result ? (
        <SuccessDisplay result={result} />
      ) : (
        <button onClick={startVerification}>
          Custom Verification Button
        </button>
      )}
    </div>
  ),
}
```

## Provider Configuration

### VNPT Provider

Currently, only VNPT provider is implemented. It supports:

- **Document Types**: CCCD_CHIP, CCCD_NO_CHIP, CMND_12, CMND_9, PASSPORT, etc.
- **Flow Types**: DOCUMENT_TO_FACE, FACE_TO_DOCUMENT, DOCUMENT, FACE
- **Features**: Liveness detection, face comparison, authenticity check

### Environment Variables

```bash
# Required for VNPT provider
NEXT_PUBLIC_EKYC_AUTH_TOKEN=your_auth_token
NEXT_PUBLIC_EKYC_BACKEND_URL=https://api.idg.vnpt.vn
NEXT_PUBLIC_EKYC_TOKEN_KEY=your_token_key
NEXT_PUBLIC_EKYC_TOKEN_ID=your_token_id
```

### Adding Custom Providers

1. Implement the `VerificationProvider` interface:

```tsx
import type { VerificationProvider } from "@/lib/verification/types";

export class MyCustomProvider implements VerificationProvider {
  readonly name = "custom";
  readonly version = "1.0.0";

  readonly capabilities = {
    supportedDocuments: ["PASSPORT"],
    supportedFlows: ["DOCUMENT"],
    hasLivenessDetection: false,
    hasFaceComparison: false,
    hasAuthenticityCheck: false,
  };

  async initialize(config: ProviderConfig): Promise<void> {
    // Initialize your provider
  }

  async startVerification(options: VerificationOptions): Promise<VerificationSession> {
    // Start verification
  }

  // ... implement other required methods
}
```

2. Register your provider:

```tsx
import { verificationManager } from "@/lib/verification";
import { MyCustomProvider } from "./MyCustomProvider";

const provider = new MyCustomProvider();
await verificationManager.registerProvider("custom", provider);
```

## Auto-fill Mapping

### Basic Mapping

Map verification results to form fields:

```tsx
autofillMapping: {
  "form_field_id": "personalData.fieldName",
}
```

### Supported Personal Data Fields

- `fullName` - Full name
- `dateOfBirth` - Date of birth (ISO format)
- `gender` - Gender ("male" | "female" | "other")
- `nationality` - Nationality
- `idNumber` - ID number
- `address.fullAddress` - Complete address
- `address.city` - City/Province
- `address.district` - District
- `address.ward` - Ward
- `documentType` - Document type
- `issuedDate` - Issue date (ISO format)
- `expiryDate` - Expiry date (ISO format)
- `issuedBy` - Issuing authority

### Nested Field Access

Use dot notation for nested fields:

```tsx
autofillMapping: {
  "full_name": "fullName",
  "home_address": "address.fullAddress",
  "city_only": "address.city",
  "doc_type": "documentType",
}
```

## Examples

### Simple Identity Verification Form

```tsx
import { DynamicForm } from "@/components/form-generation";
import { FieldType } from "@/components/form-generation/types";

export function SimpleIdVerification() {
  const config = {
    id: "id-verification",
    fields: [
      {
        id: "verify_identity",
        type: FieldType.EKYC,
        verification: {
          provider: "vnpt",
          providerOptions: {
            documentType: "CCCD_CHIP",
            flowType: "DOCUMENT_TO_FACE",
          },
          autofillMapping: {
            "name": "fullName",
            "id_no": "idNumber",
            "dob": "dateOfBirth",
          },
        },
      },
      {
        id: "name",
        type: FieldType.TEXT,
        label: "Full Name",
        readOnly: true,
      },
      {
        id: "id_no",
        type: FieldType.TEXT,
        label: "ID Number",
        readOnly: true,
      },
      {
        id: "dob",
        type: FieldType.DATE,
        label: "Date of Birth",
        readOnly: true,
      },
    ],
  };

  return <DynamicForm config={config} />;
}
```

### Loan Application with eKYC

See the complete example in `src/components/form-generation/examples/EkycFormExample.tsx`

### Multi-step Wizard with eKYC

```tsx
const wizardConfig = {
  id: "loan-wizard",
  steps: [
    {
      id: "identity",
      title: "Identity Verification",
      fields: [
        {
          id: "ekyc",
          type: FieldType.EKYC,
          renderMode: "modal",
          verification: {
            provider: "vnpt",
            required: true,
            autofillMapping: {
              "applicant_name": "fullName",
              "applicant_id": "idNumber",
            },
          },
        },
      ],
      validation: {
        customValidator: (data) => {
          if (!data.ekyc?.verified) {
            return "Identity verification required";
          }
          return true;
        },
      },
    },
    // ... other steps
  ],
};
```

## Advanced Usage

### Custom Validation

```tsx
validation: {
  customValidator: async (data) => {
    // Check if eKYC is verified
    if (!data.identity_verification?.verified) {
      return "Please verify your identity";
    }

    // Check confidence score
    if (data.identity_verification?.confidence < 80) {
      return "Verification confidence too low. Please try again.";
    }

    // Check document expiry
    if (data.id_expiry_date && new Date(data.id_expiry_date) < new Date()) {
      return "ID document has expired";
    }

    return true;
  },
}
```

### Tracking Events

```tsx
verification: {
  onVerified: (result) => {
    // Track successful verification
    analytics.track("ekyc_success", {
      provider: result.provider.name,
      confidence: result.verificationData.confidence,
      duration: result.processing.totalDuration,
      documentType: result.personalData.documentType,
    });
  },
  onError: (error) => {
    // Track verification errors
    analytics.track("ekyc_error", {
      error: error.message,
      provider: "vnpt",
    });
  },
}
```

### Conditional Fields

Show/hide fields based on verification:

```tsx
const formFields = [
  {
    id: "ekyc_verification",
    type: FieldType.EKYC,
    // ... eKYC config
  },
  {
    id: "manual_id_input",
    type: FieldType.TEXT,
    label: "ID Number",
    dependencies: [
      {
        conditions: [
          {
            fieldId: "ekyc_verification",
            operator: "equals",
            value: null,
          },
        ],
        action: "show",
      },
    ],
  },
];
```

## Security Considerations

### Data Privacy

- All biometric data is encrypted in transit and at rest
- Data automatically expires after 30 minutes
- No sensitive data is stored in localStorage
- Vietnamese Decree 13/2023 compliant

### Best Practices

1. **Always use HTTPS** for production
2. **Validate user consent** before starting verification
3. **Implement rate limiting** to prevent abuse
4. **Log verification attempts** for audit trails
5. **Handle errors gracefully** without exposing sensitive info

### Environment Configuration

```tsx
// Use environment-specific configs
const config = {
  development: {
    provider: "vnpt",
    environment: "development",
    allowTestCards: true,
  },
  production: {
    provider: "vnpt",
    environment: "production",
    strictValidation: true,
  },
};
```

## Troubleshooting

### Common Issues

#### 1. "Provider not found" Error

**Solution**: Ensure provider is initialized before rendering the form:

```tsx
// Initialize in app startup
await initializeVerification();

// Or check before rendering
const isReady = await verificationManager.healthCheck();
```

#### 2. Verification fails with "Low confidence"

**Solution**:
- Check lighting conditions
- Ensure document is not damaged
- Try different document type
- Adjust confidence threshold

#### 3. Auto-fill not working

**Solution**:
- Verify field IDs match exactly
- Check mapping paths are correct
- Ensure target fields are not disabled by validation

#### 4. Modal doesn't close after verification

**Solution**:
- Check if `closeOnOverlayClick` is configured
- Ensure modal state is properly updated
- Verify the `onVerified` callback doesn't prevent close

### Debug Mode

Enable debug logging:

```tsx
// In development
if (process.env.NODE_ENV === "development") {
  window.ekycDebug = true;
}
```

### Getting Help

1. Check browser console for errors
2. Verify environment variables
3. Test with different documents
4. Review provider documentation
5. Check network requests in dev tools

### Performance Tips

1. **Load SDK lazily**: SDK loads only when needed
2. **Cache results**: Store verification results in memory
3. **Optimize images**: Compress document images
4. **Use CDN**: Host SDK files on CDN
5. **Batch requests**: Minimize API calls

---

## API Reference

### FieldType.EKYC

The eKYC field type configuration extends `BaseFieldConfig` with:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `renderMode` | `"button" \| "inline" \| "modal" \| "custom"` | No | How to render the field |
| `verification` | `EkycVerificationConfig` | Yes | Verification configuration |
| `customRender` | `function` | No (if mode != custom) | Custom render function |

### EkycVerificationConfig

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `provider` | `string` | Yes | - | Provider name |
| `providerOptions` | `object` | No | {} | Provider-specific options |
| `autofillMapping` | `object` | Yes | - | Map results to form fields |
| `onVerified` | `function` | No | - | Success callback |
| `onError` | `function` | No | - | Error callback |
| `buttonText` | `string` | No | "Verify Identity" | Button text |
| `required` | `boolean` | No | false | Require verification |
| `confidenceThreshold` | `number` | No | 70 | Min confidence |
| `showResultPreview` | `boolean` | No | false | Show results |
| `allowManualOverride` | `boolean` | No | false | Allow edits |
| `modalConfig` | `object` | No | - | Modal options |
| `uiConfig` | `object` | No | - | UI behavior |

### VerificationResult

The normalized verification result contains:

```tsx
interface VerificationResult {
  success: boolean;
  sessionId: string;
  provider: {
    name: string;
    version: string;
  };
  personalData: {
    fullName?: string;
    dateOfBirth?: string;
    // ... other fields
  };
  verificationData: {
    confidence: number;
    livenessScore?: number;
    faceMatchScore?: number;
    // ... other scores
  };
  processing: {
    totalDuration: number;
    steps: Record<string, number>;
    retryCount: number;
  };
  // ... other properties
}
```

---

## Changelog

### v1.0.0
- Initial release
- VNPT provider integration
- Support for multiple render modes
- Auto-fill functionality
- Provider abstraction layer