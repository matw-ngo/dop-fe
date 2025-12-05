"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CreditCardDetails } from "@/components/features/credit-card/CreditCardDetails";
import { CreditCardsThemeProvider } from "@/components/features/credit-card/CreditCardsThemeProvider";
import { CreditCardComparisonSnackbar } from "@/components/features/credit-cards";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useCreditCardsNavbarTheme } from "@/hooks/features/credit-card/useCreditCardsNavbarTheme";

export default function CardDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations();

  // Configuration - use theme-aware navbar config
  const creditCardsNavbarConfig = useCreditCardsNavbarTheme();

  return (
    <CreditCardsThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header configOverride={creditCardsNavbarConfig} />

        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/credit-cards">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.back")}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("pages.creditCard.cardDetails")}
                </h1>
                <p className="text-muted-foreground">
                  {t("pages.creditCard.cardDetailsDescription") ||
                    "Thông tin chi tiết và điều kiện thẻ"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <CreditCardDetails cardSlug={slug} />
          </div>
        </main>

        <Footer company="finzone" />

        {/* Comparison Snackbar */}
        <CreditCardComparisonSnackbar />
      </div>
    </CreditCardsThemeProvider>
  );
}
