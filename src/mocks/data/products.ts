import type { components } from "@/lib/api/v1/dop";

type ProductDetail = components["schemas"]["ProductDetail"];
type ListProductsResponse = components["schemas"]["ListProductsResponse"];

/**
 * Mock Products Data
 * Based on credit card structure from old-code
 */

export const MOCK_PRODUCTS: ProductDetail[] = [
  // Original 2 products from API
  {
    product_id: "a36dd155-0049-4c87-9d50-736ff02439ec",
    name: "FinLoan QuickCash",
    summary: "Short-term cash loan with flexible tenor",
    description:
      '<p>Quick disbursing personal cash loan product for salaried customers with flexible tenors. <a href="https://gemini.google.com/" rel="nofollow">Gemini</a></p><img src="https://pub-2a4d683eb3604fab9396f27eb95fe1bc.r2.dev/editor/6ba65224-1160-4465-883b-e20dd9b401e9.webp"><p></p>',
    product_type: "PRODUCT_TYPE_CASH_LOAN",
    partner_id: "019bdffb-1b04-72f9-9904-57b0e04dc2cb",
    partner_name: "Partner B",
    status: "PRODUCT_STATUS_UNSPECIFIED",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "3e27aec1-91d1-45f0-914d-59e4046a5f2d",
    name: "Acme Platinum Card",
    summary: "Premium rewards card with travel perks",
    description:
      "Acme Platinum Card offering travel rewards, lounge access and flexible repayment options.",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    partner_name: "Default Partner",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },

  // Additional Credit Cards (18 more)
  {
    product_id: "b1111111-1111-1111-1111-111111111111",
    name: "Techcombank Visa Infinite",
    summary: "Premium card with unlimited rewards and airport lounge access",
    description:
      "<p>Techcombank Visa Infinite is the most premium card with exclusive privileges including unlimited 1.5% cashback, 5-star airport lounge access, and 24/7 concierge service.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-010",
    partner_name: "Techcombank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b2222222-2222-2222-2222-222222222222",
    name: "BIDV Mastercard World",
    summary: "Unlimited points accumulation with shopping benefits",
    description:
      "<p>BIDV Mastercard World offers premium shopping experience with unlimited 3 miles per USD spent, 25% discount at shopping malls, and purchase protection up to 100 million VND.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-011",
    partner_name: "BIDV",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b3333333-3333-3333-3333-333333333333",
    name: "VietinBank Visa Platinum",
    summary: "Supermarket cashback with travel insurance",
    description:
      "<p>VietinBank Visa Platinum optimizes daily spending with 3% cashback at supermarkets, 1% on all other transactions, and travel risk insurance up to 500 million VND.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-012",
    partner_name: "VietinBank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b4444444-4444-4444-4444-444444444444",
    name: "Sacombank Visa Gold",
    summary: "Low annual fee, easy approval for new users",
    description:
      "<p>Sacombank Visa Gold is ideal for first-time credit card users with low fees, lifetime fee waiver when spending from 2 million/month, and 200k VND welcome bonus.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-004",
    partner_name: "Sacombank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b5555555-5555-5555-5555-555555555555",
    name: "MB Bank JCB Platinum",
    summary: "Special benefits in Japan with high cashback",
    description:
      "<p>MB Bank JCB Platinum offers premium experience with special benefits in Japan including 3% cashback on Japan transactions, 15% discount at JCB stores, and golf privileges.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-005",
    partner_name: "MB Bank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b6666666-6666-6666-6666-666666666666",
    name: "HSBC Visa Signature",
    summary: "Ultra-premium card with concierge service",
    description:
      "<p>HSBC Visa Signature is the ultra-premium card for VIP customers with unlimited airport lounge access, 2.5% cashback on all transactions, and 24/7 concierge service.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-006",
    partner_name: "HSBC Vietnam",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b7777777-7777-7777-7777-777777777777",
    name: "VPBank Mastercard Platinum",
    summary: "Shopping benefits with reward points",
    description:
      "<p>VPBank Mastercard Platinum offers premium shopping experience with 20% discount at major supermarkets, reward points redemption, and free online shopping delivery.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-003",
    partner_name: "VPBank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b8888888-8888-8888-8888-888888888888",
    name: "Vietcombank Visa Platinum",
    summary: "Cashback up to 2% with first year fee waiver",
    description:
      "<p>Vietcombank Visa Platinum Cashback offers 2% cashback for all transactions in first 3 months, 1% thereafter, with first year annual fee waiver and 500k VND bonus.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-001",
    partner_name: "Vietcombank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "b9999999-9999-9999-9999-999999999999",
    name: "TPBank Visa Travel",
    summary: "Travel rewards with airport lounge access",
    description:
      "<p>TPBank Visa Travel is designed for travel enthusiasts with 2 miles per USD spent, 4 free airport lounge visits per year, and travel insurance up to 100k USD.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-002",
    partner_name: "TPBank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c1111111-1111-1111-1111-111111111111",
    name: "Standard Chartered Visa Infinite",
    summary: "Global premium card with lifestyle benefits",
    description:
      "<p>Standard Chartered Visa Infinite offers global privileges including complimentary hotel stays, dining discounts worldwide, and priority customer service.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-015",
    partner_name: "Standard Chartered",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c2222222-2222-2222-2222-222222222222",
    name: "Citibank Premier Miles Card",
    summary: "Miles accumulation for frequent flyers",
    description:
      "<p>Citibank Premier Miles Card offers 10 miles per USD spent on air travel and dining, complimentary airport transfers, and travel insurance coverage.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-016",
    partner_name: "Citibank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c3333333-3333-3333-3333-333333333333",
    name: "UOB PRVI Miles Card",
    summary: "Miles card with flexible redemption",
    description:
      "<p>UOB PRVI Miles Card offers 1.4 miles per local dollar spent, 2.4 miles per overseas dollar, with no cap on miles accumulation and flexible airline redemption.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-017",
    partner_name: "UOB",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c4444444-4444-4444-4444-444444444444",
    name: "DBS Black World Mastercard",
    summary: "Premium lifestyle card with rewards",
    description:
      "<p>DBS Black World Mastercard offers 5% cashback on online shopping, 2% on dining and entertainment, and complimentary movie tickets every month.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-018",
    partner_name: "DBS Bank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c5555555-5555-5555-5555-555555555555",
    name: "OCBC Titanium Rewards Card",
    summary: "High rewards on contactless payments",
    description:
      "<p>OCBC Titanium Rewards Card offers 10% cashback on all contactless mobile payments including Apple Pay, Google Pay, and Samsung Pay.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-019",
    partner_name: "OCBC Bank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c6666666-6666-6666-6666-666666666666",
    name: "Maybank Visa Signature",
    summary: "Regional card with travel benefits",
    description:
      "<p>Maybank Visa Signature offers enhanced rewards across ASEAN countries, complimentary golf games, and regional airport lounge access.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-020",
    partner_name: "Maybank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c7777777-7777-7777-7777-777777777777",
    name: "Shinhan Bank Visa Platinum",
    summary: "Korean bank card with local benefits",
    description:
      "<p>Shinhan Bank Visa Platinum offers special benefits for Korean transactions, duty-free shopping discounts, and K-culture experience vouchers.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-021",
    partner_name: "Shinhan Bank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c8888888-8888-8888-8888-888888888888",
    name: "Woori Bank Mastercard Gold",
    summary: "Gold card with comprehensive benefits",
    description:
      "<p>Woori Bank Mastercard Gold offers purchase protection, extended warranty, and special discounts at partner merchants across Vietnam.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-022",
    partner_name: "Woori Bank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
  {
    product_id: "c9999999-9999-9999-9999-999999999999",
    name: "Hong Leong Visa Classic",
    summary: "Entry-level card with essential benefits",
    description:
      "<p>Hong Leong Visa Classic is perfect for first-time cardholders with low income requirements, fraud protection, and installment plans with 0% interest.</p>",
    product_type: "PRODUCT_TYPE_CREDIT_CARD",
    partner_id: "partner-023",
    partner_name: "Hong Leong Bank",
    status: "PRODUCT_STATUS_ACTIVE",
    tenant_id: "11111111-1111-1111-1111-111111111111",
  },
];

/**
 * Mock API Response for List Products
 */
export const getMockProductsResponse = (
  pageSize = 10,
  pageIndex = 0,
): ListProductsResponse => {
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const products = MOCK_PRODUCTS.slice(start, end);

  return {
    products,
    total: MOCK_PRODUCTS.length,
  };
};

/**
 * Mock API Response for Product Detail
 */
export const getMockProductDetail = (
  productId: string,
): ProductDetail | null => {
  return MOCK_PRODUCTS.find((p) => p.product_id === productId) || null;
};

/**
 * Filter products by type
 */
export const filterProductsByType = (type: string): ProductDetail[] => {
  if (!type) return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter((p) => p.product_type === type);
};

/**
 * Search products by name
 */
export const searchProducts = (query: string): ProductDetail[] => {
  if (!query) return MOCK_PRODUCTS;
  const lowerQuery = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.summary?.toLowerCase().includes(lowerQuery),
  );
};

