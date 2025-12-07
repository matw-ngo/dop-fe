/**
 * Gross to Net Calculator Page
 *
 * Page for calculating net salary from gross salary in Vietnam
 */

import { GrossToNetCalculator } from "@/components/tools";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Tính lương Gross sang Net | Công cụ tính lương",
  description:
    "Công cụ tính lương từ Gross sang Net chính xác theo quy định pháp luật Việt Nam. Tính toán thuế thu nhập cá nhân, bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp.",
  keywords: [
    "tính lương gross net",
    "tính thuế TNCN",
    "tính lương thực nhận",
    "bảo hiểm xã hội",
  ],
};

export default function GrossToNetCalculatorPage() {
  const t = useTranslations("pages.gross-to-net-calculator");
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
          <GrossToNetCalculator />
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("deductions.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong>
                      {t("deductions.socialInsurance.name")} (8%):
                    </strong>
                    <p className="text-muted-foreground mt-1">
                      {t("deductions.socialInsurance.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong>
                      {t("deductions.healthInsurance.name")} (1.5%):
                    </strong>
                    <p className="text-muted-foreground mt-1">
                      {t("deductions.healthInsurance.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong>
                      {t("deductions.unemploymentInsurance.name")} (1%):
                    </strong>
                    <p className="text-muted-foreground mt-1">
                      {t("deductions.unemploymentInsurance.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong>{t("deductions.personalIncomeTax.name")}:</strong>
                    <p className="text-muted-foreground mt-1">
                      {t("deductions.personalIncomeTax.description")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-400 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong>{t("deductions.deduction.name")}:</strong>
                    <p className="text-muted-foreground mt-1">
                      {t("deductions.deduction.description")}
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {t("importantNotes.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span className="text-muted-foreground">
                    {t("importantNotes.note1")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span className="text-muted-foreground">
                    {t("importantNotes.note2")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span className="text-muted-foreground">
                    {t("importantNotes.note3")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span className="text-muted-foreground">
                    {t("importantNotes.note4")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span className="text-muted-foreground">
                    {t("importantNotes.note5")}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tax Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("taxRates.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">
                      {t("taxRates.table.bracket")}
                    </TableHead>
                    <TableHead>{t("taxRates.table.income")}</TableHead>
                    <TableHead className="w-20">
                      {t("taxRates.table.rate")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket1")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      5%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">2</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket2")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      10%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">3</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket3")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      15%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">4</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket4")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      20%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">5</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket5")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      25%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">6</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket6")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      30%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">7</TableCell>
                    <TableCell>
                      {t("taxRates.table.brackets.bracket7")}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      35%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </ToolsPageLayout>
    </ToolsThemeProvider>
  );
}
