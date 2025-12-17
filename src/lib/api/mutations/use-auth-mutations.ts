// @ts-nocheck
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/use-auth-store";
import { authApi, socialAuthApi } from "../endpoints/auth";
import type { paths } from "../v1.d.ts";

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: (
      credentials: paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"],
    ) => authApi.login(credentials),
    onSuccess: async (data) => {
      // Store tokens in auth store
      await storeLogin(credentials.username, credentials.password);

      toast.success("Đăng nhập thành công", {
        description: `Chào mừng trở lại, ${data.user.username}!`,
      });

      // Invalidate queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error: any) => {
      let message = "Đăng nhập thất bại";
      let description = "Tên đăng nhập hoặc mật khẩu không chính xác";

      if (error?.response?.status === 429) {
        message = "Quá nhiều lần thử";
        description = "Vui lòng thử lại sau vài phút";
      } else if (error?.response?.status === 403) {
        message = "Tài khoản bị khóa";
        description = "Vui lòng liên hệ quản trị viên";
      } else if (error?.response?.status >= 500) {
        message = "Lỗi máy chủ";
        description = "Vui lòng thử lại sau";
      } else if (error?.message) {
        description = error.message;
      }

      toast.error(message, { description });
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      // Clear auth store
      storeLogout();

      toast.success("Đăng xuất thành công");

      // Clear all queries from cache
      queryClient.clear();
    },
    onError: (error) => {
      // Even if API call fails, clear local auth state
      storeLogout();
      queryClient.clear();

      toast.error("Đăng xuất thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      userData: paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"],
    ) => authApi.register(userData),
    onSuccess: (data) => {
      toast.success("Đăng ký thành công", {
        description: "Vui lòng kiểm tra email để xác thực tài khoản",
      });

      // Invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      let message = "Đăng ký thất bại";
      let description = "Vui lòng thử lại sau";

      if (error?.response?.status === 409) {
        message = "Email đã tồn tại";
        description = "Vui lòng sử dụng email khác hoặc đăng nhập";
      } else if (error?.response?.status === 400) {
        description = error.message || "Thông tin không hợp lệ";
      } else if (error?.message) {
        description = error.message;
      }

      toast.error(message, { description });
    },
  });
}

/**
 * Hook for password reset
 */
export function usePasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: () => {
      toast.success("Email đặt lại mật khẩu đã được gửi", {
        description: "Vui lòng kiểm tra hộp thư của bạn",
      });
    },
    onError: (error: any) => {
      let message = "Gửi email thất bại";
      let description = "Vui lòng thử lại sau";

      if (error?.response?.status === 404) {
        message = "Email không tồn tại";
        description = "Vui lòng kiểm tra lại email đã nhập";
      } else if (error?.message) {
        description = error.message;
      }

      toast.error(message, { description });
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công", {
        description: "Mật khẩu của bạn đã được cập nhật",
      });
    },
    onError: (error: any) => {
      const message = "Đổi mật khẩu thất bại";
      let description = "Vui lòng thử lại sau";

      if (error?.response?.status === 400) {
        description = "Mật khẩu hiện tại không chính xác";
      } else if (error?.message) {
        description = error.message;
      }

      toast.error(message, { description });
    },
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      profileData: paths["/auth/profile"]["put"]["requestBody"]["content"]["application/json"],
    ) => authApi.updateProfile(profileData),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công");

      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error("Cập nhật thông tin thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

/**
 * Hook for social login
 */
export function useSocialLogin() {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: ({
      provider,
      code,
      state,
    }: {
      provider: string;
      code: string;
      state?: string;
    }) => socialAuthApi.socialLoginCallback(provider, code, state),
    onSuccess: async (data) => {
      // Store authentication data
      await storeLogin(data.user.username, "", data.accessToken);

      toast.success("Đăng nhập bằng mạng xã hội thành công", {
        description: `Chào mừng ${data.user.username}!`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error) => {
      toast.error("Đăng nhập mạng xã hội thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

/**
 * Admin mutations for user management
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      userData: paths["/admin/users"]["post"]["requestBody"]["content"]["application/json"],
    ) => authAdminApi.createUser(userData),
    onSuccess: () => {
      toast.success("Tạo người dùng thành công");

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error) => {
      toast.error("Tạo người dùng thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: paths["/admin/users/{id}"]["put"]["requestBody"]["content"]["application/json"];
    }) => authAdminApi.updateUser(userId, userData),
    onSuccess: (_, variables) => {
      toast.success("Cập nhật người dùng thành công");

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({
        queryKey: ["adminUser", variables.userId],
      });
    },
    onError: (error) => {
      toast.error("Cập nhật người dùng thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authAdminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success("Xóa người dùng thành công");

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error) => {
      toast.error("Xóa người dùng thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      authAdminApi.updateUserRole(userId, role),
    onSuccess: (_, variables) => {
      toast.success("Cập nhật vai trò thành công");

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({
        queryKey: ["adminUser", variables.userId],
      });
    },
    onError: (error) => {
      toast.error("Cập nhật vai trò thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      authAdminApi.blockUser(userId, reason),
    onSuccess: (_, variables) => {
      toast.success("Khóa người dùng thành công");

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({
        queryKey: ["adminUser", variables.userId],
      });
    },
    onError: (error) => {
      toast.error("Khóa người dùng thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

export default {
  useLogin,
  useLogout,
  useRegister,
  usePasswordReset,
  useChangePassword,
  useUpdateProfile,
  useSocialLogin,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserRole,
  useBlockUser,
};
