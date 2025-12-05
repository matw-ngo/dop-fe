"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CreditCardDetails } from "@/components/features/credit-card/CreditCardDetails";

export default function CardDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/vi/credit-cards">
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
      <div className="container mx-auto px-4 py-8">
        <CreditCardDetails cardSlug={slug} />
      </div>
    </div>
  );
}
