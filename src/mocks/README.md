# Mock Data Documentation

## Overview

Mock data cho Products API để phát triển UI mà không cần backend.

## Files

```
src/mocks/
├── data/
│   └── products.ts          # Mock product data
├── handlers/
│   └── products.ts          # MSW handlers for products API
└── README.md                # This file

mocks/
├── handlers.ts              # Main MSW handlers (includes products)
└── ...
```

## Mock Products Data

### Total Products: 10

**Credit Cards: 6**
1. Vietcombank Visa Platinum Cashback
2. TPBank Visa Travel
3. VPBank Mastercard Platinum
4. Sacombank Visa Gold
5. MB Bank JCB Platinum
6. HSBC Visa Signature

**Insurance: 2**
7. Bảo Hiểm Sức Khỏe Toàn Diện Bảo Việt
8. Bảo Hiểm Ô Tô Vật Chất PVI

**Loans: 2**
9. Vay Tiêu Dùng Không Thế Chấp FE Credit
10. Vay Mua Nhà VPBank

## API Endpoints

### GET /products

**Query Parameters:**
- `tenant_id` (required): UUID
- `page_size` (optional): Number, default 10
- `page_index` (optional): Number, default 0
- `product_type` (optional): Filter by type (credit_card, insurance, loan)
- `search` (optional): Search by name or summary

**Response:**
```json
{
  "products": [
    {
      "product_id": "uuid",
      "name": "string",
      "summary": "string",
      "description": "string",
      "product_type": "credit_card | insurance | loan",
      "partner_id": "uuid",
      "partner_name": "string",
      "status": "active",
      "tenant_id": "uuid",
      "thumbnail": "string",
      "images": ["string"]
    }
  ],
  "total": 10
}
```

**Examples:**
```bash
# Get all products (page 1)
GET /products?tenant_id=tenant-001&page_size=10&page_index=0

# Get credit cards only
GET /products?tenant_id=tenant-001&product_type=credit_card

# Search products
GET /products?tenant_id=tenant-001&search=vietcombank
```

### GET /products/{id}

**Query Parameters:**
- `tenant_id` (required): UUID

**Response:**
```json
{
  "product_id": "uuid",
  "name": "string",
  "summary": "string",
  "description": "string (markdown)",
  "product_type": "credit_card | insurance | loan",
  "partner_id": "uuid",
  "partner_name": "string",
  "status": "active",
  "tenant_id": "uuid",
  "thumbnail": "string",
  "images": ["string"]
}
```

**Example:**
```bash
GET /products/550e8400-e29b-41d4-a716-446655440001?tenant_id=tenant-001
```

## Mock Ratings

Since API doesn't have rating field, we provide mock ratings:

```typescript
import { getMockRating } from '@/mocks/data/products';

const rating = getMockRating(productId); // Returns 4.3 - 4.9
```

## Helper Functions

### Filter by Type
```typescript
import { filterProductsByType } from '@/mocks/data/products';

const creditCards = filterProductsByType('credit_card');
```

### Search Products
```typescript
import { searchProducts } from '@/mocks/data/products';

const results = searchProducts('vietcombank');
```

### Get by Partner
```typescript
import { getProductsByPartner } from '@/mocks/data/products';

const vpbankProducts = getProductsByPartner('partner-003');
```

## Product Type Labels & Colors

```typescript
import { 
  PRODUCT_TYPE_LABELS, 
  PRODUCT_TYPE_COLORS 
} from '@/mocks/data/products';

// Labels
PRODUCT_TYPE_LABELS['credit_card'] // "Thẻ tín dụng"
PRODUCT_TYPE_LABELS['insurance']   // "Bảo hiểm"
PRODUCT_TYPE_LABELS['loan']        // "Vay tiêu dùng"

// Colors (Tailwind classes)
PRODUCT_TYPE_COLORS['credit_card'] // "bg-blue-500"
PRODUCT_TYPE_COLORS['insurance']   // "bg-green-500"
PRODUCT_TYPE_COLORS['loan']        // "bg-purple-500"
```

## Description Format

Product descriptions are in Markdown format with sections:

```markdown
## Tổng quan
Brief overview of the product

## Ưu đãi / Quyền lợi
- Benefit 1
- Benefit 2
- Benefit 3

## Lãi suất & Phí / Phí bảo hiểm
- Fee 1
- Fee 2
- Fee 3

## Điều kiện
- Requirement 1
- Requirement 2
- Requirement 3
```

## Network Simulation

MSW handlers simulate network delays:
- List products: 500ms delay
- Product detail: 300ms delay

## Error Scenarios

### 400 Bad Request
```bash
# Missing tenant_id
GET /products
# Response: { "code": "invalid_argument", "message": "tenant_id is required" }
```

### 404 Not Found
```bash
# Invalid product ID
GET /products/invalid-id?tenant_id=tenant-001
# Response: { "code": "not_found", "message": "Product not found" }
```

## Usage in Components

### With Hooks
```typescript
import { useProducts } from '@/hooks/features/product';

function ProductList() {
  const { data, isLoading } = useProducts({
    tenantId: 'tenant-001',
    pageSize: 10,
    pageIndex: 0,
  });
  
  // data.products - array of products
  // data.total - total count
}
```

### With Mock Rating
```typescript
import { getMockRating } from '@/mocks/data/products';

function ProductCard({ product }) {
  const rating = getMockRating(product.product_id);
  
  return (
    <div>
      <span>★ {rating}/5</span>
    </div>
  );
}
```

## Testing

Mock data is automatically used when MSW is enabled:

```typescript
// In tests
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Adding New Products

To add new mock products:

1. Add to `MOCK_PRODUCTS` array in `src/mocks/data/products.ts`
2. Add rating to `MOCK_RATINGS` object
3. Follow the existing structure

```typescript
{
  product_id: "unique-uuid",
  name: "Product Name",
  summary: "Short description",
  description: `
## Tổng quan
...

## Ưu đãi
...
  `,
  product_type: "credit_card | insurance | loan",
  partner_id: "partner-xxx",
  partner_name: "Partner Name",
  status: "active",
  tenant_id: "tenant-001",
  thumbnail: "/images/products/product.png",
  images: ["/images/products/product-detail.png"],
}
```

## Notes

- All product IDs follow UUID format
- Images paths are placeholders (need actual images)
- Descriptions are in Vietnamese
- Mock data covers all 3 product types
- Pagination works correctly with total count
- Filtering and search work client-side in MSW handlers
