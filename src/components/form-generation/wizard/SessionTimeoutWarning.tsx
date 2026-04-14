"use client";

/**
 * Session Timeout Warning Component
 *
 * Displays a warning alert when the verification session is about to expire.
 * Only shows when less than 60 seconds remain.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

// ============================================================================
// Types
// ============================================================================

export interface SessionTimeoutWarningProps {
  /** Seconds remaining until session expires */
  timeRemaining: number;
}

// ============================================================================
// Component
// ============================================================================

export function SessionTimeoutWarning({
  timeRemaining,
}: SessionTimeoutWarningProps) {
  const t = useTranslations("features.loan-application.navigation");

  // Only show when less than 1 minute remaining
  if (timeRemaining > 60) {
    return null;
  }

  return (
    <Alert variant="default" className="mb-4 border-orange-500 bg-orange-50">
      <Clock className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900">
        {t("sessionTimeout.title")}
      </AlertTitle>
      <AlertDescription className="text-orange-800">
        {t("sessionTimeout.warning", { seconds: timeRemaining })}
      </AlertDescription>
    </Alert>
  );
}

SessionTimeoutWarning.displayName = "SessionTimeoutWarning";
