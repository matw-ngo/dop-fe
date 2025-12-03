import apiClient from "../client";
import type { paths } from "../v1.d.ts";

/**
 * Loan Application API endpoints
 */
export const loanApi = {
  // Get loan products
  getLoanProducts: async (params?: paths["/loans"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/loans", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Get single loan product
  getLoanProduct: async (id: string) => {
    const response = await apiClient.GET("/loans/{id}", {
      params: {
        path: { id },
      },
    });
    return response.data;
  },

  // Submit loan application
  submitLoanApplication: async (application: paths["/loans/applications"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/loans/applications", {
      body: application,
    });
    return response.data;
  },

  // Get loan application status
  getApplicationStatus: async (applicationId: string) => {
    const response = await apiClient.GET("/loans/applications/{id}/status", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },

  // Get user's loan applications
  getUserApplications: async (params?: paths["/loans/applications"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/loans/applications", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Get loan eligibility
  checkEligibility: async (criteria: paths["/loans/eligibility"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/loans/eligibility", {
      body: criteria,
    });
    return response.data;
  },

  // Calculate loan payment
  calculatePayment: async (loanDetails: paths["/loans/calculator"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/loans/calculator", {
      body: loanDetails,
    });
    return response.data;
  },

  // Compare loan products
  compareProducts: async (products: paths["/loans/compare"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/loans/compare", {
      body: { products },
    });
    return response.data;
  },

  // Get loan providers
  getLoanProviders: async () => {
    const response = await apiClient.GET("/loans/providers");
    return response.data;
  },

  // Update application documents
  uploadDocuments: async (applicationId: string, documents: paths["/loans/applications/{id}/documents"]["post"]["requestBody"]["content"]["multipart/form-data"]) => {
    const response = await apiClient.POST("/loans/applications/{id}/documents", {
      params: {
        path: { id: applicationId },
      },
      body: documents,
      bodySerializer: "multipart",
    });
    return response.data;
  },

  // Get application timeline
  getApplicationTimeline: async (applicationId: string) => {
    const response = await apiClient.GET("/loans/applications/{id}/timeline", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },
};

/**
 * Loan Admin API endpoints (admin only)
 */
export const loanAdminApi = {
  // Get all applications (admin)
  getAllApplications: async (params?: paths["/admin/loans/applications"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/loans/applications", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (applicationId: string, status: paths["/admin/loans/applications/{id}/status"]["put"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.PUT("/admin/loans/applications/{id}/status", {
      params: {
        path: { id: applicationId },
      },
      body: status,
    });
    return response.data;
  },

  // Forward application to partner
  forwardApplication: async (applicationId: string, partnerData: paths["/admin/loans/applications/{id}/forward"]["post"]["requestBody"]["content"]["application/json"]) => {
    const response = await apiClient.POST("/admin/loans/applications/{id}/forward", {
      params: {
        path: { id: applicationId },
      },
      body: partnerData,
    });
    return response.data;
  },

  // Get application statistics
  getApplicationStats: async (params?: paths["/admin/loans/stats"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/loans/stats", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Get partner performance
  getPartnerPerformance: async (params?: paths["/admin/loans/partners"]["get"]["parameters"]["query"]) => {
    const response = await apiClient.GET("/admin/loans/partners", {
      params: {
        query: params,
      },
    });
    return response.data;
  },
};

export default loanApi;