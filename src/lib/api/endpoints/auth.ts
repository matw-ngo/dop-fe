import apiClient from "../client";
import type { paths } from "../v1.d.ts";

/**
 * Authentication API endpoints
 */
export const authApi = {
  // Login
  login: async (credentials: paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/auth/login", {
      body: credentials,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.POST("/auth/logout");
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.POST("/auth/refresh", {
      body: { refreshToken },
    });
    return response.data;
  },

  // Register user
  register: async (userData: paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/auth/register", {
      body: userData,
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await apiClient.POST("/auth/verify-email", {
      body: { token },
    });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.POST("/auth/forgot-password", {
      body: { email },
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.POST("/auth/reset-password", {
      body: { token, newPassword },
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.POST("/auth/change-password", {
      body: { currentPassword, newPassword },
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.GET("/auth/profile");
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData: paths["/auth/profile"]["put"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.PUT("/auth/profile", {
      body: profileData,
    });
    return response.data;
  },

  // Get user permissions
  getPermissions: async () => {
    const response = await apiClient.GET("/auth/permissions");
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string) => {
    const response = await apiClient.DELETE("/auth/account", {
      body: { password },
    });
    return response.data;
  },
};

/**
 * Social Authentication API endpoints
 */
export const socialAuthApi = {
  // Get social login URLs
  getSocialLoginUrls: async () => {
    const response = await apiClient.GET("/auth/social");
    return response.data;
  },

  // Social login callback
  socialLoginCallback: async (provider: string, code: string, state?: string) => {
    const response = await apiClient.POST("/auth/social/{provider}/callback", {
      params: {
        path: { provider },
      },
      body: { code, state },
    });
    return response.data;
  },

  // Link social account
  linkSocialAccount: async (provider: string, token: string) => {
    const response = await apiClient.POST("/auth/social/{provider}/link", {
      params: {
        path: { provider },
      },
      body: { token },
    });
    return response.data;
  },

  // Unlink social account
  unlinkSocialAccount: async (provider: string) => {
    const response = await apiClient.DELETE("/auth/social/{provider}", {
      params: {
        path: { provider },
      },
    });
    return response.data;
  },
};

/**
 * Authentication Admin API endpoints (admin only)
 */
export const authAdminApi = {
  // Get all users
  getAllUsers: async (params?: paths["/admin/users"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/users", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Create user
  createUser: async (userData: paths["/admin/users"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/admin/users", {
      body: userData,
    });
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: paths["/admin/users/{id}"]["put"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.PUT("/admin/users/{id}", {
      params: {
        path: { id: userId },
      },
      body: userData,
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await apiClient.DELETE("/admin/users/{id}", {
      params: {
        path: { id: userId },
      },
    });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: string, role: string) => {
    const response = await apiClient.PATCH("/admin/users/{id}/role", {
      params: {
        path: { id: userId },
      },
      body: { role },
    });
    return response.data;
  },

  // Block user
  blockUser: async (userId: string, reason: string) => {
    const response = await apiClient.POST("/admin/users/{id}/block", {
      params: {
        path: { id: userId },
      },
      body: { reason },
    });
    return response.data;
  },

  // Unblock user
  unblockUser: async (userId: string) => {
    const response = await apiClient.DELETE("/admin/users/{id}/block", {
      params: {
        path: { id: userId },
      },
    });
    return response.data;
  },

  // Get user sessions
  getUserSessions: async (userId: string) => {
    const response = await apiClient.GET("/admin/users/{id}/sessions", {
      params: {
        path: { id: userId },
      },
    });
    return response.data;
  },

  // Revoke user session
  revokeSession: async (userId: string, sessionId: string) => {
    const response = await apiClient.DELETE("/admin/users/{id}/sessions/{sessionId}", {
      params: {
        path: { id: userId, sessionId },
      },
    });
    return response.data;
  },

  // Get auth statistics
  getAuthStats: async (params?: paths["/admin/auth/stats"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/auth/stats", {
      params: {
        query: params,
      },
    });
    return response.data;
  },
};

export default authApi;