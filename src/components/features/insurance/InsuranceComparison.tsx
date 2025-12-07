import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Check,
  X,
  Star,
  Clock,
  DollarSign,
  AlertCircle,
  Phone,
  Globe,
  Car,
  Heart,
  Home,
  Plane,
  Users,
  Trash2,
} from "lucide-react";
import { InsuranceProduct, CoveragePeriod, FeeType } from "@/types/insurance";

interface InsuranceComparisonProps {
  products: InsuranceProduct[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  className?: string;
}

export const InsuranceComparison: React.FC<InsuranceComparisonProps> = ({
  products,
  onRemove,
  onClear,
  className = "",
}) => {
  const t = useTranslations("features.insurance.comparison");

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vehicle":
        return <Car className="w-5 h-5" />;
      case "health":
        return <Heart className="w-5 h-5" />;
      case "travel":
        return <Plane className="w-5 h-5" />;
      case "property":
        return <Home className="w-5 h-5" />;
      case "life":
        return <Users className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get coverage period label
  const getCoveragePeriodLabel = (period: CoveragePeriod) => {
    switch (period) {
      case "monthly":
        return "Hàng tháng";
      case "quarterly":
        return "Hàng quý";
      case "semi-annually":
        return "6 tháng";
      case "annually":
        return "Hàng năm";
      case "custom":
        return "Tùy chỉnh";
      default:
        return period;
    }
  };

  // Get fee type label
  const getFeeTypeLabel = (feeType: FeeType) => {
    switch (feeType) {
      case "fixed":
        return "Cố định";
      case "percentage":
        return "% Giá trị";
      case "tiered":
        return "Theo bậc";
      case "calculated":
        return "Theo công thức";
      default:
        return feeType;
    }
  };

  // Find best value for each metric
  const findBestValue = (metric: string) => {
    if (products.length === 0) return null;

    let bestProduct = products[0];
    let bestValue: any = null;

    switch (metric) {
      case "rating":
        bestValue = Math.max(...products.map((p) => p.rating));
        return products.find((p) => p.rating === bestValue)?.id;

      case "pricing.totalPremium":
        bestValue = Math.min(...products.map((p) => p.pricing.totalPremium));
        return products.find((p) => p.pricing.totalPremium === bestValue)?.id;

      case "claims.approvalRate":
        bestValue = Math.max(...products.map((p) => p.claims.approvalRate));
        return products.find((p) => p.claims.approvalRate === bestValue)?.id;

      case "claims.processingTime":
        bestValue = Math.min(...products.map((p) => p.claims.processingTime));
        return products.find((p) => p.claims.processingTime === bestValue)?.id;

      default:
        return null;
    }
  };

  if (products.length === 0) {
    return null;
  }

  const bestRatingId = findBestValue("rating");
  const bestPremiumId = findBestValue("pricing.totalPremium");
  const bestApprovalRateId = findBestValue("claims.approvalRate");
  const bestProcessingTimeId = findBestValue("claims.processingTime");

  return (
    <div
      className={`bg-card rounded-lg border shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          So sánh {products.length} sản phẩm bảo hiểm
        </h3>
        <Button variant="outline" size="sm" onClick={onClear}>
          Xóa tất cả
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header with Product Cards */}
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-4 border-b font-medium sticky left-0 bg-card">
                Tiêu chí
              </th>
              {products.map((product, index) => (
                <th
                  key={product.id}
                  className="text-center p-4 border-b min-w-[200px]"
                >
                  <div className="space-y-2">
                    {/* Product Avatar */}
                    <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto flex items-center justify-center relative">
                      {getCategoryIcon(product.category)}
                      {product.isRecommended && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded-full">
                          Đề xuất
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.issuer}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(product.id)}
                      className="h-6 w-6 p-0 mx-auto hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Coverage Section */}
            <tr className="bg-muted/20">
              <td
                colSpan={products.length + 1}
                className="p-3 border-b font-semibold text-sm"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Mức bảo hiểm
              </td>
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Tai nạn cá nhân
                </div>
              </td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  {product.coverage.personalAccident.disabled ? (
                    <X className="w-4 h-4 text-red-500 mx-auto" />
                  ) : (
                    <span className="font-semibold text-green-600">
                      {formatCurrency(product.coverage.personalAccident.limit)}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-purple-600" />
                  Tài sản
                </div>
              </td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  {product.coverage.propertyDamage.disabled ? (
                    <X className="w-4 h-4 text-red-500 mx-auto" />
                  ) : (
                    <span className="font-semibold text-green-600">
                      {formatCurrency(product.coverage.propertyDamage.limit)}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  Chi phí y tế
                </div>
              </td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  {product.coverage.medicalExpenses.disabled ? (
                    <X className="w-4 h-4 text-red-500 mx-auto" />
                  ) : (
                    <span className="font-semibold text-green-600">
                      {formatCurrency(product.coverage.medicalExpenses.limit)}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Pricing Section */}
            <tr className="bg-muted/20">
              <td
                colSpan={products.length + 1}
                className="p-3 border-b font-semibold text-sm"
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Phí bảo hiểm
              </td>
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">Phí cơ bản</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  {formatCurrency(product.pricing.basePremium)}
                </td>
              ))}
            </tr>

            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">Tổng phí (含VAT)</td>
              {products.map((product) => (
                <td
                  key={product.id}
                  className={`text-center p-4 border-b font-semibold ${
                    product.id === bestPremiumId
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : ""
                  }`}
                >
                  {formatCurrency(product.pricing.totalPremium)}
                  {product.id === bestPremiumId && (
                    <div className="text-xs mt-1">Thấp nhất</div>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">Thời gian bảo hiểm</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                    {getCoveragePeriodLabel(product.pricing.coveragePeriod)}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">Loại phí</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  <span className="text-sm">
                    {getFeeTypeLabel(product.pricing.feeType)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Claims Metrics */}
            <tr className="bg-muted/20">
              <td
                colSpan={products.length + 1}
                className="p-3 border-b font-semibold text-sm"
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Dịch vụ bồi thường
              </td>
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">Tỷ lệ duyệt yêu cầu</td>
              {products.map((product) => (
                <td
                  key={product.id}
                  className={`text-center p-4 border-b font-semibold ${
                    product.id === bestApprovalRateId
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : ""
                  }`}
                >
                  {product.claims.approvalRate}%
                  {product.id === bestApprovalRateId && (
                    <div className="text-xs mt-1">Cao nhất</div>
                  )}
                </td>
              ))}
            </tr>

            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Thời gian xử lý
                </div>
              </td>
              {products.map((product) => (
                <td
                  key={product.id}
                  className={`text-center p-4 border-b ${
                    product.id === bestProcessingTimeId
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : ""
                  }`}
                >
                  {product.claims.processingTime} ngày
                  {product.id === bestProcessingTimeId && (
                    <div className="text-xs mt-1 font-semibold">Nhanh nhất</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Special Features */}
            <tr className="bg-muted/20">
              <td
                colSpan={products.length + 1}
                className="p-3 border-b font-semibold text-sm"
              >
                <Check className="w-4 h-4 inline mr-2" />
                Tính năng đặc biệt
              </td>
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Hỗ trợ 24/7
                </div>
              </td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  {product.additionalServices?.medicalHotline ? (
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Bảo hiểm toàn cầu
                </div>
              </td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 border-b">
                  {product.additionalServices?.worldwideCoverage ? (
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            {products.some(
              (p) =>
                p.category === "vehicle" &&
                p.additionalServices?.roadsideAssistance,
            ) && (
              <tr>
                <td className="p-4 border-b font-medium">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Cứu hộ trên đường
                  </div>
                </td>
                {products.map((product) => (
                  <td key={product.id} className="text-center p-4 border-b">
                    {product.additionalServices?.roadsideAssistance ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            )}

            {/* Rating & Reviews */}
            <tr className="bg-muted/20">
              <td
                colSpan={products.length + 1}
                className="p-3 border-b font-semibold text-sm"
              >
                <Star className="w-4 h-4 inline mr-2" />
                Đánh giá
              </td>
            </tr>

            <tr>
              <td className="p-4 border-b font-medium">Xếp hạng sao</td>
              {products.map((product) => (
                <td
                  key={product.id}
                  className={`text-center p-4 border-b ${
                    product.id === bestRatingId
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
                  {product.id === bestRatingId && (
                    <div className="text-xs mt-1">Cao nhất</div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Đăng ký sản phẩm tốt nhất
          </Button>
          <Button variant="outline">Tìm hiểu thêm</Button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceComparison;
