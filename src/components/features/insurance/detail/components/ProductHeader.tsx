import type { InsuranceProduct } from "@/types/insurance";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface ProductHeaderProps {
  product: InsuranceProduct;
  locale: string;
}

export const ProductHeader = ({ product, locale }: ProductHeaderProps) => {
  const t = useTranslations("features.insurance.detail");
  const tCommon = useTranslations("common");

  const breadcrumbItems = [
    { label: t("breadcrumb.home"), href: `/${locale}` },
    {
      label: t("breadcrumb.insurance"),
      href: `/${locale}/insurance`,
    },
    {
      label: getCategoryDisplayName(product.category, t),
      href: `/${locale}/insurance?category=${product.category}`,
    },
    { label: product.name },
  ];

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/${locale}/insurance`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        </div>

        <BreadcrumbNav items={breadcrumbItems} />

        <div className="mt-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {product.name}
                </h1>
                {product.isRecommended && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {t("recommended")}
                  </Badge>
                )}
                {product.isNew && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {t("new")}
                  </Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-3">
                {product.issuer}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {t("productCode")}: {product.productCode || product.id}
                </span>
                <span>•</span>
                <span>
                  {t("rating")}: {product.rating}/5 ({t("reviews")})
                  {product.reviewCount.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getCategoryDisplayName(category: string, t: any): string {
  const categoryKeys: Record<string, string> = {
    vehicle: "categories.vehicle",
    health: "categories.health",
    life: "categories.life",
    travel: "categories.travel",
    property: "categories.property",
  };
  return t(categoryKeys[category]) || category;
}
