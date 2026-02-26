"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { components } from "@/lib/api/v1/consent";
import { ConsentForm } from "./ConsentForm";
import { ConsentHistory } from "./ConsentHistory";

type DataCategory = components["schemas"]["DataCategory"];
type ConsentLog = components["schemas"]["ConsentLog"];
type Consent = components["schemas"]["Consent"];

interface ConsentVersion {
  version?: string | number | null;
  content?: string | null;
}

interface ConsentTabsLegacyProps {
  consentVersion?: ConsentVersion;
  dataCategories?: DataCategory[];
  consentLogs?: ConsentLog[];
  userConsent?: Consent | null;
  isLoadingLogs: boolean;
  isSubmitting: boolean;
  onGrant: () => void;
  onReject: () => void;
}

export function ConsentTabsLegacy({
  consentVersion,
  dataCategories,
  consentLogs,
  userConsent,
  isLoadingLogs,
  isSubmitting,
  onGrant,
  onReject,
}: ConsentTabsLegacyProps) {
  const t = useTranslations("features.consent");
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  useEffect(() => {
    if (consentLogs && consentLogs.length > 0) {
      setActiveTab("history");
      return;
    }

    setActiveTab("form");
  }, [consentLogs]);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--consent-border)]">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex-1 border-b-2 pb-2 font-medium transition-colors ${
              activeTab === "form"
                ? "border-[var(--consent-primary)] text-[var(--consent-primary)]"
                : "border-transparent text-[var(--consent-muted)] hover:text-[var(--consent-fg)]"
            }`}
          >
            {t("tabs.form")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 border-b-2 pb-2 font-medium transition-colors ${
              activeTab === "history"
                ? "border-[var(--consent-primary)] text-[var(--consent-primary)]"
                : "border-transparent text-[var(--consent-muted)] hover:text-[var(--consent-fg)]"
            }`}
          >
            {t("tabs.history")}
          </button>
        </div>
      </div>

      {activeTab === "form" && (
        <ConsentForm
          consentVersion={consentVersion}
          dataCategories={dataCategories}
          onGrant={onGrant}
          onReject={onReject}
          isSubmitting={isSubmitting}
        />
      )}

      {activeTab === "history" && (
        <ConsentHistory
          consentLogs={consentLogs}
          userConsent={userConsent}
          isLoading={isLoadingLogs}
        />
      )}
    </div>
  );
}

export default ConsentTabsLegacy;
