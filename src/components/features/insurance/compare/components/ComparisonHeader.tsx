import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

interface ComparisonHeaderProps {
  locale: string;
  productCount: number;
  onClearAll: () => void;
}

export function ComparisonHeader({
  locale,
  productCount,
  onClearAll,
}: ComparisonHeaderProps) {
  const t = useTranslations();

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t("common.home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/insurance`}>
                {t("pages.insurance.insuranceProducts")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("pages.insurance.compare")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/insurance`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("pages.insurance.compareProducts")}
              </h1>
              <p className="text-muted-foreground">
                {t("pages.insurance.compareDescription")}
              </p>
            </div>
          </div>

          {productCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {productCount} {t("pages.insurance.products")}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                {t("pages.insurance.clearAll")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
