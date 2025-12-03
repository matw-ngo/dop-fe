import apiClient from "../client";
import type { paths } from "../v1.d.ts";

/**
 * OTP Verification API endpoints
 */
export const otpApi = {
  // Request OTP
  requestOTP: async (phoneNumber: string, provider?: string) => {
    const response = await apiClient.POST("/otp/request", {
      body: {
        phoneNumber,
        provider: provider || "auto", // auto-detect or specify: viettel, mobifone, vinaphone
      },
    });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (phoneNumber: string, otpCode: string, requestId?: string) => {
    const response = await apiClient.POST("/otp/verify", {
      body: {
        phoneNumber,
        otpCode,
        requestId,
      },
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (phoneNumber: string, requestId?: string) => {
    const response = await apiClient.POST("/otp/resend", {
      body: {
        phoneNumber,
        requestId,
      },
    });
    return response.data;
  },

  // Check OTP status
  checkOTPStatus: async (requestId: string) => {
    const response = await apiClient.GET("/otp/status/{requestId}", {
      params: {
        path: { requestId },
      },
    });
    return response.data;
  },

  // Get OTP request limits
  getOTPLimits: async () => {
    const response = await apiClient.GET("/otp/limits");
    return response.data;
  },

  // Validate phone number format and detect provider
  validatePhoneNumber: async (phoneNumber: string) => {
    const response = await apiClient.POST("/otp/validate-phone", {
      body: { phoneNumber },
    });
    return response.data;
  },
};

/**
 * OTP Admin API endpoints (admin only)
 */
export const otpAdminApi = {
  // Get OTP statistics
  getOTPStats: async (params?: paths["/admin/otp/stats"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/otp/stats", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Get OTP verification logs
  getOTPLogs: async (params?: paths["/admin/otp/logs"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/otp/logs", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Block phone number from OTP
  blockPhoneNumber: async (phoneNumber: string, reason: string) => {
    const response = await apiClient.POST("/admin/otp/block", {
      body: {
        phoneNumber,
        reason,
      },
    });
    return response.data;
  },

  // Unblock phone number
  unblockPhoneNumber: async (phoneNumber: string) => {
    const response = await apiClient.DELETE("/admin/otp/block/{phoneNumber}", {
      params: {
        path: { phoneNumber },
      },
    });
    return response.data;
  },

  // Get blocked phone numbers
  getBlockedNumbers: async () => {
    const response = await apiClient.GET("/admin/otp/blocked");
    return response.data;
  },
};

export default otpApi;