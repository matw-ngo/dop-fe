import { Metadata } from "next";
import { ProductCompare } from "@/components/features/product/compare";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";

export const metadata: Metadata = {
  title: "So sánh sản phẩm - Fin Zone",
  description: "So sánh các sản phẩm tài chính để tìm lựa chọn phù hợp nhất",
};

export default function ProductComparePage() {
  return (
    <TenantThemeProvider>
      <ProductCompare />
    </TenantThemeProvider>
  );
}
