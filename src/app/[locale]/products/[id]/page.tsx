import { Metadata } from "next";
import { ProductDetail } from "@/components/features/product/detail";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { dopClient } from "@/lib/api/services/dop";

interface ProductDetailPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const { data } = await dopClient.GET("/products/{id}", {
      params: {
        path: { id: params.id },
        query: { tenant_id: "finzone" },
      },
    });

    if (data) {
      return {
        title: `${data.name} - Fin Zone`,
        description:
          data.description ||
          data.summary ||
          "Xem chi tiết thông tin sản phẩm tài chính",
      };
    }
  } catch (error) {
    console.error("Failed to fetch product metadata:", error);
  }

  return {
    title: "Chi tiết sản phẩm - Fin Zone",
    description: "Xem chi tiết thông tin sản phẩm tài chính",
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <TenantThemeProvider>
      <Header />
      <main className="min-h-screen pt-[60px] md:pt-[72px]">
        <ProductDetail productId={params.id} />
      </main>
      <Footer />
    </TenantThemeProvider>
  );
}
