/**
 * OTP Verification Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOTPVerification } from '../use-otp-verification';

// Mock the OTP API
jest.mock('@/lib/api/endpoints/otp', () => ({
  otpApi: {
    requestOTP: jest.fn(),
    verifyOTP: jest.fn(),
    resendOTP: jest.fn(),
    checkOTPStatus: jest.fn()
  }
}));

// Mock the auth store
jest.mock('@/store/use-auth-store', () => ({
  useAuthStore: {
    getState: jest.fn()
  }
}));

import { otpApi } from '@/lib/api/endpoints/otp';
import { useAuthStore } from '@/store/use-auth-store';

const mockOtpApi = otpApi as jest.Mocked<typeof otpApi>;
const mockUseAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>;

describe('useOTPVerification Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockOtpApi.requestOTP.mockResolvedValue({
      success: true,
      data: {
        requestId: 'test-request-id',
        telco: {
          code: 'VIETTEL',
          name: 'Viettel',
          otpLength: 4,
          supportsShortCode: true,
          color: '#0033A0'
        },
        expiry: 300,
        maxAttempts: 3,
        resendCooldown: 60
      }
    });

    mockOtpApi.verifyOTP.mockResolvedValue({
      success: true,
      data: {
        verified: true
      }
    });

    mockOtpApi.resendOTP.mockResolvedValue({
      success: true,
      data: {
        expiry: 300
      }
    });

    mockOtpApi.checkOTPStatus.mockResolvedValue({
      success: true,
      data: {
        status: 'pending'
      }
    });

    mockUseAuthStore.getState.mockReturnValue({
      user: null
    });
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useOTPVerification());

    expect(result.current.phoneNumber).toBe('');
    expect(result.current.isRequesting).toBe(false);
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.isResending).toBe(false);
    expect(result.current.attempts).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  test('initializes with initial phone number', () => {
    const { result } = renderHook(() => useOTPVerification({
      phoneNumber: '0961234567'
    }));

    expect(result.current.phoneNumber).toBe('0961234567');
  });

  test('requests OTP successfully', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useOTPVerification({
      onSuccess
    }));

    await act(async () => {
      const requestId = await result.current.requestOTP('0961234567');
      expect(requestId).toBe('test-request-id');
    });

    expect(mockOtpApi.requestOTP).toHaveBeenCalledWith('0961234567');
    expect(result.current.isRequesting).toBe(false);
    expect(result.current.requestId).toBe('test-request-id');
    expect(result.current.phoneNumber).toBe('0961234567');
    expect(result.current.attempts).toBe(0);
    expect(result.current.telcoInfo).toEqual({
      code: 'VIETTEL',
      name: 'Viettel',
      otpLength: 4,
      supportsShortCode: true,
      color: '0033A0'
    });
  });

  test('handles OTP request failure', async () => {
    const onError = jest.fn();
    mockOtpApi.requestOTP.mockRejectedValue(new Error('Request failed'));

    const { result } = renderHook(() => useOTPVerification({
      onError
    }));

    await act(async () => {
      await expect(result.current.requestOTP('0961234567')).rejects.toThrow('Request failed');
    });

    expect(result.current.isRequesting).toBe(false);
    expect(result.current.error).toBe('Request failed');
    expect(onError).toHaveBeenCalled();
  });

  test('verifies OTP successfully', async () => {
    const onSuccess = jest.fn();

    // First request OTP
    const { result } = renderHook(() => useOTPVerification({
      onSuccess
    }));

    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Then verify OTP
    await act(async () => {
      const success = await result.current.verifyOTP('1234');
      expect(success).toBe(true);
    });

    expect(mockOtpApi.verifyOTP).toHaveBeenCalledWith(
      '0961234567',
      '1234',
      'test-request-id',
      expect.objectContaining({
        deviceFingerprint: expect.any(String),
        userAgent: expect.any(String)
      })
    );

    expect(result.current.success).toBe(true);
    expect(result.current.isVerifying).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith('0961234567');
  });

  test('handles OTP verification failure', async () => {
    const onError = jest.fn();
    mockOtpApi.verifyOTP.mockResolvedValue({
      success: false,
      message: 'Invalid OTP'
    });

    const { result } = renderHook(() => useOTPVerification({
      onError
    }));

    // First request OTP
    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Then verify OTP with wrong code
    await act(async () => {
      await expect(result.current.verifyOTP('9999')).rejects.toThrow('Invalid OTP');
    });

    expect(result.current.attempts).toBe(1);
    expect(result.current.error).toBe('Invalid OTP');
    expect(onError).toHaveBeenCalled();
  });

  test('locks session after max attempts', async () => {
    const onLockout = jest.fn();
    mockOtpApi.verifyOTP.mockResolvedValue({
      success: false,
      message: 'Invalid OTP'
    });

    const { result } = renderHook(() => useOTPVerification({
      maxAttempts: 2,
      onLockout
    }));

    // First request OTP
    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Fail verification twice (max attempts = 2)
    await act(async () => {
      await expect(result.current.verifyOTP('9999')).rejects.toThrow('Invalid OTP');
    });

    await act(async () => {
      await expect(result.current.verifyOTP('9999')).rejects.toThrow('Invalid OTP');
    });

    expect(result.current.isLocked).toBe(true);
    expect(result.current.attempts).toBe(2);
    expect(onLockout).toHaveBeenCalled();
  });

  test('resends OTP successfully', async () => {
    const { result } = renderHook(() => useOTPVerification());

    // First request OTP
    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Then resend OTP
    await act(async () => {
      const success = await result.current.resendOTP();
      expect(success).toBe(true);
    });

    expect(mockOtpApi.resendOTP).toHaveBeenCalledWith(
      '0961234567',
      'test-request-id'
    );

    expect(result.current.isResending).toBe(false);
    expect(result.current.canResend).toBe(false); // Should be in cooldown
  });

  test('checks OTP status', async () => {
    const { result } = renderHook(() => useOTPVerification());

    // First request OTP
    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Check status
    await act(async () => {
      const status = await result.current.checkOTPStatus();
      expect(status).toEqual({
        status: 'pending'
      });
    });

    expect(mockOtpApi.checkOTPStatus).toHaveBeenCalledWith('test-request-id');
  });

  test('handles session expiry', async () => {
    const onSessionExpiry = jest.fn();
    mockOtpApi.checkOTPStatus.mockResolvedValue({
      success: true,
      data: {
        status: 'expired'
      }
    });

    const { result } = renderHook(() => useOTPVerification({
      onSessionExpiry,
      autoRefresh: true
    }));

    // Request OTP
    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Check status and handle expiry
    await act(async () => {
      await result.current.checkOTPStatus();
    });

    expect(result.current.isExpired).toBe(true);
    expect(onSessionExpiry).toHaveBeenCalled();
  });

  test('resets state correctly', () => {
    const { result } = renderHook(() => useOTPVerification());

    // Simulate some state
    act(() => {
      result.current.setPhoneNumber('0961234567');
      result.current.setOTPRequest('test-request-id');
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.phoneNumber).toBe('');
    expect(result.current.requestId).toBe('');
    expect(result.current.attempts).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  test('provides computed values', () => {
    const { result } = renderHook(() => useOTPVerification());

    expect(result.current.isActive).toBe(false);
    expect(result.current.canVerify).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  test('provides timer helpers', () => {
    const { result } = renderHook(() => useOTPVerification({
      initialPhoneNumber: '0961234567'
    }));

    // Set a session
    act(() => {
      result.current.setOTPRequest('test-request-id');
    });

    const remainingTime = result.current.getRemainingTime();
    expect(typeof remainingTime).toBe('number');
  });

  test('updates user on successful verification', async () => {
    const mockUser = { id: '1', username: 'test', email: 'test@example.com' };
    mockUseAuthStore.getState.mockReturnValue({
      user: mockUser
    });

    const { result } = renderHook(() => useOTPVerification());

    // Request OTP
    await act(async () => {
      await result.current.requestOTP('0961234567');
    });

    // Verify OTP
    await act(async () => {
      await result.current.verifyOTP('1234');
    });

    expect(mockUseAuthStore.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          phone: '0961234567'
        })
      })
    );
  });

  test('handles learning mode', async () => {
    const { result } = renderHook(() => useOTPVerification({
      enableLearning: true
    }));

    await act(async () => {
      await result.current.requestOTP('0961234567');
      await result.current.verifyOTP('1234');
    });

    // Should not throw any errors with learning enabled
    expect(result.current.success).toBe(true);
  });
});