/**
 * Comprehensive Vietnamese Loan Calculator Component
 *
 * A sophisticated loan calculator designed specifically for the Vietnamese market
 * with support for multiple interest rate types, loan products, and regulatory compliance.
 */

import {
  AlertCircle,
  Briefcase,
  Calculator,
  Car,
  CheckCircle,
  CreditCard,
  DollarSign,
  Home,
  Info,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import calculation functions
import {
  calculateLoanDetails,
  formatLoanResults,
  type InterestRateType,
  type LoanCalculationParams,
  type LoanCalculationResult,
  type LoanType,
} from "@/lib/financial/calculations";
import {
  assessLoanEligibility,
  calculateAutoLoan,
  calculateBusinessLoan,
  calculateConsumerLoan,
  calculateHomeLoan,
} from "@/lib/financial/loan-calculations";
import { validateLoanCalculationParams } from "@/lib/financial/validation";
import { VIETNAMESE_LOAN_TYPES } from "@/lib/financial-data/vietnamese-financial-data";

// Types
interface LoanFormData {
  principal: number;
  annualRate: number;
  termInMonths: number;
  rateType: InterestRateType;
  loanType: LoanType;
  promotionalPeriod?: number;
  promotionalRate?: number;
  hasInsurance: boolean;
  insuranceRate?: number;
  processingFee?: number;
  earlyRepaymentPenalty?: number;
  // Specific loan type fields
  propertyType?: "apartment" | "house" | "land";
  propertyLocation?: "hanoi" | "hcmc" | "other";
  vehicleType?: "new_car" | "used_car";
  vehicleValue?: number;
  monthlyIncome?: number;
  monthlyDebts?: number;
}

interface CalculationResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
  apr: number;
  schedule?: Array<{
    period: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  eligibility?: {
    eligible: boolean;
    probability: number;
    recommendations: string[];
  };
}

const LoanCalculator: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<LoanFormData>({
    principal: 500000000, // 500 triệu VND default
    annualRate: 9.5,
    termInMonths: 120,
    rateType: "reducing_balance",
    loanType: "home",
    hasInsurance: true,
    insuranceRate: 0.3,
    processingFee: 1.5,
    earlyRepaymentPenalty: 3,
  });

  // Results state
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("calculator");

  // Input change handler
  const handleInputChange = useCallback(
    (field: keyof LoanFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Calculate loan
  const calculateLoan = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate inputs
      const params: LoanCalculationParams = {
        principal: formData.principal,
        annualRate: formData.annualRate,
        termInMonths: formData.termInMonths,
        rateType: formData.rateType,
        promotionalPeriod: formData.promotionalPeriod,
        promotionalRate: formData.promotionalRate,
        hasInsurance: formData.hasInsurance,
        insuranceRate: formData.insuranceRate,
        processingFee: formData.processingFee,
        earlyRepaymentPenalty: formData.earlyRepaymentPenalty,
      };

      const validation = validateLoanCalculationParams(params);
      if (!validation.isValid) {
        setErrors(validation.errors.map((e) => e.message));
        setLoading(false);
        return;
      }

      // Calculate based on loan type
      let calculationResult: LoanCalculationResult;

      switch (formData.loanType) {
        case "home":
          calculationResult = calculateHomeLoan(
            formData.principal,
            formData.annualRate,
            formData.termInMonths,
            {
              loanType: formData.rateType,
              collateralType: "real_estate",
              propertyType: formData.propertyType || "apartment",
              propertyLocation: formData.propertyLocation || "other",
              isPrimaryResidence: true,
              disbursementMethod: "lump_sum",
              interestPaymentMethod: "monthly",
            },
          );
          break;

        case "auto":
          calculationResult = calculateAutoLoan(
            formData.principal,
            formData.annualRate,
            formData.termInMonths,
            {
              loanType: formData.rateType,
              collateralType: "vehicle",
              vehicleType: formData.vehicleType || "new_car",
              vehicleValue: formData.vehicleValue || formData.principal * 1.2,
              isNewCar: formData.vehicleType === "new_car",
              disbursementMethod: "lump_sum",
              interestPaymentMethod: "monthly",
            },
          );
          break;

        case "consumer":
          calculationResult = calculateConsumerLoan(
            formData.principal,
            formData.annualRate,
            formData.termInMonths,
            {
              loanType: formData.rateType,
              collateralType: "none",
              purpose: "home_improvement",
              employmentType: "permanent",
              monthlyIncome: formData.monthlyIncome || 15000000,
              disbursementMethod: "lump_sum",
              interestPaymentMethod: "monthly",
            },
          );
          break;

        case "business":
          calculationResult = calculateBusinessLoan(
            formData.principal,
            formData.annualRate,
            formData.termInMonths,
            {
              loanType: formData.rateType,
              collateralType: "real_estate",
              businessType: "llc",
              businessAge: 3,
              annualRevenue: (formData.monthlyIncome || 15000000) * 12,
              profitability: 15,
              disbursementMethod: "installment",
              interestPaymentMethod: "monthly",
            },
          );
          break;

        default:
          calculationResult = calculateLoanDetails(params);
          break;
      }

      // Format results
      const formattedResults = formatLoanResults(calculationResult);

      // Check eligibility if income data is available
      let eligibility;
      if (formData.monthlyIncome) {
        eligibility = assessLoanEligibility(
          formData.loanType,
          formData.principal,
          formData.monthlyIncome,
          formData.monthlyDebts || 0,
        );
      }

      // Generate sample schedule (first 12 months for display)
      const schedule = calculationResult.paymentSchedule
        .slice(0, 12)
        .map((payment) => ({
          period: payment.period,
          principal: payment.principalPayment,
          interest: payment.interestPayment,
          balance: payment.endingBalance,
        }));

      setResults({
        monthlyPayment: calculationResult.monthlyPayment,
        totalPayment: calculationResult.totalPayment,
        totalInterest: calculationResult.totalInterest,
        effectiveRate: calculationResult.effectiveInterestRate,
        apr: calculationResult.apr,
        schedule,
        eligibility,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      setErrors(["Đã xảy ra lỗi khi tính toán. Vui lòng thử lại."]);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Auto-calculate when form data changes
  useEffect(() => {
    if (
      formData.principal > 0 &&
      formData.annualRate >= 0 &&
      formData.termInMonths > 0
    ) {
      calculateLoan();
    }
  }, [formData, calculateLoan]);

  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const num =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^\d]/g, ""))
        : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get loan type icon
  const getLoanTypeIcon = (type: LoanType) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "auto":
        return <Car className="w-4 h-4" />;
      case "consumer":
        return <CreditCard className="w-4 h-4" />;
      case "business":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Máy tính khoản vay</h1>
        <p className="text-gray-600">
          Công cụ tính toán khoản vay chuyên nghiệp cho thị trường Việt Nam
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Máy tính
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            So sánh
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Lịch trả nợ
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Mẹo vay
          </TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getLoanTypeIcon(formData.loanType)}
                    Thông tin khoản vay
                  </CardTitle>
                  <CardDescription>
                    Nhập thông tin chi tiết về khoản vay của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Loan Type */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {VIETNAMESE_LOAN_TYPES.map((loanType) => (
                      <Button
                        key={loanType.id}
                        variant={
                          formData.loanType === loanType.id
                            ? "default"
                            : "outline"
                        }
                        className="flex flex-col items-center gap-1 h-auto p-3"
                        onClick={() =>
                          handleInputChange("loanType", loanType.id)
                        }
                      >
                        {getLoanTypeIcon(loanType.id as LoanType)}
                        <span className="text-xs">{loanType.nameVn}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Principal Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="principal">Số tiền vay</Label>
                    <Input
                      id="principal"
                      type="text"
                      value={formatCurrency(formData.principal)}
                      onChange={(e) => {
                        const value =
                          parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                        handleInputChange("principal", value);
                      }}
                      className="text-lg"
                    />
                    <Slider
                      value={[formData.principal]}
                      onValueChange={([value]) =>
                        handleInputChange("principal", value)
                      }
                      max={5000000000}
                      min={10000000}
                      step={100000000}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>10 triệu</span>
                      <span>5 tỷ</span>
                    </div>
                  </div>

                  {/* Interest Rate Type */}
                  <div className="space-y-2">
                    <Label>Phương pháp lãi suất</Label>
                    <Select
                      value={formData.rateType}
                      onValueChange={(value: InterestRateType) =>
                        handleInputChange("rateType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reducing_balance">
                          Lãi suất dư giảm
                        </SelectItem>
                        <SelectItem value="flat_rate">
                          Lãi suất phẳng
                        </SelectItem>
                        <SelectItem value="fixed">Lãi suất cố định</SelectItem>
                        <SelectItem value="floating">
                          Lãi suất thả nổi
                        </SelectItem>
                        <SelectItem value="promotional">
                          Lãi suất ưu đãi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Annual Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="annualRate">Lãi suất năm (%)</Label>
                    <Input
                      id="annualRate"
                      type="number"
                      value={formData.annualRate}
                      onChange={(e) =>
                        handleInputChange(
                          "annualRate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      step="0.1"
                      min="0"
                      max="30"
                    />
                    <Slider
                      value={[formData.annualRate]}
                      onValueChange={([value]) =>
                        handleInputChange("annualRate", value)
                      }
                      max={25}
                      min={3}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>3%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="space-y-2">
                    <Label htmlFor="termInMonths">Kỳ hạn vay (tháng)</Label>
                    <Input
                      id="termInMonths"
                      type="number"
                      value={formData.termInMonths}
                      onChange={(e) =>
                        handleInputChange(
                          "termInMonths",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min="6"
                      max="360"
                    />
                    <Slider
                      value={[formData.termInMonths]}
                      onValueChange={([value]) =>
                        handleInputChange("termInMonths", value)
                      }
                      max={360}
                      min={6}
                      step={6}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>6 tháng</span>
                      <span>30 năm</span>
                    </div>
                  </div>

                  {/* Promotional Period */}
                  {formData.rateType === "promotional" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="promotionalPeriod">
                          Thời gian ưu đãi (tháng)
                        </Label>
                        <Input
                          id="promotionalPeriod"
                          type="number"
                          value={formData.promotionalPeriod || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "promotionalPeriod",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min="1"
                          max={formData.termInMonths}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="promotionalRate">
                          Lãi suất ưu đãi (%)
                        </Label>
                        <Input
                          id="promotionalRate"
                          type="number"
                          value={formData.promotionalRate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "promotionalRate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          step="0.1"
                          min="0"
                          max={formData.annualRate}
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasInsurance">Bảo hiểm khoản vay</Label>
                      <Switch
                        id="hasInsurance"
                        checked={formData.hasInsurance}
                        onCheckedChange={(checked) =>
                          handleInputChange("hasInsurance", checked)
                        }
                      />
                    </div>

                    {formData.hasInsurance && (
                      <div className="space-y-2">
                        <Label htmlFor="insuranceRate">Phí bảo hiểm (%)</Label>
                        <Input
                          id="insuranceRate"
                          type="number"
                          value={formData.insuranceRate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "insuranceRate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          step="0.1"
                          min="0"
                          max="5"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="processingFee">Phí xử lý (%)</Label>
                        <Input
                          id="processingFee"
                          type="number"
                          value={formData.processingFee || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "processingFee",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          step="0.1"
                          min="0"
                          max="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="earlyRepaymentPenalty">
                          Phí trả trước hạn (%)
                        </Label>
                        <Input
                          id="earlyRepaymentPenalty"
                          type="number"
                          value={formData.earlyRepaymentPenalty || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "earlyRepaymentPenalty",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          step="0.1"
                          min="0"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loan Type Specific Fields */}
                  {formData.loanType === "home" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Loại bất động sản</Label>
                        <Select
                          value={formData.propertyType || "apartment"}
                          onValueChange={(
                            value: "apartment" | "house" | "land",
                          ) => handleInputChange("propertyType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Căn hộ</SelectItem>
                            <SelectItem value="house">Nhà riêng</SelectItem>
                            <SelectItem value="land">Đất</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Vị trí</Label>
                        <Select
                          value={formData.propertyLocation || "other"}
                          onValueChange={(value: "hanoi" | "hcmc" | "other") =>
                            handleInputChange("propertyLocation", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hanoi">Hà Nội</SelectItem>
                            <SelectItem value="hcmc">TP.HCM</SelectItem>
                            <SelectItem value="other">Tỉnh khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {formData.loanType === "auto" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Loại xe</Label>
                        <Select
                          value={formData.vehicleType || "new_car"}
                          onValueChange={(value: "new_car" | "used_car") =>
                            handleInputChange("vehicleType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new_car">Xe mới</SelectItem>
                            <SelectItem value="used_car">
                              Xe đã qua sử dụng
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleValue">Giá trị xe</Label>
                        <Input
                          id="vehicleValue"
                          type="text"
                          value={formatCurrency(
                            formData.vehicleValue || formData.principal * 1.2,
                          )}
                          onChange={(e) => {
                            const value =
                              parseFloat(
                                e.target.value.replace(/[^\d]/g, ""),
                              ) || 0;
                            handleInputChange("vehicleValue", value);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {(formData.loanType === "consumer" ||
                    formData.loanType === "business") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyIncome">
                          Thu nhập hàng tháng
                        </Label>
                        <Input
                          id="monthlyIncome"
                          type="text"
                          value={formatCurrency(formData.monthlyIncome || 0)}
                          onChange={(e) => {
                            const value =
                              parseFloat(
                                e.target.value.replace(/[^\d]/g, ""),
                              ) || 0;
                            handleInputChange("monthlyIncome", value);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyDebts">Nợ hiện tại</Label>
                        <Input
                          id="monthlyDebts"
                          type="text"
                          value={formatCurrency(formData.monthlyDebts || 0)}
                          onChange={(e) => {
                            const value =
                              parseFloat(
                                e.target.value.replace(/[^\d]/g, ""),
                              ) || 0;
                            handleInputChange("monthlyDebts", value);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Calculate Button */}
                  <Button
                    onClick={calculateLoan}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Đang tính toán..." : "Tính toán khoản vay"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {results && (
                <>
                  {/* Summary Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Kết quả tính toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 mb-1">
                            Khoản thanh toán hàng tháng
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {results.monthlyPayment}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tổng tiền thanh toán:
                            </span>
                            <span className="font-medium">
                              {results.totalPayment}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tổng lãi suất:
                            </span>
                            <span className="font-medium">
                              {results.totalInterest}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Lãi suất hiệu quả:
                            </span>
                            <span className="font-medium">
                              {results.effectiveRate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">APR:</span>
                            <span className="font-medium">
                              {results.apr.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Eligibility Check */}
                      {results.eligibility && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Khả năng được duyệt:
                            </span>
                            <Badge
                              variant={
                                results.eligibility.eligible
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {results.eligibility.eligible
                                ? "Có khả năng"
                                : "Khó khăn"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Tỷ lệ: {results.eligibility.probability}%
                          </div>
                          {results.eligibility.recommendations.length > 0 && (
                            <div className="text-sm space-y-1">
                              <div className="font-medium">Khuyến nghị:</div>
                              {results.eligibility.recommendations
                                .slice(0, 3)
                                .map((rec, index) => (
                                  <div key={index} className="text-gray-600">
                                    • {rec}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mẹo nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>
                            Lãi suất dư giảm thường tốt hơn lãi suất phẳng cho
                            vay dài hạn
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>
                            Cân nhắc bảo hiểm khoản vay để giảm rủi ro
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>
                            Khoản thanh hàng tháng nên dưới 50% thu nhập
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Payment Schedule Tab */}
        <TabsContent value="schedule">
          {results && results.schedule ? (
            <Card>
              <CardHeader>
                <CardTitle>Lịch trả nợ (12 tháng đầu)</CardTitle>
                <CardDescription>
                  Chi tiết các khoản thanh toán hàng tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Kỳ</th>
                        <th className="text-right p-2">Gốc</th>
                        <th className="text-right p-2">Lãi</th>
                        <th className="text-right p-2">Dư nợ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.schedule.map((payment) => (
                        <tr key={payment.period} className="border-b">
                          <td className="p-2">{payment.period}</td>
                          <td className="text-right p-2">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="text-right p-2">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="text-right p-2">
                            {formatCurrency(payment.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Chưa có kết quả tính toán</p>
                <p className="text-sm text-gray-400">
                  Vui lòng tính toán khoản vay trước
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                So sánh khoản vay
              </h3>
              <p className="text-gray-500">
                Tính năng so sánh đang được phát triển
              </p>
              <p className="text-sm text-gray-400">
                Sắp ra mắt: so sánh nhiều gói vay cùng lúc
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lời khuyên khi vay tiền</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Đánh giá khả năng trả nợ</h4>
                  <p className="text-sm text-gray-600">
                    Đảm bảo khoản thanh toán hàng tháng không vượt quá 30-50%
                    thu nhập của bạn
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. So sánh lãi suất</h4>
                  <p className="text-sm text-gray-600">
                    Đừng chỉ nhìn vào lãi suất danh nghĩa, hãy xem APR (lãi suất
                    thực)
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. Đọc kỹ hợp đồng</h4>
                  <p className="text-sm text-gray-600">
                    Chú ý các điều khoản về phí trả trước hạn, phí xử lý, và các
                    loại phí khác
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4. Cân nhắc bảo hiểm</h4>
                  <p className="text-sm text-gray-600">
                    Bảo hiểm khoản vay có thể bảo vệ bạn trong các trường hợp
                    bất ngờ
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cách tối ưu khoản vay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Lãi suất dư giảm</h4>
                  <p className="text-sm text-gray-600">
                    Chọn phương pháp lãi suất dư giảm cho khoản vay dài hạn
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. Kỳ hạn phù hợp</h4>
                  <p className="text-sm text-gray-600">
                    Kỳ hạn dài giúp giảm áp lực hàng tháng nhưng tăng tổng lãi
                    suất
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. Đúng thời điểm</h4>
                  <p className="text-sm text-gray-600">
                    Vay khi lãi suất thấp và tài chính ổn định
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4. Tài sản đảm bảo</h4>
                  <p className="text-sm text-gray-600">
                    Có tài sản đảm bảo giúp được lãi suất tốt hơn
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanCalculator;
