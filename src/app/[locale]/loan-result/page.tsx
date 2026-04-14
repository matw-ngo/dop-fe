"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { LoanResultScreen } from "@/components/loan-application/LoanSearching/LoanResultScreen";
import { RegistrationSuccessView } from "@/components/loan-application/LoanSearching/LoanResult/views/RegistrationSuccessView";
import { useMatchedProducts } from "@/store/use-loan-search-store";
import type { components } from "@/lib/api/v1/dop";

type MatchedProduct = components["schemas"]["matched_product"];

export default function LoanResultPage() {
  const router = useRouter();
  const tenant = useTenant();
  const matchedProducts = useMatchedProducts();
  const [selectedProduct, setSelectedProduct] = useState<MatchedProduct | null>(
    null,
  );

  useEffect(() => {
    if (matchedProducts.length === 0) {
      router.replace("/");
    }
  }, [matchedProducts, router]);

  if (matchedProducts.length === 0) {
    return null;
  }

  return (
    <TenantThemeProvider>
      <Header />
      <main
        className="min-h-screen pt-[60px] md:pt-[72px]"
        style={{ backgroundColor: tenant.theme.colors.readOnly }}
      >
        <div className="max-w-[1200px] mx-auto">
          {selectedProduct ? (
            <RegistrationSuccessView
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
            />
          ) : (
            <LoanResultScreen
              onSelectProduct={(product) => setSelectedProduct(product)}
            />
          )}
        </div>
      </main>
      <Footer />
    </TenantThemeProvider>
  );
}
