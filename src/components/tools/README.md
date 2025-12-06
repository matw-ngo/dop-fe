# Savings Calculator Component

A comprehensive React component for comparing savings rates from different Vietnamese banks. Built with shadcn/ui components and integrated with the financial tools store.

## Features

- **Amount Selection**: Interactive slider and input field for selecting savings amount (10M - 1B VND)
- **Period Selection**: Dropdown for choosing savings duration (1, 3, 6, 9, 12, 18, 24 months)
- **Savings Type**: Toggle between Online and Counter savings types
- **Sorting Options**: Sort results by interest rate (ascending/descending)
- **Results Display**:
  - Tabular view of bank comparisons
  - Highlighting of best and lowest rates
  - Pagination for large result sets
  - Summary statistics
  - External links to bank applications
- **Loading States**: Skeleton loaders during data fetching
- **Error Handling**: Error messages with retry functionality
- **Responsive Design**: Mobile-friendly layout with adaptive grid

## Usage

```tsx
import { SavingsCalculator } from '@/components/tools';

function MyPage() {
  return (
    <div className="container">
      <h1>Financial Tools</h1>
      <SavingsCalculator />
    </div>
  );
}
```

## Props

The component accepts an optional `className` prop for custom styling:

```tsx
<SavingsCalculator className="max-w-4xl mx-auto" />
```

## State Management

The component uses the `useFinancialToolsStore` hook from the financial tools store to manage:
- Savings calculation parameters
- Results data
- Loading and error states
- Calculation history

## Data Structure

### ISavingsParams
```typescript
{
  amount: number;        // Initial deposit amount
  period: number;        // Savings period in months
  type: 'counter' | 'online';
  orderBy: 'rate_asc' | 'rate_desc';
}
```

### ISavingsResult
```typescript
{
  savings: ISaving[];    // Array of bank offerings
  minRate: number;       // Minimum interest rate
  maxRate: number;       // Maximum interest rate
  totalCount: number;    // Total number of offerings
}
```

### ISaving
```typescript
{
  name: string;          // Bank code
  full_name: string;     // Full bank name
  interested: number;    // Number of interested users
  ir: number;           // Interest rate percentage
  total: number;        // Total amount after period
  interest: number;     // Interest earned
  link: string;         // Bank application link
}
```

## Customization

### Changing Defaults
Modify the `SAVINGS_DEFAULTS` constant in the component to adjust:
- Minimum/maximum amounts
- Default amount
- Period options
- Step increments

### Adding Banks
Update the mock data in `fetchSavingsData` function or integrate with your API endpoint.

### Styling
The component uses Tailwind CSS classes. Override styles by:
1. Passing a custom `className` prop
2. Modifying the component's internal classes
3. Using CSS overrides

## Testing

The component includes comprehensive tests using Vitest and React Testing Library:

```bash
# Run tests
npm test src/components/tools/SavingsCalculator

# Run tests in watch mode
npm test src/components/tools/SavingsCalculator -- --watch
```

## Integration

To integrate with a real API:

1. Replace the `fetchSavingsData` function with an actual API call
2. Add error handling for network errors
3. Implement caching for frequently accessed data
4. Add real-time rate updates if needed

## Dependencies

- React 18+
- shadcn/ui components
- Tailwind CSS
- Zustand (for state management)
- Lucide React (for icons)