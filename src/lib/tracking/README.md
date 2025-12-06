# Financial Tools Tracking Module

This module provides privacy-compliant user tracking for financial tools, ensuring compliance with privacy regulations while gathering valuable analytics data.

## Features

- **Privacy-first**: Respects Do Not Track headers and requires explicit user consent
- **Session management**: Automatic session tracking with timeout handling
- **Event filtering**: Sensitive data filtering before sending to analytics
- **Tool-specific tracking**: Specialized tracking functions for each calculator
- **React integration**: Easy-to-use React hooks

## Installation

The tracking module is already integrated into the project. No additional installation required.

## Usage

### Basic Setup

1. Initialize tracking when your app starts:

```typescript
import { initializeTracking } from '@/lib/tracking';

// In your app initialization or _app.tsx
useEffect(() => {
  initializeTracking();
}, []);
```

2. Get user consent before tracking:

```typescript
import { setUserConsent } from '@/lib/tracking';

// When user accepts tracking cookies/consent
setUserConsent(true);
```

### Using with React Components

```typescript
import { useTracking } from '@/lib/tracking/useTracking';

function MyComponent() {
  const {
    isTrackingEnabled,
    trackPageView,
    savings,
    loan
  } = useTracking();

  useEffect(() => {
    // Track page view
    trackPageView('savings-calculator');
  }, []);

  const handleCalculate = async (params) => {
    // Perform calculation
    const result = await calculate(params);

    // Track calculation
    await savings.calculate(params);

    return result;
  };

  return (
    // Your component JSX
  );
}
```

### Tracking Events

#### Savings Calculator

```typescript
import { trackSavingsCalculator } from '@/lib/tracking';

// Track page view
await trackSavingsCalculator.pageView({ source: 'home-page' });

// Track filter changes
await trackSavingsCalculator.filterChange({
  amount: 10000000,
  period: 12,
  type: 'online'
});

// Track calculation
await trackSavingsCalculator.calculate({
  amount: 10000000,
  period: 12,
  type: 'online'
});

// Track sort changes
await trackSavingsCalculator.sortChange('interest_rate');

// Track click on open account
await trackSavingsCalculator.clickOpenAccount('Vietcombank');
```

#### Loan Calculator

```typescript
import { trackLoanCalculator } from '@/lib/tracking';

// Track user inputs
await trackLoanCalculator.inputAmount(50000000);
await trackLoanCalculator.inputPeriod(24);
await trackLoanCalculator.inputRate(9.5);

// Track calculation
await trackLoanCalculator.calculate({
  amount: 50000000,
  period: 24,
  rate: 9.5
});

// Track form submission
await trackLoanCalculator.formSubmit({
  amount: 50000000,
  period: 24,
  rate: 9.5,
  monthlyPayment: 2300000
});
```

#### Salary Calculator

```typescript
import { trackSalaryCalculator } from '@/lib/tracking';

// Track calculator type view
await trackSalaryCalculator.grossToNetView();
await trackSalaryCalculator.netToGrossView();

// Track inputs
await trackSalaryCalculator.inputAmount(15000000, 'gross');
await trackSalaryCalculator.inputDependents(2);
await trackSalaryCalculator.selectRegion('hanoi');

// Track calculation
await trackSalaryCalculator.calculate({
  amount: 15000000,
  type: 'gross',
  dependents: 2,
  region: 'hanoi'
});
```

### Higher-Order Component

For automatic page view tracking:

```typescript
import { withPageTracking } from '@/lib/tracking/useTracking';

// Wrap your component
const TrackedSavingsCalculator = withPageTracking(
  SavingsCalculator,
  'savings-calculator-page',
  { feature: 'financial-tools' }
);

// Use the wrapped component
export default TrackedSavingsCalculator;
```

### Form Tracking

For tracking multi-step forms:

```typescript
import { useFormTracking } from '@/lib/tracking/useTracking';

function LoanForm() {
  const { trackFormSubmit, trackFormStep } = useFormTracking('loan-calculator');

  const handleStep1 = (data) => {
    trackFormStep('amount-and-period', data);
  };

  const handleSubmit = async (formData) => {
    // Submit form
    await submitForm(formData);

    // Track submission
    trackFormSubmit(formData);
  };

  return (
    // Your form JSX
  );
}
```

## Privacy Features

### Data Filtering

The tracking module automatically filters sensitive data:

- Passwords
- Social security numbers
- Bank account numbers
- Credit card numbers
- Phone numbers
- Email addresses
- Full names
- Physical addresses
- ID numbers

Sensitive values are hashed rather than sent in plaintext.

### Consent Management

```typescript
import { hasUserConsent, setUserConsent, clearTrackingData } from '@/lib/tracking';

// Check if user has given consent
if (hasUserConsent()) {
  // Tracking is allowed
}

// Set user consent
setUserConsent(true); // or false

// Clear all tracking data
clearTrackingData();
```

### Do Not Track

The module respects browser Do Not Track settings if configured to do so.

## Configuration

Default configuration can be modified via environment variables:

```bash
# Enable/disable tracking
NEXT_PUBLIC_TRACKING_ENABLED=true

# API endpoint for tracking data
NEXT_PUBLIC_TRACKING_API_URL=https://your-api.com/tracking

# Service name for tracking
NEXT_PUBLIC_TRACKING_SERVICE_NAME=finzone
```

## API Integration

The module is designed to send tracking data to your analytics API. Update the `sendTrackingEvent` function in `events.ts` to integrate with your preferred analytics service:

```typescript
// Example integration with Google Analytics
import { gtag } from 'ga-gtag';

const sendTrackingEvent = async (event: TrackingEvent) => {
  gtag('event', event.event, {
    custom_parameter_1: event.data.someValue,
    custom_parameter_2: event.sessionId
  });
};
```

## Testing

The module includes development logging to help verify tracking events:

```typescript
// Events are logged in development mode
console.log('Tracking event:', event);
console.log('Tracking session initialized:', sessionData);
```

## Performance Considerations

- Tracking events are sent asynchronously and don't block UI
- Events are debounced to avoid excessive API calls
- Sensitive data filtering is performed client-side
- Session data is stored in sessionStorage/localStorage for persistence