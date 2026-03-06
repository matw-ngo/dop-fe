"use client";

/**
 * Manual Reset Button Component
 *
 * Displays a reset button when error recovery is needed.
 * Only visible when showResetButton is true from useErrorRecovery hook.
 */

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useErrorRecovery } from "@/hooks/navigation/use-error-recovery";

// ============================================================================
// Component
// ============================================================================

export function ManualResetButton() {
  const t = useTranslations("features.loan-application.navigation");
  const { showResetButton, recover } = useErrorRecovery();

  if (!showResetButton) {
    return null;
  }

  return (
    <Button variant="outline" onClick={recover} className="gap-2">
      <RotateCcw className="h-4 w-4" />
      {t("error.resetButton")}
    </Button>
  );
}

ManualResetButton.displayName = "ManualResetButton";
