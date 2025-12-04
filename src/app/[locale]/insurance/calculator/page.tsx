import InsuranceCostCalculator from "@/components/features/insurance/InsuranceCostCalculator";

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
  return <InsuranceCostCalculator />;
}
