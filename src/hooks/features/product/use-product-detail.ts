import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type ProductDetail = components["schemas"]["ProductDetail"];

interface UseProductDetailParams {
  productId: string;
  tenantId: string;
}

/**
 * Fetches detailed information for a single product
 */
async function getProductDetail({
  productId,
  tenantId,
}: UseProductDetailParams): Promise<ProductDetail> {
  const { data, error, response } = await dopClient.GET("/products/{id}", {
    params: {
      path: { id: productId },
      query: { tenant_id: tenantId },
    },
  });

  if (error) {
    throw new Error(
      `Failed to get product: ${response.status} ${response.statusText}`,
    );
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Hook to get detailed information for a single product
 *
 * @remarks
 * Returns complete product information including:
 * - Product metadata (name, description, summary)
 * - Product type and status
 * - Partner information
 * - Images and thumbnail
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useProductDetail({
 *   productId: "product-uuid",
 *   tenantId: "tenant-uuid",
 * });
 *
 * if (data) {
 *   console.log(data.name, data.partner_name);
 * }
 * ```
 */
export function useProductDetail({
  productId,
  tenantId,
  enabled = true,
}: UseProductDetailParams & { enabled?: boolean }) {
  return useQuery<ProductDetail, Error>({
    queryKey: ["product", productId, tenantId],
    queryFn: () => getProductDetail({ productId, tenantId }),
    enabled: !!productId && !!tenantId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
