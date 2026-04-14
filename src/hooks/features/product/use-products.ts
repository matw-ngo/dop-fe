import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type ListProductsResponse = components["schemas"]["ListProductsResponse"];

interface UseProductsParams {
  tenantId: string;
  pageSize?: number;
  pageIndex?: number;
}

/**
 * Fetches a paginated list of products for a tenant
 */
async function getProducts({
  tenantId,
  pageSize = 10,
  pageIndex = 0,
}: UseProductsParams): Promise<ListProductsResponse> {
  const { data, error, response } = await dopClient.GET("/products", {
    params: {
      query: {
        tenant_id: tenantId,
        page_size: pageSize,
        page_index: pageIndex,
      },
    },
  });

  if (error) {
    throw new Error(
      `Failed to list products: ${response.status} ${response.statusText}`,
    );
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Hook to list products for a tenant with pagination
 *
 * @remarks
 * Returns a paginated list of products including:
 * - Product details (name, description, type)
 * - Partner information
 * - Product status and images
 * - Total count for pagination
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useProducts({
 *   tenantId: "uuid",
 *   pageSize: 10,
 *   pageIndex: 0,
 * });
 *
 * console.log(`Showing ${data?.products.length} of ${data?.total} products`);
 * ```
 */
export function useProducts({
  tenantId,
  pageSize = 10,
  pageIndex = 0,
  enabled = true,
}: UseProductsParams & { enabled?: boolean }) {
  return useQuery<ListProductsResponse, Error>({
    queryKey: ["products", tenantId, pageSize, pageIndex],
    queryFn: () => getProducts({ tenantId, pageSize, pageIndex }),
    enabled: !!tenantId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
