# Event Tracking Usage Example

This example demonstrates how to use the event tracking feature in the form generation library.

## Basic Usage

```tsx
import React from 'react';
import { FormTrackingProvider } from '@/components/form-generation/tracking';
import { LibTrackingAdapter } from '@/components/form-generation/tracking/adapters/LibTrackingAdapter';
import { DynamicForm, FieldType } from '@/components/form-generation';

// Create tracking backend instance
const trackingBackend = new LibTrackingAdapter();

// Form configuration with tracking
const loanFormConfig = {
  id: 'loan-application',
  fields: [
    {
      id: 'full_name',
      name: 'fullName',
      type: FieldType.TEXT,
      label: 'Họ và tên',

      // Tracking configuration
      tracking: {
        trackInput: {
          eventName: 'lending_page_input_name',
          debounce: 300, // Debounce for 300ms to avoid too many events
        },
        trackValidation: {
          eventName: 'lending_page_input_name_valid',
        },
      },
      validation: [{ type: 'required' }],
    },
    {
      id: 'national_id',
      name: 'nationalId',
      type: FieldType.TEXT,
      label: 'Căn cước công dân',

      tracking: {
        trackInput: {
          eventName: 'lending_page_input_nid',
          debounce: 300,
          // Transform value to avoid logging sensitive data
          transformValue: (value) => ({
            hasValue: !!value,
            length: value?.length || 0,
            // Don't log the actual ID number
          }),
        },
        trackValidation: {
          eventName: 'lending_page_input_nid_valid',
        },
      },
      validation: [
        { type: 'required' },
        { type: 'minLength', value: 9 },
        { type: 'maxLength', value: 12 },
      ],
    },
    {
      id: 'province',
      name: 'province',
      type: FieldType.SELECT,
      label: 'Tỉnh thành',

      tracking: {
        trackSelection: {
          eventName: 'lending_page_select_province',
          metadata: {
            step: 'personal_info',
            category: 'location',
          },
        },
      },
      options: {
        choices: [
          { label: 'Hà Nội', value: 'hanoi' },
          { label: 'TP. Hồ Chí Minh', value: 'hcm' },
          { label: 'Đà Nẵng', value: 'danang' },
          // ... more options
        ],
      },
    },
    {
      id: 'monthly_income',
      name: 'monthlyIncome',
      type: FieldType.NUMBER,
      label: 'Thu nhập hàng tháng (VND)',

      tracking: {
        trackInput: {
          eventName: 'lending_page_input_income',
          debounce: 500,
          transformValue: (value) => {
            // Categorize income ranges instead of exact values
            if (!value) return { range: 'empty' };
            if (value < 5000000) return { range: 'under_5m' };
            if (value < 10000000) return { range: '5m_to_10m' };
            if (value < 20000000) return { range: '10m_to_20m' };
            return { range: 'over_20m' };
          },
          metadata: {
            currency: 'VND',
            frequency: 'monthly',
          },
        },
        trackValidation: {
          eventName: 'lending_page_input_income_valid',
        },
      },
      validation: [{ type: 'required' }],
    },
    {
      id: 'agree_terms',
      name: 'agreeTerms',
      type: FieldType.CHECKBOX,
      label: 'Tôi đồng ý với điều khoản vay',

      tracking: {
        trackSelection: {
          eventName: 'lending_page_agree_terms',
          metadata: {
            legal: 'terms_and_conditions',
            required: true,
          },
        },
      },
      options: {
        checkboxLabel: 'Tôi đã đọc và đồng ý với các điều khoản',
      },
    },
  ],
};

export default function LoanApplicationForm() {
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    // Process loan application
  };

  return (
    <FormTrackingProvider backend={trackingBackend} enabled={true}>
      <div className="loan-application-form">
        <h1>Đơn đăng ký vay vốn</h1>

        <DynamicForm
          config={loanFormConfig}
          onSubmit={handleSubmit}
        />
      </div>
    </FormTrackingProvider>
  );
}
```

## Advanced Usage with Custom Tracking

