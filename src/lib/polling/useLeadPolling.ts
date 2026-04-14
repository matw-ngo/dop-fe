// ============================================================
// src/lib/polling/useLeadPolling.ts
//
// Business-layer hook: wires up `usePolling` with the lead-
// status API.  Keep ALL business decisions here so the core
// module stays generic.
// ============================================================

import { useEffect } from "react";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";
import { usePolling } from "./usePolling";
import type { UsePollingResult } from "./usePolling";

type LeadStatusResponse = components["schemas"]["LeadStatusResponse"];
type DistributionStatus = components["schemas"]["DistributionStatus"];

/** States that mean polling is finished — no point calling again. */
const TERMINAL_STATES: DistributionStatus[] = [
  "distributed",
  "failed",
  "no_match",
];

/** Fetches lead status directly (exported for re-use in useLeadStatus). */
export async function getLeadStatus(
  leadId: string,
): Promise<LeadStatusResponse> {
  const { data, error, response } = await dopClient.GET("/leads/{id}", {
    params: { path: { id: leadId } },
  });

  if (error) {
    throw new Error(
      `Failed to get lead status: ${response.status} ${response.statusText}`,
    );
  }
  if (!data) throw new Error("No data returned from API");

  return data;
}

export interface UseLeadPollingOptions {
  /**
   * When false the hook will NOT start polling automatically.
   * Useful when leadId exists but the flow hasn't reached the
   * polling stage yet.
   * @default true
   */
  enabled?: boolean;

  /**
   * Called once when polling reaches a terminal state.
   * Receives the final `LeadStatusResponse`.
   */
  onComplete?: (data: LeadStatusResponse) => void;

  /** Override default poll interval (ms). @default 5000 */
  interval?: number;

  /** Override max retry count. @default 60 */
  maxRetries?: number;

  /** Override hard timeout (ms). @default 300_000 (5 min) */
  timeout?: number;
}

/**
 * `useLeadPolling` starts polling `GET /leads/{id}` as soon as
 * `enabled` is true and `leadId` is non-null, and stops automatically
 * when the distribution status reaches a terminal state.
 */
export function useLeadPolling(
  leadId: string | null | undefined,
  options: UseLeadPollingOptions = {},
): UsePollingResult<LeadStatusResponse> {
  const {
    enabled = true,
    onComplete,
    interval = 10_000, // 10 seconds between polls
    maxRetries = 30, // ~5 minutes total (30 * 10s)
    timeout = 5 * 60 * 1_000, // 5 minutes hard timeout
  } = options;

  const shouldPoll = !!leadId && enabled;

  const result = usePolling<LeadStatusResponse>(
    {
      fetcher: () => getLeadStatus(leadId!),
      predicate: (data) => TERMINAL_STATES.includes(data.distribution_status),
      interval,
      maxRetries,
      timeout,
      backoff: "fixed",
      onComplete,
    },
    // Recreate the controller whenever the leadId changes so we always poll
    // the correct lead.
    [leadId],
  );

  // Start / stop based on `enabled` flag changes.
  useEffect(() => {
    if (shouldPoll) {
      result.start();
    } else {
      result.stop();
    }
    // `result.start` / `result.stop` are stable — no risk of infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPoll]);

  return result;
}
