/**
 * Vietnamese Salary Gross-to-Net Converter Component
 *
 * A comprehensive salary converter for Vietnamese market with tax calculations,
 * social insurance contributions, and various compensation scenarios.
 */

import {
  AlertCircle,
  Briefcase,
  Calculator,
  CheckCircle,
  DollarSign,
  Heart,
  Home,
  Info,
  PiggyBank,
  Receipt,
  Shield,
  TrendingUp,
  Users,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import calculation functions
import {
  analyzeCompensationTax,
  calculateComprehensivePersonalTax,
} from "@/lib/financial/tax-calculations";
import type { TaxCalculationResult } from "@/lib/financial-data/tax-brackets";
import {
  FAMILY_DEDUCTIONS,
  formatVND,
  REGIONAL_MINIMUM_WAGE,
  SOCIAL_INSURANCE_RATES,
} from "@/lib/financial-data/vietnamese-financial-data";

// Types
interface SalaryFormData {
  grossMonthlyIncome: number;
  numberOfDependents: number;
  region: number;
  maritalStatus: "single" | "married";
  spouseIncome?: number;
  hasDisabledDependent: boolean;
  hasSelfAndSpouseOnly: boolean;
  bonus: number;
  overtimeHours: number;
  hourlyRate: number;
  allowance: number;
}

interface TaxCalculationResults {
  grossIncome: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  totalInsurance: number;
  familyDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  breakdown: any;
  additionalInsights: {
    isHighIncomeEarner: boolean;
    taxOptimizationOpportunities: string[];
    recommendedFilingMethod: string;
    pensionContributionLimit: number;
    healthInsuranceLimit: number;
  };
  regionalComparison: {
    regionAverageTax: number;
    taxDifferenceFromAverage: number;
    percentileRank: number;
  };
}

interface CompensationAnalysis {
  baseSalaryTax: TaxCalculationResult;
  withBonusTax: TaxCalculationResult;
  withAllowancesTax: TaxCalculationResult;
  totalCompensationTax: TaxCalculationResult;
  taxEfficiency: {
    mostEfficientStructure: string;
    taxSavingsOpportunity: number;
    recommendations: string[];
  };
}

const SalaryConverter: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<SalaryFormData>({
    grossMonthlyIncome: 15000000, // 15 triệu VND default
    numberOfDependents: 0,
    region: 1,
    maritalStatus: "single",
    spouseIncome: 0,
    hasDisabledDependent: false,
    hasSelfAndSpouseOnly: false,
    bonus: 0,
    overtimeHours: 0,
    hourlyRate: 0,
    allowance: 0,
  });

  // Results state
  const [taxResults, setTaxResults] = useState<TaxCalculationResults | null>(
    null,
  );
  const [compensationAnalysis, setCompensationAnalysis] =
    useState<CompensationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("converter");

  // Input change handler
  const handleInputChange = useCallback(
    (field: keyof SalaryFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Calculate tax
  const calculateTax = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate inputs
      if (formData.grossMonthlyIncome < 0) {
        setErrors(["Thu nhập không được âm"]);
        setLoading(false);
        return;
      }

      if (formData.numberOfDependents < 0) {
        setErrors(["Số người phụ thuộc không được âm"]);
        setLoading(false);
        return;
      }

      if (formData.region < 1 || formData.region > 4) {
        setErrors(["Khu vực không hợp lệ (1-4)"]);
        setLoading(false);
        return;
      }

      // Calculate comprehensive tax
      const params = {
        grossMonthlyIncome: formData.grossMonthlyIncome,
        numberOfDependents: formData.numberOfDependents,
        region: formData.region,
        maritalStatus: formData.maritalStatus,
        spouseIncome: formData.spouseIncome,
        hasDisabledDependent: formData.hasDisabledDependent,
        hasSelfAndSpouseOnly: formData.hasSelfAndSpouseOnly,
      };

      const calculationResults = calculateComprehensivePersonalTax(params);
      setTaxResults(calculationResults);

      // Calculate compensation analysis if there are bonus/allowance
      if (
        formData.bonus > 0 ||
        formData.allowance > 0 ||
        formData.overtimeHours > 0
      ) {
        const analysis = analyzeCompensationTax(
          formData.grossMonthlyIncome,
          formData.bonus,
          formData.allowance,
          0, // stockOptions
          formData.numberOfDependents,
          formData.region,
        );
        setCompensationAnalysis(analysis);
      } else {
        setCompensationAnalysis(null);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setErrors(["Đã xảy ra lỗi khi tính toán. Vui lòng thử lại."]);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Auto-calculate when form data changes
  useEffect(() => {
    if (formData.grossMonthlyIncome >= 0) {
      calculateTax();
    }
  }, [formData, calculateTax]);

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

  // Get regional minimum wage
  const getRegionalMinWage = (region: number): number => {
    switch (region) {
      case 1:
        return REGIONAL_MINIMUM_WAGE.region1;
      case 2:
        return REGIONAL_MINIMUM_WAGE.region2;
      case 3:
        return REGIONAL_MINIMUM_WAGE.region3;
      case 4:
        return REGIONAL_MINIMUM_WAGE.region4;
      default:
        return REGIONAL_MINIMUM_WAGE.region1;
    }
  };

  // Get region name
  const getRegionName = (region: number): string => {
    switch (region) {
      case 1:
        return "Vùng I (Hà Nội, TP.HCM)";
      case 2:
        return "Vùng II";
      case 3:
        return "Vùng III";
      case 4:
        return "Vùng IV";
      default:
        return "Chưa chọn";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Chuyển đổi lương GROSS - NET
        </h1>
        <p className="text-gray-600">
          Công cụ tính toán lương và thuế thu nhập cá nhân chuyên nghiệp cho
          Việt Nam
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="converter" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Chuyển đổi
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Chi tiết
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Phân tích
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Mẹo thuế
          </TabsTrigger>
        </TabsList>

        {/* Converter Tab */}
        <TabsContent value="converter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Thông tin lương
                  </CardTitle>
                  <CardDescription>
                    Nhập thông tin chi tiết về thu nhập của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Gross Monthly Income */}
                  <div className="space-y-2">
                    <Label htmlFor="grossMonthlyIncome">
                      Lương GROSS hàng tháng
                    </Label>
                    <Input
                      id="grossMonthlyIncome"
                      type="text"
                      value={formatCurrency(formData.grossMonthlyIncome)}
                      onChange={(e) => {
                        const value =
                          parseFloat(e.target.value.replace(/[^\d]/g, "")) || 0;
                        handleInputChange("grossMonthlyIncome", value);
                      }}
                      className="text-lg"
                    />
                    <Slider
                      value={[formData.grossMonthlyIncome]}
                      onValueChange={([value]) =>
                        handleInputChange("grossMonthlyIncome", value)
                      }
                      max={200000000}
                      min={4000000}
                      step={1000000}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>4 triệu</span>
                      <span>200 triệu</span>
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tình trạng hôn nhân</Label>
                      <Select
                        value={formData.maritalStatus}
                        onValueChange={(value: "single" | "married") =>
                          handleInputChange("maritalStatus", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Độc thân</SelectItem>
                          <SelectItem value="married">Đã kết hôn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vùng lương</Label>
                      <Select
                        value={formData.region.toString()}
                        onValueChange={(value) =>
                          handleInputChange("region", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Vùng I</SelectItem>
                          <SelectItem value="2">Vùng II</SelectItem>
                          <SelectItem value="3">Vùng III</SelectItem>
                          <SelectItem value="4">Vùng IV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Number of Dependents */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfDependents">
                      Số người phụ thuộc
                    </Label>
                    <Input
                      id="numberOfDependents"
                      type="number"
                      value={formData.numberOfDependents}
                      onChange={(e) =>
                        handleInputChange(
                          "numberOfDependents",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min="0"
                      max="20"
                    />
                    <Slider
                      value={[formData.numberOfDependents]}
                      onValueChange={([value]) =>
                        handleInputChange("numberOfDependents", value)
                      }
                      max={5}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>5+</span>
                    </div>
                  </div>

                  {/* Spouse Income */}
                  {formData.maritalStatus === "married" && (
                    <div className="space-y-2">
                      <Label htmlFor="spouseIncome">Lương vợ/chồng</Label>
                      <Input
                        id="spouseIncome"
                        type="text"
                        value={formatCurrency(formData.spouseIncome || 0)}
                        onChange={(e) => {
                          const value =
                            parseFloat(e.target.value.replace(/[^\d]/g, "")) ||
                            0;
                          handleInputChange("spouseIncome", value);
                        }}
                      />
                    </div>
                  )}

                  {/* Additional Income */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Thu nhập bổ sung
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bonus">Thưởng</Label>
                        <Input
                          id="bonus"
                          type="text"
                          value={formatCurrency(formData.bonus)}
                          onChange={(e) => {
                            const value =
                              parseFloat(
                                e.target.value.replace(/[^\d]/g, ""),
                              ) || 0;
                            handleInputChange("bonus", value);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allowance">Phụ cấp</Label>
                        <Input
                          id="allowance"
                          type="text"
                          value={formatCurrency(formData.allowance)}
                          onChange={(e) => {
                            const value =
                              parseFloat(
                                e.target.value.replace(/[^\d]/g, ""),
                              ) || 0;
                            handleInputChange("allowance", value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="overtimeHours">Giờ làm thêm</Label>
                        <Input
                          id="overtimeHours"
                          type="number"
                          value={formData.overtimeHours}
                          onChange={(e) =>
                            handleInputChange(
                              "overtimeHours",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          min="0"
                          max="200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Lương giờ</Label>
                        <Input
                          id="hourlyRate"
                          type="text"
                          value={formatCurrency(formData.hourlyRate)}
                          onChange={(e) => {
                            const value =
                              parseFloat(
                                e.target.value.replace(/[^\d]/g, ""),
                              ) || 0;
                            handleInputChange("hourlyRate", value);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Conditions */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Điều kiện đặc biệt
                    </Label>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasDisabledDependent">
                        Người phụ thuộc tàn tật
                      </Label>
                      <Switch
                        id="hasDisabledDependent"
                        checked={formData.hasDisabledDependent}
                        onCheckedChange={(checked) =>
                          handleInputChange("hasDisabledDependent", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasSelfAndSpouseOnly">
                        Chỉ có bản thân và vợ/chồng
                      </Label>
                      <Switch
                        id="hasSelfAndSpouseOnly"
                        checked={formData.hasSelfAndSpouseOnly}
                        onCheckedChange={(checked) =>
                          handleInputChange("hasSelfAndSpouseOnly", checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <Button
                    onClick={calculateTax}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Đang tính toán..." : "Tính toán thuế"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {taxResults && (
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
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">
                            Lương NET
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(taxResults.netIncome)}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lương GROSS:</span>
                            <span className="font-medium">
                              {formatCurrency(taxResults.grossIncome)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tổng BHXH:</span>
                            <span className="font-medium">
                              {formatCurrency(taxResults.totalInsurance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Thuế TNCN:</span>
                            <span className="font-medium">
                              {formatCurrency(taxResults.incomeTax)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Thuế suất hiệu quả:
                            </span>
                            <span className="font-medium">
                              {taxResults.effectiveTaxRate.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Tax Breakdown */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Chi tiết các khoản đóng góp
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">BHXH (8%):</span>
                            <span>
                              {formatCurrency(taxResults.socialInsurance)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">BHYT (1.5%):</span>
                            <span>
                              {formatCurrency(taxResults.healthInsurance)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">BHTN (1%):</span>
                            <span>
                              {formatCurrency(taxResults.unemploymentInsurance)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-medium pt-2 border-t">
                            <span>Giảm trừ gia cảnh:</span>
                            <span>
                              {formatCurrency(taxResults.familyDeductions)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Regional Comparison */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">So sánh vùng</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Vùng:</span>
                          <span>{getRegionName(formData.region)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Lương tối thiểu:
                          </span>
                          <span>
                            {formatCurrency(
                              getRegionalMinWage(formData.region),
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Xếp hạng thuế:</span>
                          <span>
                            {taxResults.regionalComparison.percentileRank.toFixed(
                              0,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  {taxResults.additionalInsights.taxOptimizationOpportunities
                    .length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Gợi ý tối ưu thuế
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {taxResults.additionalInsights.taxOptimizationOpportunities.map(
                            (opportunity, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                                <span className="text-sm">{opportunity}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Compensation Analysis */}
              {compensationAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Phân tích cấu trúc lương
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Cấu trúc hiệu quả nhất:
                        </span>
                        <span className="font-medium">
                          {
                            compensationAnalysis.taxEfficiency
                              .mostEfficientStructure
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Tiết kiệm thuế tiềm năng:
                        </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(
                            compensationAnalysis.taxEfficiency
                              .taxSavingsOpportunity,
                          )}
                        </span>
                      </div>
                    </div>

                    {compensationAnalysis.taxEfficiency.recommendations.length >
                      0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Khuyến nghị:</div>
                        {compensationAnalysis.taxEfficiency.recommendations
                          .slice(0, 3)
                          .map((rec, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {rec}
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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

        {/* Detailed Breakdown Tab */}
        <TabsContent value="breakdown">
          {taxResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tax Bracket Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Biểu thuế thu nhập cá nhân</CardTitle>
                  <CardDescription>
                    Chi tiết các mức thuế suất áp dụng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { range: "0 - 5 triệu", rate: "5%", amount: 250000 },
                      { range: "5 - 10 triệu", rate: "10%", amount: 750000 },
                      { range: "10 - 18 triệu", rate: "15%", amount: 1950000 },
                      { range: "18 - 32 triệu", rate: "20%", amount: 4750000 },
                      { range: "32 - 52 triệu", rate: "25%", amount: 9750000 },
                      { range: "52 - 80 triệu", rate: "30%", amount: 18150000 },
                      { range: "Trên 80 triệu", rate: "35%", amount: 0 },
                    ].map((bracket, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{bracket.range}</div>
                          <div className="text-sm text-gray-600">
                            Thuế suất: {bracket.rate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(bracket.amount)}
                          </div>
                          {bracket.amount > 0 && (
                            <Progress value={25} className="w-16 h-1 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Insurance Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết bảo hiểm xã hội</CardTitle>
                  <CardDescription>
                    Phân tích các khoản đóng góp bảo hiểm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          Bảo hiểm xã hội (8%)
                        </span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Đóng góp:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(taxResults.socialInsurance)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mức trần:{" "}
                          {formatCurrency(
                            taxResults.additionalInsights
                              .pensionContributionLimit,
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-medium">
                          Bảo hiểm y tế (1.5%)
                        </span>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Đóng góp:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(taxResults.healthInsurance)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mức trần:{" "}
                          {formatCurrency(
                            taxResults.additionalInsights.healthInsuranceLimit,
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-green-500" />
                        <span className="font-medium">
                          Bảo hiểm thất nghiệp (1%)
                        </span>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Đóng góp:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(taxResults.unemploymentInsurance)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mức trần theo vùng {getRegionName(formData.region)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Chưa có kết quả tính toán</p>
                <p className="text-sm text-gray-400">
                  Vui lòng tính toán lương trước
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">So sánh theo vùng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((region) => {
                    const minWage = getRegionalMinWage(region);
                    const taxRate = taxResults?.effectiveTaxRate || 0;
                    const netIncome =
                      formData.grossMonthlyIncome -
                      (formData.grossMonthlyIncome * taxRate) / 100;

                    return (
                      <div
                        key={region}
                        className={`p-3 rounded ${region === formData.region ? "bg-blue-50 ring-2 ring-blue-500" : "bg-gray-50"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Vùng {region}</span>
                          {region === formData.region && (
                            <Badge variant="default">Hiện tại</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Lương tối thiểu: {formatCurrency(minWage)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Thu nhập NET: {formatCurrency(netIncome)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {taxResults && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Tác động của người phụ thuộc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[0, 1, 2, 3].map((dependents) => {
                        const familyDeduction =
                          FAMILY_DEDUCTIONS.taxpayerDeduction +
                          dependents * FAMILY_DEDUCTIONS.dependentDeduction;
                        const newTaxableIncome = Math.max(
                          0,
                          formData.grossMonthlyIncome -
                            taxResults.totalInsurance -
                            familyDeduction,
                        );

                        // Simple tax calculation for comparison
                        let newTax = 0;
                        if (newTaxableIncome > 5000000) newTax = 250000;
                        if (newTaxableIncome > 10000000) newTax += 750000;
                        if (newTaxableIncome > 18000000) newTax += 1950000;

                        const newNetIncome =
                          formData.grossMonthlyIncome -
                          taxResults.totalInsurance -
                          newTax;
                        const taxDifference = taxResults.incomeTax - newTax;

                        return (
                          <div
                            key={dependents}
                            className={`p-3 rounded ${dependents === formData.numberOfDependents ? "bg-green-50 ring-2 ring-green-500" : "bg-gray-50"}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {dependents} người phụ thuộc
                              </span>
                              {dependents === formData.numberOfDependents && (
                                <Badge variant="default">Hiện tại</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Giảm trừ: {formatCurrency(familyDeduction)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Thu nhập NET: {formatCurrency(newNetIncome)}
                            </div>
                            {taxDifference > 0 && (
                              <div className="text-sm text-green-600 font-medium">
                                Tiết kiệm thuế: {formatCurrency(taxDifference)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Xu hướng thuế</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Thuế suất hiệu quả:
                          </span>
                          <span className="font-medium">
                            {taxResults?.effectiveTaxRate.toFixed(2)}%
                          </span>
                        </div>
                        <Progress
                          value={taxResults?.effectiveTaxRate || 0}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Xếp hạng thuế vùng:
                          </span>
                          <span className="font-medium">
                            {taxResults?.regionalComparison.percentileRank.toFixed(
                              0,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            taxResults?.regionalComparison.percentileRank || 0
                          }
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Phân loại thu nhập</Label>
                        <div
                          className={`p-3 rounded ${
                            taxResults?.additionalInsights.isHighIncomeEarner
                              ? "bg-red-50"
                              : "bg-green-50"
                          }`}
                        >
                          <div className="font-medium">
                            {taxResults?.additionalInsights.isHighIncomeEarner
                              ? "Thu nhập cao"
                              : "Thu nhập trung bình"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {taxResults?.additionalInsights.isHighIncomeEarner
                              ? "Cần kê khai thuế định kỳ"
                              : "Kê khai thuế năm nếu có thay đổi"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cách tối ưu thuế thu nhập cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Đăng ký người phụ thuộc
                  </h4>
                  <p className="text-sm text-gray-600">
                    Mỗi người phụ thuộc giúp giảm trừ 4.4 triệu/tháng, tiết kiệm
                    thuế đáng kể
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-500" />
                    Phân tích lương và phụ cấp
                  </h4>
                  <p className="text-sm text-gray-600">
                    Một số khoản phụ cấp được miễn thuế, giúp tối ưu thu nhập
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Tối đa hóa bảo hiểm xã hội
                  </h4>
                  <p className="text-sm text-gray-600">
                    Đóng BHXH tối đa 23.8 triệu/tháng để hưởng lợi ích về sau
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý quan trọng về thuế</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Kê khai thuế</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Thu nhập &gt; 120 triệu/năm phải kê khai thuế</li>
                    <li>• Có nhiều nguồn thu nhập cần kê khai tổng hợp</li>
                    <li>• Nộp hồ sơ trước 31/3 năm sau</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Giảm trừ gia cảnh</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 11 triệu/tháng cho bản thân</li>
                    <li>• 4.4 triệu/tháng cho mỗi người phụ thuộc</li>
                    <li>• Cần cung cấp giấy tờ chứng minh</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Quy định mới</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mức giảm trừ tăng từ 9 triệu lên 11 triệu</li>
                    <li>• Mức phụ thuộc tăng từ 3.6 triệu lên 4.4 triệu</li>
                    <li>• Áp dụng từ 01/07/2020</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalaryConverter;
