"use client";

/**
 * Loan Calculator Component
 *
 * A comprehensive loan calculator for Vietnamese users that calculates:
 * - Monthly payments
 * - Total interest
 * - Amortization schedule
 */

import {
  Calculator,
  Calendar,
  Download,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import type {
  AmortizationEntry,
  ILoanParams,
  ILoanResult,
} from "@/types/tools";
import {
  CalculatorAsyncErrorHandler,
  CalculatorErrorBoundary,
  useCalculatorErrorHandler,
} from "./ErrorBoundary";

// Loan terms in months
const LOAN_TERMS = [
  { value: 3 },
  { value: 6 },
  { value: 12 },
  { value: 18 },
  { value: 24 },
  { value: 36 },
  { value: 48 },
  { value: 60 },
  { value: 120 },
  { value: 180 },
  { value: 240 },
  { value: 360 },
];

const LOAN_PRESETS = [
  { key: "motorcycle", amount: 30_000_000, term: 24, rate: 12 },
  { key: "car", amount: 500_000_000, term: 60, rate: 9 },
  { key: "homeRenovation", amount: 200_000_000, term: 36, rate: 10 },
  { key: "personal", amount: 50_000_000, term: 12, rate: 15 },
];

// Loan calculation function
const calculateLoan = (params: ILoanParams): ILoanResult => {
  const { amount, term, rate } = params;
  const monthlyRate = rate / 100 / 12;

  // Calculate monthly payment using reducing balance formula
  const monthlyPayment =
    (amount * (monthlyRate * (1 + monthlyRate) ** term)) /
    ((1 + monthlyRate) ** term - 1);

  const totalPayment = monthlyPayment * term;
  const totalInterest = totalPayment - amount;

  // Generate amortization schedule
  const amortization: AmortizationEntry[] = [];
  let remainingBalance = amount;

  for (let month = 1; month <= term; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;

    amortization.push({
      month,
      principal: Math.round(principalPayment),
      interest: Math.round(interestPayment),
      balance: Math.max(0, Math.round(remainingBalance - principalPayment)),
    });

    remainingBalance -= principalPayment;
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    amortization,
  };
};

interface LoanCalculatorProps {
  className?: string;
}

const LoanCalculatorInner: React.FC<LoanCalculatorProps> = ({ className }) => {
  const t = useTranslations("features.tools.loan-calculator");

  // Error handling
  const {
    error: asyncError,
    handleError,
    clearError,
  } = useCalculatorErrorHandler("Loan Calculator");

  // Store hooks
  const {
    loanParams,
    loanResults,
    setLoanParams,
    setLoanResults,
    clearLoanCalculation,
  } = useFinancialToolsStore();

  // Local state
  const [amount, setAmount] = useState(loanParams?.amount || 100_000_000);
  const [term, setTerm] = useState(loanParams?.term || 12);
  const [rate, setRate] = useState(loanParams?.rate || 12.0);
  const [showSchedule, setShowSchedule] = useState(false);

  // Calculate results when inputs change
  const results = useMemo(() => {
    try {
      return calculateLoan({ amount, term, rate });
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error("Failed to calculate loan"),
      );
      // Return default results on error
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        amortization: [],
      };
    }
  }, [amount, term, rate, handleError]);

  // Update store when results change
  useEffect(() => {
    setLoanParams({ amount, term, rate });
    setLoanResults(results);
  }, [amount, term, rate, results, setLoanParams, setLoanResults]);

  // Handle preset selection
  const handlePresetSelect = (preset: (typeof LOAN_PRESETS)[0]) => {
    setAmount(preset.amount);
    setTerm(preset.term);
    setRate(preset.rate);
  };

  // Reset calculator
  const handleReset = () => {
    setAmount(100_000_000);
    setTerm(12);
    setRate(12.0);
    clearLoanCalculation();
  };

  // Export amortization schedule
  const exportSchedule = () => {
    const csv = [
      [
        t("csvExport.headers.period"),
        t("csvExport.headers.beginningBalance"),
        t("csvExport.headers.principal"),
        t("csvExport.headers.interest"),
        t("csvExport.headers.total"),
        t("csvExport.headers.endingBalance"),
      ].join(","),
      ...results.amortization.map(
        (entry) =>
          `${entry.month},${formatCurrency(entry.balance + entry.principal)},${formatCurrency(entry.principal)},${formatCurrency(entry.interest)},${formatCurrency(entry.principal + entry.interest)},${formatCurrency(entry.balance)}`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t("csvExport.filename")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      {/* Async Error Handler */}
      <CalculatorAsyncErrorHandler
        error={asyncError}
        onRetry={() => {
          // Recalculate with current values
          setAmount(amount);
          setTerm(term);
          setRate(rate);
        }}
        onDismiss={clearError}
        calculatorName="Loan Calculator"
      />

      {/* Main Container with Glass Effect */}
      <Card className="w-full max-w-6xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] dark:from-gray-900/95 dark:to-blue-950/30">
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-800 p-8 pb-12">
          <CardHeader className="text-white p-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/10 dark:bg-black/20 rounded-xl backdrop-blur-sm">
                <Calculator className="h-6 w-6" />
              </div>
              {t("title")}
            </CardTitle>
            <CardDescription className="text-blue-100 text-base mt-2">
              {t("subtitle")}
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="p-8 -mt-4 space-y-8">
          {/* Preset Options with Modern Styling */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LOAN_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="group relative overflow-hidden border-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200 text-xs h-auto py-3 px-4 whitespace-normal rounded-xl"
              >
                <div className="relative z-10">
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {t(`presets.${preset.key}`)}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                    {formatCurrency(preset.amount)}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form with Glass Effect */}
            <Card className="border-0 bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-gray-800/80 dark:to-blue-900/20 backdrop-blur-sm shadow-lg rounded-2xl p-6 space-y-6">
              {/* Loan Amount Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="amount"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                    1
                  </span>
                  {t("form.loanAmount")}
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      id="amount"
                      type="text"
                      value={formatCurrency(amount)}
                      onChange={(e) => {
                        const value =
                          parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                        setAmount(
                          Math.min(10_000_000_000, Math.max(1_000_000, value)),
                        );
                      }}
                      className="text-lg font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 rounded-xl h-12 transition-all duration-200 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                      VND
                    </span>
                  </div>
                  <Slider
                    value={[amount]}
                    onValueChange={([value]) => setAmount(value)}
                    max={10_000_000_000}
                    min={1_000_000}
                    step={10_000_000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>1 triệu</span>
                    <span>10 tỷ</span>
                  </div>
                </div>
              </div>

              {/* Loan Term Select */}
              <div className="space-y-3">
                <Label
                  htmlFor="term"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                    2
                  </span>
                  {t("form.loanTerm")}
                </Label>
                <Select
                  value={term.toString()}
                  onValueChange={(value) => setTerm(parseInt(value, 10))}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 rounded-xl transition-all duration-200">
                    <SelectValue placeholder={t("form.selectTerm")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 dark:border-gray-700 dark:bg-gray-900">
                    {LOAN_TERMS.map((termOption) => (
                      <SelectItem
                        key={termOption.value}
                        value={termOption.value.toString()}
                        className="rounded-lg"
                      >
                        {t(`terms.${termOption.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Rate Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="rate"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                    3
                  </span>
                  {t("form.interestRate")}
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      id="rate"
                      type="number"
                      value={rate}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setRate(Math.min(30, Math.max(0.1, value)));
                      }}
                      step={0.1}
                      min={0.1}
                      max={30}
                      className="text-lg font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 rounded-xl h-12 transition-all duration-200 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                      %/năm
                    </span>
                  </div>
                  <Slider
                    value={[rate]}
                    onValueChange={([value]) => setRate(value)}
                    max={30}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>0.1%</span>
                    <span>30%</span>
                  </div>
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

            {/* Results with Enhanced Visual Design */}
            <div className="space-y-5">
              {/* Monthly Payment - Hero Result */}
              <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden rounded-2xl shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-blue-100 text-sm font-medium mb-2 uppercase tracking-wide">
                    {t("results.monthlyPayment")}
                  </div>
                  <div className="text-4xl font-bold mb-3">
                    {formatCurrency(results.monthlyPayment)}
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min((results.monthlyPayment / 100_000_000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Total Interest - Warning Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/50 overflow-hidden rounded-2xl shadow-md">
                <CardContent className="p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold mb-2">
                    <TrendingUp className="h-4 w-4" />
                    {t("results.totalInterest")}
                  </div>
                  <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(results.totalInterest)}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Lãi suất: {rate}%/năm
                  </div>
                </CardContent>
              </Card>

              {/* Total Payment - Summary Card */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden rounded-2xl shadow-md">
                <CardContent className="p-5 text-center">
                  <div className="text-gray-600 text-sm font-medium mb-2">
                    {t("results.totalPayment")}
                    {t("results.totalPayment")}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {formatCurrency(results.totalPayment)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-200 dark:bg-gray-700 inline-block px-3 py-1 rounded-full">
                    {term} {t("form.months")} ×{" "}
                    {formatCurrency(results.monthlyPayment)}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSchedule(!showSchedule)}
                  variant="outline"
                  className="flex-1 h-12 border-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 rounded-xl font-semibold text-gray-700 dark:text-gray-300"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {showSchedule
                    ? t("results.hideSchedule")
                    : t("results.showSchedule")}
                </Button>
                <Button
                  onClick={exportSchedule}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 rounded-xl text-gray-700 dark:text-gray-300"
                  title={t("results.exportCsv")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Amortization Schedule with Enhanced Design */}
          {showSchedule && (
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 px-6 py-5">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  {t("results.schedule")}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Lịch trình trả nợ chi tiết cho khoản vay{" "}
                  {formatCurrency(amount)}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                  <Table>
                    <TableHeader className="bg-gray-50/80 dark:bg-gray-900/50">
                      <TableRow className="border-b border-gray-200 dark:border-gray-700">
                        <TableHead className="w-20 px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {t("results.month")}
                        </TableHead>
                        <TableHead className="text-right px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {t("results.principal")}
                        </TableHead>
                        <TableHead className="text-right px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {t("results.interest")}
                        </TableHead>
                        <TableHead className="text-right px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {t("results.total")}
                        </TableHead>
                        <TableHead className="text-right px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {t("results.endingBalance")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.amortization.map((entry, index) => (
                        <TableRow
                          key={entry.month}
                          className={`border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-colors duration-150 ${
                            index === 0
                              ? "bg-blue-50/20 dark:bg-blue-950/20"
                              : ""
                          }`}
                        >
                          <TableCell className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                {entry.month}
                              </span>
                              {entry.month === 1 && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                                  Bắt đầu
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-4 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(entry.principal)}
                          </TableCell>
                          <TableCell className="text-right px-4 py-4 font-mono text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {formatCurrency(entry.interest)}
                          </TableCell>
                          <TableCell className="text-right px-4 py-4 font-mono text-sm font-semibold text-gray-900 dark:text-gray-100 bg-blue-50/50 dark:bg-blue-950/50 rounded-lg">
                            {formatCurrency(entry.principal + entry.interest)}
                          </TableCell>
                          <TableCell
                            className={`text-right px-4 py-4 font-mono text-sm ${
                              entry.balance === 0
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {entry.balance === 0 ? (
                              <span className="flex items-center justify-end gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {formatCurrency(entry.balance)}
                              </span>
                            ) : (
                              formatCurrency(entry.balance)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        Số kỳ trả
                      </div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {results.amortization.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        Tổng gốc
                      </div>
                      <div className="font-bold text-gray-800 dark:text-gray-100">
                        {formatCurrency(amount)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        Tổng lãi
                      </div>
                      <div className="font-bold text-slate-600 dark:text-slate-400">
                        {formatCurrency(results.totalInterest)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        Tổng cộng
                      </div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(results.totalPayment)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Wrap the component with error boundary
export const LoanCalculator: React.FC<LoanCalculatorProps> = (props) => (
  <CalculatorErrorBoundary calculatorName="Loan Calculator">
    <LoanCalculatorInner {...props} />
  </CalculatorErrorBoundary>
);

export default LoanCalculator;
