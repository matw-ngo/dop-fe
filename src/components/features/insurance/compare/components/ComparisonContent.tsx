import InsuranceGrid from "@/components/features/insurance/InsuranceGrid";
import { InsuranceComparison } from "@/components/features/insurance/InsuranceComparison";
import ComparisonPanel from "@/components/features/insurance/ComparisonPanel";
import { useTranslations, useLocale } from "next-intl";
import { InsuranceProduct } from "@/types/insurance";

interface ComparisonContentProps {
  products: InsuranceProduct[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export function ComparisonContent({ products, onRemoveProduct, onClearAll }: ComparisonContentProps) {
  const t = useTranslations();
  const locale = useLocale();

  const handleAddProduct = () => {
    // Navigate back to insurance listing to add more products
    window.location.href = `/${locale}/insurance`;
  };

  return (
    <div className="space-y-8">
      {/* Comparison Panel */}
      <div className="lg:col-span-1">
        <ComparisonPanel
          products={products}
          onAdd={handleAddProduct}
          onRemove={onRemoveProduct}
          onClear={onClearAll}
          maxProducts={3}
          isSticky={true}
        />
      </div>

      {/* Main Comparison Area */}
      <div>
        {products.length > 0 && (
          <InsuranceComparison
            products={products}
            onRemove={onRemoveProduct}
            onClear={onClearAll}
          />
        )}
      </div>

      {/* Suggestions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {t("pages.insurance.youMightAlsoLike")}
        </h2>
        <InsuranceGrid
          products={[]} // Will be populated with suggestions in Task 28
          columns={3}
          gap="4"
          emptyStateMessage={
            t("pages.insurance.noMoreSuggestions")
          }
        />
      </div>
    </div>
  );
}