"use client";
/**
 * Net to Gross Salary Calculator Component
 *
 * A reverse salary calculator for Vietnamese users that determines
 * the gross salary needed to achieve a desired net salary.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  DollarSign,
  Users,
  TrendingUp,
  RotateCcw,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import { calculateNetToGross } from "@/lib/calculators/salary-net-to-gross";
import { ALLOWANCES, REGIONAL_MINIMUM_WAGES } from "@/lib/constants/tools";
import { formatCurrency } from "@/lib/utils";
import { formatPercentage } from "@/lib/financial-data/market-indicators";
import {
  CalculatorErrorBoundary,
  useCalculatorErrorHandler,
  CalculatorAsyncErrorHandler,
} from "./ErrorBoundary";

// Vietnamese regions
const REGIONS = [
  { label: "I - Hà Nội, TP.HCM", value: 1 },
  { label: "II - Đà Nẵng, Hải Phòng, Cần Thơ", value: 2 },
  { label: "III - Các đô thị loại I", value: 3 },
  { label: "IV - Tỉnh lẻ khác", value: 4 },
];

// Net salary presets
const NET_PRESETS = [
  { label: "Lương tối thiểu", amount: 5_000_000 },
  { label: "Lương sinh viên", amount: 8_000_000 },
  { label: "Lương fresher", amount: 12_000_000 },
  { label: "Lương 2 năm kinh nghiệm", amount: 18_000_000 },
  { label: "Lương senior", amount: 30_000_000 },
];

interface NetToGrossCalculatorProps {
  className?: string;
}

const NetToGrossCalculatorInner: React.FC<NetToGrossCalculatorProps> = ({
  className,
}) => {
  // Error handling
  const {
    error: asyncError,
    handleError,
    clearError,
  } = useCalculatorErrorHandler("Net to Gross Calculator");

  // Store hooks
  const {
    taxParams,
    taxResults,
    setTaxParams,
    setTaxResults,
    clearTaxCalculation,
  } = useFinancialToolsStore();

  // Local state
  const [net, setNet] = useState<number>(10_000_000);
  const [region, setRegion] = useState<number>(1);
  const [dependents, setDependents] = useState<number>(0);

  // Calculate results
  const results = useMemo(() => {
    try {
      return calculateNetToGross({ net, region, dependents });
    } catch (error) {
      handleError(
        error instanceof Error
          ? error
          : new Error("Failed to calculate net to gross salary"),
      );
      // Return default results on error
      return {
        net: 0,
        gross: 0,
        iterations: 0,
        converged: false,
        finalError: 0,
      };
    }
  }, [net, region, dependents, handleError]);

  // Update store when results change
  useEffect(() => {
    setTaxParams({ net, region, dependents } as any);
    setTaxResults(results as any);
  }, [net, region, dependents, results, setTaxParams, setTaxResults]);

  // Handle preset selection
  const handlePresetSelect = (amount: number) => {
    setNet(amount);
  };

  // Reset calculator
  const handleReset = () => {
    setNet(10_000_000);
    setRegion(1);
    setDependents(0);
    clearTaxCalculation();
  };

  // Calculate deduction percentage
  const deductionPercentage =
    results.gross > 0 ? ((results.gross - net) / results.gross) * 100 : 0;

  return (
    <div className={className}>
      {/* Async Error Handler */}
      <CalculatorAsyncErrorHandler
        error={asyncError}
        onRetry={() => {
          // Recalculate with current values
          setNet(net);
          setRegion(region);
          setDependents(dependents);
        }}
        onDismiss={clearError}
        calculatorName="Net to Gross Calculator"
      />
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tính Lương Net → Gross
          </CardTitle>
          <CardDescription>
            Xác định lương gộp cần thiết để nhận được mức lương ròng mong muốn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preset Options */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {NET_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset.amount)}
                className="text-xs h-auto py-2 px-3"
              >
                {preset.label}
                <div className="text-muted-foreground">
                  {formatCurrency(preset.amount)}
                </div>
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="net">Lương NET mong muốn</Label>
                <Input
                  id="net"
                  type="text"
                  value={formatCurrency(net)}
                  onChange={(e) => {
                    const value =
                      parseInt(e.target.value.replace(/\D/g, "")) || 0;
                    setNet(Math.max(0, value));
                  }}
                  className="text-lg font-semibold"
                  placeholder="Nhập lương ròng mong muốn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Vùng Lương</Label>
                <Select
                  value={region.toString()}
                  onValueChange={(value) => setRegion(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vùng" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((reg) => (
                      <SelectItem key={reg.value} value={reg.value.toString()}>
                        {reg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  Lương tối thiểu:{" "}
                  {formatCurrency((REGIONAL_MINIMUM_WAGES as any)[region])}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Số người phụ thuộc</Label>
                <Input
                  id="dependents"
                  type="number"
                  value={dependents}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setDependents(Math.max(0, Math.min(10, value)));
                  }}
                  min={0}
                  max={10}
                  className="text-lg font-semibold"
                />
                <div className="text-xs text-muted-foreground">
                  Giảm trừ: {formatCurrency(ALLOWANCES.dependent)}/người
                </div>
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại
              </Button>
            </div>

            {/* Results */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      Lương NET mong muốn
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(net)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      Lương GROSS cần
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(results.gross)}
                    </div>
                    {results.iterations > 0 && (
                      <Badge variant="secondary" className="mt-1">
                        {results.iterations} vòng lặp
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Convergence Status */}
              {!results.converged && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Không tìm thấy chính xác lương gross. Kết quả gần nhất với
                    sai số: {formatCurrency(results.finalError || 0)}
                  </AlertDescription>
                </Alert>
              )}

              {/* Deduction Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Phân Tích Lương GROSS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Gross Breakdown */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Lương GROSS
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(results.gross)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Tổng khấu trừ
                        </div>
                        <div className="text-lg font-semibold text-destructive">
                          {formatCurrency(results.gross - net)}
                          <div className="text-sm font-normal">
                            ({formatPercentage(deductionPercentage)})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deduction Details */}
                  {results.breakdown && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">
                          Chi tiết khấu trừ
                        </div>
                        <div className="space-y-1 pl-4">
                          <div className="flex justify-between text-sm">
                            <span>- Bảo hiểm (10.5%)</span>
                            <span>
                              {formatCurrency(
                                results.breakdown.insurance.employee.total,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>- Thuế TNCN</span>
                            <span>
                              {formatCurrency(results.breakdown.tax.tax)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Tổng khấu trừ</span>
                            <span className="text-destructive">
                              {formatCurrency(results.gross - net)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Calculation Formula */}
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="text-sm">
                            Lương NET = Lương GROSS - Bảo hiểm (10.5%) - Thuế
                            TNCN
                            <br />
                            Thuế TNCN được tính theo biểu thuế lũy tiến từng
                            phần
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Optimization Tips */}
                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="font-medium text-sm mb-2">
                        Mẹo tối ưu thuế:
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>
                          • Khai báo đầy đủ người phụ thuộc để tối đa hóa giảm
                          trừ
                        </li>
                        <li>• Góp quỹ hưu trí tự nguyện để giảm thuế TNCN</li>
                        <li>
                          • Xem xét các khoản chiết khấu hợp lệ (hiếu thương, từ
                          thiện)
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrap the component with error boundary
export const NetToGrossCalculator: React.FC<NetToGrossCalculatorProps> = (
  props,
) => (
  <CalculatorErrorBoundary calculatorName="Net to Gross Calculator">
    <NetToGrossCalculatorInner {...props} />
  </CalculatorErrorBoundary>
);

export default NetToGrossCalculator;
