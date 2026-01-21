// @ts-nocheck
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loanApi } from "../endpoints/loans";
import type { paths } from "../v1/dop";

/**
 * Hook for submitting loan applications
 */
export function useSubmitLoanApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      application: paths["/loans/applications"]["post"]["requestBody"]["content"]["application/json"],
    ) => loanApi.submitLoanApplication(application),
    onSuccess: (data) => {
      toast.success("Đơn vay đã được gửi thành công", {
        description: `Mã đơn: ${data.applicationId}`,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });
      queryClient.invalidateQueries({ queryKey: ["loanProducts"] });
    },
    onError: (error) => {
      toast.error("Gửi đơn vay thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });
}

/**
 * Hook for uploading loan documents
 */
export function useUploadLoanDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      documents,
    }: {
      applicationId: string;
      documents: paths["/loans/applications/{id}/documents"]["post"]["requestBody"]["content"]["multipart/form-data"];
    }) => loanApi.uploadDocuments(applicationId, documents),
    onSuccess: (data, variables) => {
      toast.success("Tài liệu đã được tải lên thành công");

      // Invalidate application details
      queryClient.invalidateQueries({
        queryKey: ["applicationStatus", variables.applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applicationTimeline", variables.applicationId],
      });
    },
    onError: (error) => {
      toast.error("Tải tài liệu thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });
}

/**
 * Hook for checking loan eligibility
 */
export function useCheckEligibility() {
  return useMutation({
    mutationFn: (
      criteria: paths["/loans/eligibility"]["post"]["requestBody"]["content"]["application/json"],
    ) => loanApi.checkEligibility(criteria),
    onSuccess: (data) => {
      if (data.eligible) {
        toast.success("Bạn đủ điều kiện vay vốn", {
          description: `Hạn mức vay: ${data.maxAmount} VNĐ`,
        });
      } else {
        toast.error("Bạn chưa đủ điều kiện vay vốn", {
          description: data.reason || "Vui lòng kiểm tra lại điều kiện",
        });
      }
    },
    onError: (error) => {
      toast.error("Kiểm tra điều kiện thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });
}

/**
 * Hook for calculating loan payments
 */
export function useCalculatePayment() {
  return useMutation({
    mutationFn: (
      loanDetails: paths["/loans/calculator"]["post"]["requestBody"]["content"]["application/json"],
    ) => loanApi.calculatePayment(loanDetails),
    onSuccess: (data) => {
      toast.success("Tính toán thành công");
    },
    onError: (error) => {
      toast.error("Tính toán thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });
}

/**
 * Admin mutations for loan management
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: paths["/admin/loans/applications/{id}/status"]["put"]["requestBody"]["content"]["application/json"];
    }) => loanAdminApi.updateApplicationStatus(applicationId, status),
    onSuccess: (data, variables) => {
      toast.success("Cập nhật trạng thái thành công");

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["adminApplications"] });
      queryClient.invalidateQueries({
        queryKey: ["applicationStatus", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["adminLoanStats"] });
    },
    onError: (error) => {
      toast.error("Cập nhật trạng thái thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });
}

export function useForwardApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      partnerData,
    }: {
      applicationId: string;
      partnerData: paths["/admin/loans/applications/{id}/forward"]["post"]["requestBody"]["content"]["application/json"];
    }) => loanAdminApi.forwardApplication(applicationId, partnerData),
    onSuccess: (data, variables) => {
      toast.success(`Đã chuyển đơn đến ${data.partnerName}`, {
        description: `Mã chuyển: ${data.forwardId}`,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["adminApplications"] });
      queryClient.invalidateQueries({
        queryKey: ["applicationStatus", variables.applicationId],
      });
    },
    onError: (error) => {
      toast.error("Chuyển đơn thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });
}

export default {
  useSubmitLoanApplication,
  useUploadLoanDocuments,
  useCheckEligibility,
  useCalculatePayment,
  useUpdateApplicationStatus,
  useForwardApplication,
};
