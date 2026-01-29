/**
 * OTP Verification Dialog Component
 * Comprehensive OTP verification dialog with Vietnamese telco support
 */

"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Info,
  Lock,
  Smartphone,
  User,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { detectTelco } from "@/lib/telcos/telco-detector";
import getPhoneMetadata, {
  formatPhoneNumber,
  getOTPSettings,
  TELCO_ERROR_MESSAGES,
} from "@/lib/telcos/vietnamese-telcos";
import { cn } from "@/lib/utils";
import { OTPInput } from "./OTPInput";
import { OTPResend } from "./OTPResend";
import { PhoneInput } from "./PhoneInput";

export type VerificationStep = "phone" | "otp" | "success" | "error" | "locked";

export interface OTPVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber?: string;
  onPhoneSubmit?: (phoneNumber: string, metadata?: any) => Promise<void>;
  onOTPVerify?: (otpCode: string) => Promise<boolean>;
  onOTPRequest?: (phoneNumber: string) => Promise<void>;
  onOTPResend?: (phoneNumber: string) => Promise<void>;
  onSuccess?: (phoneNumber: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  autoRequestOTP?: boolean;
  showPhoneNumber?: boolean;
  telcoCode?: string;
  title?: string;
  description?: string;
  className?: string;
  maxAttempts?: number;
  lockoutDuration?: number; // seconds
  sessionTimeout?: number; // seconds
}

