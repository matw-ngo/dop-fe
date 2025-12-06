"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import { formatCurrency } from "@/lib/utils";
import {
  type ISaving,
  type ISavingsParams,
  type ISavingsResult,
} from "@/types/tools";
import { useSavingsCalculator } from "@/hooks/use-savings-calculator";
import {
  CalculatorErrorBoundary,
  useCalculatorErrorHandler,
  CalculatorAsyncErrorHandler,
} from "./ErrorBoundary";

// Savings calculator constants
const SAVINGS_DEFAULTS = {
  MIN_AMOUNT: 10_000_000,
  MAX_AMOUNT: 1_000_000_000,
  DEFAULT_AMOUNT: 50_000_000,
  AMOUNT_STEP: 10_000_000,
  DEFAULT_PERIOD: 12,
  PERIOD_OPTIONS: [1, 3, 6, 9, 12, 18, 24],
};

interface SavingsCalculatorProps {
  className?: string;
}

const SavingsCalculatorInner: React.FC<SavingsCalculatorProps> = ({
  className,
}) => {
  const t = useTranslations("tools.savingsCalculator");

  // Error handling
  const {
    error: asyncError,
    handleError,
    clearError,
  } = useCalculatorErrorHandler("Savings Calculator");

  // State for filters
  const [amount, setAmount] = useState<number>(SAVINGS_DEFAULTS.DEFAULT_AMOUNT);
  const [period, setPeriod] = useState<number>(SAVINGS_DEFAULTS.DEFAULT_PERIOD);
  const [type, setType] = useState<"counter" | "online">("online");
  const [sortOrder, setSortOrder] = useState<"rate_asc" | "rate_desc">(
    "rate_desc",
  );

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cache for API results
  const [resultsCache, setResultsCache] = useState<Map<string, ISavingsResult>>(
    new Map(),
  );

  // Get savings store
  const {
    setSavingsParams,
    setSavingsResults,
    savingsResults,
    setLoading,
    setError,
    clearErrors,
    loading,
    errors,
    addToHistory,
  } = useFinancialToolsStore();

  // Memoize parameters object
  const params: ISavingsParams = useMemo(
    () => ({
      amount,
      period,
      type,
      orderBy: sortOrder,
    }),
    [amount, period, type, sortOrder],
  );

  // Generate cache key for API results
  const generateCacheKey = useCallback((params: ISavingsParams): string => {
    return JSON.stringify(params);
  }, []);

  // Fetch savings data from API with caching
  const fetchSavingsData = useCallback(
    async (params: ISavingsParams): Promise<ISavingsResult> => {
      const cacheKey = generateCacheKey(params);

      // Check cache first
      if (resultsCache.has(cacheKey)) {
        return resultsCache.get(cacheKey)!;
      }

      try {
        // TODO: Implement savings calculation using the new hook
        throw new Error(
          "Savings calculation needs to be updated to use the new hook",
        );
      } catch (error) {
        // Handle error with our error handler
        handleError(
          error instanceof Error
            ? error
            : new Error("Failed to calculate savings"),
        );
        throw error;
      }
    },
    [resultsCache, generateCacheKey],
  );

  // Calculate when filters change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        // Clear previous errors
        clearErrors();

        // Set loading state through store
        setLoading("calculations", true);

        // Fetch data from API
        const results = await fetchSavingsData(params);

        // Update store with results
        setSavingsParams(params);
        setSavingsResults(results);

        // Add to history
        addToHistory("savings", params, results);
      } catch (error) {
        // Handle errors through store
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to calculate savings";
        setError("calculation", errorMessage);
      } finally {
        // Clear loading state
        setLoading("calculations", false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    params,
    fetchSavingsData,
    setSavingsParams,
    setSavingsResults,
    addToHistory,
    setLoading,
    setError,
    clearErrors,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [params]);

  // Handle amount change
  const handleAmountChange = (value: number[]) => {
    setAmount(value[0]);
  };

  // Handle amount input change
  const handleAmountInputChange = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ""));
    if (
      !isNaN(numValue) &&
      numValue >= SAVINGS_DEFAULTS.MIN_AMOUNT &&
      numValue <= SAVINGS_DEFAULTS.MAX_AMOUNT
    ) {
      setAmount(numValue);
    }
  };

  // Format amount for display
  const formatAmountDisplay = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)}M`;
    }
    return formatCurrency(value);
  };

  // Get paginated results
  const paginatedResults = useMemo(() => {
    if (!savingsResults?.savings) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return savingsResults.savings.slice(startIndex, endIndex);
  }, [savingsResults?.savings, currentPage]);

  // Get min and max rates for highlighting
  const rateStats = useMemo(() => {
    if (!savingsResults?.savings || savingsResults.savings.length === 0) {
      return { min: null, max: null };
    }

    const rates = savingsResults.savings.map((r) => r.ir);
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
    };
  }, [savingsResults?.savings]);

  // Handle retry
  const handleRetry = () => {
    clearErrors();
    // The useEffect will trigger the calculation again with the same params
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    // The useEffect will handle the calculation
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Async Error Handler */}
      <CalculatorAsyncErrorHandler
        error={asyncError}
        onRetry={handleRetry}
        onDismiss={clearError}
        calculatorName="Savings Calculator"
      />

      {/* Filter Controls with Modern Design */}
      <Card className="border-0 bg-gradient-to-br from-white/95 to-green-50/30 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] dark:from-gray-900/95 dark:to-green-950/30 overflow-hidden">
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 pb-12">
          <CardHeader className="text-white p-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              {t("title")}
            </CardTitle>
            <CardDescription className="text-green-100 text-base mt-2">
              {t("subtitle")}
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="p-8 -mt-4 space-y-8">
          {/* Amount Slider with Enhanced Design */}
          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white/80 to-green-50/50 backdrop-blur-sm shadow-lg rounded-2xl p-6">
            <div className="space-y-4">
              <Label
                htmlFor="amount"
                className="text-lg font-semibold text-gray-700 flex items-center gap-2"
              >
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs font-bold">
                  1
                </span>
                {t("form.savingsAmount")}:
                <span className="text-green-600 font-bold">
                  {formatAmountDisplay(amount)}
                </span>
              </Label>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="text"
                    value={formatCurrency(amount)}
                    onChange={(e) => handleAmountInputChange(e.target.value)}
                    className="h-12 text-lg font-semibold border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200 pr-16"
                    placeholder={t("form.enterAmount")}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    VND
                  </span>
                </div>
                <div className="px-2">
                  <Slider
                    id="amount"
                    min={SAVINGS_DEFAULTS.MIN_AMOUNT}
                    max={SAVINGS_DEFAULTS.MAX_AMOUNT}
                    step={SAVINGS_DEFAULTS.AMOUNT_STEP}
                    value={[amount]}
                    onValueChange={handleAmountChange}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between mt-3 text-xs text-muted-foreground font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {formatAmountDisplay(SAVINGS_DEFAULTS.MIN_AMOUNT)}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {formatAmountDisplay(SAVINGS_DEFAULTS.MAX_AMOUNT)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Period and Type Controls with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Period Dropdown */}
            <Card className="border-2 border-gray-200 bg-gradient-to-br from-white/80 to-green-50/50 backdrop-blur-sm shadow-md rounded-2xl p-5">
              <div className="space-y-3">
                <Label
                  htmlFor="period"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs font-bold">
                    2
                  </span>
                  {t("form.savingsPeriod")}
                </Label>
                <Select
                  value={period.toString()}
                  onValueChange={(value) => setPeriod(parseInt(value))}
                >
                  <SelectTrigger
                    id="period"
                    className="h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    {SAVINGS_DEFAULTS.PERIOD_OPTIONS.map((p) => (
                      <SelectItem
                        key={p}
                        value={p.toString()}
                        className="rounded-lg"
                      >
                        {p} {p === 1 ? "tháng" : "tháng"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Type Toggle */}
            <Card className="border-2 border-gray-200 bg-gradient-to-br from-white/80 to-green-50/50 backdrop-blur-sm shadow-md rounded-2xl p-5">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs font-bold">
                    3
                  </span>
                  {t("form.savingsType")}
                </Label>
                <div className="flex items-center space-x-3 p-2">
                  <Switch
                    id="type"
                    checked={type === "online"}
                    onCheckedChange={(checked) =>
                      setType(checked ? "online" : "counter")
                    }
                    className="scale-110"
                  />
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium cursor-pointer"
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        type === "online"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {type === "online"
                        ? t("form.onlineSavings")
                        : t("form.counterSavings")}
                    </span>
                  </Label>
                </div>
              </div>
            </Card>

            {/* Sort Options */}
            <Card className="border-2 border-gray-200 bg-gradient-to-br from-white/80 to-green-50/50 backdrop-blur-sm shadow-md rounded-2xl p-5">
              <div className="space-y-3">
                <Label
                  htmlFor="sort"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs font-bold">
                    4
                  </span>
                  {t("form.sortBy")}
                </Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value: "rate_asc" | "rate_desc") =>
                    setSortOrder(value)
                  }
                >
                  <SelectTrigger
                    id="sort"
                    className="h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="rate_desc" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        {t("form.highestInterestRate")}
                      </div>
                    </SelectItem>
                    <SelectItem value="rate_asc" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        {t("form.lowestInterestRate")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>

          {/* Apply Filters Button with Enhanced Design */}
          <div className="flex justify-end">
            <Button
              onClick={handleApplyFilters}
              disabled={loading.calculations}
              className="min-w-[160px] h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl border-0"
            >
              {loading.calculations ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("form.calculating")}
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t("form.applyFilters")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {errors.calculation && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{errors.calculation}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("form.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Table with Enhanced Design */}
      <Card className="border-0 bg-gradient-to-br from-white/95 to-green-50/30 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-6">
          <CardHeader className="text-white p-0">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                {t("results.bankComparisonResults")}
              </div>
              {savingsResults?.savings && savingsResults.savings.length > 0 && (
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors duration-200">
                  {t("results.banksFound", {
                    count: savingsResults.savings.length,
                  })}
                </Badge>
              )}
            </CardTitle>
            {savingsResults && (
              <CardDescription className="text-green-100 text-sm mt-2">
                {t("results.basedOn", {
                  amount: formatCurrency(amount),
                  period,
                })}
              </CardDescription>
            )}
          </CardHeader>
        </div>
        <CardContent className="p-6">
          {loading.calculations ? (
            // Enhanced Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card
                  key={i}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 space-x-4">
                    <Skeleton className="h-5 w-[200px] rounded-lg" />
                    <Skeleton className="h-5 w-[80px] rounded-lg" />
                    <Skeleton className="h-5 w-[120px] rounded-lg" />
                    <Skeleton className="h-5 w-[120px] rounded-lg" />
                    <Skeleton className="h-9 w-[100px] rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          ) : savingsResults?.savings && savingsResults.savings.length > 0 ? (
            <>
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="px-6 py-4 font-semibold text-gray-700">
                        {t("results.table.bankName")}
                      </TableHead>
                      <TableHead className="text-right px-6 py-4 font-semibold text-gray-700">
                        {t("results.table.interestRate")}
                      </TableHead>
                      <TableHead className="text-right px-6 py-4 font-semibold text-gray-700">
                        {t("results.table.interestAmount")}
                      </TableHead>
                      <TableHead className="text-right px-6 py-4 font-semibold text-gray-700">
                        {t("results.table.totalAmount")}
                      </TableHead>
                      <TableHead className="text-center px-6 py-4 font-semibold text-gray-700">
                        {t("results.table.action")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result, index) => {
                      const isMaxRate = result.ir === rateStats.max;
                      const isMinRate = result.ir === rateStats.min;

                      return (
                        <TableRow
                          key={result.name}
                          className={`border-b border-gray-100 hover:bg-green-50/30 transition-colors duration-200 ${
                            index === 0 ? "bg-green-50/20" : ""
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-green-700">
                                  {result.full_name.charAt(0)}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {result.full_name}
                              </span>
                              {index === 0 && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Tốt nhất
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="font-mono font-bold text-lg text-gray-900">
                                {result.ir}%
                              </span>
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <div
                                  className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                                  style={{
                                    background: `conic-gradient(from 0deg, rgb(34 197 94) 0%, rgb(34 197 94) ${(result.ir / 10) * 100}%, rgb(229 231 235) ${(result.ir / 10) * 100}%)`,
                                  }}
                                >
                                  <span className="text-white text-xs font-bold">
                                    {result.ir}
                                  </span>
                                </div>
                              </div>
                              {isMaxRate && (
                                <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                                  <TrendingUp className="mr-1 h-3 w-3" />
                                  {t("results.bestRate")}
                                </Badge>
                              )}
                              {isMinRate && !isMaxRate && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 border-orange-200 text-orange-700"
                                >
                                  <TrendingDown className="mr-1 h-3 w-3" />
                                  {t("results.lowRate")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6 py-4">
                            <div className="text-right">
                              <span className="font-mono text-lg font-semibold text-green-600">
                                {formatCurrency(result.interest)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6 py-4">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono text-xl font-bold text-gray-900">
                                {formatCurrency(result.total)}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                +{formatCurrency(result.interest)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-10 px-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:bg-green-100 hover:border-green-400 hover:shadow-md transition-all duration-200 rounded-xl"
                            >
                              <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center font-semibold text-green-700"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t("results.open")}
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Pagination */}
              {savingsResults.savings.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">
                    {t("results.showing", {
                      start: (currentPage - 1) * itemsPerPage + 1,
                      end: Math.min(
                        currentPage * itemsPerPage,
                        savingsResults.savings.length,
                      ),
                      total: savingsResults.savings.length,
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="h-10 px-4 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-lg"
                    >
                      ← {t("results.previous")}
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            Math.ceil(
                              savingsResults.savings.length / itemsPerPage,
                            ),
                          ),
                        },
                        (_, i) => {
                          const pageNum = i + 1;
                          const isActive = currentPage === pageNum;

                          return (
                            <Button
                              key={pageNum}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-9 w-9 p-0 transition-all duration-200 rounded-lg ${
                                isActive
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                                  : "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        },
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(
                              savingsResults.savings.length / itemsPerPage,
                            ),
                            prev + 1,
                          ),
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(savingsResults.savings.length / itemsPerPage)
                      }
                      className="h-10 px-4 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-lg"
                    >
                      {t("results.next")} →
                    </Button>
                  </div>
                </div>
              )}

              {/* Enhanced Summary Stats */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  {t("results.summary")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-600 text-sm mb-1">
                          {t("results.averageRate")}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(
                            savingsResults.savings.reduce(
                              (sum, r) => sum + r.ir,
                              0,
                            ) / savingsResults.savings.length
                          ).toFixed(2)}
                          <span className="text-lg font-normal text-gray-600 ml-1">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-600 text-sm mb-1">
                          {t("results.totalInterestRange")}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(
                            savingsResults.savings.reduce(
                              (min, r) => Math.min(min, r.interest),
                              Infinity,
                            ),
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">đến</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            savingsResults.savings.reduce(
                              (max, r) => Math.max(max, r.interest),
                              0,
                            ),
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-600 text-sm mb-1">
                          {t("results.bestTotalReturn")}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            savingsResults.savings.reduce(
                              (max, r) => Math.max(max, r.total),
                              0,
                            ),
                          )}
                        </div>
                        <div className="text-xs text-green-500 mt-1 bg-green-100 px-2 py-1 rounded-full inline-block">
                          Cao nhất
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          ) : !loading.calculations && !errors.calculation ? (
            // Enhanced Empty state
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t("results.noSavingsFound")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t("results.tryAdjustingFilters")}
              </p>
              <Button
                onClick={handleRetry}
                className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

// Wrap the component with error boundary
export const SavingsCalculator: React.FC<SavingsCalculatorProps> = (props) => (
  <CalculatorErrorBoundary calculatorName="Savings Calculator">
    <SavingsCalculatorInner {...props} />
  </CalculatorErrorBoundary>
);

export default SavingsCalculator;
