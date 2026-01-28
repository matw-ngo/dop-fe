/**
 * Financial Comparison Tools Component
 *
 * Comprehensive comparison tools for loan products, financial health scoring,
 * affordability analysis, and ROI calculations for the Vietnamese market.
 */

import { AlertCircle, BarChart3, Heart, Scale, Target } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import calculation functions
import {
  analyzeAffordability,
  calculateFinancialHealthScore,
  calculateLoanDetails,
} from "@/lib/financial/calculations";
import { compareLoanOptions } from "@/lib/financial/loan-calculations";
import type { VietnameseBank } from "@/lib/financial-data/vietnamese-financial-data";

// Types
interface LoanComparisonData {
  loan1: {
    principal: number;
    annualRate: number;
    termInMonths: number;
    bankId?: string;
    loanType: string;
  };
  loan2: {
    principal: number;
    annualRate: number;
    termInMonths: number;
    bankId?: string;
    loanType: string;
  };
}

interface FinancialHealthData {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebts: number;
  monthlySavings: number;
  creditScore: number;
  hasEmergencyFund: boolean;
  hasInsurance: boolean;
  investmentDiversity: number;
}

interface AffordabilityData {
  loanAmount: number;
  monthlyIncome: number;
  monthlyDebts: number;
  interestRate: number;
  termInMonths: number;
}

interface ROIData {
  investmentAmount: number;
  expectedReturn: number;
  investmentPeriod: number;
  riskLevel: "low" | "medium" | "high";
  inflationRate?: number;
}