```tsx
import { FormTrackingProvider, TrackingBackend } from '@/components/form-generation/tracking';

// Custom tracking backend that sends to multiple services
class MultiServiceTrackingBackend implements TrackingBackend {
  private services: TrackingBackend[];

  constructor(services: TrackingBackend[]) {
    this.services = services;
  }

  trackEvent(eventName: string, data: Record<string, any>): void {
    // Send to all tracking services
    this.services.forEach(service => {
      try {
        service.trackEvent(eventName, data);
      } catch (error) {
        console.error('Tracking service error:', error);
      }
    });
  }

  trackField(event: FieldTrackingEvent): void {
    // Send to all tracking services
    this.services.forEach(service => {
      try {
        service.trackField(event);
      } catch (error) {
        console.error('Tracking service error:', error);
      }
    });
  }
}

// Custom field tracking logic
const customFieldConfig = {
  id: 'special_field',
  name: 'specialField',
  type: FieldType.TEXT,
  label: 'Special Field',

  tracking: {
    // Custom tracking function for complex logic
    customTracking: (event) => {
      // Custom tracking logic
      if (event.eventType === 'input') {
        // Track input length over time
        console.log(`Field ${event.fieldName} has ${event.value?.length || 0} characters`);
      }

      // You can still call your own tracking service here
      window.gtag?.('event', 'custom_field_interaction', {
        field_name: event.fieldName,
        event_type: event.eventType,
        custom_property: 'special_tracking',
      });
    },

    // You can combine custom tracking with standard tracking
    trackInput: {
      eventName: 'standard_input_event',
      debounce: 200,
    },
  },
};

// Usage with custom backend
const customBackend = new MultiServiceTrackingBackend([
  new LibTrackingAdapter(),
  // Add other tracking backends here
]);

export function CustomTrackingForm() {
  return (
    <FormTrackingProvider
      backend={customBackend}
      enabled={process.env.NODE_ENV === 'production'}
    >
      <DynamicForm
        config={{
          fields: [customFieldConfig],
        }}
        onSubmit={(data) => console.log(data)}
      />
    </FormTrackingProvider>
  );
}
```

## Conditional Tracking

```tsx
// Track based on user consent
const hasTrackingConsent = getUserConsent(); // Your consent management

export function ConsentAwareForm() {
  return (
    <FormTrackingProvider
      backend={trackingBackend}
      enabled={hasTrackingConsent}
    >
      <DynamicForm config={formConfig} onSubmit={handleSubmit} />
    </FormTrackingProvider>
  );
}
```

## Testing Tracking

```tsx
import { render, fireEvent } from '@testing-library/react';
import { FormTrackingProvider } from '@/components/form-generation/tracking';

// Mock tracking backend
const mockBackend = {
  trackEvent: jest.fn(),
  trackField: jest.fn(),
};

describe('Form Tracking', () => {
  it('should track field interactions', () => {
    render(
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        <TrackedForm />
      </FormTrackingProvider>
    );

    // Get the input field
    const input = screen.getByLabelText('Full Name');

    // Type in the field
    fireEvent.change(input, { target: { value: 'John Doe' } });

    // Blur the field
    fireEvent.blur(input);

    // Verify tracking was called
    expect(mockBackend.trackEvent).toHaveBeenCalledWith('input_event', {
      field_id: 'full_name',
      field_name: 'fullName',
      value: 'John Doe',
    });
  });
});
```

## Best Practices

1. **Debounce Input Events**: Use debounce for text inputs to avoid sending too many events
2. **Transform Sensitive Data**: Never log PII (Personally Identifiable Information)
3. **Use Metadata**: Add context to events with metadata
4. **Respect User Consent**: Disable tracking for users who haven't consented
5. **Test Thoroughly**: Mock tracking in tests to avoid actual API calls
6. **Category Events**: Use consistent naming conventions for events
7. **Handle Errors**: Wrap tracking calls in try-catch blocks in custom backends

## Event Naming Convention

Follow a consistent pattern for event names:

- `lending_page_input_{field_name}` - Input events
- `lending_page_input_{field_name}_valid` - Validation success
- `lending_page_select_{field_name}` - Selection events
- `lending_page_blur_{field_name}` - Blur events
- `lending_page_form_submit` - Form submission
- `lending_page_step_{step_name}` - Multi-step form navigation