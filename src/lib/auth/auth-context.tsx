"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { getLocalizedRedirect } from "@/lib/client-utils";
import type { AuthState } from "@/store/use-auth-store";
import { useTranslations } from "next-intl";

interface AuthContextType {
  user: AuthState["user"];
  isAuthenticated: AuthState["isAuthenticated"];
  isLoading: AuthState["isLoading"];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    checkAuth,
  } = useAuthStore();
  const t = useTranslations("admin.auth");

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Enhanced login function with locale-aware redirect
  const login = async (username: string, password: string): Promise<boolean> => {
    const success = await storeLogin(username, password);
    if (success) {
      // Show success toast
      // Note: In a real implementation, you might want to use a toast library
      console.log(t("loginSuccess", { username }));
      
      // Redirect to admin dashboard with locale
      const adminPath = getLocalizedRedirect("/admin", pathname);
      router.push(adminPath);
    }
    return success;
  };

  // Enhanced logout function with locale-aware redirect
  const logout = () => {
    storeLogout();
    // Show logout toast
    // Note: In a real implementation, you might want to use a toast library
    console.log(t("logoutSuccess"));
    
    // Redirect to login page with locale
    const loginPath = getLocalizedRedirect("/admin/login", pathname);
    router.push(loginPath);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}