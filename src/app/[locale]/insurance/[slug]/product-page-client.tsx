"use client";

import type { InsuranceProduct } from "@/types/insurance";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useInsuranceNavbarTheme } from "@/hooks/features/insurance/useInsuranceNavbarTheme";
import { Suspense } from "react";
import { InsuranceDetails } from "@/components/features/insurance";
import {
  ProductHeader,
  ProductSidebar,
} from "@/components/features/insurance/detail/components";
import { InsuranceThemeProvider } from "@/components/features/insurance/InsuranceThemeProvider";
import ComparisonSnackbar from "@/components/features/insurance/InsuranceComparisonSnackbar";

interface ProductPageClientProps {
  product: InsuranceProduct;
  locale: string;
}

export default function ProductPageClient({
  product,
  locale,
}: ProductPageClientProps) {
  const navbarConfig = useInsuranceNavbarTheme();

  return (
    <InsuranceThemeProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(product)),
        }}
      />

      <div className="flex flex-col min-h-screen bg-background">
        <Header configOverride={navbarConfig} />

        <ProductHeader product={product} locale={locale} />

        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InsuranceDetails product={product} />
            </div>

            <div className="lg:col-span-1">
              <Suspense fallback={<div>Loading sidebar...</div>}>
                <ProductSidebar product={product} locale={locale} />
              </Suspense>
            </div>
          </div>
        </div>

        <Footer company="finzone" />

        <ComparisonSnackbar />
      </div>
    </InsuranceThemeProvider>
  );
}

function generateStructuredData(product: InsuranceProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceProduct",
    name: product.name,
    provider: {
      "@type": "Organization",
      name: product.issuer,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.pricing.totalPremium,
      priceCurrency: product.pricing.currency,
      availability: "https://schema.org/InStock",
    },
    description: product.metaDescription,
    image: product.image,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}
