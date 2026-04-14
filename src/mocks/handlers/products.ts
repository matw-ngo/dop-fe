import { http, HttpResponse } from "msw";
import {
  getMockProductsResponse,
  getMockProductDetail,
  filterProductsByType,
  searchProducts,
} from "../data/products";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const productsHandlers = [
  /**
   * GET /products - List products with pagination
   */
  http.get(`${BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenant_id");
    const pageSize = Number.parseInt(url.searchParams.get("page_size") || "10"); // Default to 10 for testing pagination
    const pageIndex = Number.parseInt(
      url.searchParams.get("page_index") || "0",
    );
    const productType = url.searchParams.get("product_type");
    const search = url.searchParams.get("search");

    // Validate tenant_id
    if (!tenantId) {
      return HttpResponse.json(
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

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json(response));
      }, 500);
    });
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
      return HttpResponse.json(
        {
          code: "invalid_argument",
          message: "tenant_id is required",
        },
        { status: 400 },
      );
    }

    const product = getMockProductDetail(id as string);

    if (!product) {
      return HttpResponse.json(
        {
          code: "not_found",
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json(product));
      }, 300);
    });
  }),
];