export const OTPVerificationDialog: React.FC<OTPVerificationDialogProps> = ({
  open,
  onOpenChange,
  phoneNumber: initialPhoneNumber = "",
  onPhoneSubmit,
  onOTPVerify,
  onOTPRequest,
  onOTPResend,
  onSuccess,
  onError,
  onClose,
  autoRequestOTP = true,
  showPhoneNumber = true,
  telcoCode,
  title = "Xác thực OTP",
  description = "Nhập mã OTP đã được gửi đến số điện thoại của bạn",
  className,
  maxAttempts = 3,
  lockoutDuration = 900, // 15 minutes
  sessionTimeout = 600, // 10 minutes
  ...props
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState<VerificationStep>(
    initialPhoneNumber ? "otp" : "phone",
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
  const [_sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [phoneMetadata, setPhoneMetadata] = useState<any>(null);
  const [otpSettings, setOtpSettings] = useState<any>(null);
  const [telcoInfo, setTelcoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize phone metadata when phone number changes
  useEffect(() => {
    if (phoneNumber) {
      const telcoDetection = detectTelco(phoneNumber);
      const telcoCode = telcoDetection.telco?.code || "VIETTEL";
      const metadata =
        getPhoneMetadata[telcoCode] ||
        getPhoneMetadata.default ||
        getPhoneMetadata.viettel;
      const settings = getOTPSettings(phoneNumber);

      setPhoneMetadata(metadata);
      setOtpSettings(settings);
      setTelcoInfo(telcoDetection);

      // Set session timeout
      const endTime = new Date();
      endTime.setSeconds(endTime.getSeconds() + settings.otpExpiry);
      setSessionEndTime(endTime);
      setSessionStartTime(new Date());
    }
  }, [phoneNumber]);

  // Check lockout status
  useEffect(() => {
    if (lockoutEndTime && new Date() < lockoutEndTime) {
      const checkLockout = () => {
        if (new Date() >= lockoutEndTime) {
          setLockoutEndTime(null);
          setAttempts(0);
          setCurrentStep("phone");
        }
      };

      timerIntervalRef.current = setInterval(checkLockout, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [lockoutEndTime]);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    setCurrentStep("error");
    setError(TELCO_ERROR_MESSAGES.OTP_EXPIRED);
  }, []);

  // Check session timeout
  useEffect(() => {
    if (sessionEndTime && currentStep === "otp") {
      const checkSession = () => {
        if (new Date() >= sessionEndTime) {
          handleSessionTimeout();
        }
      };

      timerIntervalRef.current = setInterval(checkSession, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [sessionEndTime, currentStep, handleSessionTimeout]);

  // Handle phone number submission
  const handlePhoneSubmit = useCallback(
    async (phone: string, isValid: boolean, metadata?: any) => {
      if (!isValid) {
        setError(TELCO_ERROR_MESSAGES.INVALID_PHONE);
        return;
      }

      setIsVerifying(true);
      setError(null);

      try {
        if (onPhoneSubmit) {
          await onPhoneSubmit(phone, metadata);
        }

        setPhoneNumber(phone);
        setPhoneMetadata(metadata);

        // Auto-request OTP if enabled
        if (autoRequestOTP && onOTPRequest) {
          await onOTPRequest(phone);
        }

        setCurrentStep("otp");
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Phone submission failed");
        setError(error.message);
        onError?.(error);
      } finally {
        setIsVerifying(false);
      }
    },
    [onPhoneSubmit, autoRequestOTP, onOTPRequest, onError],
  );

  // Handle OTP verification
  const handleOTPVerify = useCallback(
    async (code: string) => {
      if (!code || code.length !== otpSettings?.otpLength) {
        setError(TELCO_ERROR_MESSAGES.INVALID_OTP_LENGTH);
        return;
      }

      setIsVerifying(true);
      setError(null);

      try {
        const isValid = await onOTPVerify?.(code);

        if (isValid) {
          setSuccessMessage("Xác thực OTP thành công!");
          setCurrentStep("success");
          onSuccess?.(phoneNumber);
        } else {
          throw new Error(TELCO_ERROR_MESSAGES.INVALID_OTP);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("OTP verification failed");

        setAttempts((prev) => prev + 1);
        setError(error.message);

        // Check if max attempts reached
        if (attempts + 1 >= maxAttempts) {
          const lockoutEnd = new Date();
          lockoutEnd.setSeconds(lockoutEnd.getSeconds() + lockoutDuration);
          setLockoutEndTime(lockoutEnd);
          setCurrentStep("locked");
        }

        onError?.(error);
      } finally {
        setIsVerifying(false);
      }
    },
    [
      onOTPVerify,
      otpSettings?.otpLength,
      phoneNumber,
      attempts,
      maxAttempts,
      lockoutDuration,
      onSuccess,
      onError,
    ],
  );

  // Handle OTP resend
  const handleOTPResend = useCallback(async () => {
    if (!phoneNumber) return;

    try {
      if (onOTPResend) {
        await onOTPResend(phoneNumber);
      }

      // Reset session timeout
      const endTime = new Date();
      endTime.setSeconds(endTime.getSeconds() + otpSettings?.otpExpiry);
      setSessionEndTime(endTime);
      setSessionStartTime(new Date());

      setSuccessMessage("Mã OTP đã được gửi lại");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("OTP resend failed");
      setError(error.message);
      onError?.(error);
    }
  }, [phoneNumber, onOTPResend, otpSettings?.otpExpiry, onError]);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Reset state
    setCurrentStep(initialPhoneNumber ? "otp" : "phone");
    setOtpCode("");
    setAttempts(0);
    setError(null);
    setSuccessMessage(null);

    onOpenChange(false);
    onClose?.();
  }, [initialPhoneNumber, onOpenChange, onClose]);

  // Get remaining time for timers
  const getRemainingTime = (endTime: Date | null): number => {
    if (!endTime) return 0;
    return Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
  };

  const lockoutRemaining = getRemainingTime(lockoutEndTime);
  const sessionRemaining = getRemainingTime(sessionEndTime);

  // Get telco color for styling
  const getTelcoColor = (): string => {
    return telcoInfo?.telco?.color || "#666666";
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className={cn("sm:max-w-md", className)} {...props}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: `${getTelcoColor()}20` }}
            >
              {currentStep === "phone" && (
                <User className="h-8 w-8" style={{ color: getTelcoColor() }} />
              )}
              {currentStep === "otp" && (
                <Lock className="h-8 w-8" style={{ color: getTelcoColor() }} />
              )}
              {currentStep === "success" && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
              {currentStep === "error" && (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              {currentStep === "locked" && (
                <AlertCircle className="h-8 w-8 text-orange-500" />
              )}
            </div>
          </div>

          <DialogTitle className="text-xl font-semibold">
            {currentStep === "phone" && "Xác thực số điện thoại"}
            {currentStep === "otp" && "Nhập mã OTP"}
            {currentStep === "success" && "Xác thực thành công"}
            {currentStep === "error" && "Lỗi xác thực"}
            {currentStep === "locked" && "Tạm khóa"}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground">
            {currentStep === "phone" &&
              "Nhập số điện thoại Việt Nam để nhận mã OTP"}
            {currentStep === "otp" && phoneMetadata && (
              <>
                Mã OTP đã được gửi đến{" "}
                {formatPhoneNumber(phoneMetadata.phoneNumber)}
              </>
            )}
            {currentStep === "success" &&
              "Số điện thoại của bạn đã được xác thực thành công"}
            {currentStep === "error" &&
              "Đã xảy ra lỗi trong quá trình xác thực"}
            {currentStep === "locked" &&
              "Tài khoản của bạn đã bị tạm khóa do nhập sai quá nhiều lần"}
          </DialogDescription>
        </DialogHeader>

        {/* Phone Input Step */}
        {currentStep === "phone" && (
          <div className="space-y-4">
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneSubmit}
              showTelcoBadge={true}
              showValidation={true}
              label="Số điện thoại"
              placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
                disabled={isVerifying}
              >
                Hủy
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* OTP Input Step */}
        {currentStep === "otp" && (
          <div className="space-y-4">
            {/* Telco Info */}
            {telcoInfo?.telco && showPhoneNumber && (
              <div className="text-center space-y-2">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 mx-auto"
                  style={{
                    backgroundColor: `${getTelcoColor()}20`,
                    borderColor: getTelcoColor(),
                    color: getTelcoColor(),
                  }}
                >
                  <Smartphone className="h-3 w-3" />
                  {telcoInfo.telco.name}
                  {phoneMetadata?.isInternational && (
                    <span className="text-xs">(Quốc tế)</span>
                  )}
                </Badge>

                <p className="text-sm text-muted-foreground">
                  {formatPhoneNumber(phoneMetadata?.phoneNumber)}
                </p>
              </div>
            )}

            {/* Session Timer */}
            {sessionRemaining > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Thời gian còn lại</span>
                  </div>
                  <span className="font-mono">
                    {Math.floor(sessionRemaining / 60)}:
                    {(sessionRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <Progress
                  value={
                    (sessionRemaining / (otpSettings?.otpExpiry || 600)) * 100
                  }
                  className="h-2"
                />
              </div>
            )}

            {/* OTP Input */}
            <OTPInput
              length={otpSettings?.otpLength || 6}
              value={otpCode}
              onChange={setOtpCode}
              onComplete={handleOTPVerify}
              disabled={isVerifying}
              error={error || undefined}
              showTimer={true}
              timerRemaining={sessionRemaining}
              timerDuration={otpSettings?.otpExpiry || 600}
              onTimerExpire={handleSessionTimeout}
              allowAutoSubmit={true}
            />

            {/* Resend OTP */}
            <OTPResend
              onResend={handleOTPResend}
              maxAttempts={otpSettings?.maxAttempts || 3}
              currentAttempt={attempts}
              telcoCode={telcoInfo?.telco?.code}
              telcoSettings={otpSettings}
              disabled={isVerifying}
              showProgress={true}
              showAttempts={true}
              showTelcoInfo={true}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("phone")}
                disabled={isVerifying}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Success Step */}
        {currentStep === "success" && (
          <div className="space-y-4 text-center">
            <div className="text-green-600 space-y-2">
              <CheckCircle className="h-16 w-16 mx-auto" />
              <p className="font-semibold">Xác thực thành công!</p>
              <p className="text-sm text-muted-foreground">
                Số điện thoại của bạn đã được xác thực thành công
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleDialogClose} className="w-full">
                Hoàn thành
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Error Step */}
        {currentStep === "error" && (
          <div className="space-y-4 text-center">
            <div className="text-red-600 space-y-2">
              <XCircle className="h-16 w-16 mx-auto" />
              <p className="font-semibold">Xác thực thất bại</p>
              <p className="text-sm text-muted-foreground">
                {error || "Đã xảy ra lỗi trong quá trình xác thực"}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("phone")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
              <Button onClick={handleDialogClose}>Đóng</Button>
            </DialogFooter>
          </div>
        )}

        {/* Locked Step */}
        {currentStep === "locked" && (
          <div className="space-y-4 text-center">
            <div className="text-orange-600 space-y-2">
              <AlertCircle className="h-16 w-16 mx-auto" />
              <p className="font-semibold">Tài khoản bị tạm khóa</p>
              <p className="text-sm text-muted-foreground">
                Bạn đã nhập sai OTP quá nhiều lần. Vui lòng thử lại sau.
              </p>
            </div>

            {lockoutRemaining > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Mở khóa sau:</span>
                  <span className="font-mono font-semibold">
                    {Math.floor(lockoutRemaining / 60)}:
                    {(lockoutRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <Progress
                  value={(lockoutRemaining / lockoutDuration) * 100}
                  className="h-2"
                />
              </div>
            )}

            <Alert className="border-blue-200 bg-blue-50 text-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Để bảo vệ tài khoản của bạn, vui lòng đợi hết thời gian khóa
                hoặc liên hệ hỗ trợ.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={handleDialogClose} variant="outline">
                Đóng
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

OTPVerificationDialog.displayName = "OTPVerificationDialog";

export default OTPVerificationDialog;
