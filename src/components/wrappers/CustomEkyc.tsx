"use client";

// Custom eKYC wrapper for Data-Driven UI system
// Integrates eKYC SDK as a form field component
// Supports both inline and modal modes

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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Camera, ShieldCheck, ShieldX } from "lucide-react";

// Dynamically import components to avoid SSR issues
const EkycSdkWrapper = dynamic(
  () => import("@/components/features/ekyc/ekyc-sdk-wrapper"),
  { ssr: false },
);

const EkycDialog = dynamic(
  () =>
    import("@/components/ekyc/ekyc-dialog").then((mod) => ({
      default: mod.EkycDialog,
    })),
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
  flowType?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT";

  /** Language */
  language?: "vi" | "en";

  /** Container height (only for inline mode) */
  height?: string | number;

  /** Is disabled */
  disabled?: boolean;

  /** Custom container ID */
  containerId?: string;

  /** Authorization token */
  authToken?: string;

  /** Display mode: "inline" = nhúng trực tiếp, "modal" = mở dialog (khuyến nghị) */
  mode?: "inline" | "modal";

  /** Button text when using modal mode */
  buttonText?: string;

  /** Show detailed summary after completion */
  showDetailedSummary?: boolean;
}

export const CustomEkyc = React.forwardRef<HTMLDivElement, CustomEkycProps>(
  (
    {
      value,
      onChange,
      label = "eKYC Verification",
      description,
      flowType = "DOCUMENT_TO_FACE",
      language = "vi",
      height = "600px",
      disabled = false,
      containerId,
      authToken,
      mode = "inline",
      buttonText,
      showDetailedSummary = true,
    },
    ref,
  ) => {
    const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
    const [sessionData, setSessionData] = React.useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
    const [verificationStatus, setVerificationStatus] = React.useState<
      "pending" | "success" | "error"
    >("pending");

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

    // Handle eKYC success (for modal mode)
    const handleEkycSuccess = React.useCallback(
      (result: any) => {
        console.log("[CustomEkyc] eKYC success:", result);

        const completionData = {
          completed: true,
          sessionId: result?.sessionId || Date.now().toString(),
          data: result,
          timestamp: new Date().toISOString(),
        };

        setIsCompleted(true);
        setSessionData(completionData);
        setVerificationStatus("success");
        onChange?.(completionData);
      },
      [onChange],
    );

    // Handle eKYC error (for modal mode)
    const handleEkycError = React.useCallback((error: Error) => {
      console.error("[CustomEkyc] eKYC error:", error);
      setVerificationStatus("error");
    }, []);

    // Open eKYC dialog
    const openDialog = React.useCallback(() => {
      setIsDialogOpen(true);
    }, []);

    // // Listen to eKYC SDK events (for inline mode)
    // React.useEffect(() => {
    //   if (
    //     mode !== "inline" ||
    //     typeof window === "undefined" ||
    //     disabled ||
    //     isCompleted
    //   )
    //     return;

    //   const handleEkycComplete = (event: CustomEvent) => {
    //     console.log("[CustomEkyc] eKYC completed:", event.detail);
    //     handleEkycSuccess(event.detail);
    //   };

    //   const handleEkycErrorEvent = (event: CustomEvent) => {
    //     console.error("[CustomEkyc] eKYC error:", event.detail);
    //     handleEkycError(new Error(event.detail?.message || "eKYC failed"));
    //   };

    //   // Add event listeners (adjust event names based on actual SDK events)
    //   window.addEventListener("ekyc:completed" as any, handleEkycComplete);
    //   window.addEventListener("ekyc:error" as any, handleEkycErrorEvent);

    //   return () => {
    //     window.removeEventListener("ekyc:completed" as any, handleEkycComplete);
    //     window.removeEventListener("ekyc:error" as any, handleEkycErrorEvent);
    //   };
    // }, [mode, disabled, isCompleted, handleEkycSuccess, handleEkycError]);

    // // Render modal mode
    // if (mode === "modal") {
    //   return (
    //     <FormItem ref={ref}>
    //       {label && <FormLabel>{label}</FormLabel>}
    //       <FormControl>
    //         <Card>
    //           <CardContent className="p-6 space-y-4">
    //             {/* Verification Status */}
    //             {verificationStatus === "pending" && (
    //               <Alert>
    //                 <ShieldCheck className="h-4 w-4" />
    //                 <AlertDescription>
    //                   {language === "vi"
    //                     ? "Nhấn nút bên dưới để bắt đầu xác thực eKYC. Quá trình chỉ mất 2-3 phút."
    //                     : "Click the button below to start eKYC verification. The process takes 2-3 minutes."}
    //                 </AlertDescription>
    //               </Alert>
    //             )}

    //             {verificationStatus === "success" && isCompleted && (
    //               <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
    //                 <CheckCircle2 className="h-4 w-4 text-green-600" />
    //                 <AlertDescription className="text-green-800 dark:text-green-200">
    //                   <div className="space-y-2">
    //                     <p className="font-semibold">
    //                       {language === "vi"
    //                         ? "✅ Xác thực thành công!"
    //                         : "✅ Verification Successful!"}
    //                     </p>
    //                     {showDetailedSummary && sessionData?.data && (
    //                       <div className="text-sm space-y-1">
    //                         {sessionData.data.fullName && (
    //                           <p>
    //                             • {language === "vi" ? "Họ tên" : "Full Name"}:{" "}
    //                             <strong>{sessionData.data.fullName}</strong>
    //                           </p>
    //                         )}
    //                         {sessionData.data.idNumber && (
    //                           <p>
    //                             •{" "}
    //                             {language === "vi"
    //                               ? "Số CMND/CCCD"
    //                               : "ID Number"}
    //                             : <strong>{sessionData.data.idNumber}</strong>
    //                           </p>
    //                         )}
    //                         {sessionData.data.faceMatch !== undefined && (
    //                           <p>
    //                             •{" "}
    //                             {language === "vi"
    //                               ? "Xác thực khuôn mặt"
    //                               : "Face Match"}
    //                             :{" "}
    //                             <Badge
    //                               variant={
    //                                 sessionData.data.faceMatch
    //                                   ? "default"
    //                                   : "destructive"
    //                               }
    //                               className={
    //                                 sessionData.data.faceMatch
    //                                   ? "bg-green-500"
    //                                   : ""
    //                               }
    //                             >
    //                               {sessionData.data.faceMatch
    //                                 ? `${
    //                                     language === "vi" ? "Khớp" : "Match"
    //                                   } ${sessionData.data.matchScore?.toFixed(
    //                                     1
    //                                   )}%`
    //                                 : language === "vi"
    //                                 ? "Không khớp"
    //                                 : "Not Match"}
    //                             </Badge>
    //                           </p>
    //                         )}
    //                       </div>
    //                     )}
    //                     {sessionData?.sessionId && (
    //                       <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-mono">
    //                         Session ID: {sessionData.sessionId}
    //                       </p>
    //                     )}
    //                   </div>
    //                 </AlertDescription>
    //               </Alert>
    //             )}

    //             {verificationStatus === "error" && (
    //               <Alert variant="destructive">
    //                 <ShieldX className="h-4 w-4" />
    //                 <AlertDescription>
    //                   {language === "vi"
    //                     ? "Xác thực không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ."
    //                     : "Verification failed. Please try again or contact support."}
    //                 </AlertDescription>
    //               </Alert>
    //             )}

    //             {/* Action Button */}
    //             <div className="flex justify-center pt-2">
    //               {verificationStatus === "pending" && (
    //                 <Button
    //                   size="lg"
    //                   onClick={openDialog}
    //                   disabled={disabled}
    //                   className="min-w-[200px]"
    //                 >
    //                   <Camera className="mr-2 h-5 w-5" />
    //                   {buttonText ||
    //                     (language === "vi"
    //                       ? "Bắt đầu xác thực"
    //                       : "Start Verification")}
    //                 </Button>
    //               )}

    //               {verificationStatus === "success" && (
    //                 <Button
    //                   size="lg"
    //                   variant="outline"
    //                   onClick={openDialog}
    //                   disabled={disabled}
    //                   className="min-w-[200px]"
    //                 >
    //                   <Camera className="mr-2 h-5 w-5" />
    //                   {language === "vi" ? "Xác thực lại" : "Verify Again"}
    //                 </Button>
    //               )}

    //               {verificationStatus === "error" && (
    //                 <Button
    //                   size="lg"
    //                   onClick={openDialog}
    //                   disabled={disabled}
    //                   className="min-w-[200px]"
    //                 >
    //                   <Camera className="mr-2 h-5 w-5" />
    //                   {language === "vi" ? "Thử lại" : "Retry"}
    //                 </Button>
    //               )}
    //             </div>

    //             {/* Instructions */}
    //             {!isCompleted && (
    //               <div className="pt-4 border-t text-sm text-muted-foreground">
    //                 <h4 className="font-semibold mb-2">
    //                   {language === "vi" ? "Hướng dẫn:" : "Instructions:"}
    //                 </h4>
    //                 <ul className="space-y-1 list-disc list-inside">
    //                   <li>
    //                     {language === "vi"
    //                       ? "Chuẩn bị CMND/CCCD gốc (không phải bản photocopy)"
    //                       : "Prepare original ID card (not photocopy)"}
    //                   </li>
    //                   <li>
    //                     {language === "vi"
    //                       ? "Đảm bảo ánh sáng đủ, không bị chói hoặc tối"
    //                       : "Ensure adequate lighting, not too bright or dark"}
    //                   </li>
    //                   <li>
    //                     {language === "vi"
    //                       ? "Giữ giấy tờ nằm trong khung hình"
    //                       : "Keep the document within the frame"}
    //                   </li>
    //                   <li>
    //                     {language === "vi"
    //                       ? "Chuẩn bị chụp ảnh khuôn mặt theo hướng dẫn"
    //                       : "Prepare to take a photo of your face as instructed"}
    //                   </li>
    //                 </ul>
    //               </div>
    //             )}
    //           </CardContent>
    //         </Card>
    //       </FormControl>
    //       {description && !isCompleted && (
    //         <FormDescription className="text-xs text-muted-foreground mt-2">
    //           {description}
    //         </FormDescription>
    //       )}
    //       <FormMessage />

    //       {/* eKYC Dialog */}
    //       <EkycDialog
    //         open={isDialogOpen}
    //         onOpenChange={setIsDialogOpen}
    //         onSuccess={handleEkycSuccess}
    //         onError={handleEkycError}
    //       />
    //     </FormItem>
    //   );
    // }

    // Render inline mode (legacy behavior)
    return (
      <FormItem ref={ref}>
        {/* {label && <FormLabel>{label}</FormLabel>} */}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6"
                    onClick={() => {
                      setIsCompleted(false);
                      setSessionData(null);
                      setVerificationStatus("pending");
                      onChange?.({
                        completed: false,
                        sessionId: undefined,
                        data: undefined,
                      });
                    }}
                  >
                    {language === "vi" ? "Xác thực lại" : "Verify Again"}
                  </Button>
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
                <EkycSdkWrapper
                  containerId={containerId}
                  authToken={authToken}
                  flowType={flowType}
                  language={language}
                  style={{
                    width: "100%",
                    height: typeof height === "number" ? `${height}px` : height,
                    minHeight: "100%",
                  }}
                />
              )}
            </CardContent>
          </Card>
        </FormControl>
        {/* {description && !isCompleted && (
          <FormDescription className="text-xs text-muted-foreground mt-2">
            {description}
          </FormDescription>
        )} */}
        <FormMessage />
      </FormItem>
    );
  },
);

CustomEkyc.displayName = "CustomEkyc";

export default CustomEkyc;
