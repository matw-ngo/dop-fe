"use client";

import { Calendar, CheckCircle, FileText, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ConsentHistoryProps {
  consentLogs?: any[];
  userConsent?: any;
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
          <FileText className="mx-auto h-8 w-8 text-muted-foreground animate-pulse" />
          <p className="mt-2 text-sm text-muted-foreground">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!consentLogs || consentLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("history.empty")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("history.emptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t("history.title")}</h3>

      {userConsent && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            {userConsent.action === "grant" ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {userConsent.action === "grant"
                  ? t("history.granted")
                  : t("history.revoked")}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
        <h4 className="font-medium text-sm">{t("history.logs")}</h4>
        <div className="space-y-2">
          {consentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  {log.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.details}
                    </p>
                  )}
                </div>
                {log.created_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
