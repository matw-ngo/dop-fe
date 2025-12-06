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
import { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";

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
      <LoanCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("loanTypes.title")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>{t("loanTypes.homeLoan.name")}:</strong>{" "}
              {t("loanTypes.homeLoan.description")}
            </li>
            <li>
              • <strong>{t("loanTypes.carLoan.name")}:</strong>{" "}
              {t("loanTypes.carLoan.description")}
            </li>
            <li>
              • <strong>{t("loanTypes.personalLoan.name")}:</strong>{" "}
              {t("loanTypes.personalLoan.description")}
            </li>
            <li>
              • <strong>{t("loanTypes.businessLoan.name")}:</strong>{" "}
              {t("loanTypes.businessLoan.description")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
