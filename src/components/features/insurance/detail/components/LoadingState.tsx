import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import { useTranslations } from "next-intl";

interface LoadingStateProps {
  locale: string;
}

export const LoadingState = ({ locale }: LoadingStateProps) => {
  const tCommon = useTranslations("common");
  const insuranceNavbarConfig = getInsuranceNavbarConfig();

  return (
    <>
      <Header configOverride={insuranceNavbarConfig} />
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          {tCommon("loading")}
        </div>
      </main>
      <Footer company="finzone" />
    </>
  );
}