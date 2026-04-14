/**
 * MSW Handlers for Products API
 *
 * Mock handlers for products endpoints
 */

import { http } from "msw";
import {
  getMockProductsResponse,
  getMockProductDetail,
  filterProductsByType,
  searchProducts,
} from "../../../mocks/data/products";

const BASE_URL = "*";

const mswJson = (body: unknown, init?: ResponseInit): Response => {
  const headers = new Headers(init?.headers);
  headers.set("x-msw-mocked", "true");

  return Response.json(body, { ...init, headers });
};

export const productsHandlers = [
  /**
   * GET /products - List products with pagination
   */
  http.get(`${BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenant_id");
    const pageSize = Number.parseInt(url.searchParams.get("page_size") || "10");
    const pageIndex = Number.parseInt(
      url.searchParams.get("page_index") || "0",
    );
    const productType = url.searchParams.get("product_type");
    const search = url.searchParams.get("search");

    // Validate tenant_id
    if (!tenantId) {
      return mswJson(
        {
          code: "invalid_argument",
          message: "tenant_id is required",
        },
        { status: 400 },
      );
    }

    // Get mock data
    let response = getMockProductsResponse(pageSize, pageIndex);

    // Apply filters if provided
    if (productType) {
      const filtered = filterProductsByType(productType);
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      response = {
        products: filtered.slice(start, end),
        total: filtered.length,
      };
    }

    if (search) {
      const filtered = searchProducts(search);
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      response = {
        products: filtered.slice(start, end),
        total: filtered.length,
      };
    }

    console.log("🎯 MSW: GET /products", {
      tenantId,
      pageSize,
      pageIndex,
      productType,
      search,
      response,
    });

    // Return immediately without delay for better UX
    return mswJson(response);
  }),

  /**
   * GET /products/{id} - Get product detail
   */
  http.get(`${BASE_URL}/products/:id`, ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenant_id");

    // Validate tenant_id
    if (!tenantId) {
      return mswJson(
        {
          code: "invalid_argument",
          message: "tenant_id is required",
        },
        { status: 400 },
      );
    }

    const product = getMockProductDetail(id as string);

    if (!product) {
      return mswJson(
        {
          code: "not_found",
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    console.log("🎯 MSW: GET /products/:id", { id, tenantId, product });

    // Return immediately without delay for better UX
    return mswJson(product);
  }),
];

export default productsHandlers;
