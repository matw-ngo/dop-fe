// @ts-nocheck
import RegulationContent from "@/components/features/insurance/RegulationContent";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";

interface RegulationsPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: RegulationsPageProps) {
  return {
    title: "Quy định pháp luật về bảo hiểm",
    description:
      "Tổng hợp các văn bản pháp quy, thông tư, nghị định về bảo hiểm tại Việt Nam",
  };
}

export default function RegulationsPage({
  params: { locale },
}: RegulationsPageProps) {
  return (
    <>
      <Header configOverride={getInsuranceNavbarConfig()} />
      <main>
        <RegulationContent />
      </main>
      <Footer company="finzone" />
    </>
  );
}
