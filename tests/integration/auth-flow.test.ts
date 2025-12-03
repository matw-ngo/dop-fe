import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/auth-context";
import { useAuthStore } from "@/store/use-auth-store";
import { messages } from "../../../messages/vi.json";

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="vi" messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Mock components for testing
const TestLoginComponent = () => {
  const { login, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const success = await login("admin", "admin123");
    if (success) {
      // Handle successful login
    }
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </div>
      <div data-testid="loading-status">
        {isLoading ? "Loading" : "Not Loading"}
      </div>
      <button
        data-testid="login-button"
        onClick={handleLogin}
        disabled={isLoading}
      >
        Login
      </button>
    </div>
  );
};

const TestProtectedComponent = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <div data-testid="protected-content">Access Denied</div>;
  }

  return (
    <div>
      <div data-testid="protected-content">Welcome, {user?.username}!</div>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
    });
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe("Login Flow", () => {
    it("should handle successful login flow", async () => {
      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      // Initial state
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
      expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");

      // Click login button
      fireEvent.click(screen.getByTestId("login-button"));

      // Should show loading state
      expect(screen.getByTestId("loading-status")).toHaveTextContent("Loading");
      expect(screen.getByTestId("login-button")).toBeDisabled();

      // Wait for successful login
      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");
      });

      // Button should be enabled again
      expect(screen.getByTestId("login-button")).toBeEnabled();
    });

    it("should handle failed login flow", async () => {
      // Mock failed login
      const originalLogin = useAuthStore.getState().login;
      useAuthStore.setState({
        login: async (username: string, password: string) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return false; // Simulate failed login
        },
      });

      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      // Click login button
      fireEvent.click(screen.getByTestId("login-button"));

      // Wait for login attempt to complete
      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");
      });

      // Restore original login function
      useAuthStore.setState({ login: originalLogin });
    });

    it("should persist login state across component unmounts", async () => {
      // First render and login
      const { unmount } = render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("login-button"));

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      });

      // Unmount component
      unmount();

      // Re-mount component
      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      // Should still be authenticated (localStorage persistence)
      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      });
    });
  });

  describe("Protected Component Flow", () => {
    it("should show access denied for unauthenticated users", () => {
      render(
        <TestWrapper>
          <TestProtectedComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId("protected-content")).toHaveTextContent("Access Denied");
    });

    it("should show protected content for authenticated users", async () => {
      // First authenticate user
      const authStore = useAuthStore.getState();
      await authStore.login("admin", "admin123");

      render(
        <TestWrapper>
          <TestProtectedComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toHaveTextContent("Welcome, admin!");
      });
    });

    it("should handle logout flow", async () => {
      // First authenticate user
      const authStore = useAuthStore.getState();
      await authStore.login("admin", "admin123");

      render(
        <TestWrapper>
          <TestProtectedComponent />
        </TestWrapper>
      );

      // Verify authenticated state
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toHaveTextContent("Welcome, admin!");
      });

      // Click logout
      fireEvent.click(screen.getByTestId("logout-button"));

      // Should show access denied
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toHaveTextContent("Access Denied");
      });
    });
  });

  describe("Auth State Hydration", () => {
    it("should properly hydrate from localStorage", async () => {
      // Manually set localStorage with auth data
      const authData = {
        state: {
          user: {
            id: "test-user-1",
            username: "testuser",
            email: "test@example.com",
            role: "user" as const,
          },
          isAuthenticated: true,
          isHydrated: true,
        },
        version: 0,
      };

      localStorage.setItem("auth-storage", JSON.stringify(authData));

      render(
        <TestWrapper>
          <TestProtectedComponent />
        </TestWrapper>
      );

      // Should hydrate and show authenticated content
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toHaveTextContent("Welcome, testuser!");
      });
    });

    it("should handle corrupted localStorage data", async () => {
      // Set corrupted localStorage data
      localStorage.setItem("auth-storage", "invalid-json");

      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      // Should handle gracefully and show unauthenticated state
      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");
      });
    });

    it("should handle empty localStorage", async () => {
      // Ensure localStorage is empty
      localStorage.removeItem("auth-storage");

      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      // Should show unauthenticated state after hydration
      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors during login", async () => {
      // Mock network error
      const originalLogin = useAuthStore.getState().login;
      useAuthStore.setState({
        login: async () => {
          throw new Error("Network error");
        },
      });

      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("login-button"));

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");
      });

      // Restore original login function
      useAuthStore.setState({ login: originalLogin });
    });

    it("should handle timeout during login", async () => {
      // Mock timeout
      const originalLogin = useAuthStore.getState().login;
      useAuthStore.setState({
        login: async () => {
          await new Promise(resolve => setTimeout(resolve, 30000)); // Long delay
          return true;
        },
      });

      render(
        <TestWrapper>
          <TestLoginComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("login-button"));

      // Should show loading state
      expect(screen.getByTestId("loading-status")).toHaveTextContent("Loading");

      // Restore original login function
      useAuthStore.setState({ login: originalLogin });
    });
  });

  describe("Multiple Components", () => {
    it("should share auth state across multiple components", async () => {
      const TestComponent1 = () => {
        const { isAuthenticated } = useAuth();
        return <div data-testid="comp1-auth">{isAuthenticated ? "Yes" : "No"}</div>;
      };

      const TestComponent2 = () => {
        const { user } = useAuth();
        return <div data-testid="comp2-user">{user?.username || "No User"}</div>;
      };

      render(
        <TestWrapper>
          <TestLoginComponent />
          <TestComponent1 />
          <TestComponent2 />
        </TestWrapper>
      );

      // Initial state
      expect(screen.getByTestId("comp1-auth")).toHaveTextContent("No");
      expect(screen.getByTestId("comp2-user")).toHaveTextContent("No User");

      // Login
      fireEvent.click(screen.getByTestId("login-button"));

      await waitFor(() => {
        expect(screen.getByTestId("comp1-auth")).toHaveTextContent("Yes");
        expect(screen.getByTestId("comp2-user")).toHaveTextContent("admin");
      });
    });
  });
});