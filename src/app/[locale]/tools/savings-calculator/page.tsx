/**
 * Savings Calculator Page
 *
 * Page for comparing savings interest rates across Vietnamese banks
 */

import { Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ToolsPageLayout } from "@/components/features/tools/ToolsPageLayout";
import { ToolsThemeProvider } from "@/components/features/tools/ToolsThemeProvider";
import { SavingsCalculator } from "@/components/tools";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SavingsCalculatorPage() {
  const t = useTranslations("pages.savings-calculator");
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
        <div className="my-12">
          <SavingsCalculator />
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                {t("importantNotes.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  1
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t("importantNotes.note1")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  2
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t("importantNotes.note2")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  3
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t("importantNotes.note3")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {t("savingsTips.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">{t("savingsTips.tip1.title")}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{t("savingsTips.tip1.description")}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{t("savingsTips.tip2.title")}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{t("savingsTips.tip2.description")}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">{t("savingsTips.tip3.title")}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{t("savingsTips.tip3.description")}</p>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Savings Types */}
        {/* <Card>
          <CardHeader>
            <CardTitle>{t("savingsTypes.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg space-y-3 hover:border-blue-200 transition-colors">
                <h4 className="font-semibold text-blue-600">{t("savingsTypes.traditional.title")}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("savingsTypes.traditional.feature1")}</li>
                  <li>• {t("savingsTypes.traditional.feature2")}</li>
                  <li>• {t("savingsTypes.traditional.feature3")}</li>
                </ul>
                <p className="text-xs text-blue-600 font-medium">{t("savingsTypes.traditional.interest")}</p>
              </div>
              <div className="p-4 border rounded-lg space-y-3 hover:border-emerald-200 transition-colors">
                <h4 className="font-semibold text-emerald-600">{t("savingsTypes.digital.title")}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("savingsTypes.digital.feature1")}</li>
                  <li>• {t("savingsTypes.digital.feature2")}</li>
                  <li>• {t("savingsTypes.digital.feature3")}</li>
                </ul>
                <p className="text-xs text-emerald-600 font-medium">{t("savingsTypes.digital.interest")}</p>
              </div>
              <div className="p-4 border rounded-lg space-y-3 hover:border-violet-200 transition-colors">
                <h4 className="font-semibold text-violet-600">{t("savingsTypes.term.title")}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("savingsTypes.term.feature1")}</li>
                  <li>• {t("savingsTypes.term.feature2")}</li>
                  <li>• {t("savingsTypes.term.feature3")}</li>
                </ul>
                <p className="text-xs text-violet-600 font-medium">{t("savingsTypes.term.interest")}</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </ToolsPageLayout>
    </ToolsThemeProvider>
  );
}
