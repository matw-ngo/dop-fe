// @ts-nocheck
import InsuranceTutorial from "@/components/features/insurance/InsuranceTutorial";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";

interface TutorialsPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    category?: string;
    difficulty?: string;
    search?: string;
  };
}

export default function TutorialsPage({
  params: { locale },
}: TutorialsPageProps) {
  return (
    <>
      <Header configOverride={getInsuranceNavbarConfig()} />
      <main>
        <InsuranceTutorial locale={locale} />
      </main>
      <Footer company="finzone" />
    </>
  );
}
