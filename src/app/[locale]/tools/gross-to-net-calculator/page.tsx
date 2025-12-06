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
import { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";

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
  const t = useTranslations("pages.grossToNetCalculator");
  const locale = useLocale();
  return (
    <div className="container mx-auto py-6 space-y-6">
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

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      {/* Calculator Component */}
      <GrossToNetCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("deductions.title")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>{t("deductions.socialInsurance.name")} (8%):</strong>{" "}
              {t("deductions.socialInsurance.description")}
            </li>
            <li>
              • <strong>{t("deductions.healthInsurance.name")} (1.5%):</strong>{" "}
              {t("deductions.healthInsurance.description")}
            </li>
            <li>
              •{" "}
              <strong>
                {t("deductions.unemploymentInsurance.name")} (1%):
              </strong>{" "}
              {t("deductions.unemploymentInsurance.description")}
            </li>
            <li>
              • <strong>{t("deductions.personalIncomeTax.name")}:</strong>{" "}
              {t("deductions.personalIncomeTax.description")}
            </li>
            <li>
              • <strong>{t("deductions.deduction.name")}:</strong>{" "}
              {t("deductions.deduction.description")}
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("importantNotes.title")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("importantNotes.note1")}</li>
            <li>{t("importantNotes.note2")}</li>
            <li>{t("importantNotes.note3")}</li>
            <li>{t("importantNotes.note4")}</li>
            <li>{t("importantNotes.note5")}</li>
          </ul>
        </div>
      </div>

      {/* Tax Rates Table */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t("taxRates.title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("taxRates.table.bracket")}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("taxRates.table.income")}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("taxRates.table.rate")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket1")}
                </td>
                <td className="border border-gray-300 px-4 py-2">5%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket2")}
                </td>
                <td className="border border-gray-300 px-4 py-2">10%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">3</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket3")}
                </td>
                <td className="border border-gray-300 px-4 py-2">15%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">4</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket4")}
                </td>
                <td className="border border-gray-300 px-4 py-2">20%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">5</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket5")}
                </td>
                <td className="border border-gray-300 px-4 py-2">25%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">6</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket6")}
                </td>
                <td className="border border-gray-300 px-4 py-2">30%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">7</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("taxRates.table.brackets.bracket7")}
                </td>
                <td className="border border-gray-300 px-4 py-2">35%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
