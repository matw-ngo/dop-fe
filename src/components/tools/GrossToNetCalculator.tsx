"use client";
/**
 * Gross to Net Salary Calculator Component
 *
 * A comprehensive salary calculator for Vietnamese users that converts
 * gross salary to net salary with detailed tax and insurance breakdowns.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
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
const REGIONS = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }];

// Salary presets
const SALARY_PRESETS = [
  { key: "minimum", amount: REGIONAL_MINIMUM_WAGES[1] },
  { key: "employee", amount: 10_000_000 },
  { key: "professional", amount: 20_000_000 },
  { key: "manager", amount: 35_000_000 },
  { key: "director", amount: 70_000_000 },
];

interface GrossToNetCalculatorProps {
  className?: string;
}

const GrossToNetCalculatorInner: React.FC<GrossToNetCalculatorProps> = ({
  className,
}) => {
  const t = useTranslations("features.tools.gross-to-net-calculator");

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

      {/* Main Container with Glass Effect */}
      <Card className="w-full max-w-6xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] dark:from-gray-900/95 dark:to-purple-950/30">
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-8 pb-12">
          <CardHeader className="text-white p-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calculator className="h-6 w-6" />
              </div>
              {t("title")}
            </CardTitle>
            <CardDescription className="text-purple-100 text-base mt-2">
              {t("subtitle")}
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="p-8 -mt-4 space-y-8">
          {/* Preset Options with Modern Styling */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SALARY_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset.amount)}
                className="group relative overflow-hidden border-2 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02] hover:border-purple-300 hover:shadow-md transition-all duration-200 text-xs h-auto py-3 px-4 whitespace-normal rounded-xl"
              >
                <div className="relative z-10">
                  <div className="font-medium text-gray-700">
                    {t(`presets.${preset.key}`)}
                  </div>
                  <div className="text-purple-600 font-semibold mt-1">
                    {formatCurrency(preset.amount)}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Form with Glass Effect */}
            <Card className="border-0 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-sm shadow-lg rounded-2xl p-6 space-y-6">
              {/* Gross Salary Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="gross"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs font-bold">
                    1
                  </span>
                  {t("form.grossSalary")}
                </Label>
                <div className="relative">
                  <Input
                    id="gross"
                    type="text"
                    value={formatCurrency(gross)}
                    onChange={(e) => {
                      const value =
                        parseInt(e.target.value.replace(/\D/g, "")) || 0;
                      setGross(Math.max(0, value));
                    }}
                    className="text-lg font-semibold border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl h-12 transition-all duration-200 pr-16"
                    placeholder={t("form.enterGrossSalary")}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    VND
                  </span>
                </div>
                {gross < (REGIONAL_MINIMUM_WAGES as any)[region] && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {t("form.minimumWage", { region })}:{" "}
                      {formatCurrency((REGIONAL_MINIMUM_WAGES as any)[region])}
                    </span>
                  </div>
                )}
              </div>

              {/* Region Select */}
              <div className="space-y-3">
                <Label
                  htmlFor="region"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs font-bold">
                    2
                  </span>
                  {t("form.salaryRegion")}
                </Label>
                <Select
                  value={region.toString()}
                  onValueChange={(value) => setRegion(parseInt(value))}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-200">
                    <SelectValue placeholder={t("form.selectRegion")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    {REGIONS.map((reg) => (
                      <SelectItem
                        key={reg.value}
                        value={reg.value.toString()}
                        className="rounded-lg"
                      >
                        {t(`regions.${reg.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground bg-purple-50 p-2 rounded-lg">
                  {t("form.minimumWageLabel")}:{" "}
                  <span className="font-semibold text-purple-700">
                    {formatCurrency((REGIONAL_MINIMUM_WAGES as any)[region])}
                  </span>
                </div>
              </div>

              {/* Dependents Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="dependents"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs font-bold">
                    3
                  </span>
                  {t("form.numberOfDependents")}
                </Label>
                <div className="relative">
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
                    className="text-lg font-semibold border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl h-12 transition-all duration-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    người
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-purple-50 p-2 rounded-lg">
                  {t("form.deductionPerPerson")}:{" "}
                  <span className="font-semibold text-purple-700">
                    {formatCurrency(ALLOWANCES.dependent)}
                  </span>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-12 border-2 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-xl font-semibold"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("form.reset")}
              </Button>
            </Card>

            {/* Results Summary with Enhanced Design */}
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Gross Salary Card */}
                <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden rounded-2xl shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wide">
                      {t("results.grossSalary")}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-3">
                      {formatCurrency(results.gross)}
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min((results.gross / 100_000_000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Net Salary Card - Hero Result */}
                <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden rounded-2xl shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-100 text-sm font-medium mb-2 uppercase tracking-wide">
                      {t("results.netSalary")}
                    </div>
                    <div className="text-4xl font-bold mb-3">
                      {formatCurrency(results.net)}
                    </div>
                    <div className="text-green-100 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                      {t("results.monthlyTakeHome")}
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${(results.net / results.gross) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Deduction Breakdown with Enhanced Design */}
              <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-purple-50/50 overflow-hidden rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5">
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-purple-600" />
                    </div>
                    {t("results.deductionBreakdown")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Insurance Deductions with Enhanced Design */}
                  <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-white rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800">
                          {t("results.insurance")}{" "}
                          <span className="text-purple-600 font-bold">
                            (10.5%)
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100">
                          <span className="text-sm text-gray-700 font-medium">
                            {t("results.socialInsurance")} (8%)
                          </span>
                          <span className="font-mono font-semibold text-purple-700">
                            {formatCurrency(results.insurance.employee.social)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100">
                          <span className="text-sm text-gray-700 font-medium">
                            {t("results.healthInsurance")} (1.5%)
                          </span>
                          <span className="font-mono font-semibold text-purple-700">
                            {formatCurrency(results.insurance.employee.health)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100">
                          <span className="text-sm text-gray-700 font-medium">
                            {t("results.unemploymentInsurance")} (1%)
                          </span>
                          <span className="font-mono font-semibold text-purple-700">
                            {formatCurrency(
                              results.insurance.employee.unemployment,
                            )}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
                          <span className="font-semibold text-gray-800">
                            {t("results.totalInsurance")}
                          </span>
                          <span className="font-mono font-bold text-lg text-purple-700">
                            {formatCurrency(results.insurance.employee.total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Deductions with Enhanced Design */}
                  <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-white rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="font-semibold text-gray-800">
                          {t("results.taxDeductions")}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                          <span className="text-sm text-gray-700 font-medium">
                            {t("self")} (Giảm trừ gia cảnh)
                          </span>
                          <span className="font-mono font-semibold text-green-700">
                            {formatCurrency(results.allowances.self)}
                          </span>
                        </div>
                        {dependents > 0 && (
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                            <span className="text-sm text-gray-700 font-medium">
                              {t("results.dependents", { count: dependents })}
                            </span>
                            <span className="font-mono font-semibold text-green-700">
                              {formatCurrency(results.allowances.dependent)}
                            </span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                          <span className="font-semibold text-gray-800">
                            {t("results.totalDeductions")}
                          </span>
                          <span className="font-mono font-bold text-lg text-green-700">
                            {formatCurrency(results.allowances.total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PIT with Enhanced Design */}
                  <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-white rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="font-semibold text-gray-800">
                          {t("results.pit")}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-100">
                          <span className="text-sm text-gray-700 font-medium">
                            {t("results.taxableIncome")}
                          </span>
                          <span className="font-mono font-semibold text-orange-700">
                            {formatCurrency(results.tax.taxableIncome)}
                          </span>
                        </div>
                        {taxBracketDetails.length > 0 && (
                          <details className="group">
                            <summary className="cursor-pointer p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors duration-200">
                              {t("results.viewTaxDetails")}
                            </summary>
                            <div className="mt-2 space-y-2 pl-3">
                              {taxBracketDetails.map((bracket, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-2 bg-white rounded-lg border border-orange-100 text-xs"
                                >
                                  <span className="text-gray-700">
                                    {formatPercentage(bracket.rate)} ×{" "}
                                    {formatCurrency(bracket.max)}
                                  </span>
                                  <span className="font-mono font-semibold text-orange-600">
                                    {formatCurrency(bracket.tax)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center p-3 bg-orange-100 rounded-lg">
                          <span className="font-semibold text-gray-800">
                            {t("results.totalPit")}
                          </span>
                          <span className="font-mono font-bold text-lg text-orange-700">
                            {formatCurrency(results.tax.tax)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Deductions Summary */}
                  <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-gray-800">
                            {t("results.totalDeductionsAmount")}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Bao gồm BHXH, BHYT, BHTN và PIT
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                          {formatCurrency(
                            results.insurance.employee.total + results.tax.tax,
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Employer Cost with Enhanced Design */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white overflow-hidden rounded-2xl shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">
                          {t("results.totalEmployerCost")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("results.employerCostDescription")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(
                          results.gross +
                            (results.employerCost || results.gross * 0.215),
                        )}
                      </div>
                      <div className="text-xs text-blue-500 mt-1 bg-blue-100 px-2 py-1 rounded-full inline-block">
                        +21.5% từ lương GROSS
                      </div>
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