const FinancialComparison: React.FC = () => {
  const [activeTab, setActiveTab] = useState("loan-comparison");
  const [_loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Loan comparison state
  const [loanComparisonData, setLoanComparisonData] =
    useState<LoanComparisonData>({
      loan1: {
        principal: 500000000,
        annualRate: 9.5,
        termInMonths: 120,
        loanType: "home",
      },
      loan2: {
        principal: 500000000,
        annualRate: 10.0,
        termInMonths: 120,
        loanType: "home",
      },
    });
  const [loanComparisonResult, setLoanComparisonResult] = useState<any>(null);

  // Financial health state
  const [financialHealthData, setFinancialHealthData] =
    useState<FinancialHealthData>({
      monthlyIncome: 20000000,
      monthlyExpenses: 12000000,
      monthlyDebts: 3000000,
      monthlySavings: 5000000,
      creditScore: 700,
      hasEmergencyFund: true,
      hasInsurance: true,
      investmentDiversity: 60,
    });
  const [healthScoreResult, setHealthScoreResult] = useState<any>(null);

  // Affordability state
  const [affordabilityData, setAffordabilityData] = useState<AffordabilityData>(
    {
      loanAmount: 1000000000,
      monthlyIncome: 25000000,
      monthlyDebts: 5000000,
      interestRate: 9.0,
      termInMonths: 180,
    },
  );
  const [affordabilityResult, setAffordabilityResult] = useState<any>(null);

  // ROI state
  const [roiData, setRoiData] = useState<ROIData>({
    investmentAmount: 100000000,
    expectedReturn: 130000000,
    investmentPeriod: 12,
    riskLevel: "medium",
    inflationRate: 3.89,
  });
  const [roiResult, setRoiResult] = useState<any>(null);

  // Bank data
  const [_banks, setBanks] = useState<VietnameseBank[]>([]);
  const [_bestLoanRates, _setBestLoanRates] = useState<any[]>([]);

  // Load bank data
  useEffect(() => {
    const mockBanks = [
      {
        id: "vcb",
        name: "Vietcombank",
        loanRates: {
          home: { minRate: 7.5, maxRate: 11.0 },
          auto: { minRate: 9.0, maxRate: 13.0 },
          consumer: { minRate: 12.0, maxRate: 18.0 },
        },
      },
      {
        id: "tcb",
        name: "Techcombank",
        loanRates: {
          home: { minRate: 7.8, maxRate: 11.5 },
          auto: { minRate: 9.5, maxRate: 14.0 },
          consumer: { minRate: 13.0, maxRate: 20.0 },
        },
      },
      {
        id: "acb",
        name: "ACB",
        loanRates: {
          home: { minRate: 7.2, maxRate: 10.5 },
          auto: { minRate: 8.8, maxRate: 12.5 },
          consumer: { minRate: 11.5, maxRate: 17.0 },
        },
      },
    ];
    setBanks(mockBanks as any);
  }, []);

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

  // Calculate loan comparison
  const calculateLoanComparison = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Calculate both loans
      const loan1Result = calculateLoanDetails({
        principal: loanComparisonData.loan1.principal,
        annualRate: loanComparisonData.loan1.annualRate,
        termInMonths: loanComparisonData.loan1.termInMonths,
        rateType: "reducing_balance",
        hasInsurance: true,
        insuranceRate: 0.3,
        processingFee: 1.5,
        earlyRepaymentPenalty: 3,
      });

      const loan2Result = calculateLoanDetails({
        principal: loanComparisonData.loan2.principal,
        annualRate: loanComparisonData.loan2.annualRate,
        termInMonths: loanComparisonData.loan2.termInMonths,
        rateType: "reducing_balance",
        hasInsurance: true,
        insuranceRate: 0.3,
        processingFee: 1.5,
        earlyRepaymentPenalty: 3,
      });

      // Compare loans
      const comparison = compareLoanOptions(loan1Result, loan2Result);
      setLoanComparisonResult({
        loan1: loan1Result,
        loan2: loan2Result,
        comparison,
      });
    } catch (error) {
      console.error("Comparison error:", error);
      setErrors(["Đã xảy ra lỗi khi so sánh. Vui lòng thử lại."]);
    } finally {
      setLoading(false);
    }
  }, [loanComparisonData]);

  // Calculate financial health
  const calculateFinancialHealth = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const healthScore = calculateFinancialHealthScore(
        financialHealthData.monthlyIncome,
        financialHealthData.monthlyExpenses,
        financialHealthData.monthlyDebts,
        financialHealthData.monthlySavings,
        financialHealthData.creditScore,
        financialHealthData.hasEmergencyFund,
        financialHealthData.hasInsurance,
        financialHealthData.investmentDiversity,
      );
      setHealthScoreResult(healthScore);
    } catch (error) {
      console.error("Health score error:", error);
      setErrors(["Đã xảy ra lỗi khi tính điểm sức khỏe tài chính."]);
    } finally {
      setLoading(false);
    }
  }, [financialHealthData]);

  // Calculate affordability
  const calculateAffordability = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const affordability = analyzeAffordability(
        affordabilityData.monthlyIncome,
        affordabilityData.monthlyDebts,
        affordabilityData.interestRate,
        affordabilityData.loanAmount,
        affordabilityData.termInMonths,
      );
      setAffordabilityResult(affordability);
    } catch (error) {
      console.error("Affordability error:", error);
      setErrors(["Đã xảy ra lỗi khi phân tích khả năng vay."]);
    } finally {
      setLoading(false);
    }
  }, [affordabilityData]);

  // Calculate ROI
  const calculateROI = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const profit = roiData.expectedReturn - roiData.investmentAmount;
      const roiPercentage = (profit / roiData.investmentAmount) * 100;
      const annualizedROI = roiPercentage * (12 / roiData.investmentPeriod);

      // Risk-adjusted ROI
      const riskMultiplier =
        roiData.riskLevel === "low"
          ? 1.0
          : roiData.riskLevel === "medium"
            ? 0.8
            : 0.6;
      const riskAdjustedROI = annualizedROI * riskMultiplier;

      // Inflation-adjusted ROI
      const realROI = roiData.inflationRate
        ? ((1 + annualizedROI / 100) / (1 + roiData.inflationRate / 100) - 1) *
          100
        : annualizedROI;

      setRoiResult({
        profit,
        roiPercentage,
        annualizedROI,
        riskAdjustedROI,
        realROI,
        riskMultiplier,
      });
    } catch (error) {
      console.error("ROI calculation error:", error);
      setErrors(["Đã xảy ra lỗi khi tính toán ROI."]);
    } finally {
      setLoading(false);
    }
  }, [roiData]);

  // Auto-calculate when data changes
  useEffect(() => {
    if (activeTab === "loan-comparison") {
      calculateLoanComparison();
    } else if (activeTab === "financial-health") {
      calculateFinancialHealth();
    } else if (activeTab === "affordability") {
      calculateAffordability();
    } else if (activeTab === "roi-calculator") {
      calculateROI();
    }
  }, [
    activeTab,
    calculateAffordability,
    calculateFinancialHealth,
    calculateLoanComparison,
    calculateROI,
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Công cụ so sánh tài chính
        </h1>
        <p className="text-gray-600">
          Phân tích và so sánh các sản phẩm tài chính cho thị trường Việt Nam
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="loan-comparison"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            So sánh vay
          </TabsTrigger>
          <TabsTrigger
            value="financial-health"
            className="flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Sức khỏe tài chính
          </TabsTrigger>
          <TabsTrigger
            value="affordability"
            className="flex items-center gap-2"
          >
            <Scale className="w-4 h-4" />
            Khả năng vay
          </TabsTrigger>
          <TabsTrigger
            value="roi-calculator"
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            ROI
          </TabsTrigger>
        </TabsList>

        {/* Loan Comparison Tab */}
        <TabsContent value="loan-comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  Khoản vay 1
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Số tiền vay</Label>
                  <Input
                    type="text"
                    value={formatCurrency(loanComparisonData.loan1.principal)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan1: { ...prev.loan1, principal: value },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lãi suất (%)</Label>
                  <Input
                    type="number"
                    value={loanComparisonData.loan1.annualRate}
                    onChange={(e) => {
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan1: {
                          ...prev.loan1,
                          annualRate: parseFloat(e.target.value) || 0,
                        },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kỳ hạn (tháng)</Label>
                  <Input
                    type="number"
                    value={loanComparisonData.loan1.termInMonths}
                    onChange={(e) => {
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan1: {
                          ...prev.loan1,
                          termInMonths: parseInt(e.target.value, 10) || 0,
                        },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loại vay</Label>
                  <Select
                    value={loanComparisonData.loan1.loanType}
                    onValueChange={(value) => {
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan1: { ...prev.loan1, loanType: value },
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Vay mua nhà</SelectItem>
                      <SelectItem value="auto">Vay mua xe</SelectItem>
                      <SelectItem value="consumer">Vay tiêu dùng</SelectItem>
                      <SelectItem value="business">Vay kinh doanh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Loan 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  Khoản vay 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Số tiền vay</Label>
                  <Input
                    type="text"
                    value={formatCurrency(loanComparisonData.loan2.principal)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan2: { ...prev.loan2, principal: value },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lãi suất (%)</Label>
                  <Input
                    type="number"
                    value={loanComparisonData.loan2.annualRate}
                    onChange={(e) => {
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan2: {
                          ...prev.loan2,
                          annualRate: parseFloat(e.target.value) || 0,
                        },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kỳ hạn (tháng)</Label>
                  <Input
                    type="number"
                    value={loanComparisonData.loan2.termInMonths}
                    onChange={(e) => {
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan2: {
                          ...prev.loan2,
                          termInMonths: parseInt(e.target.value, 10) || 0,
                        },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loại vay</Label>
                  <Select
                    value={loanComparisonData.loan2.loanType}
                    onValueChange={(value) => {
                      setLoanComparisonData((prev) => ({
                        ...prev,
                        loan2: { ...prev.loan2, loanType: value },
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Vay mua nhà</SelectItem>
                      <SelectItem value="auto">Vay mua xe</SelectItem>
                      <SelectItem value="consumer">Vay tiêu dùng</SelectItem>
                      <SelectItem value="business">Vay kinh doanh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Results */}
          {loanComparisonResult && (
            <Card>
              <CardHeader>
                <CardTitle>Kết quả so sánh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        loanComparisonResult.loan1.monthlyPayment,
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Khoản vay 1 - Trả hàng tháng
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        loanComparisonResult.loan2.monthlyPayment,
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Khoản vay 2 - Trả hàng tháng
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        loanComparisonResult.comparison
                          .cheaperMonthlyPayment === "loan1"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        loanComparisonResult.comparison.savings
                          .monthlyPaymentDifference,
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Chênh lệch hàng tháng
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">
                        Khoản vay 1 - Chi tiết
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tổng thanh toán:</span>
                          <span>
                            {formatCurrency(
                              loanComparisonResult.loan1.totalPayment,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tổng lãi suất:</span>
                          <span>
                            {formatCurrency(
                              loanComparisonResult.loan1.totalInterest,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>APR:</span>
                          <span>
                            {loanComparisonResult.loan1.apr.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">
                        Khoản vay 2 - Chi tiết
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tổng thanh toán:</span>
                          <span>
                            {formatCurrency(
                              loanComparisonResult.loan2.totalPayment,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tổng lãi suất:</span>
                          <span>
                            {formatCurrency(
                              loanComparisonResult.loan2.totalInterest,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>APR:</span>
                          <span>
                            {loanComparisonResult.loan2.apr.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Khuyến nghị</h3>
                  <p className="text-sm text-gray-600">
                    {loanComparisonResult.comparison.recommendation}
                  </p>
                  {loanComparisonResult.comparison.reasoning.map(
                    (reason: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 mt-1">
                        • {reason}
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Financial Health Tab */}
        <TabsContent value="financial-health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài chính</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Thu nhập hàng tháng</Label>
                  <Input
                    type="text"
                    value={formatCurrency(financialHealthData.monthlyIncome)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setFinancialHealthData((prev) => ({
                        ...prev,
                        monthlyIncome: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chi phí hàng tháng</Label>
                  <Input
                    type="text"
                    value={formatCurrency(financialHealthData.monthlyExpenses)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setFinancialHealthData((prev) => ({
                        ...prev,
                        monthlyExpenses: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nợ hiện tại</Label>
                  <Input
                    type="text"
                    value={formatCurrency(financialHealthData.monthlyDebts)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setFinancialHealthData((prev) => ({
                        ...prev,
                        monthlyDebts: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tiết kiệm hàng tháng</Label>
                  <Input
                    type="text"
                    value={formatCurrency(financialHealthData.monthlySavings)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setFinancialHealthData((prev) => ({
                        ...prev,
                        monthlySavings: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Điểm tín dụng</Label>
                  <Input
                    type="number"
                    value={financialHealthData.creditScore}
                    onChange={(e) => {
                      setFinancialHealthData((prev) => ({
                        ...prev,
                        creditScore: parseInt(e.target.value, 10) || 0,
                      }));
                    }}
                    min="300"
                    max="850"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đa dạng hóa đầu tư (%)</Label>
                  <Slider
                    value={[financialHealthData.investmentDiversity]}
                    onValueChange={([value]) =>
                      setFinancialHealthData((prev) => ({
                        ...prev,
                        investmentDiversity: value,
                      }))
                    }
                    max={100}
                    min={0}
                    step={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emergency-fund"
                      checked={financialHealthData.hasEmergencyFund}
                      onCheckedChange={(checked) =>
                        setFinancialHealthData((prev) => ({
                          ...prev,
                          hasEmergencyFund: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="emergency-fund">Có quỹ khẩn cấp</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insurance"
                      checked={financialHealthData.hasInsurance}
                      onCheckedChange={(checked) =>
                        setFinancialHealthData((prev) => ({
                          ...prev,
                          hasInsurance: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="insurance">Có bảo hiểm</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {healthScoreResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Điểm sức khỏe tài chính</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div
                      className={`text-6xl font-bold ${
                        healthScoreResult.overallScore >= 80
                          ? "text-green-600"
                          : healthScoreResult.overallScore >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {healthScoreResult.overallScore}
                    </div>
                    <div className="text-sm text-gray-600">/ 100 điểm</div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Điểm tín dụng</span>
                        <span>{healthScoreResult.creditScore}/850</span>
                      </div>
                      <Progress
                        value={(healthScoreResult.creditScore / 850) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ổn định thu nhập</span>
                        <span>{healthScoreResult.incomeStability}/100</span>
                      </div>
                      <Progress
                        value={healthScoreResult.incomeStability}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quản lý nợ</span>
                        <span>{healthScoreResult.debtManagement}/100</span>
                      </div>
                      <Progress
                        value={healthScoreResult.debtManagement}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tỷ lệ tiết kiệm</span>
                        <span>{healthScoreResult.savingsRate}/100</span>
                      </div>
                      <Progress
                        value={healthScoreResult.savingsRate}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Đa dạng đầu tư</span>
                        <span>{healthScoreResult.investmentDiversity}/100</span>
                      </div>
                      <Progress
                        value={healthScoreResult.investmentDiversity}
                        className="h-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {healthScoreResult.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">
                          Điểm mạnh
                        </h4>
                        <ul className="text-sm space-y-1">
                          {healthScoreResult.strengths.map(
                            (strength: string, index: number) => (
                              <li key={index} className="text-green-600">
                                ✓ {strength}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {healthScoreResult.riskFactors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">
                          Yếu tố rủi ro
                        </h4>
                        <ul className="text-sm space-y-1">
                          {healthScoreResult.riskFactors.map(
                            (risk: string, index: number) => (
                              <li key={index} className="text-red-600">
                                ⚠ {risk}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {healthScoreResult.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">
                          Khuyến nghị
                        </h4>
                        <ul className="text-sm space-y-1">
                          {healthScoreResult.recommendations.map(
                            (rec: string, index: number) => (
                              <li key={index} className="text-blue-600">
                                • {rec}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Affordability Tab */}
        <TabsContent value="affordability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khả năng vay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Số tiền muốn vay</Label>
                  <Input
                    type="text"
                    value={formatCurrency(affordabilityData.loanAmount)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setAffordabilityData((prev) => ({
                        ...prev,
                        loanAmount: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thu nhập hàng tháng</Label>
                  <Input
                    type="text"
                    value={formatCurrency(affordabilityData.monthlyIncome)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setAffordabilityData((prev) => ({
                        ...prev,
                        monthlyIncome: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nợ hiện tại</Label>
                  <Input
                    type="text"
                    value={formatCurrency(affordabilityData.monthlyDebts)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setAffordabilityData((prev) => ({
                        ...prev,
                        monthlyDebts: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lãi suất dự kiến (%)</Label>
                  <Input
                    type="number"
                    value={affordabilityData.interestRate}
                    onChange={(e) => {
                      setAffordabilityData((prev) => ({
                        ...prev,
                        interestRate: parseFloat(e.target.value) || 0,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kỳ hạn (tháng)</Label>
                  <Input
                    type="number"
                    value={affordabilityData.termInMonths}
                    onChange={(e) => {
                      setAffordabilityData((prev) => ({
                        ...prev,
                        termInMonths: parseInt(e.target.value, 10) || 0,
                      }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {affordabilityResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích khả năng vay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge
                      variant={
                        affordabilityResult.riskLevel === "low"
                          ? "default"
                          : affordabilityResult.riskLevel === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-lg px-4 py-2"
                    >
                      {affordabilityResult.riskLevel === "low"
                        ? "An toàn"
                        : affordabilityResult.riskLevel === "medium"
                          ? "Cần cân nhắc"
                          : "Rủi ro cao"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm khả năng vay:</span>
                      <span className="font-medium">
                        {affordabilityResult.affordabilityScore}/100
                      </span>
                    </div>
                    <Progress
                      value={affordabilityResult.affordabilityScore}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Khoản thanh toán hàng tháng:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(affordabilityResult.maxMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Tỷ lệ nợ trên thu nhập:
                      </span>
                      <span className="font-medium">
                        {affordabilityResult.debtToIncomeRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Số tiền vay đề nghị:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          affordabilityResult.recommendedLoanAmount,
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Khuyến nghị</h4>
                    <ul className="text-sm space-y-1">
                      {affordabilityResult.recommendations.map(
                        (rec: string, index: number) => (
                          <li key={index} className="text-gray-600">
                            • {rec}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ROI Calculator Tab */}
        <TabsContent value="roi-calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đầu tư</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Số tiền đầu tư</Label>
                  <Input
                    type="text"
                    value={formatCurrency(roiData.investmentAmount)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setRoiData((prev) => ({
                        ...prev,
                        investmentAmount: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dự kiến thu hồi</Label>
                  <Input
                    type="text"
                    value={formatCurrency(roiData.expectedReturn)}
                    onChange={(e) => {
                      const value =
                        parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setRoiData((prev) => ({
                        ...prev,
                        expectedReturn: value,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thời gian đầu tư (tháng)</Label>
                  <Input
                    type="number"
                    value={roiData.investmentPeriod}
                    onChange={(e) => {
                      setRoiData((prev) => ({
                        ...prev,
                        investmentPeriod: parseInt(e.target.value, 10) || 0,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mức độ rủi ro</Label>
                  <Select
                    value={roiData.riskLevel}
                    onValueChange={(value: "low" | "medium" | "high") => {
                      setRoiData((prev) => ({ ...prev, riskLevel: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tỷ lệ lạm phát (%)</Label>
                  <Input
                    type="number"
                    value={roiData.inflationRate}
                    onChange={(e) => {
                      setRoiData((prev) => ({
                        ...prev,
                        inflationRate: parseFloat(e.target.value) || 0,
                      }));
                    }}
                    step="0.1"
                  />
                </div>
              </CardContent>
            </Card>

            {roiResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả ROI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div
                      className={`text-5xl font-bold ${
                        roiResult.roiPercentage >= 20
                          ? "text-green-600"
                          : roiResult.roiPercentage >= 10
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {roiResult.roiPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">ROI tổng thể</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lợi nhuận:</span>
                      <span className="font-medium">
                        {formatCurrency(roiResult.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI hàng năm:</span>
                      <span className="font-medium">
                        {roiResult.annualizedROI.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        ROI điều chỉnh rủi ro:
                      </span>
                      <span className="font-medium">
                        {roiResult.riskAdjustedROI.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        ROI thực (sau lạm phát):
                      </span>
                      <span className="font-medium">
                        {roiResult.realROI.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {roiData.riskLevel === "low"
                            ? "Thấp"
                            : roiData.riskLevel === "medium"
                              ? "Trung bình"
                              : "Cao"}
                        </div>
                        <div className="text-xs text-gray-600">
                          Mức độ rủi ro
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(roiResult.riskMultiplier * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          Hệ số rủi ro
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
  );
};

export default FinancialComparison;
