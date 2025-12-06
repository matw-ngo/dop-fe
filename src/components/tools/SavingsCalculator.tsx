"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    <div className={`space-y-6 ${className}`}>
      {/* Async Error Handler */}
      <CalculatorAsyncErrorHandler
        error={asyncError}
        onRetry={handleRetry}
        onDismiss={clearError}
        calculatorName="Savings Calculator"
      />
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Calculator</CardTitle>
          <CardDescription>
            Compare savings rates from different banks and find the best option
            for your money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Slider */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-medium">
              Savings Amount: {formatAmountDisplay(amount)}
            </Label>
            <div className="px-2">
              <Slider
                id="amount"
                min={SAVINGS_DEFAULTS.MIN_AMOUNT}
                max={SAVINGS_DEFAULTS.MAX_AMOUNT}
                step={SAVINGS_DEFAULTS.AMOUNT_STEP}
                value={[amount]}
                onValueChange={handleAmountChange}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{formatAmountDisplay(SAVINGS_DEFAULTS.MIN_AMOUNT)}</span>
                <span>{formatAmountDisplay(SAVINGS_DEFAULTS.MAX_AMOUNT)}</span>
              </div>
            </div>
            <Input
              type="text"
              value={formatCurrency(amount)}
              onChange={(e) => handleAmountInputChange(e.target.value)}
              className="max-w-xs"
              placeholder="Enter amount"
            />
          </div>

          {/* Period and Type Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Period Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm font-medium">
                Savings Period
              </Label>
              <Select
                value={period.toString()}
                onValueChange={(value) => setPeriod(parseInt(value))}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAVINGS_DEFAULTS.PERIOD_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} {p === 1 ? "month" : "months"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Savings Type</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="type"
                  checked={type === "online"}
                  onCheckedChange={(checked) =>
                    setType(checked ? "online" : "counter")
                  }
                />
                <Label htmlFor="type" className="text-sm">
                  {type === "online" ? "Online Savings" : "Counter Savings"}
                </Label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label htmlFor="sort" className="text-sm font-medium">
                Sort By
              </Label>
              <Select
                value={sortOrder}
                onValueChange={(value: "rate_asc" | "rate_desc") =>
                  setSortOrder(value)
                }
              >
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rate_desc">
                    Highest Interest Rate
                  </SelectItem>
                  <SelectItem value="rate_asc">Lowest Interest Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleApplyFilters}
              disabled={loading.calculations}
              className="min-w-[120px]"
            >
              {loading.calculations ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Apply Filters"
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
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bank Comparison Results</span>
            {savingsResults?.savings && savingsResults.savings.length > 0 && (
              <Badge variant="secondary">
                {savingsResults.savings.length} banks found
              </Badge>
            )}
          </CardTitle>
          {savingsResults && (
            <CardDescription>
              Based on {formatCurrency(amount)} for {period} months
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loading.calculations ? (
            // Loading skeleton
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : savingsResults?.savings && savingsResults.savings.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank Name</TableHead>
                      <TableHead className="text-right">
                        Interest Rate
                      </TableHead>
                      <TableHead className="text-right">
                        Interest Amount
                      </TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result) => {
                      const isMaxRate = result.ir === rateStats.max;
                      const isMinRate = result.ir === rateStats.min;

                      return (
                        <TableRow key={result.name}>
                          <TableCell className="font-medium">
                            {result.full_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <span className="font-mono">{result.ir}%</span>
                              {isMaxRate && (
                                <Badge variant="default" className="ml-1">
                                  <TrendingUp className="mr-1 h-3 w-3" />
                                  Best
                                </Badge>
                              )}
                              {isMinRate && !isMaxRate && (
                                <Badge variant="outline" className="ml-1">
                                  <TrendingDown className="mr-1 h-3 w-3" />
                                  Low
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(result.interest)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(result.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Open
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {savingsResults.savings.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      savingsResults.savings.length,
                    )}{" "}
                    of {savingsResults.savings.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of{" "}
                      {Math.ceil(savingsResults.savings.length / itemsPerPage)}
                    </span>
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
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Average Rate:{" "}
                    </span>
                    <span className="font-medium">
                      {(
                        savingsResults.savings.reduce(
                          (sum, r) => sum + r.ir,
                          0,
                        ) / savingsResults.savings.length
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total Interest Range:{" "}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        savingsResults.savings.reduce(
                          (min, r) => Math.min(min, r.interest),
                          Infinity,
                        ),
                      )}{" "}
                      -{" "}
                      {formatCurrency(
                        savingsResults.savings.reduce(
                          (max, r) => Math.max(max, r.interest),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Best Total Return:{" "}
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        savingsResults.savings.reduce(
                          (max, r) => Math.max(max, r.total),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : !loading.calculations && !errors.calculation ? (
            // Empty state
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No savings products found matching your criteria.</p>
              <p className="text-sm mt-1">
                Try adjusting your filters to see more results.
              </p>
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
