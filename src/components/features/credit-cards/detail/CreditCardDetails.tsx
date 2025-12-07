import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import vietnameseCreditCards from "@/data/credit-cards";
import { CreditCard } from "@/types/credit-card";
import { LoadingState } from "./components/LoadingState";
import { ProductHeader } from "./components/ProductHeader";
import { ProductOverviewCard } from "./components/ProductOverviewCard";
import { ProductSidebar } from "./components/ProductSidebar";
import CreditCardComponent from "../../credit-card/CreditCard";
import { BenefitsTab } from "./components/tabs/BenefitsTab";
import { FeesTab } from "./components/tabs/FeesTab";
import { FeaturesTab } from "./components/tabs/FeaturesTab";
import { RequirementsTab } from "./components/tabs/RequirementsTab";
import { ReviewsTab } from "./components/tabs/ReviewsTab";

// Extended interface for detailed card view with additional fields
interface ExtendedCardInfo extends CreditCard {
  description?: string;
}

interface CreditCardDetailsProps {
  cardSlug: string;
  onBack?: () => void;
}

export const CreditCardDetails: React.FC<CreditCardDetailsProps> = ({
  cardSlug,
  onBack,
}) => {
  const t = useTranslations("features.credit-cards.detail");
  const [isLoading, setIsLoading] = useState(false);

  // Find card from the main credit cards data
  const card: ExtendedCardInfo | undefined = vietnameseCreditCards.find(
    (c) => c.slug === cardSlug || c.id === cardSlug,
  );

  // Get related cards (mock implementation)
  const relatedCards = card
    ? vietnameseCreditCards
        .filter((c) => c.id !== card.id && c.category === card.category)
        .slice(0, 3)
    : [];

  if (!card) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">{t("details.notFound")}</h2>
        <p className="text-muted-foreground">{t("details.notFoundDesc")}</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t("breadcrumb.home")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/credit-cards">
              {t("breadcrumb.creditCards")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/credit-cards?category=${card.category}`}>
              {t(`categories.${card.category}`)}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{card.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductHeader card={card} onBack={onBack} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Overview */}
          <ProductOverviewCard card={card} />

          {/* Detailed Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                {t("details.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="benefits">
                {t("details.tabs.benefits")}
              </TabsTrigger>
              <TabsTrigger value="fees">{t("details.tabs.fees")}</TabsTrigger>
              <TabsTrigger value="features">
                {t("details.tabs.features")}
              </TabsTrigger>
              <TabsTrigger value="requirements">
                {t("details.tabs.requirements")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("details.tabs.overviewContent")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{card.description || t("details.noDescription")}</p>
                  </div>
                  {card.welcomeOffer && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border">
                      <h4 className="font-semibold mb-2">
                        {t("details.welcomeOffer")}
                      </h4>
                      <p className="text-sm">{card.welcomeOffer}</p>
                      {card.welcomeOfferExpiry && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("details.offerExpiry", {
                            date: card.welcomeOfferExpiry,
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <BenefitsTab card={card} />
            </TabsContent>

            <TabsContent value="fees" className="mt-6">
              <FeesTab card={card} />
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <FeaturesTab card={card} />
            </TabsContent>

            <TabsContent value="requirements" className="mt-6">
              <RequirementsTab card={card} />
            </TabsContent>
          </Tabs>

          {/* Reviews Section */}
          <ReviewsTab card={card} />

          {/* Related Cards */}
          {relatedCards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t("details.relatedCards")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {relatedCards.map((relatedCard) => (
                    <CreditCardComponent
                      key={relatedCard.id}
                      card={relatedCard}
                      viewMode="compact"
                      onCardClick={() =>
                        (window.location.href = `/credit-cards/${relatedCard.slug || relatedCard.id}`)
                      }
                    />
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/credit-cards">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 mx-auto"
                    >
                      {t("details.viewAllCards")}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <ProductSidebar card={card} />
        </div>
      </div>
    </div>
  );
};

export default CreditCardDetails;
