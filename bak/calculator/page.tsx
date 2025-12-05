// @ts-nocheck
import InsuranceCostCalculator from "@/components/features/insurance/InsuranceCostCalculator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";

interface CalculatorPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: CalculatorPageProps) {
  return {
    title: "Công cụ tính phí bảo hiểm",
    description:
      "Công cụ tính phí bảo hiểm bắt buộc và tự nguyện cho các loại xe tại Việt Nam",
  };
}

export default function CalculatorPage({
  params: { locale },
}: CalculatorPageProps) {
  return (
    <>
      <Header configOverride={getInsuranceNavbarConfig()} />
      <main>
        <InsuranceCostCalculator />
      </main>
      <Footer company="finzone" />
    </>
  );
}
