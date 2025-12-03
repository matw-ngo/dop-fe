// Loan Product Card Component
// Individual loan product display for Vietnamese market

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Clock,
  Shield,
  TrendingUp,
  Calculator,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Phone,
  Globe,
  FileText,
  Users,
  Award,
  Zap,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Heart,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  Heart as HeartIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  VietnameseLoanProduct,
  VietnameseLoanType,
} from "@/lib/loan-products/vietnamese-loan-products";
import { VietnameseLoanCalculator, formatVND, quickMonthlyPaymentCalculation } from "@/lib/loan-products/interest-calculations";

interface ProductCardProps {
  /** Loan product */
  product: VietnameseLoanProduct;
  /** Loan amount for calculations */
  loanAmount?: number;
  /** Loan term for calculations */
  loanTerm?: number;
  /** Is product selected */
  selected?: boolean;
  /** On selection change */
  onSelectionChange?: (selected: boolean) => void;
  /** On apply click */
  onApply?: () => void;
  /** On details click */
  onDetails?: () => void;
  /** Show comparison button */
  showCompare?: boolean;
  /** Compact view */
  compact?: boolean;
  /** Show calculations */
  showCalculations?: boolean;
  /** Is favorited */
  favorited?: boolean;
  /** On favorite toggle */
  onFavoriteToggle?: () => void;
}

