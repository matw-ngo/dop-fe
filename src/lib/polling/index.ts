// ============================================================
// src/lib/polling/index.ts  — public API of the polling module
// ============================================================

export { PollingController } from "./PollingController";
export { usePolling } from "./usePolling";
export { useLeadPolling, getLeadStatus } from "./useLeadPolling";

export type {
  PollingConfig,
  PollingState,
  PollingStatus,
  BackoffStrategy,
} from "./types";

export type { UsePollingResult } from "./usePolling";
export type { UseLeadPollingOptions } from "./useLeadPolling";
