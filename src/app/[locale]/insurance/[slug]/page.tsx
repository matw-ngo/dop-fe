import { notFound } from "next/navigation";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import type { InsuranceProduct } from "@/types/insurance";
import ProductPageClient from "./product-page-client";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

async function getProductData(slug: string): Promise<InsuranceProduct> {
  const product = INSURANCE_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return product;
}

export default async function InsuranceProductDetailPage({ params }: Props) {
  const product = await getProductData(params.slug);

  return <ProductPageClient product={product} locale={params.locale} />;
}

export async function generateMetadata({ params }: Props) {
  const product = await getProductData(params.slug);

  return {
    title: product.metaTitle || `${product.name} - ${product.issuer}`,
    description:
      product.metaDescription ||
      `Thông tin chi tiết về ${product.name} từ ${product.issuer}`,
    keywords: [
      product.name,
      product.issuer,
      product.category,
      ...product.tags,
    ].join(", "),
    openGraph: {
      title: product.metaTitle || `${product.name} - ${product.issuer}`,
      description:
        product.metaDescription ||
        `Thông tin chi tiết về ${product.name} từ ${product.issuer}`,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.imageAlt,
        },
      ],
      locale: params.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle || `${product.name} - ${product.issuer}`,
      description:
        product.metaDescription ||
        `Thông tin chi tiết về ${product.name} từ ${product.issuer}`,
      images: [product.image],
    },
    alternates: {
      canonical: `/${params.locale}/insurance/${product.slug}`,
      languages: {
        [params.locale]: `/${params.locale}/insurance/${product.slug}`,
        "x-default": `/en/insurance/${product.slug}`,
      },
    },
  };
}

export async function generateStructuredData(product: InsuranceProduct) {
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
