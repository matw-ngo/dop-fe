"use client";
/**
 * Gross to Net Salary Calculator Component
 *
 * A comprehensive salary calculator for Vietnamese users that converts
 * gross salary to net salary with detailed tax and insurance breakdowns.
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  DollarSign,
  Users,
  TrendingDown,
  RotateCcw,
  Info,
} from "lucide-react";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import { calculateGrossToNet } from "@/lib/calculators/salary-gross-to-net";
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

// Salary presets
const SALARY_PRESETS = [
  { label: "Lương tối thiểu", amount: REGIONAL_MINIMUM_WAGES[1] },
  { label: "Lương nhân viên", amount: 10_000_000 },
  { label: "Lương chuyên viên", amount: 20_000_000 },
  { label: "Lương quản lý", amount: 35_000_000 },
  { label: "Lương giám đốc", amount: 70_000_000 },
];

interface GrossToNetCalculatorProps {
  className?: string;
}

const GrossToNetCalculatorInner: React.FC<GrossToNetCalculatorProps> = ({
  className,
}) => {
  // Error handling
  const {
    error: asyncError,
    handleError,
    clearError,
  } = useCalculatorErrorHandler("Gross to Net Calculator");

  // Store hooks
  const {
    taxParams,
    taxResults,
    setTaxParams,
    setTaxResults,
    clearTaxCalculation,
  } = useFinancialToolsStore();

  // Local state
  const [gross, setGross] = useState<number>(
    taxParams?.grossMonthlyIncome || 10_000_000,
  );
  const [region, setRegion] = useState<number>(taxParams?.region || 1);
  const [dependents, setDependents] = useState<number>(
    taxParams?.numberOfDependents || 0,
  );

  // Calculate results
  const results = useMemo(() => {
    try {
      return calculateGrossToNet({ gross, region, dependents });
    } catch (error) {
      handleError(
        error instanceof Error
          ? error
          : new Error("Failed to calculate gross to net salary"),
      );
      // Return default results on error
      return {
        gross: 0,
        net: 0,
        insurance: {
          employee: {
            social: 0,
            health: 0,
            unemployment: 0,
            total: 0,
          },
          employer: {
            social: 0,
            health: 0,
            unemployment: 0,
            total: 0,
          },
        },
        allowances: {
          self: 0,
          dependent: 0,
          total: 0,
        },
        tax: {
          taxableIncome: 0,
          tax: 0,
        },
        employerCost: 0,
      };
    }
  }, [gross, region, dependents, handleError]);

  // Update store when results change
  useEffect(() => {
    setTaxParams({
      grossMonthlyIncome: gross,
      region,
      numberOfDependents: dependents,
    });
    setTaxResults(results as any);
  }, [gross, region, dependents, results, setTaxParams, setTaxResults]);

  // Handle preset selection
  const handlePresetSelect = (amount: number) => {
    setGross(amount);
  };

  // Reset calculator
  const handleReset = () => {
    setGross(10_000_000);
    setRegion(1);
    setDependents(0);
    clearTaxCalculation();
  };

  // Tax bracket details for display
  const taxBracketDetails =
    results.tax.brackets?.filter((b) => b.tax > 0) || [];

  return (
    <div className={className}>
      {/* Async Error Handler */}
      <CalculatorAsyncErrorHandler
        error={asyncError}
        onRetry={() => {
          // Recalculate with current values
          setGross(gross);
          setRegion(region);
          setDependents(dependents);
        }}
        onDismiss={clearError}
        calculatorName="Gross to Net Calculator"
      />
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tính Lương Gross → Net
          </CardTitle>
          <CardDescription>
            Tính lương thực nhận từ lương gộp với đầy đủ các khoản khấu trừ
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preset Options */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {SALARY_PRESETS.map((preset) => (
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
                <Label htmlFor="gross">Lương GROSS</Label>
                <Input
                  id="gross"
                  type="text"
                  value={formatCurrency(gross)}
                  onChange={(e) => {
                    const value =
                      parseInt(e.target.value.replace(/\D/g, "")) || 0;
                    setGross(Math.max(0, value));
                  }}
                  className="text-lg font-semibold"
                  placeholder="Nhập lương gộp"
                />
                {gross < (REGIONAL_MINIMUM_WAGES as any)[region] && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Info className="h-4 w-4" />
                    Lương tối thiểu vùng {region}:{" "}
                    {formatCurrency((REGIONAL_MINIMUM_WAGES as any)[region])}
                  </div>
                )}
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

            {/* Results Summary */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      Lương GROSS
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(results.gross)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      Lương NET
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(results.net)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Thực nhận hàng tháng
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Deduction Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Chi Tiết Khấu Trừ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Insurance Deductions */}
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Bảo hiểm (10.5%)</div>
                    <div className="space-y-1 pl-4">
                      <div className="flex justify-between text-sm">
                        <span>- BHXH (8%)</span>
                        <span>
                          {formatCurrency(results.insurance.employee.social)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>- BHYT (1.5%)</span>
                        <span>
                          {formatCurrency(results.insurance.employee.health)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>- BHTN (1%)</span>
                        <span>
                          {formatCurrency(
                            results.insurance.employee.unemployment,
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Tổng bảo hiểm</span>
                        <span className="text-destructive">
                          {formatCurrency(results.insurance.employee.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allowances */}
                  <div className="space-y-2">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Giảm trừ gia cảnh
                    </div>
                    <div className="space-y-1 pl-4">
                      <div className="flex justify-between text-sm">
                        <span>Bản thân</span>
                        <span>{formatCurrency(results.allowances.self)}</span>
                      </div>
                      {dependents > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Phụ thuộc ({dependents} người)</span>
                          <span>
                            {formatCurrency(results.allowances.dependent)}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Tổng giảm trừ</span>
                        <span className="text-green-600">
                          {formatCurrency(results.allowances.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="space-y-2">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Thuế TNCN
                    </div>
                    <div className="space-y-1 pl-4">
                      <div className="flex justify-between text-sm">
                        <span>Thu nhập chịu thuế</span>
                        <span>{formatCurrency(results.tax.taxableIncome)}</span>
                      </div>
                      {taxBracketDetails.length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                            Xem chi tiết thuế suất
                          </summary>
                          <div className="mt-2 space-y-1 pl-4">
                            {taxBracketDetails.map((bracket, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs"
                              >
                                <span>
                                  {formatPercentage(bracket.rate)} ×{" "}
                                  {formatCurrency(bracket.max)}
                                </span>
                                <span>{formatCurrency(bracket.tax)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Tổng thuế TNCN</span>
                        <span className="text-destructive">
                          {formatCurrency(results.tax.tax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng khấu trừ</span>
                    <span className="text-destructive">
                      {formatCurrency(
                        results.insurance.employee.total + results.tax.tax,
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Employer Cost */}
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        Tổng chi phí của công ty
                      </div>
                      <div className="text-sm text-muted-foreground">
                        GROSS + Bảo hiểm công ty (21.5%)
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        results.gross +
                          (results.employerCost || results.gross * 0.215),
                      )}
                    </div>
                  </div>
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
export const GrossToNetCalculator: React.FC<GrossToNetCalculatorProps> = (
  props,
) => (
  <CalculatorErrorBoundary calculatorName="Gross to Net Calculator">
    <GrossToNetCalculatorInner {...props} />
  </CalculatorErrorBoundary>
);

export default GrossToNetCalculator;
