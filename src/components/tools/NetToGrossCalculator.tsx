"use client";
/**
 * Net to Gross Salary Calculator Component
 *
 * A reverse salary calculator for Vietnamese users that determines
 * the gross salary needed to achieve a desired net salary.
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
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
const REGIONS = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }];

// Net salary presets
const NET_PRESETS = [
  { key: "minimum", amount: 5_000_000 },
  { key: "student", amount: 8_000_000 },
  { key: "fresher", amount: 12_000_000 },
  { key: "twoYearsExperience", amount: 18_000_000 },
  { key: "senior", amount: 30_000_000 },
];

interface NetToGrossCalculatorProps {
  className?: string;
}

const NetToGrossCalculatorInner: React.FC<NetToGrossCalculatorProps> = ({
  className,
}) => {
  const t = useTranslations("features.tools.net-to-gross-calculator");

  // Error handling
  const {
    error: asyncError,
    handleError,
    clearError,
  } = useCalculatorErrorHandler("Net to Gross Calculator");

  // Store hooks
  const { setTaxParams, setTaxResults, clearTaxCalculation } =
    useFinancialToolsStore();

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

      {/* Main Container with Glass Effect */}
      <Card className="w-full max-w-6xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-white/95 to-orange-50/30 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] dark:from-gray-900/95 dark:to-orange-950/30">
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-800 p-8 pb-12">
          <CardHeader className="text-white p-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/10 dark:bg-black/20 rounded-xl backdrop-blur-sm">
                <Calculator className="h-6 w-6" />
              </div>
              {t("title")}
            </CardTitle>
            <CardDescription className="text-orange-100 text-base mt-2">
              {t("subtitle")}
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="p-8 -mt-4 space-y-8">
          {/* Preset Options with Modern Styling */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {NET_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset.amount)}
                className="group relative overflow-hidden border-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 hover:scale-[1.02] hover:border-orange-300 dark:hover:border-orange-400 hover:shadow-md transition-all duration-200 text-xs h-auto py-3 px-4 whitespace-normal rounded-xl"
              >
                <div className="relative z-10">
                  <div className="font-medium text-gray-700 dark:text-gray-200">
                    {t(`presets.${preset.key}`)}
                  </div>
                  <div className="text-orange-600 dark:text-orange-400 font-semibold mt-1">
                    {formatCurrency(preset.amount)}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Form with Glass Effect */}
            <Card className="border-0 bg-gradient-to-br from-white/80 to-orange-50/50 dark:from-gray-800/80 dark:to-orange-950/50 backdrop-blur-sm shadow-lg rounded-2xl p-6 space-y-6">
              {/* Net Salary Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="net"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">
                    1
                  </span>
                  {t("form.desiredNetSalary")}
                </Label>
                <div className="relative">
                  <Input
                    id="net"
                    type="text"
                    value={formatCurrency(net)}
                    onChange={(e) => {
                      const value =
                        parseInt(e.target.value.replace(/\D/g, "")) || 0;
                      setNet(Math.max(0, value));
                    }}
                    className="text-lg font-semibold border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 rounded-xl h-12 transition-all duration-200 pr-16"
                    placeholder={t("form.enterDesiredNetSalary")}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    VND
                  </span>
                </div>
              </div>

              {/* Region Select */}
              <div className="space-y-3">
                <Label
                  htmlFor="region"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">
                    2
                  </span>
                  {t("form.salaryRegion")}
                </Label>
                <Select
                  value={region.toString()}
                  onValueChange={(value) => setRegion(parseInt(value))}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 rounded-xl transition-all duration-200">
                    <SelectValue placeholder={t("form.selectRegion")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 dark:bg-gray-800 dark:border-gray-600">
                    {REGIONS.map((reg) => (
                      <SelectItem
                        key={reg.value}
                        value={reg.value.toString()}
                        className="rounded-lg dark:text-gray-200 dark:focus:bg-gray-700"
                      >
                        {t(`regions.${reg.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/50 p-2 rounded-lg">
                  {t("form.minimumWageLabel")}:{" "}
                  <span className="font-semibold text-orange-700 dark:text-orange-400">
                    {formatCurrency((REGIONAL_MINIMUM_WAGES as any)[region])}
                  </span>
                </div>
              </div>

              {/* Dependents Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="dependents"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">
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
                    className="text-lg font-semibold border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 rounded-xl h-12 transition-all duration-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    người
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/50 p-2 rounded-lg">
                  {t("form.deductionPerPerson")}:{" "}
                  <span className="font-semibold text-orange-700 dark:text-orange-400">
                    {formatCurrency(ALLOWANCES.dependent)}
                  </span>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-12 border-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 rounded-xl font-semibold"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("form.reset")}
              </Button>
            </Card>

            {/* Results with Enhanced Design */}
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Desired Net Salary Card */}
                <Card className="border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden rounded-2xl shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2 uppercase tracking-wide">
                      {t("results.desiredNetSalary")}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                      {formatCurrency(net)}
                    </div>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min((net / 100_000_000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Required Gross Salary Card - Hero Result */}
                <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden rounded-2xl shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-100 text-sm font-medium mb-2 uppercase tracking-wide">
                      {t("results.requiredGross")}
                    </div>
                    <div className="text-4xl font-bold mb-3">
                      {formatCurrency(results.gross)}
                    </div>
                    {results.iterations > 0 && (
                      <div className="text-orange-100 text-sm bg-white/10 dark:bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                        {results.iterations} {t("results.iterations")}
                      </div>
                    )}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min((results.gross / 100_000_000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Convergence Status with Enhanced Design */}
              {!results.converged && (
                <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200 font-medium">
                    {t("results.convergenceWarning", {
                      error: formatCurrency(results.finalError || 0),
                    })}
                  </AlertDescription>
                </Alert>
              )}

              {/* Gross Analysis with Enhanced Design */}
              <Card className="border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-800 dark:to-orange-950/50 overflow-hidden rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-5">
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    {t("results.grossAnalysis")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Gross Breakdown with Enhanced Design */}
                  <Card className="border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="text-center p-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
                            {t("results.grossSalary")}
                          </div>
                          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {formatCurrency(results.gross)}
                          </div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
                            {t("results.totalDeductions")}
                          </div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(results.gross - net)}
                          </div>
                          <div className="text-sm text-red-500 dark:text-red-400 mt-1">
                            ({formatPercentage(deductionPercentage)})
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deduction Details with Enhanced Design */}
                  {results.breakdown && (
                    <Card className="border-2 border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-900 rounded-xl overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="font-semibold text-gray-800 dark:text-gray-100">
                            {t("results.deductionDetails")}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-100 dark:border-orange-800">
                            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                              - {t("results.insurance")} (10.5%)
                            </span>
                            <span className="font-mono font-semibold text-orange-700">
                              {formatCurrency(
                                results.breakdown.insurance.employee.total,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-100 dark:border-orange-800">
                            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                              - {t("results.pit")}
                            </span>
                            <span className="font-mono font-semibold text-orange-700">
                              {formatCurrency(results.breakdown.tax.tax)}
                            </span>
                          </div>
                          <Separator className="my-2 dark:bg-gray-700" />
                          <div className="flex justify-between items-center p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              Tổng khấu trừ
                            </span>
                            <span className="font-mono font-bold text-lg text-orange-700 dark:text-orange-400">
                              {formatCurrency(results.gross - net)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Calculation Formula with Enhanced Design */}
                  <Alert className="border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-orange-50/20 dark:from-gray-900 dark:to-orange-950/20 rounded-xl">
                    <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <AlertDescription className="text-gray-700 dark:text-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                          Công thức tính toán:
                        </div>
                        <div>{t("results.netFormula")}</div>
                        <div>{t("results.pitFormula")}</div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Optimization Tips with Enhanced Design */}
                  <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-900 rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {t("results.taxOptimizationTips")}
                        </div>
                      </div>
                      <ul className="text-sm space-y-3 text-gray-700 dark:text-gray-200">
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold mt-0.5">
                            1
                          </span>
                          <span>{t("results.tip1")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold mt-0.5">
                            2
                          </span>
                          <span>{t("results.tip2")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold mt-0.5">
                            3
                          </span>
                          <span>{t("results.tip3")}</span>
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
