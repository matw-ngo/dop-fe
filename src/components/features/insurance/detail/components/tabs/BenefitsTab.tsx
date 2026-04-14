import {
  Award,
  Check,
  Gift,
  Globe,
  HeadphonesIcon,
  Mail,
  Percent,
  Phone,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import type React from "react";
import { formatCurrency } from "@/lib/utils";
import {
  formatEmailUrl,
  formatHotlineUrl,
  formatWebsiteUrl,
} from "../../utils";
import { ServiceCard } from "../ServiceCard";

interface BenefitsTabProps {
  product: any;
  t: any;
}

export const BenefitsTab: React.FC<BenefitsTabProps> = ({ product, t }) => {
  return (
    <div className="mt-6 space-y-6">
      {/* Main Benefits */}
      <div className="bg-muted/30 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          {t("tabs.benefits.mainBenefits.title")}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {product.benefits.map((benefit: string, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-card rounded-lg border"
            >
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {t("tabs.benefits.features.title")}
        </h3>
        <div className="grid gap-3">
          {product.features.map((feature: string, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Star className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Services */}
      {product.additionalServices && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5 text-primary" />
            {t("tabs.benefits.services.title")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(product.additionalServices).map(([key, value]) => (
              <ServiceCard
                key={key}
                service={key}
                available={value as boolean}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-xl">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              {t("tabs.benefits.emergencySupport.title")}
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href={formatHotlineUrl(product.claims.contactInfo.hotline)}
                className="flex items-center gap-2 p-3 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <Phone className="w-4 h-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("tabs.benefits.emergencySupport.hotline247")}
                  </p>
                  <p className="font-medium">
                    {product.claims.contactInfo.hotline}
                  </p>
                </div>
              </a>
              <a
                href={formatEmailUrl(product.claims.contactInfo.email)}
                className="flex items-center gap-2 p-3 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("tabs.benefits.emergencySupport.email")}
                  </p>
                  <p className="font-medium text-sm">
                    {product.claims.contactInfo.email}
                  </p>
                </div>
              </a>
              {product.claims.contactInfo.website && (
                <a
                  href={formatWebsiteUrl(product.claims.contactInfo.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-card rounded-lg border hover:shadow-md transition-shadow"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("tabs.benefits.emergencySupport.website")}
                    </p>
                    <p className="font-medium text-sm">
                      {product.claims.contactInfo.website}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Special Offers */}
      <div className="bg-muted/30 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          {t("tabs.benefits.offers.title")}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {product.paymentOptions.discounts?.map(
            (discount: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-card rounded-lg border"
              >
                <Percent className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">
                    {t("tabs.benefits.offers.discount", {
                      value:
                        discount.type === "percentage"
                          ? `${discount.value}%`
                          : formatCurrency(discount.value),
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {discount.condition}
                  </p>
                </div>
              </div>
            ),
          )}
          {product.renewal.noClaimBonus.maxYears > 0 && (
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">
                  {t("tabs.benefits.offers.noClaimBonus")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("tabs.benefits.offers.noClaimBonusDesc", {
                    maxDiscount: product.renewal.noClaimBonus.maxDiscount,
                    maxYears: product.renewal.noClaimBonus.maxYears,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
