// Loan Product Comparison Component
// Side-by-side comparison of Vietnamese loan products

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Clock,
  Shield,
  TrendingUp,
  Calculator,
  FileText,
  Users,
  Building,
  Phone,
  Globe,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  VietnameseLoanProduct,
  VietnameseLoanType,
} from "@/lib/loan-products/vietnamese-loan-products";
import { VietnameseLoanCalculator, formatVND } from "@/lib/loan-products/interest-calculations";

interface ComparisonProps {
  /** Products to compare */
  products: VietnameseLoanProduct[];
  /** Loan amount for calculations */
  loanAmount: number;
  /** Loan term for calculations */
  loanTerm: number;
  /** Currently selected products */
  selectedProducts: VietnameseLoanProduct[];
  /** On product selection change */
  onSelectionChange: (products: VietnameseLoanProduct[]) => void;
  /** On product apply */
  onProductApply: (product: VietnameseLoanProduct) => void;
  /** On product details view */
  onProductDetails: (product: VietnameseLoanProduct) => void;
  /** Loading state */
  loading?: boolean;
  /** Compact view */
  compact?: boolean;
}

interface ProductComparisonRow {
  /** Feature name */
  feature: string;
  /** Feature name in Vietnamese */
  featureVi: string;
  /** Description */
  description?: string;
  /** Description in Vietnamese */
  descriptionVi?: string;
  /** Values for each product */
  values: Array<{
    value: React.ReactNode;
    rating?: "excellent" | "good" | "average" | "poor";
    highlight?: boolean;
  }>;
  /** Importance */
  importance: "high" | "medium" | "low";
}

