import FeeTables from "@/components/features/insurance/FeeTables";

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
  return <FeeTables />;
}
