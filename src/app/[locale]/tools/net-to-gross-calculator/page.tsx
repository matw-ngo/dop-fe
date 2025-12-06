/**
 * Net to Gross Calculator Page
 *
 * Page for calculating gross salary from desired net salary in Vietnam
 */

import { NetToGrossCalculator } from "@/components/tools";
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
  title: "Tính lương Net sang Gross | Công cụ tính lương",
  description:
    "Công cụ tính lương từ Net sang Gross chính xác. Xác định mức lương Gross cần đề nghị để đạt được mức lương Net mong muốn sau khi đã trừ các khoản thuế và bảo hiểm.",
  keywords: [
    "tính lương net gross",
    "tính lương đề nghị",
    "tính thuế TNCN ngược",
    "lương gross cần đạt",
  ],
};

export default function NetToGrossCalculatorPage() {
  const t = useTranslations("pages.netToGrossCalculator");
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
      <NetToGrossCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("usageGuide.title")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("usageGuide.step1")}</li>
            <li>{t("usageGuide.step2")}</li>
            <li>{t("usageGuide.step3")}</li>
            <li>{t("usageGuide.step4")}</li>
            <li>{t("usageGuide.step5")}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {t("negotiationTips.title")}
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("negotiationTips.tip1")}</li>
            <li>{t("negotiationTips.tip2")}</li>
            <li>{t("negotiationTips.tip3")}</li>
            <li>{t("negotiationTips.tip4")}</li>
            <li>{t("negotiationTips.tip5")}</li>
          </ul>
        </div>
      </div>

      {/* Example Calculations */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t("examples.title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("examples.table.netWanted")}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("examples.table.grossNeeded")}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("examples.table.totalDeductions")}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t("examples.table.notes")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">10 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  ~12.8 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">~2.8 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("examples.table.rows.row1.note")}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">15 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  ~19.5 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">~4.5 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("examples.table.rows.row2.note")}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">20 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  ~26.5 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">~6.5 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("examples.table.rows.row3.note")}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">30 triệu</td>
                <td className="border border-gray-300 px-4 py-2">~41 triệu</td>
                <td className="border border-gray-300 px-4 py-2">~11 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  {t("examples.table.rows.row4.note")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          * {t("examples.disclaimer")}
        </p>
      </div>

      {/* Tips Section */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          {t("tips.title")}
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• 💡 {t("tips.tip1")}</li>
          <li>• 💡 {t("tips.tip2")}</li>
          <li>• 💡 {t("tips.tip3")}</li>
          <li>• 💡 {t("tips.tip4")}</li>
          <li>• 💡 {t("tips.tip5")}</li>
        </ul>
      </div>
    </div>
  );
}
