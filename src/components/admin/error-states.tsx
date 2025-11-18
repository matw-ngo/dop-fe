"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangleIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: React.ReactNode;
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryText,
  icon = <AlertTriangleIcon className="h-12 w-12 text-destructive" />,
}: ErrorStateProps) {
  const t = useTranslations("admin.components.errorStates");
  
  const defaultTitle = title || t("default.title");
  const defaultMessage = message || t("default.message");
  const defaultRetryText = retryText || t("default.retry");
  
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon}
        <h3 className="mt-4 text-lg font-semibold">{defaultTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{defaultMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            {defaultRetryText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  action,
  icon = <SearchIcon className="h-12 w-12 text-muted-foreground" />,
}: EmptyStateProps) {
  const t = useTranslations("admin.components.errorStates");
  
  const defaultTitle = title || t("empty.title");
  const defaultMessage = message || t("empty.message");
  
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon}
        <h3 className="mt-4 text-lg font-semibold">{defaultTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{defaultMessage}</p>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface NotFoundStateProps {
  title?: string;
  message?: string;
  backText?: string;
  onBack?: () => void;
  icon?: React.ReactNode;
}

export function NotFoundState({
  title,
  message,
  backText,
  onBack,
  icon = <AlertTriangleIcon className="h-12 w-12 text-muted-foreground" />,
}: NotFoundStateProps) {
  const t = useTranslations("admin.components.errorStates");
  
  const defaultTitle = title || t("notFound.title");
  const defaultMessage = message || t("notFound.message");
  const defaultBackText = backText || t("notFound.goBack");
  
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon}
        <h3 className="mt-4 text-lg font-semibold">{defaultTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{defaultMessage}</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4" variant="outline">
            {defaultBackText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations("admin.components.errorStates");
  
  return (
    <ErrorState
      title={t("networkError.title")}
      message={t("networkError.message")}
      onRetry={onRetry}
      icon={<AlertTriangleIcon className="h-12 w-12 text-orange-500" />}
    />
  );
}

export function PermissionErrorState() {
  const t = useTranslations("admin.components.errorStates");
  
  return (
    <ErrorState
      title={t("permissionError.title")}
      message={t("permissionError.message")}
      retryText={t("permissionError.goBack")}
      icon={<AlertTriangleIcon className="h-12 w-12 text-red-500" />}
    />
  );
}