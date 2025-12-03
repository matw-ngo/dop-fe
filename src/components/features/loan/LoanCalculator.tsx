// Loan Calculator Component
// Vietnamese loan calculation tool with various interest rate methods

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  Download,
  Info,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  Settings,
  HelpCircle,
  Clock,
  Shield,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VietnameseLoanCalculator,
  LoanCalculationParams,
  LoanCalculationResult,
  formatVND,
  compareLoanOptions,
} from "@/lib/loan-products/interest-calculations";
import type { InterestRateType } from "@/lib/loan-products/vietnamese-loan-products";

interface CalculatorProps {
  /** Initial calculation parameters */
  initialParams?: Partial<LoanCalculationParams>;
  /** Show comparison feature */
  showComparison?: boolean;
  /** Show schedule details */
  showSchedule?: boolean;
  /** Compact view */
  compact?: boolean;
  /** On calculation complete */
  onCalculationComplete?: (result: LoanCalculationResult) => void;
  /** Predefined loan products for comparison */
  loanProducts?: Array<{
    name: string;
    params: LoanCalculationParams;
  }>;
}

export function LoanCalculator({
  initialParams = {},
  showComparison = true,
  showSchedule = true,
  compact = false,
  onCalculationComplete,
  loanProducts = [],
}: CalculatorProps) {
  const [params, setParams] = useState<LoanCalculationParams>({
    principal: 2000000000, // 2 tỷ VND
    term: 24, // 24 months
    annualRate: 10.5, // 10.5% annual rate
    rateType: "reducing",
    calculationMethod: "monthly",
    processingFee: 1.0,
    processingFeeFixed: 0,
    insuranceFee: 0.2,
    otherFees: 0,
    firstPaymentDate: new Date(),
    gracePeriod: 0,
    ...initialParams,
  });

  const [result, setResult] = useState<LoanCalculationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);

  // Common loan amounts in VND
  const commonAmounts = [
    { value: 500000000, label: "500 triệu" },
    { value: 1000000000, label: "1 tỷ" },
    { value: 2000000000, label: "2 tỷ" },
    { value: 3000000000, label: "3 tỷ" },
    { value: 5000000000, label: "5 tỷ" },
    { value: 10000000000, label: "10 tỷ" },
  ];

  // Common loan terms
  const commonTerms = [
    { value: 12, label: "1 năm" },
    { value: 24, label: "2 năm" },
    { value: 36, label: "3 năm" },
    { value: 60, label: "5 năm" },
    { value: 120, label: "10 năm" },
    { value: 180, label: "15 năm" },
    { value: 240, label: "20 năm" },
    { value: 360, label: "30 năm" },
  ];

  // Calculate loan when parameters change
  useEffect(() => {
    calculateLoan();
  }, [params]);

  const calculateLoan = () => {
    try {
      const calculation = VietnameseLoanCalculator.calculateLoan(params);
      setResult(calculation);
      onCalculationComplete?.(calculation);
    } catch (error) {
      console.error("Error calculating loan:", error);
    }
  };

  const updateParam = (key: keyof LoanCalculationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const compareProducts = () => {
    if (loanProducts.length > 0) {
      const comparison = compareLoanOptions(loanProducts);
      setComparisonResults(comparison);
    }
  };

  const formatSliderValue = (value: number[]) => {
    const [min, max] = value;
    return formatVND(min) + " - " + formatVND(max);
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-600">Số tiền vay</Label>
              <div className="text-lg font-bold">{formatVND(params.principal)}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Trả hàng tháng</Label>
              <div className="text-lg font-bold text-blue-600">
                {result ? formatVND(result.monthlyPayment) : "---"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="h-6 w-6 mr-2" />
            Máy tính khoản vay
          </h2>
          <p className="text-gray-600 mt-1">
            Tính toán khoản vay với các phương pháp lãi suất khác nhau
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={calculateLoan}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tính lại
          </Button>
          {showComparison && (
            <Button
              variant="outline"
              size="sm"
              onClick={compareProducts}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              So sánh
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin khoản vay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loan Amount */}
              <div className="space-y-2">
                <Label>Số tiền vay (VND)</Label>
                <Input
                  type="text"
                  value={params.principal.toLocaleString("vi-VN")}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0;
                    updateParam("principal", value);
                  }}
                  className="text-lg font-medium"
                />
                <Slider
                  value={[params.principal]}
                  onValueChange={([value]) => updateParam("principal", value)}
                  max={10000000000}
                  min={100000000}
                  step={100000000}
                  className="mt-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  {commonAmounts.slice(0, 3).map((amount) => (
                    <Button
                      key={amount.value}
                      variant={params.principal === amount.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateParam("principal", amount.value)}
                      className="text-xs"
                    >
                      {amount.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <Label>Thời gian vay (tháng)</Label>
                <Input
                  type="number"
                  value={params.term}
                  onChange={(e) => updateParam("term", parseInt(e.target.value) || 0)}
                  min={1}
                  max={360}
                />
                <Slider
                  value={[params.term]}
                  onValueChange={([value]) => updateParam("term", value)}
                  max={360}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="grid grid-cols-4 gap-2">
                  {commonTerms.slice(0, 4).map((term) => (
                    <Button
                      key={term.value}
                      variant={params.term === term.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateParam("term", term.value)}
                      className="text-xs"
                    >
                      {term.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Interest Rate Type */}
              <div className="space-y-2">
                <Label>Phương pháp tính lãi</Label>
                <Select
                  value={params.rateType}
                  onValueChange={(value: InterestRateType) => updateParam("rateType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reducing">Lãi suất giảm dần</SelectItem>
                    <SelectItem value="fixed">Lãi suất cố định</SelectItem>
                    <SelectItem value="flat">Lãi suất phẳng</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Lãi suất giảm dần:</strong> Lãi suất tính trên dư nợ giảm dần</p>
                        <p><strong>Lãi suất cố định:</strong> Lãi suất không thay đổi trong suốt thời gian vay</p>
                        <p><strong>Lãi suất phẳng:</strong> Lãi suất tính trên khoản vay ban đầu</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label>Lãi suất năm (%)</Label>
                <Input
                  type="number"
                  value={params.annualRate}
                  onChange={(e) => updateParam("annualRate", parseFloat(e.target.value) || 0)}
                  min={0}
                  max={30}
                  step={0.1}
                />
                <Slider
                  value={[params.annualRate]}
                  onValueChange={([value]) => updateParam("annualRate", value)}
                  max={30}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Promotional Rate */}
              <div className="space-y-2">
                <Label>Lãi suất ưu đãi (nếu có)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Lãi suất (%)</Label>
                    <Input
                      type="number"
                      value={params.promotionalRate || ""}
                      onChange={(e) => updateParam("promotionalRate", parseFloat(e.target.value) || undefined)}
                      min={0}
                      max={params.annualRate}
                      step={0.1}
                      placeholder="Không có"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Thời gian (tháng)</Label>
                    <Input
                      type="number"
                      value={params.promotionalPeriod || ""}
                      onChange={(e) => updateParam("promotionalPeriod", parseInt(e.target.value) || undefined)}
                      min={1}
                      max={params.term}
                      placeholder="Không có"
                    />
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className="space-y-3">
                <Label>Phí và chi phí</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Phí xử lý (%)</Label>
                    <Input
                      type="number"
                      value={params.processingFee || ""}
                      onChange={(e) => updateParam("processingFee", parseFloat(e.target.value) || 0)}
                      min={0}
                      max={5}
                      step={0.1}
                      placeholder="0%"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Phí bảo hiểm (%)</Label>
                    <Input
                      type="number"
                      value={params.insuranceFee || ""}
                      onChange={(e) => updateParam("insuranceFee", parseFloat(e.target.value) || 0)}
                      min={0}
                      max={2}
                      step={0.1}
                      placeholder="0%"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Phí khác (VND)</Label>
                  <Input
                    type="text"
                    value={params.otherFees ? params.otherFees.toLocaleString("vi-VN") : ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0;
                      updateParam("otherFees", value);
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Grace Period */}
              <div className="space-y-2">
                <Label>Giai đoạn ân hạn (tháng)</Label>
                <Input
                  type="number"
                  value={params.gracePeriod || 0}
                  onChange={(e) => updateParam("gracePeriod", parseInt(e.target.value) || 0)}
                  min={0}
                  max={params.term}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              {/* Summary Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kết quả tính toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600 mb-1">Trả hàng tháng</div>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatVND(result.monthlyPayment)}
                        </div>
                        {result.promotionalSummary && (
                          <div className="text-xs text-blue-500 mt-2">
                            Giai đoạn ưu đãi: {formatVND(result.promotionalSummary.promotionalMonthlyPayment)}/tháng
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">Tổng lãi suất</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatVND(result.totalInterest)}
                        </div>
                        <div className="text-xs text-green-500 mt-1">
                          {((result.totalInterest / params.principal) * 100).toFixed(1)}% của khoản vay
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-600 mb-1">Tổng thanh toán</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatVND(result.totalPayable)}
                        </div>
                        <div className="text-xs text-purple-500 mt-1">
                          Bao gồm cả phí và lãi suất
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600 mb-1">APR hiệu quả</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {result.effectiveAPR.toFixed(2)}%
                        </div>
                        <div className="text-xs text-orange-500 mt-1">
                          Lãi suất thực tế hàng năm
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fees Breakdown */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Chi tiết chi phí</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Khoản vay gốc:</span>
                        <span className="font-medium">{formatVND(params.principal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lãi suất:</span>
                        <span className="font-medium">{formatVND(result.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí xử lý:</span>
                        <span className="font-medium">
                          {formatVND(result.totalFees)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Tổng cộng:</span>
                        <span className="text-lg">{formatVND(result.totalPayable)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              {showSchedule && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Lịch trả nợ</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetails(!showDetails)}
                        >
                          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showDetails ? (
                      <div className="space-y-2">
                        {/* Summary */}
                        <div className="grid grid-cols-4 gap-4 text-sm font-medium p-3 bg-gray-50 rounded">
                          <div>Kỳ</div>
                          <div className="text-right">Gốc</div>
                          <div className="text-right">Lãi</div>
                          <div className="text-right">Tổng</div>
                        </div>

                        {/* Payment Schedule - Show first 6 payments */}
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                          {result.paymentSchedule.slice(0, 6).map((payment, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 text-sm p-2 hover:bg-gray-50 rounded">
                              <div>{payment.paymentNumber}</div>
                              <div className="text-right">{formatVND(payment.principal)}</div>
                              <div className="text-right">{formatVND(payment.interest)}</div>
                              <div className="text-right font-medium">{formatVND(payment.total)}</div>
                            </div>
                          ))}
                          {result.paymentSchedule.length > 6 && (
                            <div className="text-center text-sm text-gray-500 py-2">
                              ... và {result.paymentSchedule.length - 6} kỳ còn lại
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nhấn vào biểu tượng mắt để xem lịch trả nợ chi tiết</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Comparison Results */}
              {showComparison && comparisonResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      So sánh sản phẩm vay
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparisonResults.map((item, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-4 rounded-lg border",
                            item.ranking === 1 && "border-green-500 bg-green-50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                item.ranking === 1 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                              )}>
                                {item.ranking}
                              </div>
                              <span className="font-medium">{item.name}</span>
                              {item.ranking === 1 && (
                                <Badge className="bg-green-100 text-green-800">Tốt nhất</Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatVND(item.monthlyPayment)}</div>
                              <div className="text-sm text-gray-600">/tháng</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Lãi suất:</span>
                              <div className="font-medium">{item.effectiveAPR.toFixed(2)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Tổng lãi:</span>
                              <div className="font-medium">{formatVND(item.totalInterest)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Tổng trả:</span>
                              <div className="font-medium">{formatVND(item.totalPayable)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}