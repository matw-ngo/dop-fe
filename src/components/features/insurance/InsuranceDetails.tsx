"use client";

import type { InsuranceProduct } from "@/types/insurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  AlertCircle,
  Clock,
  FileText,
  Users,
  Shield,
  Heart,
  Car,
  Plane,
  Home,
  DollarSign,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  Smartphone,
  Building,
  RefreshCw,
  Calendar,
  UserCheck,
  FileCheck,
  HelpCircle,
  Star,
  Award,
  TrendingUp,
  Activity,
  HeartPulse,
  Umbrella,
  Lock,
  Wallet,
  Calculator,
  ChevronRight,
  Info,
  Zap,
  Truck,
  HeadphonesIcon,
  MessageCircle,
  Video,
  FileSearch,
  Stethoscope,
  Ambulance,
  ShieldCheck,
  Gift,
  Tag,
  Percent,
  AlertTriangle,
  Ban,
  Timer,
  UserX,
  HeartHandshake,
  Route,
  FileSignature,
  Banknote,
  Recycle,
  RotateCcw,
  ArrowRight,
  Briefcase,
  Cloud,
  Trophy,
  FileX,
  Plus,
  Minus,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  useInsuranceStore,
  useInsuranceComparison,
  useInsuranceActions,
} from "@/store/use-insurance-store";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

interface InsuranceDetailsProps {
  product: InsuranceProduct;
}

