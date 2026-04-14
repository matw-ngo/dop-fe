import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/features/product/detail";

interface ProductDetailPageProps {
  params: {
    id: string;
    locale: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  // TODO: Fetch product data for metadata
  // For now, return default metadata
  return {
    title: "Chi tiết sản phẩm - Fin Zone",
    description: "Xem chi tiết thông tin sản phẩm tài chính",
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetail productId={params.id} />;
}
