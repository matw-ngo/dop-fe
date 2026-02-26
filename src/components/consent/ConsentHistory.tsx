"use client";

import { Calendar, CheckCircle, FileText, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/v1/consent";

type ConsentLog = components["schemas"]["ConsentLog"];
type Consent = components["schemas"]["Consent"];

interface ConsentHistoryProps {
  consentLogs?: ConsentLog[];
  userConsent?: Consent | null;
  isLoading: boolean;
}

export function ConsentHistory({
  consentLogs,
  userConsent,
  isLoading,
}: ConsentHistoryProps) {
  const t = useTranslations("features.consent");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <FileText className="mx-auto h-8 w-8 animate-pulse text-[var(--consent-muted)]" />
          <p className="mt-2 text-sm text-[var(--consent-muted)]">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!consentLogs || consentLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-[var(--consent-muted)]" />
        <h3 className="mb-2 text-lg font-semibold text-[var(--consent-fg)]">
          {t("history.empty")}
        </h3>
        <p className="text-sm text-[var(--consent-muted)]">
          {t("history.emptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[var(--consent-fg)]">
        {t("history.title")}
      </h3>

      {userConsent && (
        <div className="rounded-lg border border-[var(--consent-border)] bg-[var(--consent-surface)] p-4">
          <div className="flex items-start gap-3">
            {userConsent.action === "grant" ? (
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--consent-primary)]" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--consent-error)]" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--consent-fg)]">
                {userConsent.action === "grant"
                  ? t("history.granted")
                  : t("history.revoked")}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--consent-muted)]">
                <Calendar className="h-3 w-3" />
                {userConsent.created_at
                  ? new Date(userConsent.created_at).toLocaleDateString()
                  : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-[var(--consent-fg)]">
          {t("history.logs")}
        </h4>
        <div className="space-y-2">
          {consentLogs.map((log, index) => (
            <div
              key={log.id ?? `${log.action ?? "unknown"}-${index}`}
              className="rounded-lg border border-[var(--consent-border)] p-3 transition-colors hover:bg-[var(--consent-surface)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--consent-fg)]">
                    {log.action}
                  </p>
                  {(log.action_by || log.source) && (
                    <p className="mt-1 text-xs text-[var(--consent-muted)]">
                      {[log.action_by, log.source].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
                {log.created_at && (
                  <div className="flex items-center gap-1 text-xs text-[var(--consent-muted)]">
                    <Calendar className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConsentHistory;
