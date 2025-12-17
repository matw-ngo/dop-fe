import { AlertTriangle, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLocalizedRedirect } from "@/lib/client-utils";

export const metadata: Metadata = {
  title: "Unauthorized Access | DOP-FE",
  description: "You don't have permission to access this page.",
};

function UnauthorizedPageContent() {
  const t = useTranslations("admin.auth");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {t("unauthorized")}
          </CardTitle>
          <CardDescription>{t("unauthorizedDescription")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("accessDenied")}</AlertTitle>
            <AlertDescription>{t("accessDeniedDescription")}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/admin">{t("backToDashboard")}</Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/login">{t("loginAsDifferentUser")}</Link>
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToHome")}
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t("needHelp")}{" "}
              <Link href="/support" className="text-primary hover:underline">
                {t("contactSupport")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnauthorizedPageContent />
    </Suspense>
  );
}
