import type { Metadata } from "next";
import { ProductList } from "@/components/features/product/list";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";

export const metadata: Metadata = {
  title: "Sản phẩm tài chính - Fin Zone",
  description:
    "Khám phá các sản phẩm tài chính đa dạng từ vay vốn, thẻ tín dụng đến bảo hiểm",
};

export default function ProductsPage() {
  return (
    <TenantThemeProvider>
      <Header />
      <main className="min-h-screen pt-[60px] md:pt-[72px]">
        <ProductList />
      </main>
      <Footer />
    </TenantThemeProvider>
  );
}