export function LoanProductComparison({
  products,
  loanAmount,
  loanTerm,
  selectedProducts,
  onSelectionChange,
  onProductApply,
  onProductDetails,
  loading = false,
  compact = false,
}: ComparisonProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["basics", "costs"]));
  const [sortCriteria, setSortCriteria] = useState<"score" | "interest" | "fees" | "processing">("score");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showCalculations, setShowCalculations] = useState(true);

  // Calculate payment details for each selected product
  const productCalculations = useMemo(() => {
    return selectedProducts.map(product => {
      const calculation = VietnameseLoanCalculator.calculateLoan({
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

      return {
        product,
        calculation,
        monthlyPayment: calculation.monthlyPayment,
        totalInterest: calculation.totalInterest,
        totalPayable: calculation.totalPayable,
        effectiveAPR: calculation.effectiveAPR,
      };
    });
  }, [selectedProducts, loanAmount, loanTerm]);

  // Sort products based on criteria
  const sortedProducts = useMemo(() => {
    const productsWithCalculations = productCalculations.map(({ product, calculation, ...rest }) => ({
      product,
      calculation,
      ...rest,
    }));

    return productsWithCalculations.sort((a, b) => {
      switch (sortCriteria) {
        case "interest":
          return a.product.interestRate.annual - b.product.interestRate.annual;
        case "fees":
          return a.calculation.totalFees - b.calculation.totalFees;
        case "processing":
          return a.product.applicationRequirements.processingTime.min - b.product.applicationRequirements.processingTime.min;
        case "score":
        default:
          return b.product.metadata.popularityScore - a.product.metadata.popularityScore;
      }
    });
  }, [productCalculations, sortCriteria]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Get rating color
  const getRatingColor = (rating?: "excellent" | "good" | "average" | "poor") => {
    switch (rating) {
      case "excellent":
        return "text-green-600 bg-green-50";
      case "good":
        return "text-blue-600 bg-blue-50";
      case "average":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Format interest rate with badge
  const formatInterestRate = (product: VietnameseLoanProduct) => {
    const rate = product.interestRate.annual;
    let rating: "excellent" | "good" | "average" | "poor";

    if (rate <= 7) rating = "excellent";
    else if (rate <= 10) rating = "good";
    else if (rate <= 15) rating = "average";
    else rating = "poor";

    return (
      <Badge className={cn(getRatingColor(rating), "font-medium")}>
        {rate}%
        {product.interestRate.promotional && (
          <span className="ml-1 text-xs">→{product.interestRate.promotional.rate}%</span>
        )}
      </Badge>
    );
  };

  // Comparison data for table view
  const comparisonRows: ProductComparisonRow[] = [
    {
      feature: "Bank",
      featureVi: "Ngân hàng",
      importance: "high",
      values: sortedProducts.map(({ product }) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={product.bank.logo} alt={product.bank.nameVi} />
            <AvatarFallback>{product.bank.code}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{product.bank.nameVi}</div>
            <div className="text-xs text-gray-500">{product.bank.type}</div>
          </div>
        </div>
      )),
    },
    {
      feature: "Interest Rate",
      featureVi: "Lãi suất",
      importance: "high",
      values: sortedProducts.map(({ product }) => formatInterestRate(product)),
    },
    {
      feature: "Monthly Payment",
      featureVi: "Trả hàng tháng",
      description: `For ${formatVND(loanAmount)} over ${loanTerm} months`,
      descriptionVi: `Đối với ${formatVND(loanAmount)} trong ${loanTerm} tháng`,
      importance: "high",
      values: sortedProducts.map(({ monthlyPayment }) => (
        <div className="font-semibold">{formatVND(monthlyPayment)}</div>
      )),
    },
    {
      feature: "Total Interest",
      featureVi: "Tổng lãi suất",
      importance: "high",
      values: sortedProducts.map(({ totalInterest }) => (
        <div className={cn("font-medium", totalInterest > loanAmount * 0.5 ? "text-red-600" : "text-gray-900")}>
          {formatVND(totalInterest)}
        </div>
      )),
    },
    {
      feature: "Total Amount Payable",
      featureVi: "Tổng số tiền phải trả",
      importance: "high",
      values: sortedProducts.map(({ totalPayable }) => (
        <div className="font-bold text-lg">{formatVND(totalPayable)}</div>
      )),
    },
    {
      feature: "Processing Time",
      featureVi: "Thời gian xử lý",
      importance: "medium",
      values: sortedProducts.map(({ product }) => {
        const time = product.applicationRequirements.processingTime;
        let rating: "excellent" | "good" | "average" | "poor";

        if (time.min <= 2) rating = "excellent";
        else if (time.min <= 5) rating = "good";
        else if (time.min <= 7) rating = "average";
        else rating = "poor";

        return (
          <Badge className={getRatingColor(rating)}>
            {time.min}-{time.max} ngày
          </Badge>
        );
      }),
    },
    {
      feature: "Online Application",
      featureVi: "Đăng ký online",
      importance: "medium",
      values: sortedProducts.map(({ product }) =>
        product.features.onlineApplication ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )
      ),
    },
    {
      feature: "Fast Approval",
      featureVi: "Phê duyệt nhanh",
      importance: "medium",
      values: sortedProducts.map(({ product }) =>
        product.features.fastApproval ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )
      ),
    },
    {
      feature: "Early Repayment",
      featureVi: "Trả trước hạn",
      importance: "medium",
      values: sortedProducts.map(({ product }) =>
        product.features.earlyRepaymentAllowed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )
      ),
    },
    {
      feature: "Processing Fee",
      featureVi: "Phí xử lý",
      importance: "medium",
      values: sortedProducts.map(({ product, calculation }) => {
        const fee = product.fees.processingFee || product.fees.processingFeeFixed;
        return fee ? (
          <span className="text-sm">
            {product.fees.processingFee
              ? `${product.fees.processingFee}%`
              : formatVND(product.fees.processingFeeFixed || 0)}
          </span>
        ) : (
          <span className="text-green-600 font-medium">Miễn phí</span>
        );
      }),
    },
    {
      feature: "Collateral Required",
      featureVi: "Yêu cầu tài sản đảm bảo",
      importance: "high",
      values: sortedProducts.map(({ product }) =>
        product.eligibility.collateralRequired ? (
          <Badge variant="destructive">Cần có</Badge>
        ) : (
          <Badge variant="secondary">Không cần</Badge>
        )
      ),
    },
    {
      feature: "Customer Rating",
      featureVi: "Đánh giá khách hàng",
      importance: "low",
      values: sortedProducts.map(({ product }) => (
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">
            {product.metadata.averageRating?.toFixed(1) || "N/A"}
          </span>
          <span className="text-xs text-gray-500">
            ({product.metadata.reviewCount || 0})
          </span>
        </div>
      )),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedProducts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chọn sản phẩm để so sánh
          </h3>
          <p className="text-gray-600">
            Vui lòng chọn ít nhất 2 sản phẩm vay để bắt đầu so sánh
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            So sánh sản phẩm vay ({selectedProducts.length})
          </h2>
          <p className="text-gray-600 mt-1">
            Đối với {formatVND(loanAmount)} trong {loanTerm} tháng
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={showCalculations ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCalculations(!showCalculations)}
          >
            {showCalculations ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            Tính toán
          </Button>

          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table className="h-4 w-4 mr-2" />
            Bảng
          </Button>

          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <Building className="h-4 w-4 mr-2" />
            Thẻ
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={sortCriteria === "score" ? "ghost" : "ghost"}
              size="sm"
              onClick={() => setSortCriteria("score")}
              className={sortCriteria === "score" ? "bg-gray-100" : ""}
            >
              <Star className="h-4 w-4 mr-1" />
              Điểm
            </Button>
            <Button
              variant={sortCriteria === "interest" ? "ghost" : "ghost"}
              size="sm"
              onClick={() => setSortCriteria("interest")}
              className={sortCriteria === "interest" ? "bg-gray-100" : ""}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Lãi suất
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison View */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[200px] sticky left-0 bg-gray-50 z-10">
                      Tiêu chí
                    </TableHead>
                    {sortedProducts.map(({ product }) => (
                      <TableHead key={product.id} className="min-w-[180px]">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={product.bank.logo} alt={product.bank.code} />
                              <AvatarFallback className="text-xs">{product.bank.code}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{product.bank.code}</span>
                          </div>
                          <div className="text-xs text-gray-600">{product.nameVi}</div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row, index) => (
                    <React.Fragment key={row.feature}>
                      <TableRow className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                        <TableCell className="font-medium sticky left-0 bg-white z-10">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span>{row.featureVi}</span>
                              {row.importance === "high" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertCircle className="h-3 w-3 text-red-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Quan trọng</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            {row.descriptionVi && (
                              <p className="text-xs text-gray-500 mt-1">{row.descriptionVi}</p>
                            )}
                          </div>
                        </TableCell>
                        {row.values.map((value, valueIndex) => (
                          <TableCell key={valueIndex} className="text-center">
                            {value}
                          </TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map(({ product, calculation, monthlyPayment, totalInterest, totalPayable, effectiveAPR }) => (
            <Card key={product.id} className="relative">
              {product.metadata.featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Nổi bật
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={product.bank.logo} alt={product.bank.nameVi} />
                    <AvatarFallback>{product.bank.code}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{product.nameVi}</CardTitle>
                    <p className="text-sm text-gray-600">{product.bank.nameVi}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {product.interestRate.annual}%
                    </div>
                    <div className="text-xs text-gray-600">Lãi suất/năm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatVND(monthlyPayment)}
                    </div>
                    <div className="text-xs text-gray-600">Trả/tháng</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thời gian xử lý:</span>
                    <Badge variant="outline" className="text-xs">
                      {product.applicationRequirements.processingTime.min}-{product.applicationRequirements.processingTime.max} ngày
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tài sản đảm bảo:</span>
                    {product.eligibility.collateralRequired ? (
                      <Badge variant="destructive" className="text-xs">Cần có</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Không cần</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Đăng ký online:</span>
                    {product.features.onlineApplication ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* Expanded Calculations */}
                {showCalculations && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng lãi suất:</span>
                      <span className="font-medium">{formatVND(totalInterest)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span class="text-gray-600">Tổng thanh toán:</span>
                      <span className="font-bold">{formatVND(totalPayable)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">APR hiệu quả:</span>
                      <span className="font-medium">{effectiveAPR.toFixed(2)}%</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onProductApply(product)}
                  >
                    Đăng ký ngay
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onProductDetails(product)}
                  >
                    Chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Section */}
      {showCalculations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Tóm tắt so sánh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedProducts.map(({ product, calculation, monthlyPayment, totalInterest, totalPayable }, index) => {
                const isBest = {
                  interest: index === 0 && sortCriteria === "interest",
                  payment: index === 0,
                  total: index === 0 && sortCriteria !== "interest",
                };

                return (
                  <div
                    key={product.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      (isBest.interest || isBest.payment || isBest.total) && "border-green-500 bg-green-50"
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={product.bank.logo} alt={product.bank.code} />
                        <AvatarFallback className="text-xs">{product.bank.code}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{product.nameVi}</span>
                      {(isBest.interest || isBest.payment || isBest.total) && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Tốt nhất
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lãi suất:</span>
                        <span className={cn("font-medium", isBest.interest && "text-green-600")}>
                          {product.interestRate.annual}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trả/tháng:</span>
                        <span className={cn("font-medium", isBest.payment && "text-green-600")}>
                          {formatVND(monthlyPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng thanh toán:</span>
                        <span className={cn("font-bold", isBest.total && "text-green-600")}>
                          {formatVND(totalPayable)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}