export function LoanProductCard({
  product,
  loanAmount = 2000000000, // Default 2 tỷ VND
  loanTerm = 24, // Default 24 months
  selected = false,
  onSelectionChange,
  onApply,
  onDetails,
  showCompare = true,
  compact = false,
  showCalculations = true,
  favorited = false,
  onFavoriteToggle,
}: ProductCardProps) {
  const [expandedFeatures, setExpandedFeatures] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Calculate payment details
  const calculations = useMemo(() => {
    if (!showCalculations) return null;

    return VietnameseLoanCalculator.calculateLoan({
      principal: loanAmount,
      term: loanTerm,
      annualRate: product.interestRate.annual,
      rateType: product.interestRate.type,
      calculationMethod: product.interestRate.calculationMethod,
      processingFee: product.fees.processingFee,
      processingFeeFixed: product.fees.processingFeeFixed,
      insuranceFee: product.fees.insuranceFee,
      otherFees: product.fees.otherFees?.reduce((sum, fee) => sum + (fee.type === "fixed" ? fee.amount : (loanAmount * fee.amount) / 100), 0),
    });
  }, [product, loanAmount, loanTerm, showCalculations]);

  // Get loan type icon
  const getLoanTypeIcon = (loanType: VietnameseLoanType) => {
    switch (loanType) {
      case "home_loan":
        return <Home className="h-4 w-4" />;
      case "auto_loan":
        return <Car className="h-4 w-4" />;
      case "consumer_loan":
        return <CreditCard className="h-4 w-4" />;
      case "business_loan":
        return <Briefcase className="h-4 w-4" />;
      case "student_loan":
        return <GraduationCap className="h-4 w-4" />;
      case "refinancing":
        return <PiggyBank className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Get interest rate color and status
  const getInterestRateStatus = () => {
    const rate = product.interestRate.annual;
    if (rate <= 7) return { color: "text-green-600", status: "Rất tốt", badge: "bg-green-100 text-green-800" };
    if (rate <= 10) return { color: "text-blue-600", status: "Tốt", badge: "bg-blue-100 text-blue-800" };
    if (rate <= 15) return { color: "text-yellow-600", status: "Trung bình", badge: "bg-yellow-100 text-yellow-800" };
    return { color: "text-red-600", status: "Cao", badge: "bg-red-100 text-red-800" };
  };

  // Get processing time status
  const getProcessingTimeStatus = () => {
    const days = product.applicationRequirements.processingTime.min;
    if (days <= 2) return { color: "text-green-600", text: "Nhanh", icon: Zap };
    if (days <= 5) return { color: "text-blue-600", text: "Khá nhanh", icon: Clock };
    return { color: "text-yellow-600", text: "Thường", icon: Clock };
  };

  const rateStatus = getInterestRateStatus();
  const processingStatus = getProcessingTimeStatus();

  if (compact) {
    return (
      <Card className={cn("transition-all duration-200 hover:shadow-lg cursor-pointer", selected && "ring-2 ring-blue-500")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={product.bank.logo} alt={product.bank.code} />
                <AvatarFallback className="text-xs">{product.bank.code}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{product.nameVi}</h3>
                <p className="text-xs text-gray-600">{product.bank.nameVi}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("font-bold text-lg", rateStatus.color)}>
                {product.interestRate.annual}%
              </div>
              <div className="text-xs text-gray-600">lãi suất/năm</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg relative",
      selected && "ring-2 ring-blue-500",
      product.metadata.featured && "border-yellow-400 shadow-md"
    )}>
      {/* Featured Badge */}
      {product.metadata.featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-100 text-yellow-800">
            <Star className="h-3 w-3 mr-1" />
            Nổi bật
          </Badge>
        </div>
      )}

      {/* Favorite Button */}
      {onFavoriteToggle && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 left-2 z-10 h-8 w-8 p-0 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
        >
          <HeartIcon
            className={cn(
              "h-4 w-4 transition-colors",
              favorited ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </Button>
      )}

      <CardHeader className="pb-3">
        {/* Bank and Product Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={product.bank.logo} alt={product.bank.nameVi} />
              <AvatarFallback>{product.bank.code}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{product.nameVi}</CardTitle>
              <p className="text-sm text-gray-600">{product.bank.nameVi}</p>
            </div>
          </div>

          {/* Selection Checkbox for comparison */}
          {showCompare && onSelectionChange && (
            <div className="ml-2">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelectionChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          )}
        </div>

        {/* Loan Type and Key Features */}
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            {getLoanTypeIcon(product.loanType)}
            <span>{product.loanType === "home_loan" ? "Vay mua nhà" :
                   product.loanType === "auto_loan" ? "Vay mua xe" :
                   product.loanType === "consumer_loan" ? "Vay tiêu dùng" :
                   product.loanType === "business_loan" ? "Vay kinh doanh" :
                   product.loanType === "student_loan" ? "Vay sinh viên" :
                   product.loanType}</span>
          </div>
          <Badge className={rateStatus.badge} variant="secondary">
            {rateStatus.status}
          </Badge>
          {product.features.onlineApplication && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Zap className="h-3 w-3 text-green-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Đăng ký online</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Interest Rate */}
          <div className="text-center">
            <div className={cn("text-2xl font-bold", rateStatus.color)}>
              {product.interestRate.annual}%
            </div>
            <div className="text-xs text-gray-600">Lãi suất/năm</div>
            {product.interestRate.promotional && (
              <div className="text-xs text-green-600 mt-1">
                Ưu đãi: {product.interestRate.promotional.rate}% ({product.interestRate.promotional.duration} tháng)
              </div>
            )}
          </div>

          {/* Monthly Payment */}
          {calculations && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatVND(calculations.monthlyPayment)}
              </div>
              <div className="text-xs text-gray-600">
                Trả/tháng ({loanTerm} tháng)
              </div>
            </div>
          )}
        </div>

        {/* Loan Limits */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giới hạn vay:</span>
            <span className="font-medium">
              {formatVND(product.amountLimits.min)} - {formatVND(product.amountLimits.max)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Thời gian vay:</span>
            <span className="font-medium">
              {product.termOptions.min} - {product.termOptions.max} tháng
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tính năng chính:</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setExpandedFeatures(!expandedFeatures)}
            >
              {expandedFeatures ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                available: product.features.onlineApplication,
                icon: Globe,
                text: "Đăng ký online",
              },
              {
                available: product.features.fastApproval,
                icon: Zap,
                text: "Phê duyệt nhanh",
              },
              {
                available: product.features.earlyRepaymentAllowed,
                icon: Calendar,
                text: "Trả trước hạn",
              },
              {
                available: !product.eligibility.collateralRequired,
                icon: Shield,
                text: "Không tài sản đảm bảo",
              },
            ]
              .filter((_, index) => index < 4 || expandedFeatures)
              .map((feature, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center space-x-1 text-xs p-2 rounded",
                          feature.available ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50"
                        )}
                      >
                        {feature.available ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span className="truncate">{feature.text}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{feature.text}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </div>
        </div>

        {/* Processing Info */}
        <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <processingStatus.icon className={cn("h-4 w-4", processingStatus.color)} />
            <span className="text-gray-600">Thời gian xử lý:</span>
          </div>
          <span className={cn("font-medium", processingStatus.color)}>
            {product.applicationRequirements.processingTime.min}-{product.applicationRequirements.processingTime.max} ngày
          </span>
        </div>

        {/* Calculations Summary */}
        {showCalculations && calculations && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng lãi suất:</span>
              <span className="font-medium">{formatVND(calculations.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng thanh toán:</span>
              <span className="font-bold">{formatVND(calculations.totalPayable)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">APR hiệu quả:</span>
              <span className="font-medium">{calculations.effectiveAPR.toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* Rating */}
        {product.metadata.averageRating && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.metadata.averageRating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="font-medium">{product.metadata.averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({product.metadata.reviewCount} đánh giá)</span>
          </div>
        )}

        {/* Promotions */}
        {product.features.promotions && product.features.promotions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Ưu đãi đặc biệt</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              {product.features.promotions[0].nameVi}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Hạn đến: {new Date(product.features.promotions[0].validUntil).toLocaleDateString("vi-VN")}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={onApply}
          >
            Đăng ký ngay
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetailsDialog(true)}
          >
            <Info className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>
        </div>
      </CardContent>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={product.bank.logo} alt={product.bank.nameVi} />
                <AvatarFallback>{product.bank.code}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-bold">{product.nameVi}</div>
                <div className="text-sm text-gray-600">{product.bank.nameVi}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Thông tin sản phẩm</h3>
                <p className="text-sm text-gray-600">{product.descriptionVi}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Điều kiện vay</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuổi:</span>
                    <span>{product.eligibility.minAge} - {product.eligibility.maxAgeAtMaturity} tuổi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thu nhập tối thiểu:</span>
                    <span>{formatVND(product.eligibility.minMonthlyIncome)}/tháng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tài sản đảm bảo:</span>
                    <span>{product.eligibility.collateralRequired ? "Cần có" : "Không cần"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Phí và lãi suất</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lãi suất:</span>
                    <span>{product.interestRate.annual}%/năm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí xử lý:</span>
                    <span>
                      {product.fees.processingFee
                        ? `${product.fees.processingFee}%`
                        : product.fees.processingFeeFixed
                        ? formatVND(product.fees.processingFeeFixed)
                        : "Miễn phí"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí trả trước hạn:</span>
                    <span>{product.fees.earlyRepaymentFee || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents and Contact */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tài liệu cần thiết</h3>
                <div className="space-y-1 text-sm">
                  {product.eligibility.requiredDocuments.slice(0, 4).map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <span>{doc.typeVi}</span>
                    </div>
                  ))}
                  {product.eligibility.requiredDocuments.length > 4 && (
                    <div className="text-gray-500 text-xs">
                      ... và {product.eligibility.requiredDocuments.length - 4} tài liệu khác
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Thông tin liên hệ</h3>
                <div className="space-y-2 text-sm">
                  {product.bank.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <a
                        href={product.bank.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {product.bank.hotline && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <a href={`tel:${product.bank.hotline}`} className="text-blue-600 hover:underline">
                        {product.bank.hotline}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Calculations */}
              {calculations && (
                <div>
                  <h3 className="font-semibold mb-2">Chi tiết tính toán</h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền vay:</span>
                      <span className="font-medium">{formatVND(loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian vay:</span>
                      <span className="font-medium">{loanTerm} tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trả hàng tháng:</span>
                      <span className="font-medium">{formatVND(calculations.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng lãi suất:</span>
                      <span className="font-medium">{formatVND(calculations.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Tổng thanh toán:</span>
                      <span>{formatVND(calculations.totalPayable)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <Button
              className="flex-1"
              onClick={() => {
                setShowDetailsDialog(false);
                onApply?.();
              }}
            >
              Đăng ký ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsDialog(false);
                onDetails?.();
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}