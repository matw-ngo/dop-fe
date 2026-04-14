# Config Hooks

Centralized hooks for fetching configuration data used in forms and dropdowns.

## Structure

All config hooks follow the same pattern:
- Use React Query for caching and state management
- Return data in `ISelectBoxOption[]` format for form compatibility
- Cache for 30 minutes (config data rarely changes)
- Retry 2 times on failure

## Available Hooks

### API-backed Hooks ✅

These hooks fetch data from backend APIs:

```typescript
import { 
  useLoanPurposes,
  useIncomeSources,
  useEmploymentTypes 
} from "@/hooks/config";

// Fetch loan purposes from API
const { data: purposes = [], isLoading } = useLoanPurposes();

// Fetch income sources from API
const { data: sources = [], isLoading } = useIncomeSources();

// Fetch employment types from API
const { data: types = [], isLoading } = useEmploymentTypes();
```

**API Endpoints:**
- `GET /config/loan-purposes` → `useLoanPurposes()`
- `GET /config/income-sources` → `useIncomeSources()`
- `GET /config/employment-types` → `useEmploymentTypes()`

### Hard-coded Hooks 🔄

These hooks return hard-coded data but are structured to be easily replaced with API calls:

```typescript
import {
  useGenderOptions,
  useIncomeRanges,
  useCareerStatusOptions,
  useIncomeTypeOptions,
  useHavingLoanOptions,
  useCreditStatusOptions
} from "@/hooks/config";

// All follow the same pattern
const { data: options = [], isLoading } = useGenderOptions();
```

**Current Status:**
- ✅ Structure ready for API integration
- ⏳ Waiting for backend endpoints
- 📝 TODO comments indicate expected endpoints

## Migration Path

When backend endpoints become available:

### Before (Hard-coded):
```typescript
// src/hooks/config/use-gender-options.ts
const GENDER_OPTIONS: ISelectBoxOption[] = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
  { label: "Khác", value: "other" },
];

async function getGenderOptions() {
  return Promise.resolve(GENDER_OPTIONS);
}
```

### After (API-backed):
```typescript
// src/hooks/config/use-gender-options.ts
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type ConfigOption = components["schemas"]["ConfigOption"];

async function getGenderOptions() {
  const { data, error, response } = await dopClient.GET("/config/gender-options");
  
  if (error) {
    throw new Error(`Failed to fetch gender options: ${response.status}`);
  }
  
  return data.data;
}

export function useGenderOptions() {
  return useQuery<ConfigOption[], Error, ISelectBoxOption[]>({
    queryKey: ["config", "gender-options"],
    queryFn: getGenderOptions,
    select: (data) => data.map(opt => ({ label: opt.name, value: opt.code })),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
}
```

**No changes needed in consuming code!** 🎉

## Usage in Forms

```typescript
import { useFormOptions } from "@/hooks/form-options";

function MyForm() {
  const formOptions = useFormOptions();
  
  if (formOptions.isLoading) {
    return <Loading />;
  }
  
  return (
    <form>
      <Select options={formOptions.genderOptions} />
      <Select options={formOptions.incomeOptions} />
      <Select options={formOptions.careerStatusOptions} />
      {/* ... */}
    </form>
  );
}
```

## Benefits

1. **Centralized**: All config data in one place
2. **Consistent**: Same pattern for all options
3. **Cacheable**: React Query handles caching automatically
4. **Type-safe**: TypeScript ensures correct usage
5. **Future-proof**: Easy to migrate from hard-coded to API
6. **Testable**: Easy to mock in tests

## Adding New Config Options

1. Create new hook file: `use-{name}-options.ts`
2. Follow the existing pattern
3. Export from `index.ts`
4. Add to `useFormOptions()` if needed for forms
5. Document expected API endpoint in TODO comment

Example:
```typescript
// src/hooks/config/use-marital-status-options.ts
import { useQuery } from "@tanstack/react-query";
import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * TODO: Replace with API call when available
 * Expected endpoint: GET /config/marital-status-options
 */
const MARITAL_STATUS_OPTIONS: ISelectBoxOption[] = [
  { label: "Độc thân", value: "single" },
  { label: "Đã kết hôn", value: "married" },
];

async function getMaritalStatusOptions() {
  return Promise.resolve(MARITAL_STATUS_OPTIONS);
}

export function useMaritalStatusOptions() {
  return useQuery<ISelectBoxOption[], Error>({
    queryKey: ["config", "marital-status-options"],
    queryFn: getMaritalStatusOptions,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
}
```

## Testing

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGenderOptions } from "./use-gender-options";

test("should return gender options", async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  const { result } = renderHook(() => useGenderOptions(), { wrapper });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(result.current.data).toHaveLength(3);
  expect(result.current.data[0]).toEqual({ label: "Nam", value: "male" });
});
```
