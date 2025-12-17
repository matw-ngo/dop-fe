import { Car, Heart, Home, Plane, Shield } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductOverviewCardProps } from "../types";
import { getCoveragePeriodText } from "../utils";

const categoryIcons = {
  health: <Heart className="w-5 h-5" />,
  vehicle: <Car className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  property: <Home className="w-5 h-5" />,
  life: <Shield className="w-5 h-5" />,
};

export const ProductOverviewCard = React.memo(function ProductOverviewCard({
  product,
  t,
}: ProductOverviewCardProps) {
  const getCategoryIcon = (category: string) => {
    return (
      categoryIcons[category as keyof typeof categoryIcons] || (
        <Shield className="w-5 h-5" />
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getCategoryIcon(product.category)}
          {t("productOverview.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">
              {t("productOverview.basicInfo")}
            </h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("productOverview.provider")}:
                </dt>
                <dd className="font-medium">{product.issuer}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("productOverview.insuranceType")}:
                </dt>
                <dd className="font-medium">
                  {product.type === "compulsory"
                    ? t("productOverview.compulsory")
                    : t("productOverview.voluntary")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("productOverview.coveragePeriod")}:
                </dt>
                <dd className="font-medium">
                  {product.pricing.customPeriodDays
                    ? `${product.pricing.customPeriodDays} ${t("units.days")}`
                    : getCoveragePeriodText(product.pricing.coveragePeriod)}
                </dd>
              </div>
              {product.productCode && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {t("productOverview.productCode")}:
                  </dt>
                  <dd className="font-medium">{product.productCode}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h4 className="font-semibold mb-3">
              {t("productOverview.insuredObjects")}
            </h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("productOverview.ageRange")}:
                </dt>
                <dd className="font-medium">
                  {product.eligibility.ageRange.min}
                  {product.eligibility.ageRange.max &&
                    ` - ${product.eligibility.ageRange.max}`}
                </dd>
              </div>
              {product.eligibility.occupation && (
                <div>
                  <dt className="text-muted-foreground">
                    {t("productOverview.occupation")}:
                  </dt>
                  <dd className="mt-1">
                    {product.eligibility.occupation.map(
                      (occ: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mr-2 mb-2"
                        >
                          {occ}
                        </Badge>
                      ),
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
