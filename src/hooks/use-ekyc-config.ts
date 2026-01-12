import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type EkycConfigResponseBody = components["schemas"]["EkycConfigResponseBody"];

async function getEkycConfig(leadId: string): Promise<EkycConfigResponseBody> {
  const { data, error } = await apiClient.GET("/leads/{id}/ekyc/config", {
    params: { path: { id: leadId } },
  });

  if (error) throw new Error(error.message || "Failed to get eKYC config");
  if (!data) throw new Error("No eKYC config returned");

  return data;
}

export function useEkycConfig(leadId: string) {
  return useQuery({
    queryKey: ["ekyc-config", leadId],
    queryFn: () => getEkycConfig(leadId),
    enabled: !!leadId,
  });
}

export default useEkycConfig;
