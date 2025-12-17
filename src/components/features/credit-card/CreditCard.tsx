"use client";

import {
  ArrowLeftRight,
  CheckCircle,
  ExternalLink,
  Gift,
  Plus,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CARD_CATEGORIES, CARD_NETWORKS } from "@/constants/credit-cards";
import { cn } from "@/lib/utils";
import type { CreditCard as CreditCardType } from "@/types/credit-card";

interface CreditCardProps {
  card: CreditCardType;
  viewMode?: "grid" | "list" | "compact";
  showCompareButton?: boolean;
  onCompare?: (cardId: string) => void;
  onCardClick?: (card: CreditCardType) => void;
  isSelected?: boolean;
  isInComparison?: boolean;
  className?: string;
}

const CreditCard: React.FC<CreditCardProps> = ({
  card,
  viewMode = "grid",
  showCompareButton = true,
  onCompare,
  onCardClick,
  isSelected = false,
  isInComparison = false,
  className,
}) => {
  const t = useTranslations("features.credit-cards.listing");

  // Format currency to VND
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get network badge color
  const getNetworkBadgeVariant = (network: string) => {
    switch (network) {
      case "visa":
        return "default";
      case "mastercard":
        return "secondary";
      case "jcb":
        return "outline";
      default:
        return "default";
    }
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground",
        )}
      />
    ));
  };

  // Handle card click
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  // Handle compare button click
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(card.id);
    }
  };

  // Compact view for comparison table
  if (viewMode === "compact") {
    return (
      <div className={cn("flex items-center space-x-3 p-2", className)}>
        <Image
          src={card.image}
          alt={card.name}
          width={60}
          height={40}
          className="object-contain rounded"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{card.name}</h4>
          <p className="text-sm text-muted-foreground">{card.issuer}</p>
        </div>
        <Badge variant={getNetworkBadgeVariant(card.cardType)}>
          {card.cardType.toUpperCase()}
        </Badge>
      </div>
    );
  }

  // List view
  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary",
          className,
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Image
              src={card.image}
              alt={card.name}
              width={120}
              height={80}
              className="object-contain rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{card.name}</h3>
                  <p className="text-muted-foreground">{card.issuer}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {renderStars(card.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({card.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={getNetworkBadgeVariant(card.cardType)}>
                    {card.cardType.toUpperCase()}
                  </Badge>
                  {card.isRecommended && (
                    <Badge variant="secondary" className="text-xs">
                      {t("recommended")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("annualFee")}
                  </p>
                  <p className="font-medium">
                    {card.annualFee === 0
                      ? t("free")
                      : formatCurrency(card.annualFee)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("interestRate")}
                  </p>
                  <p className="font-medium">{card.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("creditLimit")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(card.creditLimitMin)}+
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("incomeRequired")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(card.incomeRequiredMin)}/mo
                  </p>
                </div>
              </div>

              {card.welcomeOffer && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{card.welcomeOffer}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  {card.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {card.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{card.features.length - 3} {t("more")}
                    </Badge>
                  )}
                </div>
                {showCompareButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCompareClick}
                    disabled={isInComparison}
                  >
                    {isInComparison ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("inComparison")}
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight className="h-4 w-4 mr-1" />
                        {t("compare")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
        isSelected && "ring-2 ring-primary",
        className,
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={getNetworkBadgeVariant(card.cardType)}>
              {card.cardType.toUpperCase()}
            </Badge>
            {card.isNew && (
              <Badge variant="destructive" className="text-xs">
                {t("new")}
              </Badge>
            )}
            {card.isRecommended && (
              <Badge variant="secondary" className="text-xs">
                {t("recommended")}
              </Badge>
            )}
          </div>
          {showCompareButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCompareClick}
              disabled={isInComparison}
            >
              {isInComparison ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative h-32 mx-auto">
          <Image
            src={card.image}
            alt={card.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{card.name}</h3>
          <p className="text-muted-foreground text-sm">{card.issuer}</p>

          <div className="flex items-center space-x-1">
            {renderStars(card.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              ({card.reviewCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>{card.interestRate}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>
              {card.annualFee === 0
                ? t("free")
                : formatCurrency(card.annualFee)}
            </span>
          </div>
        </div>

        {card.welcomeOffer && (
          <div className="p-2 bg-primary/5 rounded-lg">
            <div className="flex items-center space-x-1">
              <Gift className="h-3 w-3 text-primary" />
              <p className="text-xs font-medium line-clamp-2">
                {card.welcomeOffer}
              </p>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("creditLimit")}</span>
            <span className="font-medium">
              {formatCurrency(card.creditLimitMin)}+
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("incomeRequired")}</span>
            <span className="font-medium">
              {formatCurrency(card.incomeRequiredMin)}/mo
            </span>
          </div>
        </div>

        {card.digitalFeatures?.mobileBanking && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>{t("digitalBanking")}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/credit-cards/${card.slug}`}
          className="w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button className="w-full" variant="outline">
            {t("viewDetails")}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CreditCard;
