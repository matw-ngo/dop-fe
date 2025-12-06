"use client";
/**
 * Loan Calculator Component
 *
 * A comprehensive loan calculator for Vietnamese users that calculates:
 * - Monthly payments
 * - Total interest
 * - Amortization schedule
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
import { Slider } from "@/components/ui/slider";
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
  TrendingUp,
  Calendar,
  Download,
  RotateCcw,
} from "lucide-react";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import type {
  ILoanParams,
  ILoanResult,
  AmortizationEntry,
} from "@/types/tools";
import { formatCurrency } from "@/lib/utils";
import {
  CalculatorErrorBoundary,
  useCalculatorErrorHandler,
  CalculatorAsyncErrorHandler,
} from "./ErrorBoundary";

// Vietnamese loan terms
const LOAN_TERMS = [
  { label: "3 tháng", value: 3 },
  { label: "6 tháng", value: 6 },
  { label: "12 tháng", value: 12 },
  { label: "18 tháng", value: 18 },
  { label: "24 tháng", value: 24 },
  { label: "36 tháng", value: 36 },
  { label: "48 tháng", value: 48 },
  { label: "60 tháng", value: 60 },
  { label: "120 tháng", value: 120 },
  { label: "180 tháng", value: 180 },
  { label: "240 tháng", value: 240 },
  { label: "360 tháng", value: 360 },
];

const LOAN_PRESETS = [
  { label: "Vay mua xe máy", amount: 30_000_000, term: 24, rate: 12 },
  { label: "Vay mua ô tô", amount: 500_000_000, term: 60, rate: 9 },
  { label: "Vay sửa nhà", amount: 200_000_000, term: 36, rate: 10 },
  { label: "Vay tiêu dùng", amount: 50_000_000, term: 12, rate: 15 },
];

// Loan calculation function
const calculateLoan = (params: ILoanParams): ILoanResult => {
  const { amount, term, rate } = params;
  const monthlyRate = rate / 100 / 12;

  // Calculate monthly payment using reducing balance formula
  const monthlyPayment =
    (amount * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
    (Math.pow(1 + monthlyRate, term) - 1);

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
      "Kỳ,Dư nợ đầu kỳ,Góp gốc,Lãi suất,Tổng thanh toán,Dư nợ cuối kỳ",
      ...results.amortization.map(
        (entry) =>
          `${entry.month},${formatCurrency(entry.balance + entry.principal)},${formatCurrency(entry.principal)},${formatCurrency(entry.interest)},${formatCurrency(entry.principal + entry.interest)},${formatCurrency(entry.balance)}`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lich-tra-no.csv";
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
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tính Khoản Vay
          </CardTitle>
          <CardDescription>
            Tính toán số tiền thanh toán hàng tháng và lãi suất cho khoản vay
            của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preset Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LOAN_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="text-xs h-auto py-2 px-3 whitespace-normal"
              >
                {preset.label}
                <div className="text-muted-foreground">
                  {formatCurrency(preset.amount)}
                </div>
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền vay</Label>
                <div className="space-y-2">
                  <Input
                    id="amount"
                    type="text"
                    value={formatCurrency(amount)}
                    onChange={(e) => {
                      const value =
                        parseInt(e.target.value.replace(/\D/g, "")) || 0;
                      setAmount(
                        Math.min(10_000_000_000, Math.max(1_000_000, value)),
                      );
                    }}
                    className="text-lg font-semibold"
                  />
                  <Slider
                    value={[amount]}
                    onValueChange={([value]) => setAmount(value)}
                    max={10_000_000_000}
                    min={1_000_000}
                    step={10_000_000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 triệu</span>
                    <span>10 tỷ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Kỳ hạn vay</Label>
                <Select
                  value={term.toString()}
                  onValueChange={(value) => setTerm(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kỳ hạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TERMS.map((termOption) => (
                      <SelectItem
                        key={termOption.value}
                        value={termOption.value.toString()}
                      >
                        {termOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Lãi suất năm</Label>
                <div className="space-y-2">
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
                    className="text-lg font-semibold"
                  />
                  <Slider
                    value={[rate]}
                    onValueChange={([value]) => setRate(value)}
                    max={30}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.1%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Làm lại
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      Góp hàng tháng
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      Tổng lãi phải trả
                    </div>
                    <div className="text-2xl font-bold text-destructive">
                      {formatCurrency(results.totalInterest)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    Tổng số tiền phải trả
                  </div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(results.totalPayment)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {term} tháng × {formatCurrency(results.monthlyPayment)}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSchedule(!showSchedule)}
                  variant="outline"
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {showSchedule ? "Ẩn" : "Xem"} Lịch trả nợ
                </Button>
                <Button
                  onClick={exportSchedule}
                  variant="outline"
                  size="icon"
                  title="Xuất CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Amortization Schedule */}
          {showSchedule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch Trả Nợ Chi Tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Kỳ</TableHead>
                        <TableHead className="text-right">Gốc</TableHead>
                        <TableHead className="text-right">Lãi</TableHead>
                        <TableHead className="text-right">Tổng trả</TableHead>
                        <TableHead className="text-right">
                          Dư nợ cuối kỳ
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.amortization.map((entry) => (
                        <TableRow key={entry.month}>
                          <TableCell className="font-medium">
                            {entry.month}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(entry.principal)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(entry.interest)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(entry.principal + entry.interest)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(entry.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
