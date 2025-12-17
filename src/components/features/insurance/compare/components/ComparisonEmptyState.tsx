import { Search, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ComparisonEmptyStateProps {
  onGoBack?: () => void;
}

export function ComparisonEmptyState({ onGoBack }: ComparisonEmptyStateProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Shield className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold mb-4">
        {t("pages.insurance.noProductsToCompare")}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {t("pages.insurance.selectAtLeastTwo") ||
          "Vui lòng chọn ít nhất 2 sản phẩm bảo hiểm để so sánh và tìm thấy gói phù hợp nhất với bạn"}
      </p>
      <div className="space-y-4">
        <Link href={`/${locale}/insurance`}>
          <Button size="lg" className="mr-4">
            <Search className="w-4 h-4 mr-2" />
            {t("pages.insurance.browseInsurance")}
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={onGoBack || (() => router.back())}
        >
          {t("common.goBack")}
        </Button>
      </div>

      {/* Additional Help Text */}
      <div className="mt-12 p-6 bg-muted rounded-lg max-w-2xl mx-auto">
        <h3 className="font-semibold mb-3">
          {t("pages.insurance.howToCompare")}
        </h3>
        <ol className="text-left text-sm text-muted-foreground space-y-2">
          <li>1. {t("pages.insurance.step1")}</li>
          <li>2. {t("pages.insurance.step2")}</li>
          <li>3. {t("pages.insurance.step3")}</li>
          <li>4. {t("pages.insurance.step4")}</li>
        </ol>
      </div>
    </div>
  );
}
