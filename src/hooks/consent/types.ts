/**
 * Consent-related types re-exported from OpenAPI schemas
 *
 * These types are auto-generated from the OpenAPI spec.
 * To update: run `pnpm gen:api`
 */

import type { components } from "@/lib/api/v1/consent";

// Core consent types
export type ConsentRecord = components["schemas"]["Consent"];
export type ConsentPurpose = components["schemas"]["ConsentPurpose"];
export type ConsentVersion = components["schemas"]["ConsentVersion"];
export type ConsentLog = components["schemas"]["ConsentLog"];
export type DataCategory = components["schemas"]["DataCategory"];

// Request/Response types
export type ConsentListResponse = components["schemas"]["ConsentListResponse"];
export type ConsentPurposeListResponse =
  components["schemas"]["ConsentPurposeListResponse"];
export type ConsentLogListResponse =
  components["schemas"]["ConsentLogListResponse"];

// Enums and constants
export type ConsentAction = "grant" | "revoke" | "update";
export type ConsentStatus = "active" | "revoked" | "expired";
export type ConsentSource = "web" | "mobile" | "api";
