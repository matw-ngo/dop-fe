# Insurance Components

This directory contains React components for the Insurance feature.

## Components

### InsuranceSearchBar

A comprehensive search bar component for insurance products with auto-complete, recent searches, and popular suggestions.

#### Features

- Debounced search input (300ms by default)
- Auto-complete suggestions from insurance products and categories
- Recent searches with localStorage persistence
- Popular searches section
- Keyboard navigation support
- Loading states
- Analytics tracking integration
- Responsive design with shadcn/ui components

#### Props

```typescript
interface SearchBarProps {
  value?: string;                    // Controlled input value
  onChange?: (value: string) => void; // Value change handler
  onSearch?: (value: string) => void; // Search submit handler
  placeholder?: string;              // Input placeholder text
  className?: string;                // Custom CSS classes
  showRecentSearches?: boolean;      // Show/hide recent searches
  showSuggestions?: boolean;         // Show/hide suggestions
  debounceMs?: number;              // Debounce delay in milliseconds
  suggestions?: string[];           // External suggestions array
  recentSearches?: string[];        // External recent searches
  loading?: boolean;                // External loading state
}
```

#### Usage

```tsx
import { InsuranceSearchBar } from '@/components/features/insurance';

function InsurancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    // Perform search...
    setIsLoading(false);
  };

  return (
    <InsuranceSearchBar
      value={searchQuery}
      onChange={setSearchQuery}
      onSearch={handleSearch}
      loading={isLoading}
      placeholder="Tìm kiếm bảo hiểm..."
    />
  );
}
```

#### Internationalization

The component uses the following translation keys:

- `pages.insurance.searchPlaceholder`
- `pages.insurance.searchSuggestions`
- `pages.insurance.suggestions`
- `pages.insurance.searching`
- `pages.insurance.recentSearches`
- `pages.insurance.clear`
- `pages.insurance.noSuggestions`
- `pages.insurance.trySearchingFor`

#### Analytics

The component automatically tracks search queries using Google Analytics via the `ANALYTICS_EVENTS.SEARCH_QUERY` event.

#### Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatible