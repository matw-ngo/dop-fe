// ============================================================
// src/components/loan-application/LoanSearching/LoanSearchingScreenWithPolling.tsx
//
// Drop-in replacement for LoanSearchingScreen that drives the
// UI from real backend data instead of a fixed 3-second timeout.
//
// The original LoanSearchingScreen is left untouched so existing
// consumers can migrate incrementally.
// ============================================================

"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import {
  useLoanSearchResult,
  useForwardStatus,
  useLoanSearchStore,
} from "@/store/use-loan-search-store";
import { useLeadPolling } from "@/lib/polling/useLeadPolling";
import type { components } from "@/lib/api/v1/dop";

type ForwardResult = components["schemas"]["ForwardResult"];
type DistributionStatus = components["schemas"]["DistributionStatus"];

interface LoanSearchingScreenWithPollingProps {
  message?: string;
  className?: string;
}

// Map backend terminal states to the store's ForwardStatus shape.
function distributionToForwardStatus(
  status: DistributionStatus,
): ForwardResult["status"] {
  switch (status) {
    case "distributed":
      return "forwarded";
    case "failed":
    case "no_match":
      return "exhausted";
    default:
      return undefined;
  }
}

export function LoanSearchingScreenWithPolling({
  message,
  className,
}: LoanSearchingScreenWithPollingProps) {
  const t = useTranslations("pages.form.finding_loan");
  const { theme } = useFormTheme();

  const config = useLoanSearchStore((state) => state.config);
  const setForwardStatus = useLoanSearchStore(
    (state) => state.setForwardStatus,
  );
  const setResult = useLoanSearchStore((state) => state.setResult);

  const forwardStatus = useForwardStatus();
  const result = useLoanSearchResult<ForwardResult>();

  // ── Polling ─────────────────────────────────────────────
  // Only poll when:
  //   1. A leadId is present in the store config
  //   2. We don't already have a terminal forward status (avoids re-polling
  //      if the store was pre-populated by the orchestrator's submit-info
  //      onSuccess callback).
  const { status: pollingStatus, attempt } = useLeadPolling(
    config?.leadId ?? null,
    {
      enabled: !!config?.leadId && !forwardStatus,
      onComplete: (data) => {
        if (!data) return;

        const mappedStatus = distributionToForwardStatus(
          data.distribution_status,
        );

        setForwardStatus(mappedStatus);

        if (data.is_forwarded) {
          setResult({
            status: "forwarded",
            partner_id: data.partner_id,
            partner_name: data.partner_name,
          } satisfies ForwardResult);
        }
      },
    },
  );

  // ── Derived display state ────────────────────────────────
  const isLoading = !forwardStatus;
  const isSuccess = forwardStatus === "forwarded";
  const isError = forwardStatus === "rejected" || forwardStatus === "exhausted";
  const partnerName = result?.partner_name;

  // ── Rotating messages based on elapsed time ──────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading || pollingStatus !== "polling") return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, pollingStatus]);

  // Reset elapsed time when polling starts/stops
  useEffect(() => {
    if (pollingStatus === "polling") {
      setElapsedSeconds(0);
    }
  }, [pollingStatus]);

  // Get rotating message based on elapsed time
  const getRotatingMessage = (): string => {
    if (elapsedSeconds < 10) {
      return t("message");
    } else if (elapsedSeconds < 30) {
      return t("message_10s");
    } else if (elapsedSeconds < 60) {
      return t("message_30s");
    } else if (elapsedSeconds < 120) {
      return t("message_60s");
    } else if (elapsedSeconds < 180) {
      return t("message_120s");
    } else if (elapsedSeconds < 240) {
      return t("message_180s");
    } else {
      return t("message_240s");
    }
  };

  const displayMessage = message || getRotatingMessage();

  return (
    <div
      className={cn("flex items-center justify-center px-4 py-12", className)}
    >
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Spinner — hidden once we have a successful match */}
          {!isSuccess && (
            <div style={{ color: theme.colors.primary }}>
              <Spinner
                className="h-24 w-24"
                style={{ color: theme.colors.primary }}
              />
            </div>
          )}

          <div className="space-y-2">
            {/* Primary message */}
            <p style={{ color: theme.colors.textPrimary || "#1f2937" }}>
              {displayMessage}
            </p>

            {/* Success: show matched partner name */}
            {isSuccess && partnerName && (
              <p style={{ color: theme.colors.primary }}>
                {t("partnerMatch", { partner: partnerName })}
              </p>
            )}

            {/* No-match / error state */}
            {isError && (
              <p className="text-sm text-destructive">{t("noMatch")}</p>
            )}
          </div>

          {/* Live polling feedback — visible while actively searching */}
          {isLoading && pollingStatus === "polling" && attempt > 0 && (
            <p
              className="text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("checkingStatus", { attempt })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
