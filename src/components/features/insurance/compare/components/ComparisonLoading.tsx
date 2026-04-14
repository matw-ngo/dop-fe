import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";

export function ComparisonLoading() {
  const t = useTranslations();

  return (
    <>
      <Header configOverride={getInsuranceNavbarConfig()} />
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-lg">{t("pages.insurance.loadingComparison")}</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
