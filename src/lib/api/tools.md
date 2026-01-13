# Financial Tools API Client

This module provides API client functions for the financial tools feature, including savings calculator, salary calculator, and interest rates fetching.

## API Functions

### calculateSavings

Calculates savings comparisons across different banks based on input parameters.

```typescript
import { calculateSavings } from '@/lib/api/tools';
import type { ISavingsParams } from '@/types/tools';

const params: ISavingsParams = {
  amount: 10000000,        // Initial deposit amount
  period: 12,              // Savings period in months
  type: 'online',          // 'online' | 'counter'
  orderBy: 'rate_desc'     // 'rate_asc' | 'rate_desc'
};

try {
  const result = await calculateSavings(params);
  console.log(result.savings);  // Array of bank offerings
  console.log(result.minRate);  // Minimum interest rate
  console.log(result.maxRate);  // Maximum interest rate
} catch (error) {
  console.error('Failed to calculate savings:', error);
}
```

### calculateSalary

Calculates salary breakdown (gross to net or net to gross).

```typescript
import { calculateSalary } from '@/lib/api/tools';

// Gross to net calculation
const grossResult = await calculateSalary({
  gross: 15000000,
  period: 'monthly',
  dependents: 1,
  region: 'HN'  // Optional region code
});

// Net to gross calculation
const netResult = await calculateSalary({
  net: 12000000,
  period: 'monthly',
  dependents: 0
});
```

### fetchInterestRates

Fetches current bank interest rates for display purposes.

```typescript
import { fetchInterestRates } from '@/lib/api/tools';

try {
  const rates = await fetchInterestRates();
  rates.forEach(bank => {
    console.log(`${bank.bank} - ${bank.bankCode}`);
    bank.savingsRates.forEach(rate => {
      console.log(`  ${rate.term}: ${rate.rate}%`);
    });
  });
} catch (error) {
  console.error('Failed to fetch interest rates:', error);
}
```

## Error Handling

All API functions throw structured `ToolsApiError` objects on failure:

```typescript
try {
  await calculateSavings(params);
} catch (error) {
  if (error.code === 'INVALID_PARAMS') {
    // Handle invalid parameters
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
  }
  console.error(error.message);
  console.error(error.details);
}
```

## Response Structure

### Savings Result (ISavingsResult)
```typescript
{
  savings: ISaving[],        // Array of bank offerings
  minRate: number,          // Minimum interest rate
  maxRate: number,          // Maximum interest rate
  totalCount: number        // Total number of offerings
}
```

### Salary Result (ISalary)
```typescript
{
  gross: number,                    // Gross salary
  net: number,                      // Net salary
  social_insurance: number,         // Employee SI contribution
  health_insurance: number,         // Employee HI contribution
  unemployment_insurance: number,   // Employee UI contribution
  total_insurance: number,          // Total employee contributions
  family_allowances: number,        // Family allowances
  dependent_family_allowances: number, // Dependent allowances
  taxable_income: number,           // Taxable income
  income: number,                   // Income after deductions
  personal_income_tax: number[],    // Tax by bracket
  total_personal_income_tax: number, // Total tax
  org_social_insurance: number,     // Employer SI contribution
  org_health_insurance: number,     // Employer HI contribution
  org_unemployment_insurance: number, // Employer UI contribution
  total_org_payment: number         // Total cost to employer
}
```

### Interest Rates Response
```typescript
Array<{
  bank: string,
  bankCode: string,
  savingsRates: Array<{
    term: string,
    rate: number,
    minAmount?: number,
    type: 'online' | 'counter'
  }>,
  lastUpdated: string
}>
```

## Best Practices

1. **Use withRetry for critical operations**:
   ```typescript
   import { withRetry } from '@/lib/api/client';

   const result = await withRetry(() => calculateSavings(params));
   ```

2. **Handle loading states in components**:
   ```typescript
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState(null);

   const handleCalculate = async () => {
     setLoading(true);
     try {
       const result = await calculateSavings(params);
       setData(result);
     } catch (error) {
       // Error is already shown in toast by the API function
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Debounce user inputs**:
   ```typescript
   import { debounce } from 'lodash-es';

   const debouncedCalculate = debounce(async (params) => {
     await calculateSavings(params);
   }, 500);
   ```

## Environment Configuration

The API endpoints use the same configuration as the main API client:
- Development: `http://localhost:3001/api`
- Staging: `https://dop-stg.datanest.vn/`
- Production: `https://api.dop-fe.com/`

Make sure your environment variables are set correctly if using custom endpoints.