/**
 * Get products by partner
 */
export const getProductsByPartner = (partnerId: string): ProductDetail[] => {
  return MOCK_PRODUCTS.filter((p) => p.partner_id === partnerId);
};

/**
 * Mock rating data (since API doesn't have it yet)
 */
const MOCK_RATINGS: Record<string, number> = {
  "a36dd155-0049-4c87-9d50-736ff02439ec": 4.5,
  "3e27aec1-91d1-45f0-914d-59e4046a5f2d": 4.8,
  "b1111111-1111-1111-1111-111111111111": 4.9,
  "b2222222-2222-2222-2222-222222222222": 4.6,
  "b3333333-3333-3333-3333-333333333333": 4.5,
  "b4444444-4444-4444-4444-444444444444": 4.3,
  "b5555555-5555-5555-5555-555555555555": 4.7,
  "b6666666-6666-6666-6666-666666666666": 4.9,
  "b7777777-7777-7777-7777-777777777777": 4.5,
  "b8888888-8888-8888-8888-888888888888": 4.8,
  "b9999999-9999-9999-9999-999999999999": 4.6,
  "c1111111-1111-1111-1111-111111111111": 4.7,
  "c2222222-2222-2222-2222-222222222222": 4.8,
  "c3333333-3333-3333-3333-333333333333": 4.6,
  "c4444444-4444-4444-4444-444444444444": 4.7,
  "c5555555-5555-5555-5555-555555555555": 4.5,
  "c6666666-6666-6666-6666-666666666666": 4.6,
  "c7777777-7777-7777-7777-777777777777": 4.7,
  "c8888888-8888-8888-8888-888888888888": 4.5,
  "c9999999-9999-9999-9999-999999999999": 4.4,
};

export const getMockRating = (productId: string): number => {
  return MOCK_RATINGS[productId] || 4.5; // Default rating if not found
};