export function InsuranceDetails({ product }: InsuranceDetailsProps) {
  const t = useTranslations("pages.insurance");
  const { isInComparison } = useInsuranceStore();
  const { comparison } = useInsuranceComparison();
  const { addToComparison, removeFromComparison } = useInsuranceActions();

  const isInComparisonList = isInComparison(product.id);
  const comparisonCount = comparison.selectedProducts.length;
  const canAddMore = comparisonCount < comparison.maxProducts;

  const handleCompareAction = () => {
    if (isInComparisonList) {
      removeFromComparison(product.id);
      toast.success(
        t("removedFromComparison") || "Đã xóa khỏi danh sách so sánh",
      );
    } else {
      if (canAddMore) {
        addToComparison(product.id);
        toast.success(
          t("addedToComparison") || "Đã thêm vào danh sách so sánh",
        );
      } else {
        toast.error(
          t("comparisonLimitReached") ||
            `Chỉ có thể so sánh tối đa ${comparison.maxProducts} sản phẩm`,
        );
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health":
        return <Heart className="w-5 h-5" />;
      case "vehicle":
        return <Car className="w-5 h-5" />;
      case "travel":
        return <Plane className="w-5 h-5" />;
      case "property":
        return <Home className="w-5 h-5" />;
      case "life":
        return <Shield className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getCoverageProgress = (limit: number, maxLimit: number) => {
    return Math.min((limit / maxLimit) * 100, 100);
  };

  const maxCoverageLimit = 2000000000; // 2 tỷ VND as reference

  return (
    <div className="space-y-6">
      {/* Product Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCategoryIcon(product.category)}
            Tổng quan sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Thông tin cơ bản</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nhà cung cấp:</dt>
                  <dd className="font-medium">{product.issuer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Loại bảo hiểm:</dt>
                  <dd className="font-medium">
                    {product.type === "compulsory" ? "Bắt buộc" : "Tự nguyện"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Thời hạn bảo hiểm:</dt>
                  <dd className="font-medium">
                    {product.pricing.customPeriodDays
                      ? `${product.pricing.customPeriodDays} ngày`
                      : getCoveragePeriodText(product.pricing.coveragePeriod)}
                  </dd>
                </div>
                {product.productCode && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Mã sản phẩm:</dt>
                    <dd className="font-medium">{product.productCode}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Đối tượng bảo hiểm</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Độ tuổi:</dt>
                  <dd className="font-medium">
                    {product.eligibility.ageRange.min}
                    {product.eligibility.ageRange.max &&
                      ` - ${product.eligibility.ageRange.max}`}
                  </dd>
                </div>
                {product.eligibility.occupation && (
                  <div>
                    <dt className="text-muted-foreground">Nghề nghiệp:</dt>
                    <dd className="mt-1">
                      {product.eligibility.occupation.map((occ, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mr-2 mb-2"
                        >
                          {occ}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Product Info with 5 Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coverage" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="coverage" className="text-xs sm:text-sm">
                <Shield className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Đối tượng và Phạm vi</span>
                <span className="sm:hidden">Phạm vi</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs sm:text-sm">
                <Star className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Quyền lợi</span>
                <span className="sm:hidden">Quyền lợi</span>
              </TabsTrigger>
              <TabsTrigger value="exclusions" className="text-xs sm:text-sm">
                <Ban className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Điểm loại trừ</span>
                <span className="sm:hidden">Loại trừ</span>
              </TabsTrigger>
              <TabsTrigger value="claims" className="text-xs sm:text-sm">
                <FileCheck className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Quy trình bồi thường</span>
                <span className="sm:hidden">Bồi thường</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm">
                <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Thanh toán & Gia hạn</span>
                <span className="sm:hidden">Thanh toán</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Coverage Details */}
            <TabsContent value="coverage" className="mt-6 space-y-6">
              {/* Insured Objects Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Đối tượng bảo hiểm
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Độ tuổi được bảo hiểm</p>
                        <p className="text-sm text-muted-foreground">
                          Từ {product.eligibility.ageRange.min}
                          {product.eligibility.ageRange.max &&
                            ` đến ${product.eligibility.ageRange.max}`}{" "}
                          tuổi
                        </p>
                      </div>
                    </div>
                    {product.eligibility.occupation && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Nghề nghiệp áp dụng</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.eligibility.occupation.map(
                              (occ, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {occ}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Phạm vi địa lý</p>
                        <p className="text-sm text-muted-foreground">
                          {product.availability.nationalAvailability
                            ? "Toàn quốc"
                            : `${product.availability.provinces.length} tỉnh/thành`}
                        </p>
                      </div>
                    </div>
                    {product.category === "vehicle" &&
                      product.vehicleCoverage && (
                        <div className="flex items-start gap-3">
                          <Car className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Loại xe được bảo hiểm</p>
                            <p className="text-sm text-muted-foreground">
                              {getVehicleTypeText(
                                product.vehicleCoverage.vehicleType,
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Coverage Scope Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  Phạm vi bảo hiểm
                </h3>

                {/* Personal Coverage */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-red-500" />
                    Bảo vệ con người
                  </h4>
                  <div className="grid gap-3">
                    {!product.coverage.personalAccident.disabled && (
                      <CoverageItem
                        title="Tai nạn cá nhân"
                        limit={product.coverage.personalAccident.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Activity className="w-4 h-4" />}
                        color="blue"
                      />
                    )}
                    {!product.coverage.death.disabled && (
                      <CoverageItem
                        title="Tử vong"
                        limit={product.coverage.death.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Heart className="w-4 h-4" />}
                        color="red"
                      />
                    )}
                    {!product.coverage.disability.disabled && (
                      <CoverageItem
                        title="Thương tật toàn bộ/vĩnh viễn"
                        limit={product.coverage.disability.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<UserX className="w-4 h-4" />}
                        color="orange"
                      />
                    )}
                    {!product.coverage.medicalExpenses.disabled && (
                      <CoverageItem
                        title="Chi phí y tế"
                        limit={product.coverage.medicalExpenses.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Stethoscope className="w-4 h-4" />}
                        color="green"
                      />
                    )}
                    {!product.coverage.hospitalization.disabled && (
                      <CoverageItem
                        title="Phí viện phòng"
                        limit={product.coverage.hospitalization.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Building className="w-4 h-4" />}
                        color="purple"
                      />
                    )}
                    {!product.coverage.surgery.disabled && (
                      <CoverageItem
                        title="Phí phẫu thuật"
                        limit={product.coverage.surgery.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Activity className="w-4 h-4" />}
                        color="pink"
                      />
                    )}
                    {!product.coverage.criticalIllness.disabled && (
                      <CoverageItem
                        title="Bệnh hiểm nghèo"
                        limit={product.coverage.criticalIllness.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<AlertTriangle className="w-4 h-4" />}
                        color="yellow"
                      />
                    )}
                    {!product.coverage.lossOfIncome.disabled && (
                      <CoverageItem
                        title="Mất thu nhập"
                        limit={product.coverage.lossOfIncome.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Wallet className="w-4 h-4" />}
                        color="indigo"
                      />
                    )}
                  </div>
                </div>

                {/* Property & Liability Coverage */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Tài sản & Trách nhiệm
                  </h4>
                  <div className="grid gap-3">
                    {!product.coverage.propertyDamage.disabled && (
                      <CoverageItem
                        title="Thiệt hại tài sản"
                        limit={product.coverage.propertyDamage.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Home className="w-4 h-4" />}
                        color="cyan"
                      />
                    )}
                    {!product.coverage.thirdPartyLiability.disabled && (
                      <CoverageItem
                        title="Trách nhiệm dân sự"
                        limit={product.coverage.thirdPartyLiability.limit}
                        maxLimit={maxCoverageLimit}
                        icon={<Shield className="w-4 h-4" />}
                        color="teal"
                      />
                    )}

                    {/* Vehicle-specific coverage */}
                    {product.vehicleCoverage && (
                      <>
                        {!product.vehicleCoverage.ownDamage.disabled && (
                          <CoverageItem
                            title="Thiệt hại vật chất xe"
                            limit={product.vehicleCoverage.ownDamage.limit}
                            maxLimit={maxCoverageLimit}
                            icon={<Car className="w-4 h-4" />}
                            color="blue"
                          />
                        )}
                        {!product.vehicleCoverage.theft.disabled && (
                          <CoverageItem
                            title="Mất cắp toàn bộ"
                            limit={product.vehicleCoverage.theft.limit}
                            maxLimit={maxCoverageLimit}
                            icon={<Lock className="w-4 h-4" />}
                            color="red"
                          />
                        )}
                        {!product.vehicleCoverage.fire.disabled && (
                          <CoverageItem
                            title="Cháy nổ"
                            limit={product.vehicleCoverage.fire.limit}
                            maxLimit={maxCoverageLimit}
                            icon={<AlertCircle className="w-4 h-4" />}
                            color="orange"
                          />
                        )}
                        {!product.vehicleCoverage.naturalDisasters.disabled && (
                          <CoverageItem
                            title="Thiên tai"
                            limit={
                              product.vehicleCoverage.naturalDisasters.limit
                            }
                            maxLimit={maxCoverageLimit}
                            icon={<Cloud className="w-4 h-4" />}
                            color="gray"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Coverage Notes */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  Lưu ý đặc biệt về phạm vi bảo hiểm
                </h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>
                    • Mức bồi thường thực tế có thể thay đổi tùy thuộc vào điều
                    khoản cụ thể của hợp đồng
                  </li>
                  <li>• Một số quyền lợi có thể yêu cầu điều kiện bổ sung</li>
                  {product.category === "vehicle" && (
                    <>
                      <li>
                        • Giá trị xe được bảo hiểm:{" "}
                        {formatCurrency(
                          product.vehicleCoverage?.vehicleValueRange.min || 0,
                        )}{" "}
                        -{" "}
                        {formatCurrency(
                          product.vehicleCoverage?.vehicleValueRange.max || 0,
                        )}
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Deductibles */}
              {product.deductibles.standardDeductible > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-yellow-600" />
                    Mức miễn thường
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Mức miễn thường chuẩn:{" "}
                    <strong>
                      {formatCurrency(product.deductibles.standardDeductible)}
                    </strong>
                    {product.deductibles.voluntaryDeductibleOptions.length >
                      0 && (
                      <span>
                        {" "}
                        (Tùy chọn:{" "}
                        {product.deductibles.voluntaryDeductibleOptions
                          .map((option) => formatCurrency(option))
                          .join(", ")}
                        )
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Mức miễn thường là số tiền bạn phải tự chi trả cho mỗi sự cố
                    bảo hiểm
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Benefits & Features */}
            <TabsContent value="benefits" className="mt-6 space-y-6">
              {/* Main Benefits */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Quyền lợi bảo hiểm chính
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Features */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Tính năng nổi bật
                </h3>
                <div className="grid gap-3">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Services */}
              {product.additionalServices && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <HeadphonesIcon className="w-5 h-5 text-blue-600" />
                    Dịch vụ bổ sung & Hỗ trợ 24/7
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(product.additionalServices).map(
                      ([key, value]) => (
                        <ServiceCard
                          key={key}
                          service={key}
                          available={value}
                        />
                      ),
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      Thông tin hỗ trợ khẩn cấp
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <a
                        href={`tel:${product.claims.contactInfo.hotline.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Phone className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Hotline 24/7
                          </p>
                          <p className="font-medium">
                            {product.claims.contactInfo.hotline}
                          </p>
                        </div>
                      </a>
                      <a
                        href={`mailto:${product.claims.contactInfo.email}`}
                        className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Mail className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Email hỗ trợ
                          </p>
                          <p className="font-medium text-sm">
                            {product.claims.contactInfo.email}
                          </p>
                        </div>
                      </a>
                      {product.claims.contactInfo.website && (
                        <a
                          href={`https://${product.claims.contactInfo.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                        >
                          <Globe className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Website
                            </p>
                            <p className="font-medium text-sm">
                              {product.claims.contactInfo.website}
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Offers */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Ưu đãi đặc biệt
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.paymentOptions.discounts?.map((discount, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg"
                    >
                      <Percent className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">
                          Giảm{" "}
                          {discount.type === "percentage"
                            ? `${discount.value}%`
                            : formatCurrency(discount.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {discount.condition}
                        </p>
                      </div>
                    </div>
                  ))}
                  {product.renewal.noClaimBonus.maxYears > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Không tổn thất</p>
                        <p className="text-xs text-muted-foreground">
                          Giảm đến {product.renewal.noClaimBonus.maxDiscount}%
                          sau {product.renewal.noClaimBonus.maxYears} năm
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Exclusions & Waiting Periods */}
            <TabsContent value="exclusions" className="mt-6 space-y-6">
              {/* Exclusions List */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-600" />
                  Điều khoản loại trừ
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Các trường hợp sau đây không được bảo hiểm theo điều khoản hợp
                  đồng:
                </p>
                <div className="grid gap-3">
                  {product.exclusions.map((exclusion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100"
                    >
                      <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{exclusion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waiting Periods */}
              {(product.waitingPeriods.general > 0 ||
                product.waitingPeriods.specific) && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Thời gian chờ
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Thời gian chờ là khoảng thời gian từ ngày hợp đồng có hiệu
                    lực đến ngày quyền lợi bảo hiểm được chi trả
                  </p>

                  {product.waitingPeriods.general > 0 && (
                    <div className="mb-4 p-4 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Thời gian chờ chung</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-blue-600">
                          {product.waitingPeriods.general}
                        </span>
                        <span className="text-muted-foreground">ngày</span>
                      </div>
                    </div>
                  )}

                  {product.waitingPeriods.specific && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Thời gian chờ theo từng quyền lợi
                      </h4>
                      <div className="grid gap-3">
                        {Object.entries(product.waitingPeriods.specific).map(
                          ([condition, days]) => (
                            <div
                              key={condition}
                              className="flex justify-between items-center p-3 bg-white rounded-lg"
                            >
                              <span className="text-sm font-medium">
                                {condition}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-200"
                              >
                                {days} ngày
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pre-existing Conditions */}
              {product.eligibility.preExistingConditions && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Bệnh sẵn có
                  </h3>

                  {product.eligibility.preExistingConditions.allowed.length >
                    0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-green-700">
                        Bệnh sẵn có được chấp nhận:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {product.eligibility.preExistingConditions.allowed.map(
                          (condition, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-green-100 text-green-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {condition}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {product.eligibility.preExistingConditions.notAllowed.length >
                    0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-red-700">
                        Bệnh sẵn có không được chấp nhận:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {product.eligibility.preExistingConditions.notAllowed.map(
                          (condition, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-red-100 text-red-700"
                            >
                              <X className="w-3 h-3 mr-1" />
                              {condition}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {product.eligibility.preExistingConditions.loading &&
                    product.eligibility.preExistingConditions.loading.length >
                      0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-amber-700">
                          Phụ thu theo bệnh sẵn có:
                        </h4>
                        <div className="space-y-2">
                          {product.eligibility.preExistingConditions.loading.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-white rounded"
                              >
                                <span className="text-sm">
                                  {item.condition}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-amber-600"
                                >
                                  +{item.increase}%
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Special Terms */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Điều khoản đặc biệt
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>Thông tin khai báo phải đầy đủ và trung thực</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>
                      Thay đổi thông tin phải được thông báo cho công ty bảo
                      hiểm
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>
                      Yêu cầu bồi thường phải được gửi trong thời hạn quy định
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>
                      Vi phạm điều khoản có thể dẫn đến từ chối bồi thường
                    </span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            {/* Tab 4: Claims Process */}
            <TabsContent value="claims" className="mt-6 space-y-6">
              {/* Step-by-Step Process */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Route className="w-5 h-5 text-indigo-600" />
                  Quy trình bồi thường 5 bước
                </h3>

                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    {
                      step: 1,
                      title: "Báo cáo sự cố",
                      icon: <Phone className="w-5 h-5" />,
                      desc: "Ngay khi xảy ra sự cố",
                    },
                    {
                      step: 2,
                      title: "Nộp hồ sơ",
                      icon: <FileText className="w-5 h-5" />,
                      desc: "Trong vòng 7 ngày",
                    },
                    {
                      step: 3,
                      title: "Thẩm định",
                      icon: <FileSearch className="w-5 h-5" />,
                      desc: "3-5 ngày làm việc",
                    },
                    {
                      step: 4,
                      title: "Phê duyệt",
                      icon: <FileCheck className="w-5 h-5" />,
                      desc: "1-2 ngày làm việc",
                    },
                    {
                      step: 5,
                      title: "Chi trả",
                      icon: <Banknote className="w-5 h-5" />,
                      desc: "Trong 24h sau duyệt",
                    },
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                        <span className="text-indigo-600">{item.icon}</span>
                      </div>
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                        {item.step}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    {product.claims.processDescription}
                  </p>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-blue-600" />
                  Hồ sơ cần chuẩn bị
                </h3>
                <div className="grid gap-3">
                  {product.claims.requiredDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Methods */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Phương thức yêu cầu bồi thường
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.claims.claimMethods.map((method, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="text-3xl mb-2 text-center">
                        {getClaimMethodIcon(method)}
                      </div>
                      <p className="text-sm font-medium text-center">
                        {getClaimMethodName(method)}
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {getClaimMethodDescription(method)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Time & Approval Rate */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    Thời gian xử lý
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Thời gian xử lý trung bình</span>
                        <span className="font-medium">
                          {product.claims.averageClaimTime} ngày
                        </span>
                      </div>
                      <Progress
                        value={(product.claims.averageClaimTime / 30) * 100}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cam kết xử lý</span>
                        <span className="font-medium">
                          {product.claims.processingTime} ngày làm việc
                        </span>
                      </div>
                      <Progress
                        value={(product.claims.processingTime / 30) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Tỷ lệ duyệt hồ sơ
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {product.claims.approvalRate}%
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={product.claims.approvalRate}
                        className="h-3"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.claims.approvalRate >= 95
                          ? "Tỷ lệ rất cao"
                          : product.claims.approvalRate >= 90
                            ? "Tỷ lệ cao"
                            : product.claims.approvalRate >= 80
                              ? "Tỷ lệ tốt"
                              : "Tỷ lệ trung bình"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  Liên hệ khẩn cấp
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium">Hotline khẩn cấp</p>
                        <p className="text-lg font-bold text-red-600">
                          {product.claims.contactInfo.hotline}
                        </p>
                        <p className="text-xs text-muted-foreground">24/7</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Ambulance className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium">Cấp cứu 115</p>
                        <p className="text-lg font-bold text-red-600">115</p>
                        <p className="text-xs text-muted-foreground">
                          Miễn phí
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Zalo Support</p>
                        <p className="text-lg font-bold text-blue-600">
                          {product.claims.contactInfo.hotline}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          8:00 - 22:00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 5: Payment & Renewal */}
            <TabsContent value="payment" className="mt-6 space-y-6">
              {/* Payment Methods */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.paymentOptions.methods.map((method, index) => (
                    <PaymentMethodCard key={index} method={method} />
                  ))}
                </div>
              </div>

              {/* Installment Options */}
              {product.paymentOptions.installmentAvailable &&
                product.paymentOptions.installmentPlans && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      Lựa chọn trả góp
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.paymentOptions.installmentPlans.map(
                        (plan, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">
                                {plan.months} tháng
                              </h4>
                              {plan.interestRate === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700"
                                >
                                  0% lãi suất
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {plan.interestRate
                                ? `Lãi suất: ${plan.interestRate}% năm`
                                : "Miễn lãi suất"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Thanh toán:{" "}
                              {formatCurrency(
                                Math.ceil(
                                  product.pricing.totalPremium / plan.months,
                                ),
                              )}
                              /tháng
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Auto-renewal Details */}
              <div
                className={
                  product.renewal.autoRenewal
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }
                p-6
                rounded-xl
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RotateCcw className="w-5 h-6" />
                  Tự động gia hạn
                </h3>

                {product.renewal.autoRenewal ? (
                  <div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Tự động gia hạn</p>
                          <p className="text-sm text-muted-foreground">
                            Hợp đồng sẽ được gia hạn tự động
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Nhắc nhở gia hạn</p>
                          <p className="text-sm text-muted-foreground">
                            Trước {product.renewal.renewalReminderDays} ngày
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Lợi ích gia hạn tự động:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Không gián đoạn bảo hiểm</li>
                        <li>• Tiết kiệm thời gian và công sức</li>
                        <li>• Duy trì quyền lợi không tổn thất</li>
                        <li>• Nhận ưu đãi đặc biệt khi gia hạn</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        Không hỗ trợ gia hạn tự động
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vui lòng liên hệ để gia hạn hợp đồng trước khi hết hạn
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* No Claim Bonus */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Ưu đãi không tổn thất
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Quy tắc tích lũy</h4>
                    <div className="space-y-2">
                      {Array.from(
                        { length: product.renewal.noClaimBonus.maxYears },
                        (_, i) => i + 1,
                      ).map((year) => {
                        const discount = Math.min(
                          (year / product.renewal.noClaimBonus.maxYears) *
                            product.renewal.noClaimBonus.maxDiscount,
                          product.renewal.noClaimBonus.maxDiscount,
                        );
                        return (
                          <div
                            key={year}
                            className="flex justify-between items-center p-2 bg-white rounded"
                          >
                            <span className="text-sm">
                              {year} năm không tổn thất
                            </span>
                            <Badge
                              variant="outline"
                              className="text-yellow-600"
                            >
                              -{Math.round(discount)}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Lưu ý quan trọng</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        <span>Ưu đãi áp dụng khi gia hạn đúng hạn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        <span>Một tổn thất sẽ làm giảm mức ưu đãi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        <span>
                          Mức giảm tối đa:{" "}
                          {product.renewal.noClaimBonus.maxDiscount}%
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileX className="w-5 h-5 text-gray-600" />
                  Chính sách hủy hợp đồng
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Thời gian cân nhắc</h4>
                    <p className="text-sm text-gray-700">
                      Trong vòng {product.renewal.gracePeriod} ngày kể từ ngày
                      hiệu lực hợp đồng, bạn có quyền hủy hợp đồng và được hoàn
                      lại 100% phí bảo hiểm.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Sau thời gian cân nhắc</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>
                        • Hủy hợp đồng trước hạn: Hoàn lại phí bảo hiểm tương
                        ứng với thời gian còn hiệu lực
                      </li>
                      <li>
                        • Phí hủy hợp đồng: Tối đa 10% phí bảo hiểm đã đóng
                      </li>
                      <li>
                        • Thủ tục: Gửi yêu cầu bằng văn bản kèm giấy chứng minh
                        nhân dân
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Lưu ý:</strong> Hợp đồng sẽ tự động terminate nếu
                      phí bảo hiểm không được thanh toán sau thời gian gia hạn{" "}
                      {product.renewal.gracePeriod} ngày.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Comparison Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {t("comparisonStatus") || "Trạng thái so sánh"}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {comparisonCount}/{comparison.maxProducts}{" "}
                  {t("products") || "sản phẩm"}
                </Badge>
              </div>
              {comparisonCount > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-blue-700">
                    {t("comparisonCountMessage", { count: comparisonCount }) ||
                      `Đang có ${comparisonCount} sản phẩm trong danh sách so sánh`}
                  </p>
                  <Link href="/insurance/compare">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {t("viewComparison") || "Xem so sánh"}
                    </Button>
                  </Link>
                </div>
              )}
              {!canAddMore && (
                <div className="mt-2">
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    {t("comparisonLimitMessage") ||
                      `Đã đạt giới hạn ${comparison.maxProducts} sản phẩm. Vui lòng xóa sản phẩm khỏi danh sách để thêm sản phẩm mới.`}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`${comparisonCount > 0 ? "grid grid-cols-1 md:grid-cols-3 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-3"}`}
            >
              {/* Add/Remove from Comparison Button */}
              <Button
                variant={isInComparisonList ? "secondary" : "outline"}
                onClick={handleCompareAction}
                disabled={!canAddMore && !isInComparisonList}
                aria-label={
                  isInComparisonList
                    ? t("removeFromComparisonAria") ||
                      `Xóa ${product.name} khỏi danh sách so sánh`
                    : t("addToComparisonAria") ||
                      `Thêm ${product.name} vào danh sách so sánh`
                }
                className={`
                  ${
                    isInComparisonList
                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      : "text-blue-600 border-blue-200 hover:bg-blue-50"
                  }
                  ${!canAddMore && !isInComparisonList ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isInComparisonList ? (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    {t("removeFromComparison") || "Xóa khỏi so sánh"}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addToComparison") || "Thêm vào so sánh"}
                  </>
                )}
              </Button>

              {/* View Comparison Button (only show when there are products in comparison) */}
              {comparisonCount > 0 && (
                <Link href="/insurance/compare" className="w-full">
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t("compareProducts") || "So sánh sản phẩm"}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-white text-blue-600"
                    >
                      {comparisonCount}
                    </Badge>
                  </Button>
                </Link>
              )}

              {/* Apply Button (Primary CTA) */}
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {t("applyNow") || "Mua bảo hiểm"}
              </Button>
            </div>

            {/* Additional Information */}
            <div className="text-center text-sm text-muted-foreground pt-2">
              <p>
                {t("ctaNote") ||
                  "Thêm sản phẩm vào danh sách so sánh để dễ dàng đưa ra quyết định tốt nhất"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
interface CoverageItemProps {
  title: string;
  limit: number;
  maxLimit: number;
  icon: React.ReactNode;
  color: string;
}

function CoverageItem({
  title,
  limit,
  maxLimit,
  icon,
  color,
}: CoverageItemProps) {
  const progress = Math.min((limit / maxLimit) * 100, 100);
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-indigo-100 text-indigo-700",
    cyan: "bg-cyan-100 text-cyan-700",
    teal: "bg-teal-100 text-teal-700",
    gray: "bg-gray-100 text-gray-700",
  };

  const progressColors = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
    cyan: "bg-cyan-500",
    teal: "bg-teal-500",
    gray: "bg-gray-500",
  };

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          >
            {icon}
          </div>
          <span className="font-medium">{title}</span>
        </div>
        <span className="font-bold text-lg">{formatCurrency(limit)}</span>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Mức bảo vệ</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress
          value={progress}
          className="h-2"
          indicatorClassName={
            progressColors[color as keyof typeof progressColors]
          }
        />
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: string;
  available: boolean;
}

function ServiceCard({ service, available }: ServiceCardProps) {
  const serviceInfo = getServiceInfo(service);

  return (
    <div
      className={`p-4 rounded-lg border ${available ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${available ? "bg-green-200" : "bg-gray-200"}`}
        >
          {available ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <X className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <p className="text-sm font-medium mb-1">{serviceInfo.name}</p>
        <p className="text-xs text-muted-foreground">
          {serviceInfo.description}
        </p>
      </div>
    </div>
  );
}

interface PaymentMethodCardProps {
  method: string;
}

function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const methodInfo = getPaymentMethodInfo(method);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        <div className="text-3xl mb-2">{methodInfo.icon}</div>
        <p className="font-medium text-sm">{methodInfo.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {methodInfo.description}
        </p>
      </div>
    </div>
  );
}

// Helper functions
function getCoveragePeriodText(period: string): string {
  const periods: Record<string, string> = {
    monthly: "1 tháng",
    quarterly: "3 tháng",
    "semi-annually": "6 tháng",
    annually: "1 năm",
    custom: "Tùy chỉnh",
  };
  return periods[period] || period;
}

function getServiceDisplayName(key: string): string {
  const services: Record<string, string> = {
    roadsideAssistance: "Cứu hộ đường bộ",
    medicalHotline: "Tổng đài y tế",
    legalSupport: "Hỗ trợ pháp lý",
    homeVisit: "Khám sức khỏe tại nhà",
    worldwideCoverage: "Bảo vệ toàn cầu",
  };
  return services[key] || key;
}

function getServiceInfo(service: string) {
  const services: Record<string, { name: string; description: string }> = {
    roadsideAssistance: {
      name: "Cứu hộ 24/7",
      description: "Kéo xe, thay lốp, sửa chữa tại chỗ",
    },
    medicalHotline: {
      name: "Tổng đài y tế",
      description: "Tư vấn sức khỏe 24/7",
    },
    legalSupport: {
      name: "Hỗ trợ pháp lý",
      description: "Tư vấn pháp lý miễn phí",
    },
    homeVisit: {
      name: "Khám tại nhà",
      description: "Bác sĩ đến tận nhà",
    },
    worldwideCoverage: {
      name: "Bảo vệ toàn cầu",
      description: "Áp dụng trên toàn thế giới",
    },
  };
  return services[service] || { name: service, description: "" };
}

function getPaymentMethodInfo(method: string) {
  const methods: Record<
    string,
    { name: string; icon: string; description: string }
  > = {
    cash: {
      name: "Tiền mặt",
      icon: "💵",
      description: "Thanh toán trực tiếp",
    },
    bank_transfer: {
      name: "Chuyển khoản",
      icon: "🏦",
      description: "Qua ngân hàng",
    },
    credit_card: {
      name: "Thẻ tín dụng",
      icon: "💳",
      description: "Visa/Mastercard",
    },
    mobile_banking: {
      name: "Ngân hàng số",
      icon: "📱",
      description: "App ngân hàng",
    },
    ewallet: {
      name: "Ví điện tử",
      icon: "👛",
      description: "Momo, ZaloPay...",
    },
  };
  return methods[method] || { name: method, icon: "💳", description: "" };
}

function getClaimMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    online: "🌐",
    phone: "📞",
    branch: "🏢",
    mobile_app: "📱",
  };
  return icons[method] || "📄";
}

function getClaimMethodName(method: string): string {
  const names: Record<string, string> = {
    online: "Online",
    phone: "Điện thoại",
    branch: "Văn phòng",
    mobile_app: "Ứng dụng",
  };
  return names[method] || method;
}

function getClaimMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    online: "Trực tuyến 24/7",
    phone: "Gọi tổng đài",
    branch: "Tại văn phòng",
    mobile_app: "Qua app di động",
  };
  return descriptions[method] || "";
}

function getVehicleTypeText(type: string): string {
  const types: Record<string, string> = {
    car: "Ô tô",
    motorcycle: "Xe máy",
    scooter: "Xe ga",
    three_wheeler: "Xe ba bánh",
    truck: "Xe tải",
    bus: "Xe buýt",
  };
  return types[type] || type;
}

export default InsuranceDetails;
