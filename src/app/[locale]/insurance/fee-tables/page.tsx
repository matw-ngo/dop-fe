import FeeTables from "@/components/features/insurance/FeeTables";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";

interface FeeTablesPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: FeeTablesPageProps) {
  return {
    title: "Biểu phí bảo hiểm",
    description:
      "Biểu phí bảo hiểm bắt buộc và tự nguyện cho các loại xe tại Việt Nam theo quy định hiện hành",
  };
}

export default function FeeTablesPage({
  params: { locale },
}: FeeTablesPageProps) {
  return (
    <>
      <Header configOverride={getInsuranceNavbarConfig()} />
      <main>
        <FeeTables />
      </main>
      <Footer company="finzone" />
    </>
  );
}
