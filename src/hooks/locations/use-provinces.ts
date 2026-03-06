import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type Province = components["schemas"]["Province"];

async function getProvinces() {
  const { data, error, response } = await dopClient.GET("/locations/provinces");

  if (error) {
    throw new Error(
      `Failed to fetch provinces: ${response.status} ${response.statusText}`,
    );
  }

  if (!data?.data) {
    throw new Error("No provinces data returned from API");
  }

  return data.data;
}

export function useProvinces() {
  return useQuery<Province[], Error>({
    queryKey: ["locations", "provinces"],
    queryFn: getProvinces,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });
}
