"use client";

import type { InsuranceProduct } from "@/types/insurance";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import { Suspense } from "react";
import { InsuranceDetails } from "@/components/features/insurance";
import { ProductHeader, ProductSidebar } from "@/components/features/insurance/detail/components";

interface ProductPageClientProps {
  product: InsuranceProduct;
  locale: string;
}

export default function ProductPageClient({ product, locale }: ProductPageClientProps) {
  const navbarConfig = getInsuranceNavbarConfig();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(product)),
        }}
      />

      <div className="min-h-screen bg-background">
        <Header configOverride={navbarConfig} />

        <ProductHeader product={product} locale={locale} />

        <div className="container mx-auto px-4 py-8">
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
      </div>

      <Footer company="finzone" />
    </>
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