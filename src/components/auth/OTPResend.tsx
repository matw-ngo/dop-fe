/**
 * OTP Resend Component
 * Handles OTP resend functionality with cooldown timer, rate limiting, and telco-specific rules
 */

"use client";

import {
  AlertTriangle,
  Clock,
  Info,
  RefreshCw,
  Send,
  Smartphone,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface OTPResendProps {
  onResend?: () => Promise<void>;
  initialCooldown?: number;
  maxAttempts?: number;
  currentAttempt?: number;
  telcoCode?: string;
  telcoSettings?: {
    resendCooldown: number;
    maxAttempts: number;
    supportsShortCode: boolean;
    shortCode?: string;
  };
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  showProgress?: boolean;
  showAttempts?: boolean;
  showTelcoInfo?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  loadingComponent?: React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
  onAttemptChange?: (attempt: number, maxAttempts: number) => void;
  onCooldownChange?: (remaining: number, total: number) => void;
}

export const OTPResend: React.FC<OTPResendProps> = ({
  onResend,
  initialCooldown = 0,
  maxAttempts = 3,
  currentAttempt = 0,
  telcoCode,
  telcoSettings,
  disabled = false,
  className,
  buttonClassName,
  showProgress = true,
  showAttempts = true,
  showTelcoInfo = true,
  variant = "ghost",
  size = "default",
  loadingComponent,
  successMessage = "Mã OTP đã được gửi lại",
  errorMessage = "Gửi lại mã OTP thất bại. Vui lòng thử lại.",
  onAttemptChange,
  onCooldownChange,
  ...props
}) => {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(currentAttempt);
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [cooldownReason, setCooldownReason] = useState<
    "initial" | "resend" | "rate-limit"
  >("initial");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get telco-specific cooldown
  const telcoCooldown = telcoSettings?.resendCooldown || 60;
  const telcoMaxAttempts = telcoSettings?.maxAttempts || maxAttempts;

  // Initialize cooldown
  useEffect(() => {
    if (initialCooldown > 0) {
      setCooldown(initialCooldown);
      setCooldownReason("initial");
    }
  }, [initialCooldown]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      intervalRef.current = setInterval(() => {
        setCooldown((prev) => {
          const newCooldown = prev - 1;
          onCooldownChange?.(newCooldown, telcoCooldown);
          return newCooldown;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cooldown, telcoCooldown, onCooldownChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle resend request
  const handleResend = useCallback(async () => {
    if (
      disabled ||
      isResending ||
      cooldown > 0 ||
      attempts >= telcoMaxAttempts
    ) {
      return;
    }

    setIsResending(true);
    setShowSuccess(false);
    setShowError(false);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      if (onResend) {
        await onResend();
      }

      // Success
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        onAttemptChange?.(newAttempts, telcoMaxAttempts);
        return newAttempts;
      });
      setCooldown(telcoCooldown);
      setCooldownReason("resend");
      setLastResendTime(new Date());
      setShowSuccess(true);
      setShowError(false);

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Resend OTP failed:", error);
      setShowError(true);
      setShowSuccess(false);

      // Handle rate limiting
      if (error instanceof Error && error.message.includes("rate limit")) {
        setCooldown(Math.max(60, telcoCooldown * 2)); // Double cooldown for rate limiting
        setCooldownReason("rate-limit");
      }

      // Hide error message after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsResending(false);
      abortControllerRef.current = null;
    }
  }, [
    disabled,
    isResending,
    cooldown,
    attempts,
    telcoMaxAttempts,
    telcoCooldown,
    onResend,
    onAttemptChange,
  ]);

  // Format cooldown time
  const formatCooldown = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} giây`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds > 0 ? `${remainingSeconds} giây` : ""}`;
  };

  // Get progress percentage
  const getProgressPercentage = (): number => {
    return telcoCooldown > 0 ? (cooldown / telcoCooldown) * 100 : 0;
  };

  // Check if resend is allowed
  const canResend =
    !disabled && !isResending && cooldown === 0 && attempts < telcoMaxAttempts;

  // Get telco display name
  const getTelcoDisplayName = (): string => {
    switch (telcoCode?.toUpperCase()) {
      case "VIETTEL":
        return "Viettel";
      case "MOBIFONE":
        return "Mobifone";
      case "VINAPHONE":
        return "Vinaphone";
      case "VIETNAMOBILE":
        return "Vietnamobile";
      case "GTEL":
        return "Gmobile";
      default:
        return "";
    }
  };

  // Get telco color
  const getTelcoColor = (): string => {
    switch (telcoCode?.toUpperCase()) {
      case "VIETTEL":
        return "#0033A0";
      case "MOBIFONE":
        return "#FF6600";
      case "VINAPHONE":
        return "#FF0000";
      case "VIETNAMOBILE":
        return "#FFCC00";
      case "GTEL":
        return "#00CC66";
      default:
        return "#666666";
    }
  };

  // Get button text
  const _getButtonText = (): string => {
    if (isResending) return "Đang gửi...";
    if (cooldown > 0) return `Gửi lại (${formatCooldown(cooldown)})`;
    if (attempts >= telcoMaxAttempts) return "Đạt giới hạn gửi";
    return "Gửi lại mã OTP";
  };

  // Get button variant based on state
  const getButtonVariant = (): OTPResendProps["variant"] => {
    if (cooldown > 0) return "secondary";
    if (attempts >= telcoMaxAttempts) return "destructive";
    return variant;
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Main Resend Button */}
      <div className="flex flex-col items-center space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={getButtonVariant()}
                size={size}
                onClick={handleResend}
                disabled={!canResend}
                className={cn(
                  "min-w-[140px] transition-all duration-200",
                  isResending && "opacity-70",
                  buttonClassName,
                )}
              >
                {isResending ? (
                  <>
                    {loadingComponent || (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Đang gửi...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Gửi lại ({formatCooldown(cooldown)})
                  </>
                ) : attempts >= telcoMaxAttempts ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Đạt giới hạn
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi lại mã
                  </>
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {attempts >= telcoMaxAttempts ? (
                <p>
                  Bạn đã gửi lại mã {telcoMaxAttempts} lần. Tối đa{" "}
                  {telcoMaxAttempts} lần.
                </p>
              ) : cooldown > 0 ? (
                <p>Vui lòng đợi {formatCooldown(cooldown)} trước khi gửi lại</p>
              ) : (
                <p>Gửi lại mã OTP đến số điện thoại của bạn</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Progress Bar */}
        {showProgress && cooldown > 0 && (
          <div className="w-full max-w-[200px] space-y-1">
            <div className="relative">
              <Progress value={getProgressPercentage()} className="h-2" />
              <div
                className={cn(
                  "absolute top-0 left-0 h-full transition-all duration-1000",
                  cooldownReason === "rate-limit" && "bg-destructive",
                  cooldownReason === "resend" && "bg-primary",
                  cooldownReason === "initial" && "bg-muted-foreground",
                )}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {cooldownReason === "rate-limit" && "Vượt giới hạn tần suất"}
              {cooldownReason === "resend" && "Đợi để gửi lại"}
              {cooldownReason === "initial" && "Khởi tạo"}
            </p>
          </div>
        )}

        {/* Attempts Counter */}
        {showAttempts && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Lần thử:</span>
            <Badge
              variant={
                attempts >= telcoMaxAttempts ? "destructive" : "secondary"
              }
              className="font-mono"
            >
              {attempts}/{telcoMaxAttempts}
            </Badge>
          </div>
        )}

        {/* Telco Info */}
        {showTelcoInfo && telcoCode && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3 w-3" />
            <span>Nhà mạng:</span>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: getTelcoColor(),
                color: getTelcoColor(),
              }}
            >
              {getTelcoDisplayName()}
            </Badge>
            {telcoSettings?.supportsShortCode && telcoSettings?.shortCode && (
              <span className="font-mono">({telcoSettings.shortCode})</span>
            )}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <Send className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {successMessage}
              {lastResendTime && (
                <span className="block text-xs mt-1">
                  Gửi lúc: {lastResendTime.toLocaleTimeString("vi-VN")}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {showError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Help Information */}
      {(attempts > 0 || cooldown > 0) && (
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          {attempts > 0 && (
            <p>
              • Bạn đã gửi lại mã {attempts} lần
              {attempts >= telcoMaxAttempts && " (tối đa)"}
            </p>
          )}
          {cooldown > 0 && <p>• Thời gian chờ: {formatCooldown(cooldown)}</p>}
          {telcoCode && (
            <p>
              • Mã được gửi qua đầu số {getTelcoDisplayName()}
              {telcoSettings?.supportsShortCode &&
                ` (${telcoSettings.shortCode})`}
            </p>
          )}
        </div>
      )}

      {/* Rate Limit Warning */}
      {cooldownReason === "rate-limit" && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Bạn đã gửi yêu cầu quá nhanh. Vui lòng đợi trước khi thử lại.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

OTPResend.displayName = "OTPResend";

export default OTPResend;
