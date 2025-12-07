/**
 * Loan Calculator Page
 *
 * Page for calculating loan payments, interest, and amortization schedule
 */

import { LoanCalculator } from "@/components/tools";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { ToolsThemeProvider } from "@/components/features/tools/ToolsThemeProvider";
import { ToolsPageLayout } from "@/components/features/tools/ToolsPageLayout";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  TrendingUp,
  Shield,
  AlertCircle,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tính toán khoản vay | Công cụ tính toán vay vốn",
  description:
    "Công cụ tính toán khoản vay miễn phí và dễ sử dụng. Tính toán các khoản thanh toán hàng tháng, tổng lãi suất và lịch trình trả nợ cho khoản vay của bạn.",
  keywords: [
    "tính toán khoản vay",
    "tính khoản vay",
    "lịch trả nợ",
    "lãi suất vay",
  ],
};

export default function LoanCalculatorPage() {
  const t = useTranslations("pages.loanCalculator");
  const locale = useLocale();

  return (
    <ToolsThemeProvider>
      <ToolsPageLayout
        title={t("title")}
        description={t("description")}
        showHero={false}
        showControls={false}
        showFilters={false}
      >
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t("breadcrumb.home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/tools`}>
                {t("breadcrumb.tools")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("breadcrumb.current")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Calculator Component */}
        <div className="mb-12">
          <LoanCalculator />
        </div>

        {/* Loan Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                {t("loanBasics.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {t("loanBasics.principal.title")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("loanBasics.principal.description")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {t("loanBasics.interest.title")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("loanBasics.interest.description")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">{t("loanBasics.term.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("loanBasics.term.description")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {t("loanBasics.payment.title")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("loanBasics.payment.description")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                {t("amortization.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  1
                </Badge>
                <div>
                  <strong>{t("amortization.point1.title")}</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("amortization.point1.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  2
                </Badge>
                <div>
                  <strong>{t("amortization.point2.title")}</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("amortization.point2.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  3
                </Badge>
                <div>
                  <strong>{t("amortization.point3.title")}</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("amortization.point3.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              {t("loanTips.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold">
                    {t("loanTips.before.title")}
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t("loanTips.before.tip1")}</li>
                  <li>• {t("loanTips.before.tip2")}</li>
                  <li>• {t("loanTips.before.tip3")}</li>
                  <li>• {t("loanTips.before.tip4")}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h4 className="font-semibold">
                    {t("loanTips.during.title")}
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t("loanTips.during.tip1")}</li>
                  <li>• {t("loanTips.during.tip2")}</li>
                  <li>• {t("loanTips.during.tip3")}</li>
                  <li>• {t("loanTips.during.tip4")}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold">{t("loanTips.after.title")}</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t("loanTips.after.tip1")}</li>
                  <li>• {t("loanTips.after.tip2")}</li>
                  <li>• {t("loanTips.after.tip3")}</li>
                  <li>• {t("loanTips.after.tip4")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolsPageLayout>
    </ToolsThemeProvider>
  );
}
