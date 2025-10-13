"use client";

// Custom eKYC wrapper for Data-Driven UI system
// Integrates eKYC SDK as a form field component

import React from "react";
import dynamic from "next/dynamic";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Camera } from "lucide-react";

// Dynamically import EkycSdkWrapper to avoid SSR issues
const EkycSdkWrapper = dynamic(
  () => import("@/components/features/ekyc/ekyc-sdk-wrapper"),
  { ssr: false },
);

export interface CustomEkycProps {
  /** Current value (eKYC completion status) */
  value?: boolean | { completed: boolean; sessionId?: string; data?: any };

  /** Callback when eKYC completes */
  onChange?: (value: {
    completed: boolean;
    sessionId?: string;
    data?: any;
  }) => void;

  /** Label for the field */
  label?: string;

  /** Description text */
  description?: string;

  /** Flow type */
  flowType?: "DOCUMENT" | "FACE";

  /** Language */
  language?: "vi" | "en";

  /** Container height */
  height?: string | number;

  /** Is disabled */
  disabled?: boolean;

  /** Custom container ID */
  containerId?: string;

  /** Authorization token */
  authToken?: string;
}

export const CustomEkyc = React.forwardRef<HTMLDivElement, CustomEkycProps>(
  (
    {
      value,
      onChange,
      label = "eKYC Verification",
      description,
      flowType = "FACE",
      language = "vi",
      height = "600px",
      disabled = false,
      containerId,
      authToken,
    },
    ref,
  ) => {
    const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
    const [sessionData, setSessionData] = React.useState<any>(null);

    // Check if already completed from value
    React.useEffect(() => {
      if (value) {
        if (typeof value === "boolean") {
          setIsCompleted(value);
        } else if (typeof value === "object" && value.completed) {
          setIsCompleted(true);
          setSessionData(value);
        }
      }
    }, [value]);

    // Listen to eKYC SDK events
    React.useEffect(() => {
      if (typeof window === "undefined" || disabled || isCompleted) return;

      const handleEkycComplete = (event: CustomEvent) => {
        console.log("[CustomEkyc] eKYC completed:", event.detail);

        const completionData = {
          completed: true,
          sessionId: event.detail?.sessionId || Date.now().toString(),
          data: event.detail,
          timestamp: new Date().toISOString(),
        };

        setIsCompleted(true);
        setSessionData(completionData);
        onChange?.(completionData);
      };

      const handleEkycError = (event: CustomEvent) => {
        console.error("[CustomEkyc] eKYC error:", event.detail);
        // You can handle errors here if needed
      };

      // Add event listeners (adjust event names based on actual SDK events)
      window.addEventListener("ekyc:completed" as any, handleEkycComplete);
      window.addEventListener("ekyc:error" as any, handleEkycError);

      return () => {
        window.removeEventListener("ekyc:completed" as any, handleEkycComplete);
        window.removeEventListener("ekyc:error" as any, handleEkycError);
      };
    }, [disabled, isCompleted, onChange]);

    return (
      <FormItem ref={ref}>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <Card className="overflow-hidden border-2">
            <CardContent className="p-0">
              {isCompleted ? (
                // Show completion status
                <div
                  className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-950"
                  style={{
                    minHeight:
                      typeof height === "number" ? `${height}px` : height,
                  }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                    {language === "vi"
                      ? "Xác thực thành công!"
                      : "Verification Successful!"}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    {language === "vi"
                      ? "eKYC của bạn đã được hoàn thành. Bạn có thể tiếp tục bước tiếp theo."
                      : "Your eKYC has been completed. You can proceed to the next step."}
                  </p>
                  {sessionData?.sessionId && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-4 font-mono">
                      Session ID: {sessionData.sessionId}
                    </p>
                  )}
                </div>
              ) : disabled ? (
                // Show disabled state
                <div
                  className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900"
                  style={{
                    minHeight:
                      typeof height === "number" ? `${height}px` : height,
                  }}
                >
                  <Camera className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 text-center">
                    {language === "vi"
                      ? "eKYC đã bị vô hiệu hóa"
                      : "eKYC is disabled"}
                  </p>
                </div>
              ) : (
                // Show eKYC SDK with scroll support
                <div
                  className="relative overflow-auto"
                  style={{
                    height: typeof height === "number" ? `${height}px` : height,
                    maxHeight: "80vh",
                  }}
                >
                  <EkycSdkWrapper
                    containerId={containerId}
                    authToken={authToken}
                    flowType={flowType}
                    language={language}
                    style={{ width: "100%", minHeight: "100%" }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </FormControl>
        {description && !isCompleted && (
          <FormDescription className="text-xs text-muted-foreground mt-2">
            {description}
          </FormDescription>
        )}
        <FormMessage />
      </FormItem>
    );
  },
);

CustomEkyc.displayName = "CustomEkyc";

export default CustomEkyc;
