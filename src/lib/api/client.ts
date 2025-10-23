import createClient from "openapi-fetch";
import type { paths } from "./v1.d.ts";
import { toast } from "sonner";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://dop-stg.datanest.vn/v1";

const apiClient = createClient<paths>({ baseUrl });

// Add advanced interceptors for Auth, Token Refresh, and Global Error Handling
apiClient.use({
  // Runs on every request
  async onRequest(req) {
    // const locale = localStorage.getItem('locale') || 'en';
    // req.request.headers.set('Accept-Language', locale);

    // Attach the authentication token to the request
    const token = localStorage.getItem("accessToken");
    if (token) {
      req.request.headers.set("Authorization", `Bearer ${token}`);
    }
  },

  // Runs on every response
  async onResponse(res) {
    // --- Token Refresh Logic ---
    // Check for 401 Unauthorized and ensure it's not a request to the refresh endpoint itself
    if (
      res.response.status === 401 &&
      !res.request.url.includes("/refresh-token")
    ) {
      try {
        console.log("Attempting to refresh token...");
        // const refreshToken = localStorage.getItem('refreshToken');
        // if (!refreshToken) throw new Error('No refresh token available');

        // const { data: newTokens } = await apiClient.POST('/auth/refresh-token', {
        //   body: { refreshToken },
        // });

        // if (!newTokens) {
        //   throw new Error('Failed to refresh token');
        // }

        // console.log('Token refreshed successfully.');
        // localStorage.setItem('accessToken', newTokens.accessToken);
        // localStorage.setItem('refreshToken', newTokens.refreshToken);

        // Retry the original request with the new token
        // return apiClient.clone(res.request).retry();
      } catch (e) {
        console.error("Token refresh failed, logging out.", e);
        // If refresh fails, clear tokens and redirect to login
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // window.location.href = '/login';
      }
    }

    // --- Global Error Handling & Logging ---
    if (res.response.status >= 500) {
      // Log the error to a monitoring service in production
      // if (process.env.NODE_ENV === 'production') {
      //   logErrorToMonitoringService(res);
      // }

      // Show a generic error toast to the user
      toast.error("A server error occurred", {
        description: "Please try again later or contact support.",
      });
    }
  },
});

export default apiClient;
