# RelatedProducts Component

A React component that displays related insurance products based on a current product using a smart similarity algorithm.

## Features

- **Smart Algorithm**: Calculates product similarity based on:
  - Same insurance category (highest weight)
  - Same issuer/provider
  - Similar coverage ranges
  - Similar premium ranges
  - Product ratings and popularity
- **Responsive Design**: Grid layout on desktop, carousel/slider on mobile
- **Customizable**: Configurable title, max products, and navigation options
- **Loading States**: Skeleton loaders and empty states
- **Vietnamese Localization**: Full support for Vietnamese translations
- **Accessibility**: ARIA labels and keyboard navigation

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentProduct` | `InsuranceProduct` | (required) | The current insurance product to find related products for |
| `maxProducts` | `number` | `6` | Maximum number of related products to display |
| `title` | `string` | `"Sản phẩm liên quan"` | Custom title for the section |
| `showViewAll` | `boolean` | `true` | Whether to show the "View All" button |
| `viewAllLink` | `string` | `/insurance/category/${category}` | Custom link for "View All" button |
| `onProductClick` | `function` | `undefined` | Callback when a product card is clicked |
| `className` | `string` | `undefined` | Additional CSS classes for styling |

## Similarity Algorithm

The component uses a weighted scoring system to determine related products:

1. **Same Category** (40 points): Products in the same insurance category
2. **Same Issuer** (25 points): Products from the same insurance company
3. **Similar Coverage** (10-20 points): Based on coverage limit similarity
4. **Similar Premium** (15 points): Premium within 30% of current product
5. **Same Type** (10 points): Both compulsory or voluntary insurance
6. **Recommended** (15 points): Product marked as recommended
7. **Higher Rating** (10 points): Better rating than current product
8. **More Reviews** (5 points): Significantly more reviews

## Usage Examples

### Basic Usage

```tsx
import RelatedProducts from "@/components/features/insurance/RelatedProducts";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";

function ProductPage({ productId }) {
  const product = INSURANCE_PRODUCTS.find(p => p.id === productId);

  return (
    <RelatedProducts
      currentProduct={product}
      maxProducts={4}
    />
  );
}
```

### With Custom Title and Callback

```tsx
function ProductDetailsPage() {
  const [product, setProduct] = useState(selectedProduct);

  const handleRelatedClick = (relatedProduct) => {
    // Navigate to related product or update state
    setProduct(relatedProduct);
  };

  return (
    <RelatedProducts
      currentProduct={product}
      title="Gợi ý sản phẩm tương tự"
      maxProducts={3}
      onProductClick={handleRelatedClick}
    />
  );
}
```

### Custom Styling

```tsx
<RelatedProducts
  currentProduct={product}
  className="bg-gray-50 p-6 rounded-xl"
  showViewAll={false}
/>
```

## Mobile Responsiveness

The component automatically adapts to different screen sizes:

- **Desktop (≥768px)**: Grid layout with 1-3 columns
- **Mobile (<768px)**: Carousel/slider with navigation arrows

## Dependencies

- React 18+ with hooks
- Next.js components (Link)
- Tailwind CSS for styling
- Lucide React for icons
- next-intl for internationalization
- Embla Carousel for mobile slider

## TypeScript Support

The component is fully typed with TypeScript:

```tsx
interface RelatedProductsProps {
  currentProduct: InsuranceProduct;
  maxProducts?: number;
  title?: string;
  showViewAll?: boolean;
  className?: string;
  viewAllLink?: string;
  onProductClick?: (product: InsuranceProduct) => void;
}
```

## Performance Optimizations

- `useMemo` for expensive similarity calculations
- Optimized re-renders by moving algorithm outside component
- Lazy loading with simulated loading state
- Efficient filtering and sorting

## Accessibility Features

- ARIA labels for product information
- Keyboard navigation support
- Semantic HTML structure
- Screen reader friendly carousel on mobile
- Focus management on interactive elements

## Internationalization

All text is internationalized using next-intl:

```tsx
{t("relatedProducts", "Sản phẩm liên quan")}
{t("noRelatedProducts", "Không tìm thấy sản phẩm liên quan")}
{t("viewDetails", "Xem chi tiết")}
{t("recommended", "Đề xuất")}
// ... and more
```

## Storybook Stories

View interactive examples in Storybook:

```bash
npm run storybook
```

Navigate to: Features/Insurance/RelatedProducts

Available stories:
- **Vehicle Insurance**: Related car insurance products
- **Health Insurance**: Health insurance recommendations
- **Life Insurance**: Life insurance suggestions
- **Mobile View**: Responsive mobile carousel
- **Loading State**: Skeleton loaders
- **Empty State**: No related products found

## Testing

The component includes comprehensive tests:

```bash
# Run tests
npm test RelatedProducts.test.tsx

# Coverage
npm test -- --coverage RelatedProducts.test.tsx
```

Test cases include:
- Loading states
- Product display
- Click interactions
- Empty state
- Custom props
- Mobile responsiveness

## File Structure

```
src/components/features/insurance/
├── RelatedProducts.tsx          # Main component
├── RelatedProducts.test.tsx     # Unit tests
├── RelatedProducts.stories.tsx  # Storybook stories
├── RelatedProducts.example.tsx   # Usage examples
└── RelatedProducts.md           # This documentation
```

## Best Practices

1. **Product Data**: Ensure insurance products have complete coverage and pricing data
2. **Category Consistency**: Use consistent category values across products
3. **Performance**: The component efficiently handles large product lists
4. **Mobile First**: Design with mobile users in mind
5. **Accessibility**: Test with screen readers and keyboard navigation

## Future Enhancements

Potential improvements:
- Machine learning-based recommendations
- User behavior tracking for personalization
- A/B testing different similarity algorithms
- Real-time product updates
- Advanced filtering options
- Comparison integration