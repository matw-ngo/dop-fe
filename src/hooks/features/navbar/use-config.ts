import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  NavbarConfig,
  getNavbarConfig,
  fetchNavbarConfigFromServer,
} from "@/configs/navbar-config";

interface UseNavbarConfigOptions {
  company?: string;
  useServerConfig?: boolean;
  fallbackToStatic?: boolean;
}

interface UseNavbarConfigResult {
  config: NavbarConfig | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useNavbarConfig(
  options: UseNavbarConfigOptions = {},
): UseNavbarConfigResult {
  const {
    company = "finzone",
    useServerConfig = false,
    fallbackToStatic = true,
  } = options;

  // For static config, return immediately without query
  const staticConfig = useMemo(() => {
    if (!useServerConfig) {
      return getNavbarConfig(company);
    }
    return null;
  }, [company, useServerConfig]);

  // Use react-query for server config following your pattern
  const {
    data: serverConfig,
    isLoading,
    error,
    refetch,
  } = useQuery<NavbarConfig, Error>({
    queryKey: ["navbar-config", company],
    queryFn: async () => {
      try {
        return await fetchNavbarConfigFromServer(company);
      } catch (serverError) {
        if (fallbackToStatic) {
          console.warn(
            "Server config failed, falling back to static config:",
            serverError,
          );
          return getNavbarConfig(company);
        }
        throw serverError;
      }
    },
    enabled: useServerConfig, // Only fetch when server config is requested
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    config: staticConfig || serverConfig || null,
    loading: useServerConfig ? isLoading : false,
    error: useServerConfig ? error : null,
    refetch: useServerConfig ? refetch : () => {},
  };
}
