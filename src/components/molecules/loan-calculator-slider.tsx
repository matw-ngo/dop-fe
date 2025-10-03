"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";

export interface LoanCalculatorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  onValueChange?: (value: number) => void;
  className?: string;
  variant?: "amount" | "duration" | "rate";
  showInput?: boolean;
  showBadges?: boolean;
  presetValues?: Array<{ label: string; value: number }>;
  disabled?: boolean;
  helperText?: string;
  size?: "sm" | "md" | "lg";
}

// Utility functions for formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDuration = (months: number): string => {
  if (months < 12) {
    return `${months} tháng`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} năm`;
    } else {
      return `${years} năm ${remainingMonths} tháng`;
    }
  }
};

const formatPercentage = (rate: number): string => {
  return `${rate}%/năm`;
};

export function LoanCalculatorSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  onValueChange,
  className,
  variant = "amount",
  showInput = true,
  showBadges = false,
  presetValues = [],
  disabled = false,
  helperText,
  size = "md",
}: LoanCalculatorSliderProps) {
  const [inputValue, setInputValue] = React.useState(value.toString());
  const [isFocused, setIsFocused] = React.useState(false);

  // Update input when value changes externally
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  // Default formatters based on variant
  const getDefaultFormatter = () => {
    switch (variant) {
      case "amount":
        return formatCurrency;
      case "duration":
        return formatDuration;
      case "rate":
        return formatPercentage;
      default:
        return (val: number) => `${val}${unit}`;
    }
  };

  const formatter = formatValue || getDefaultFormatter();

  const handleSliderChange = (newValue: number[]) => {
    const val = newValue[0];
    onValueChange?.(val);
    if (!isFocused) {
      setInputValue(val.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseFloat(newValue.replace(/[^\d.]/g, ""));
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onValueChange?.(numValue);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue.replace(/[^\d.]/g, ""));
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  const handlePresetClick = (presetValue: number) => {
    onValueChange?.(presetValue);
    setInputValue(presetValue.toString());
  };

  const getIcon = () => {
    switch (variant) {
      case "amount":
        return <DollarSign className="h-4 w-4" />;
      case "duration":
        return <Clock className="h-4 w-4" />;
      case "rate":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  const sizeStyles = {
    sm: {
      container: "space-y-2",
      label: "text-sm",
      value: "text-lg font-bold",
      input: "h-8 text-sm",
      badge: "text-xs px-2 py-1",
    },
    md: {
      container: "space-y-3",
      label: "text-base",
      value: "text-xl font-bold",
      input: "h-10",
      badge: "text-sm px-3 py-1",
    },
    lg: {
      container: "space-y-4",
      label: "text-lg",
      value: "text-2xl font-bold",
      input: "h-12 text-lg",
      badge: "text-base px-4 py-2",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn(styles.container, className)}>
      {/* Label and Icon */}
      <div className="flex items-center justify-between">
        <Label
          className={cn("flex items-center gap-2 font-medium", styles.label)}
        >
          {getIcon()}
          {label}
        </Label>
        {variant === "amount" && (
          <Badge variant="secondary" className="text-xs">
            {formatCurrency(min)} - {formatCurrency(max)}
          </Badge>
        )}
      </div>

      {/* Value Display */}
      <div className="text-center">
        <div className={cn("text-primary", styles.value)}>
          {formatter(value)}
        </div>
        {helperText && (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        )}
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatter(min)}</span>
          <span>{formatter(max)}</span>
        </div>
      </div>

      {/* Preset Values */}
      {showBadges && presetValues.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {presetValues.map((preset, index) => (
            <Button
              key={index}
              variant={value === preset.value ? "default" : "outline"}
              size="sm"
              className={styles.badge}
              onClick={() => handlePresetClick(preset.value)}
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      {/* Input Field */}
      {showInput && (
        <div className="space-y-1">
          <Label
            htmlFor={`input-${label}`}
            className="text-xs text-muted-foreground"
          >
            Hoặc nhập trực tiếp:
          </Label>
          <Input
            id={`input-${label}`}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={styles.input}
            placeholder={`Từ ${formatter(min)} đến ${formatter(max)}`}
          />
        </div>
      )}
    </div>
  );
}

// Loan Calculator Component that combines multiple sliders
export interface LoanCalculatorProps {
  amount: number;
  duration: number;
  interestRate?: number;
  onAmountChange?: (amount: number) => void;
  onDurationChange?: (duration: number) => void;
  onInterestRateChange?: (rate: number) => void;
  className?: string;
  showResults?: boolean;
  amountRange?: { min: number; max: number };
  durationRange?: { min: number; max: number };
  rateRange?: { min: number; max: number };
}

export function LoanCalculator({
  amount,
  duration,
  interestRate = 8.5,
  onAmountChange,
  onDurationChange,
  onInterestRateChange,
  className,
  showResults = true,
  amountRange = { min: 5_000_000, max: 500_000_000 },
  durationRange = { min: 6, max: 60 },
  rateRange = { min: 6, max: 24 },
}: LoanCalculatorProps) {
  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const payment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
      (Math.pow(1 + monthlyRate, duration) - 1);
    return payment;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalAmount = monthlyPayment * duration;
  const totalInterest = totalAmount - amount;

  const amountPresets = [
    { label: "10M", value: 10_000_000 },
    { label: "50M", value: 50_000_000 },
    { label: "100M", value: 100_000_000 },
    { label: "200M", value: 200_000_000 },
  ];

  const durationPresets = [
    { label: "6 tháng", value: 6 },
    { label: "12 tháng", value: 12 },
    { label: "24 tháng", value: 24 },
    { label: "36 tháng", value: 36 },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount Slider */}
        <LoanCalculatorSlider
          label="Số tiền vay"
          value={amount}
          min={amountRange.min}
          max={amountRange.max}
          step={1_000_000}
          variant="amount"
          onValueChange={onAmountChange}
          showBadges
          presetValues={amountPresets}
          helperText="Chọn số tiền bạn muốn vay"
        />

        {/* Duration Slider */}
        <LoanCalculatorSlider
          label="Thời hạn vay"
          value={duration}
          min={durationRange.min}
          max={durationRange.max}
          step={1}
          variant="duration"
          onValueChange={onDurationChange}
          showBadges
          presetValues={durationPresets}
          helperText="Thời gian bạn muốn trả nợ"
        />
      </div>

      {/* Interest Rate Slider (optional) */}
      {onInterestRateChange && (
        <LoanCalculatorSlider
          label="Lãi suất"
          value={interestRate}
          min={rateRange.min}
          max={rateRange.max}
          step={0.1}
          variant="rate"
          onValueChange={onInterestRateChange}
          helperText="Lãi suất áp dụng cho khoản vay"
          showInput={false}
        />
      )}

      {/* Results */}
      {showResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Trả hàng tháng</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(monthlyPayment)}
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Tổng tiền lãi</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(totalInterest)}
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
