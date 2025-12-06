/**
 * Savings Calculator Page
 *
 * Page for comparing savings interest rates across Vietnamese banks
 */

import { SavingsCalculator } from "@/components/tools";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTranslations, useLocale } from "next-intl";

export default function SavingsCalculatorPage() {
  const t = useTranslations("pages.savingsCalculator");
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
      <SavingsCalculator />

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
          <h2 className="text-xl font-semibold">{t("savingsTypes.title")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>{t("savingsTypes.noTerm.name")}:</strong>{" "}
              {t("savingsTypes.noTerm.description")}
            </li>
            <li>
              • <strong>{t("savingsTypes.term.name")}:</strong>{" "}
              {t("savingsTypes.term.description")}
            </li>
            <li>
              • <strong>{t("savingsTypes.accumulation.name")}:</strong>{" "}
              {t("savingsTypes.accumulation.description")}
            </li>
            <li>
              • <strong>{t("savingsTypes.super.name")}:</strong>{" "}
              {t("savingsTypes.super.description")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
