import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
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
      user: null,
      isAuthenticated: false,
      isLoading: false,

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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);