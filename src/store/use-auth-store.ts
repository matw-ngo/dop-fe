import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  verifiedPhone?: string;
  telco?: string;
}

export interface OTPSession {
  phoneNumber: string;
  requestId: string;
  telcoCode?: string;
  otpLength: 4 | 6;
  maxAttempts: number;
  currentAttempts: number;
  resendCooldown: number;
  sessionExpiry: number;
  isExpired: boolean;
  isLocked: boolean;
  lockoutEnd: Date | null;
  createdAt: Date;
  lastActivity: Date;
}

export interface OTPVerificationState {
  // OTP Session state
  otpSession: OTPSession | null;
  hasActiveSession: boolean;
  isRequestingOTP: boolean;
  isVerifyingOTP: boolean;
  isResendingOTP: boolean;

  // OTP Flow state
  currentStep: 'idle' | 'phone' | 'otp' | 'verified' | 'locked';
  phoneNumber: string;
  verificationCode: string;
  telcoInfo: any;

  // Timer states
  resendCooldownRemaining: number;
  sessionTimeRemaining: number;
  lockoutTimeRemaining: number;
}

export interface AuthState {
  // Core auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // OTP state
  otp: OTPVerificationState;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;

  // OTP Actions
  requestOTP: (phoneNumber: string) => Promise<string | null>;
  verifyOTP: (otpCode: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  checkOTPStatus: () => Promise<any>;
  cancelOTPSession: () => void;
  resetOTPState: () => void;

  // OTP State setters
  setOTPSession: (session: OTPSession | null) => void;
  setCurrentOTPStep: (step: OTPVerificationState['currentStep']) => void;
  setPhoneNumber: (phone: string) => void;
  setVerificationCode: (code: string) => void;
  setTelcoInfo: (telco: any) => void;
  setResendCooldown: (seconds: number) => void;
  incrementOTPAttempts: () => void;
  lockOTPSession: (lockoutEnd: Date) => void;
  updateLastActivity: () => void;

  // Getters
  getOTPStatus: () => {
    canVerify: boolean;
    canResend: boolean;
    isLocked: boolean;
    isExpired: boolean;
    attemptsRemaining: number;
  };
}

// Dummy admin user for authentication
const DUMMY_ADMIN_USER: User = {
  id: "1",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Core auth state
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until hydration is complete
      isHydrated: false, // Track if state has been hydrated from storage

      // OTP state
      otp: {
        otpSession: null,
        hasActiveSession: false,
        isRequestingOTP: false,
        isVerifyingOTP: false,
        isResendingOTP: false,
        currentStep: 'idle',
        phoneNumber: '',
        verificationCode: '',
        telcoInfo: null,
        resendCooldownRemaining: 0,
        sessionTimeRemaining: 0,
        lockoutTimeRemaining: 0,
      },

      // Core auth actions
      login: async (username: string, password: string) => {
        set({ isLoading: true });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Dummy authentication logic
        if (username === "admin" && password === "admin123") {
          set({
            user: DUMMY_ADMIN_USER,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => {
        // Clear OTP session on logout
        get().resetOTPState();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const { user } = get();
        if (user) {
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // OTP Actions
      requestOTP: async (phoneNumber: string) => {
        const state = get();

        if (state.otp.isRequestingOTP) {
          return null;
        }

        set((prev) => ({
          otp: {
            ...prev.otp,
            isRequestingOTP: true,
            phoneNumber,
            currentStep: 'otp',
          }
        }));

        try {
          // Import OTP API dynamically to avoid circular dependencies
          const { otpApi } = await import('@/lib/api/endpoints/otp');

          const response = await otpApi.requestOTP(phoneNumber);

          if (response.success && response.data) {
            const otpSession: OTPSession = {
              phoneNumber,
              requestId: response.data.requestId,
              telcoCode: response.data.telco?.code,
              otpLength: response.data.telco?.otpLength || 6,
              maxAttempts: response.data.maxAttempts || 3,
              currentAttempts: 0,
              resendCooldown: response.data.resendCooldown || 90,
              sessionExpiry: response.data.expiry || 600,
              isExpired: false,
              isLocked: false,
              lockoutEnd: null,
              createdAt: new Date(),
              lastActivity: new Date(),
            };

            set((prev) => ({
              otp: {
                ...prev.otp,
                otpSession,
                hasActiveSession: true,
                isRequestingOTP: false,
                telcoInfo: response.data.telco,
                resendCooldownRemaining: otpSession.resendCooldown,
                sessionTimeRemaining: otpSession.sessionExpiry,
                currentStep: 'otp',
              }
            }));

            return response.data.requestId;
          } else {
            throw new Error(response.message || 'Failed to request OTP');
          }
        } catch (error) {
          set((prev) => ({
            otp: {
              ...prev.otp,
              isRequestingOTP: false,
              currentStep: 'phone',
            }
          }));
          throw error;
        }
      },

      verifyOTP: async (otpCode: string) => {
        const state = get();

        if (!state.otp.otpSession || state.otp.isVerifyingOTP) {
          return false;
        }

        if (state.otp.isLocked) {
          throw new Error('Session is locked due to too many failed attempts');
        }

        set((prev) => ({
          otp: {
            ...prev.otp,
            isVerifyingOTP: true,
            verificationCode: otpCode,
          }
        }));

        try {
          const { otpApi } = await import('@/lib/api/endpoints/otp');

          const response = await otpApi.verifyOTP(
            state.otp.otpSession.phoneNumber,
            otpCode,
            state.otp.otpSession.requestId
          );

          if (response.success && response.data?.verified) {
            // Update user with verified phone
            const { user } = get();
            if (user) {
              const updatedUser: User = {
                ...user,
                verifiedPhone: state.otp.otpSession.phoneNumber,
                telco: state.otp.otpSession.telcoCode,
              };

              set({
                user: updatedUser,
                otp: {
                  ...state.otp,
                  isVerifyingOTP: false,
                  currentStep: 'verified',
                  hasActiveSession: false,
                  otpSession: null,
                }
              });
            } else {
              set((prev) => ({
                otp: {
                  ...prev.otp,
                  isVerifyingOTP: false,
                  currentStep: 'verified',
                  hasActiveSession: false,
                  otpSession: null,
                }
              }));
            }

            return true;
          } else {
            // Increment failed attempts
            const newAttempts = state.otp.otpSession.currentAttempts + 1;
            const isLocked = newAttempts >= state.otp.otpSession.maxAttempts;
            const lockoutEnd = isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;

            if (isLocked) {
              get().lockOTPSession(lockoutEnd);
            } else {
              get().incrementOTPAttempts();
            }

            set((prev) => ({
              otp: {
                ...prev.otp,
                isVerifyingOTP: false,
                isLocked,
                lockoutEnd,
              }
            }));

            throw new Error(response.message || 'Invalid OTP code');
          }
        } catch (error) {
          set((prev) => ({
            otp: {
              ...prev.otp,
              isVerifyingOTP: false,
            }
          }));
          throw error;
        }
      },

      resendOTP: async () => {
        const state = get();

        if (!state.otp.otpSession || state.otp.isResendingOTP || state.otp.resendCooldownRemaining > 0) {
          return false;
        }

        set((prev) => ({
          otp: {
            ...prev.otp,
            isResendingOTP: true,
          }
        }));

        try {
          const { otpApi } = await import('@/lib/api/endpoints/otp');

          const response = await otpApi.resendOTP(
            state.otp.otpSession.phoneNumber,
            state.otp.otpSession.requestId
          );

          if (response.success) {
            const newSessionExpiry = response.data?.expiry || state.otp.otpSession.sessionExpiry;

            set((prev) => ({
              otp: {
                ...prev.otp,
                isResendingOTP: false,
                resendCooldownRemaining: state.otp.otpSession.resendCooldown,
                sessionTimeRemaining: newSessionExpiry,
                otpSession: prev.otpSession ? {
                  ...prev.otpSession,
                  lastActivity: new Date(),
                  sessionExpiry: newSessionExpiry,
                } : null,
              }
            }));

            return true;
          } else {
            throw new Error(response.message || 'Failed to resend OTP');
          }
        } catch (error) {
          set((prev) => ({
            otp: {
              ...prev.otp,
              isResendingOTP: false,
            }
          }));
          throw error;
        }
      },

      checkOTPStatus: async () => {
        const state = get();

        if (!state.otp.otpSession) {
          return null;
        }

        try {
          const { otpApi } = await import('@/lib/api/endpoints/otp');

          const response = await otpApi.checkOTPStatus(state.otp.otpSession.requestId);

          // Update session status based on response
          if (response.data?.status) {
            const status = response.data.status;

            if (status === 'expired') {
              set((prev) => ({
                otp: {
                  ...prev.otp,
                  otpSession: prev.otpSession ? {
                    ...prev.otpSession,
                    isExpired: true,
                  } : null,
                }
              }));
            } else if (status === 'verified') {
              set((prev) => ({
                otp: {
                  ...prev.otp,
                  currentStep: 'verified',
                  hasActiveSession: false,
                  otpSession: null,
                }
              }));
            }
          }

          return response.data;
        } catch (error) {
          console.warn('Failed to check OTP status:', error);
          return null;
        }
      },

      cancelOTPSession: () => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            currentStep: 'idle',
            hasActiveSession: false,
            otpSession: null,
            phoneNumber: '',
            verificationCode: '',
            telcoInfo: null,
            resendCooldownRemaining: 0,
            sessionTimeRemaining: 0,
            lockoutTimeRemaining: 0,
          }
        }));
      },

      resetOTPState: () => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            currentStep: 'idle',
            hasActiveSession: false,
            otpSession: null,
            phoneNumber: '',
            verificationCode: '',
            telcoInfo: null,
            resendCooldownRemaining: 0,
            sessionTimeRemaining: 0,
            lockoutTimeRemaining: 0,
            isLocked: false,
          }
        }));
      },

      // OTP State setters
      setOTPSession: (session) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            otpSession: session,
            hasActiveSession: !!session,
          }
        }));
      },

      setCurrentOTPStep: (step) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            currentStep: step,
          }
        }));
      },

      setPhoneNumber: (phone) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            phoneNumber: phone,
          }
        }));
      },

      setVerificationCode: (code) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            verificationCode: code,
          }
        }));
      },

      setTelcoInfo: (telco) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            telcoInfo: telco,
          }
        }));
      },

      setResendCooldown: (seconds) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            resendCooldownRemaining: seconds,
          }
        }));
      },

      incrementOTPAttempts: () => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            otpSession: prev.otpSession ? {
              ...prev.otpSession,
              currentAttempts: prev.otpSession.currentAttempts + 1,
              lastActivity: new Date(),
            } : null,
          }
        }));
      },

      lockOTPSession: (lockoutEnd) => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            isLocked: true,
            lockoutTimeRemaining: Math.ceil((lockoutEnd.getTime() - Date.now()) / 1000),
            currentStep: 'locked',
            otpSession: prev.otpSession ? {
              ...prev.otpSession,
              isLocked: true,
              lockoutEnd,
            } : null,
          }
        }));
      },

      updateLastActivity: () => {
        set((prev) => ({
          otp: {
            ...prev.otp,
            otpSession: prev.otpSession ? {
              ...prev.otpSession,
              lastActivity: new Date(),
            } : null,
          }
        }));
      },

      // Getters
      getOTPStatus: () => {
        const state = get();
        const session = state.otp.otpSession;

        if (!session) {
          return {
            canVerify: false,
            canResend: false,
            isLocked: false,
            isExpired: false,
            attemptsRemaining: 0,
          };
        }

        const canVerify = !state.otp.isLocked && !session.isExpired && state.otp.currentStep === 'otp';
        const canResend = !state.otp.isLocked && state.otp.resendCooldownRemaining === 0;
        const isLocked = state.otp.isLocked || session.isLocked;
        const isExpired = session.isExpired || state.otp.sessionTimeRemaining <= 0;
        const attemptsRemaining = session.maxAttempts - session.currentAttempts;

        return {
          canVerify,
          canResend,
          isLocked,
          isExpired,
          attemptsRemaining,
        };
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist OTP state as it's session-based
      }),
      onRehydrateStorage: () => (state) => {
        // This function is called after rehydration is complete
        if (state) {
          state.isHydrated = true;
          state.isLoading = false;

          // Reset OTP state on hydration since it's session-based
          state.otp = {
            otpSession: null,
            hasActiveSession: false,
            isRequestingOTP: false,
            isVerifyingOTP: false,
            isResendingOTP: false,
            currentStep: 'idle',
            phoneNumber: '',
            verificationCode: '',
            telcoInfo: null,
            resendCooldownRemaining: 0,
            sessionTimeRemaining: 0,
            lockoutTimeRemaining: 0,
          };

          // Set authentication status based on rehydrated user
          if (state.user) {
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
          }
        }
      },
    },
  ),
);
