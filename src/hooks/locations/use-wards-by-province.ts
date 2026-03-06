import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type Ward = components["schemas"]["Ward"];

async function getWardsByProvinceId(provinceId: string) {
  const { data, error, response } = await dopClient.GET(
    "/locations/provinces/{id}/wards",
    {
      params: {
        path: { id: provinceId },
      },
    },
  );

  if (error) {
    throw new Error(
      `Failed to fetch wards for province ${provinceId}: ${response.status} ${response.statusText}`,
    );
  }

  if (!data?.data) {
    throw new Error("No wards data returned from API");
  }

  return data.data;
}

export function useWardsByProvince(provinceId: string | undefined) {
  return useQuery<Ward[], Error>({
    queryKey: ["locations", "wards", provinceId],
    queryFn: () => getWardsByProvinceId(provinceId!),
    enabled: !!provinceId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });
}
