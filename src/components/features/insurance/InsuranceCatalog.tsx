import React from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import {
  InsuranceProduct,
  getInsuranceProductsByCategory,
  getAllInsuranceProducts,
  getCategoryName,
} from "@/data/mock-insurance-products";

interface InsuranceCatalogProps {
  category: string;
  onProductSelect: (productId: string) => void;
}

export const InsuranceCatalog: React.FC<InsuranceCatalogProps> = ({
  category,
  onProductSelect,
}) => {
  const products =
    category === "all"
      ? getAllInsuranceProducts()
      : getInsuranceProductsByCategory(category);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {category === "all"
            ? "Tất cả gói bảo hiểm"
            : `Bảo hiểm ${getCategoryName(category)}`}
        </h2>
        <p className="text-gray-600">
          {category === "all"
            ? "So sánh và chọn gói bảo hiểm phù hợp với bạn"
            : `Các gói bảo hiểm ${getCategoryName(category.toLowerCase())} hàng đầu Việt Nam`}
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onProductSelect(product.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.provider}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Phạm vi bảo hiểm:</strong> {product.coverage}
              </p>
              <p className="text-sm">
                <strong>Phí bảo hiểm:</strong> {product.premium}
              </p>
            </div>
            <div className="mt-4">
              <Button
                className="w-full"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to quote page
                  const categorySlug = category === "all" ? "all" : category;
                  window.location.href = `/vi/insurance/${categorySlug}/${product.id}/quote`;
                }}
              >
                Yêu cầu báo giá
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceCatalog;
