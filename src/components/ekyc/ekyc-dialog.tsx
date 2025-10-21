"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEkycStore } from "@/store/use-ekyc-store";
import type { EkycFullResult } from "@/lib/ekyc/ekyc-data-mapper";

// Dynamically import EkycSdkWrapper to avoid SSR issues
const EkycSdkWrapper = dynamic(
  () => import("@/components/features/ekyc/ekyc-sdk-wrapper"),
  { ssr: false },
);

interface EkycDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: EkycFullResult) => void;
  onError?: (error: Error) => void;
  flowType?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT";
  language?: "vi" | "en";
  authToken?: string;
}

export function EkycDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  flowType = "DOCUMENT_TO_FACE",
  language = "vi",
  authToken,
}: EkycDialogProps) {
  const { status, rawResult, error: storeError, reset } = useEkycStore();

  // Listen to eKYC completion event from store
  useEffect(() => {
    if (!open) return;

    const handleEkycComplete = (event: CustomEvent) => {
      console.log("[EkycDialog] eKYC completed:", event.detail);
      const result = event.detail.result as EkycFullResult;

      // Call success callback
      onSuccess?.(result);

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    };

    window.addEventListener("ekyc:completed" as any, handleEkycComplete);

    return () => {
      window.removeEventListener("ekyc:completed" as any, handleEkycComplete);
    };
  }, [open, onSuccess, onOpenChange]);

  // Listen to store errors
  useEffect(() => {
    if (storeError && onError) {
      onError(new Error(storeError));
    }
  }, [storeError, onError]);

  // Cleanup khi đóng dialog
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Auto-close on success
  useEffect(() => {
    if (status === "success" && rawResult && open) {
      console.log("[EkycDialog] Auto-closing after success");
      onSuccess?.(rawResult);
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    }
  }, [status, rawResult, open, onSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Xác thực eKYC</DialogTitle>
          <DialogDescription>
            Vui lòng làm theo hướng dẫn để hoàn tất xác thực danh tính
          </DialogDescription>
        </DialogHeader>

        {/* Main Content - EkycSdkWrapper tự xử lý loading, error, và SDK */}
        {open && (
          <EkycSdkWrapper
            containerId="ekyc-dialog-container"
            flowType={flowType}
            language={language}
            authToken={authToken}
            className="flex-1 relative"
            style={{
              width: "100%",
              height: "auto", // Let flexbox handle height
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
