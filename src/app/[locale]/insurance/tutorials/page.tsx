import InsuranceTutorial from "@/components/features/insurance/InsuranceTutorial";

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
  return <InsuranceTutorial locale={locale} />;
}
