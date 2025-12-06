/**
 * OTP Verification Hook
 * Manages OTP verification flow with Vietnamese telco support
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

import { otpApi } from "@/lib/api/endpoints/otp";
import { useAuthStore } from "@/store/use-auth-store";

import {
  getOTPSettings,
  TELCO_ERROR_MESSAGES,
} from "@/lib/telcos/vietnamese-telcos";
import {
  getPhoneMetadata,
  validateVietnamesePhone,
} from "@/lib/telcos/phone-validation";

export interface OTPVerificationState {
  phoneNumber: string;
  requestId: string;
  isRequesting: boolean;
  isVerifying: boolean;
  isResending: boolean;
  attempts: number;
  maxAttempts: number;
  canResend: boolean;
  resendCooldown: number;
  sessionExpiry: number;
  isExpired: boolean;
  isLocked: boolean;
  lockoutEnd: Date | null;
  error: string | null;
  success: boolean;
  telcoInfo: any;
  otpSettings: any;
}

export interface UseOTPVerificationOptions {
  phoneNumber?: string;
  onSuccess?: (phoneNumber: string) => void;
  onError?: (error: Error) => void;
  onSessionExpiry?: () => void;
  onLockout?: (lockoutEnd: Date) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
  enableRetry?: boolean;
  maxRetries?: number;
}

export const useOTPVerification = (options: UseOTPVerificationOptions = {}) => {
  const {
    phoneNumber: initialPhoneNumber = "",
    onSuccess,
    onError,
    onSessionExpiry,
    onLockout,
    autoRefresh = true,
    refreshInterval = 30,
    enableRetry = true,
    maxRetries = 3,
  } = options;

  // Core state
  const [state, setState] = useState<OTPVerificationState>({
    phoneNumber: initialPhoneNumber,
    requestId: "",
    isRequesting: false,
    isVerifying: false,
    isResending: false,
    attempts: 0,
    maxAttempts: 3,
    canResend: true,
    resendCooldown: 0,
    sessionExpiry: 0,
    isExpired: false,
    isLocked: false,
    lockoutEnd: null,
    error: null,
    success: false,
    telcoInfo: null,
    otpSettings: null,
  });

  // Refs for tracking
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Update telco and OTP settings when phone number changes
  useEffect(() => {
    if (state.phoneNumber) {
      const metadata = getPhoneMetadata(state.phoneNumber);
      const settings = getOTPSettings(state.phoneNumber);

      setState((prev) => ({
        ...prev,
        telcoInfo: metadata,
        otpSettings: settings,
        maxAttempts: settings.maxAttempts,
        resendCooldown: settings.resendCooldown,
        sessionExpiry: settings.otpExpiry,
      }));
    }
  }, [state.phoneNumber]);

  // Handle session expiry
  useEffect(() => {
    if (state.sessionExpiry > 0 && state.requestId && !state.success) {
      const checkExpiry = () => {
        const now = Date.now();
        const requestTime =
          parseInt(state.requestId.substring(0, 8), 36) * 1000;
        const elapsed = (now - requestTime) / 1000;

        if (elapsed >= state.sessionExpiry) {
          setState((prev) => ({ ...prev, isExpired: true }));
          onSessionExpiry?.();
          if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
          }
        }
      };

      if (autoRefresh) {
        refreshTimerRef.current = setInterval(
          checkExpiry,
          refreshInterval * 1000,
        );
      }

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [
    state.sessionExpiry,
    state.requestId,
    state.success,
    autoRefresh,
    refreshInterval,
    onSessionExpiry,
  ]);

  // Request OTP
  const requestOTP = useCallback(
    async (phoneNumber: string) => {
      // Validate phone number
      const validation = validateVietnamesePhone(phoneNumber);
      if (!validation.isValid) {
        const error = new Error(
          validation.error || TELCO_ERROR_MESSAGES.INVALID_PHONE,
        );
        setState((prev) => ({ ...prev, error: error.message }));
        onError?.(error);
        return null;
      }

      setState((prev) => ({ ...prev, isRequesting: true, error: null }));

      try {
        abortControllerRef.current = new AbortController();

        const response = await otpApi.requestOTP(phoneNumber, undefined);

        if (response.success && response.data) {
          const requestId = response.data.requestId || crypto.randomUUID();
          const expiryTime = new Date();
          expiryTime.setSeconds(
            expiryTime.getSeconds() + (response.data.expiry || 300),
          );

          setState((prev) => ({
            ...prev,
            phoneNumber,
            requestId,
            isRequesting: false,
            attempts: 0,
            canResend: false,
            resendCooldown: prev.otpSettings?.resendCooldown || 60,
            sessionExpiry: response.data?.expiry || 300,
            isExpired: false,
            isLocked: false,
            lockoutEnd: null,
            error: null,
          }));

          // Start resend cooldown timer
          startResendCooldown();

          toast.success("Mã OTP đã được gửi đến số điện thoại của bạn", {
            description: `Mã có hiệu lực trong ${Math.floor((response.data.expiry || 300) / 60)} phút`,
          });

          return requestId;
        } else {
          throw new Error(response.message || "Failed to request OTP");
        }
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("OTP request failed");
        setState((prev) => ({
          ...prev,
          isRequesting: false,
          error: err.message,
        }));
        onError?.(err);

        toast.error("Yêu cầu OTP thất bại", {
          description: err.message,
        });

        return null;
      }
    },
    [onError],
  );

  // Verify OTP
  const verifyOTP = useCallback(
    async (otpCode: string) => {
      if (!state.phoneNumber || !state.requestId) {
        const error = new Error("No active OTP session");
        setState((prev) => ({ ...prev, error: error.message }));
        onError?.(error);
        return false;
      }

      if (state.isLocked) {
        const error = new Error(TELCO_ERROR_MESSAGES.MAX_ATTEMPTS_EXCEEDED);
        setState((prev) => ({ ...prev, error: error.message }));
        onError?.(error);
        return false;
      }

      if (state.isExpired) {
        const error = new Error(TELCO_ERROR_MESSAGES.OTP_EXPIRED);
        setState((prev) => ({ ...prev, error: error.message }));
        onError?.(error);
        return false;
      }

      setState((prev) => ({ ...prev, isVerifying: true, error: null }));

      try {
        abortControllerRef.current = new AbortController();

        const response = await otpApi.verifyOTP(
          state.phoneNumber,
          otpCode,
          state.requestId,
        );

        if (response.success && response.data?.metadata?.verified) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            success: true,
            error: null,
          }));

          toast.success("Xác thực OTP thành công");

          // Update user state in auth store if available
          const { user } = useAuthStore.getState();
          if (user && state.phoneNumber) {
            useAuthStore.setState({
              user: { ...user, phone: state.phoneNumber },
            });
          }

          onSuccess?.(state.phoneNumber);
          return true;
        } else {
          throw new Error(response.message || TELCO_ERROR_MESSAGES.INVALID_OTP);
        }
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("OTP verification failed");

        setState((prev) => {
          const newAttempts = prev.attempts + 1;
          const isLocked = newAttempts >= prev.maxAttempts;
          const lockoutEnd = isLocked
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null;

          if (isLocked) {
            onLockout?.(lockoutEnd!);
          }

          return {
            ...prev,
            isVerifying: false,
            attempts: newAttempts,
            isLocked,
            lockoutEnd,
            error: err.message,
          };
        });

        onError?.(err);

        const errorType =
          state.attempts + 1 >= state.maxAttempts ? "lockout" : "invalid";
        toast.error(
          errorType === "lockout"
            ? "Tài khoản bị khóa tạm thời"
            : "Mã OTP không chính xác",
          {
            description: err.message,
          },
        );

        // Retry if enabled and within limits
        if (
          enableRetry &&
          retryCountRef.current < maxRetries &&
          !state.isLocked
        ) {
          retryCountRef.current++;
          setTimeout(() => {
            // Auto retry logic could be implemented here
          }, 2000);
        }

        return false;
      }
    },
    [state, onSuccess, onError, onLockout, enableRetry, maxRetries],
  );

  // Resend OTP
  const resendOTP = useCallback(async () => {
    if (!state.phoneNumber) {
      const error = new Error("No phone number available");
      setState((prev) => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    if (!state.canResend || state.resendCooldown > 0) {
      const error = new Error(
        TELCO_ERROR_MESSAGES.RESEND_COOLDOWN.replace(
          "{{seconds}}",
          state.resendCooldown.toString(),
        ),
      );
      setState((prev) => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    if (state.isLocked) {
      const error = new Error(TELCO_ERROR_MESSAGES.MAX_ATTEMPTS_EXCEEDED);
      setState((prev) => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    setState((prev) => ({ ...prev, isResending: true, error: null }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await otpApi.resendOTP(
        state.phoneNumber,
        state.requestId,
      );

      if (response.success && response.data) {
        const newRequestId = response.data.requestId || crypto.randomUUID();
        const expiryTime = new Date();
        expiryTime.setSeconds(
          expiryTime.getSeconds() + (response.data.expiry || 300),
        );

        setState((prev) => ({
          ...prev,
          requestId: newRequestId,
          isResending: false,
          canResend: false,
          resendCooldown: prev.otpSettings?.resendCooldown || 90,
          sessionExpiry: response.data?.expiry || 300,
          isExpired: false,
          error: null,
        }));

        // Start resend cooldown timer
        startResendCooldown();

        toast.success("Mã OTP đã được gửi lại", {
          description: `Mã có hiệu lực trong ${Math.floor((response.data.expiry || 300) / 60)} phút`,
        });
      } else {
        throw new Error(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("OTP resend failed");
      setState((prev) => ({ ...prev, isResending: false, error: err.message }));
      onError?.(err);

      toast.error("Gửi lại OTP thất bại", {
        description: err.message,
      });
    }
  }, [state, onError]);

  // Start resend cooldown timer
  const startResendCooldown = useCallback(() => {
    const cooldownDuration = state.resendCooldown;
    let remaining = cooldownDuration;

    const cooldownTimer = setInterval(() => {
      remaining--;
      setState((prev) => ({ ...prev, resendCooldown: remaining }));

      if (remaining <= 0) {
        clearInterval(cooldownTimer);
        setState((prev) => ({ ...prev, canResend: true }));
      }
    }, 1000);

    return cooldownTimer;
  }, [state.resendCooldown]);

  // Check OTP session status
  const checkOTPStatus = useCallback(async () => {
    if (!state.requestId) return null;

    try {
      const response = await otpApi.checkOTPStatus(state.requestId);

      if (response.success && response.data) {
        const status = response.data.status;

        setState((prev) => ({
          ...prev,
          isExpired: status === "expired",
          success: status === "verified",
        }));

        return response.data;
      }
    } catch (error) {
      console.warn("Failed to check OTP status:", error);
    }

    return null;
  }, [state.requestId]);

  // Reset verification state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    setState((prev) => ({
      ...prev,
      requestId: "",
      isRequesting: false,
      isVerifying: false,
      isResending: false,
      attempts: 0,
      canResend: true,
      resendCooldown: 0,
      sessionExpiry: 0,
      isExpired: false,
      isLocked: false,
      lockoutEnd: null,
      error: null,
      success: false,
    }));

    retryCountRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    requestOTP,
    verifyOTP,
    resendOTP,
    checkOTPStatus,
    reset,

    // Computed values
    isActive: !!state.requestId && !state.success && !state.isExpired,
    canVerify:
      !!state.phoneNumber &&
      !!state.requestId &&
      !state.isExpired &&
      !state.isLocked,
    isLoading: state.isRequesting || state.isVerifying || state.isResending,
    hasError: !!state.error,

    // Timer helpers
    getRemainingTime: () => {
      if (!state.requestId || !state.sessionExpiry) return 0;
      const requestTime = parseInt(state.requestId.substring(0, 8), 36) * 1000;
      const elapsed = (Date.now() - requestTime) / 1000;
      return Math.max(0, state.sessionExpiry - elapsed);
    },

    getLockoutRemainingTime: () => {
      if (!state.lockoutEnd) return 0;
      return Math.max(
        0,
        Math.floor((state.lockoutEnd.getTime() - Date.now()) / 1000),
      );
    },
  };
};

export default useOTPVerification;
