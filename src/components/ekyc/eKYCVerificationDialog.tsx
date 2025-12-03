/**
 * Enhanced eKYC Verification Dialog
 * Comprehensive eKYC verification flow with VNPT SDK integration
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  User,
  Shield,
  Camera,
  Upload,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";

import { VietnameseDocumentType, VIETNAMESE_DOCUMENT_TYPES } from "@/lib/ekyc/document-types";
import { useEkycVerification } from "@/hooks/use-ekyc-verification";
import { useEkycStore } from "@/store/use-ekyc-store";
import DocumentScanner from "./DocumentScanner";
import FaceVerification from "./FaceVerification";
import { toast } from "sonner";

interface eKYCVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  flowType?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "DOCUMENT" | "FACE";
  language?: "vi" | "en";
  userId?: string;
  loanApplicationId?: string;
  documentType?: VietnameseDocumentType;
  autoStart?: boolean;
  showProgress?: boolean;
  allowRetry?: boolean;
  className?: string;
}

type VerificationStep = "welcome" | "document_selection" | "document_scanner" | "face_verification" | "processing" | "results" | "error";

interface StepConfig {
  id: VerificationStep;
  name: string;
  nameVi: string;
  icon: React.ReactNode;
  description: string;
  descriptionVi: string;
  canSkip?: boolean;
  required?: boolean;
}

const VERIFICATION_STEPS: StepConfig[] = [
  {
    id: "welcome",
    name: "Welcome",
    nameVi: "Chào mừng",
    icon: <Shield className="h-5 w-5" />,
    description: "Overview of eKYC verification process",
    descriptionVi: "Tổng quan về quy trình xác thực eKYC",
    required: true,
  },
  {
    id: "document_selection",
    name: "Document Selection",
    nameVi: "Chọn giấy tờ",
    icon: <FileText className="h-5 w-5" />,
    description: "Select your identification document",
    descriptionVi: "Chọn giấy tờ tùy thân của bạn",
    required: true,
  },
  {
    id: "document_scanner",
    name: "Document Scanner",
    nameVi: "Quét giấy tờ",
    icon: <Camera className="h-5 w-5" />,
    description: "Scan both sides of your document",
    descriptionVi: "Quét cả hai mặt của giấy tờ",
    required: true,
  },
  {
    id: "face_verification",
    name: "Face Verification",
    nameVi: "Xác thực khuôn mặt",
    icon: <User className="h-5 w-5" />,
    description: "Capture your face with liveness check",
    descriptionVi: "Chụp khuôn mặt với kiểm tra sống",
    required: true,
  },
  {
    id: "processing",
    name: "Processing",
    nameVi: "Đang xử lý",
    icon: <RefreshCw className="h-5 w-5" />,
    description: "Processing your verification",
    descriptionVi: "Đang xử lý xác thực của bạn",
    required: true,
  },
  {
    id: "results",
    name: "Results",
    nameVi: "Kết quả",
    icon: <CheckCircle className="h-5 w-5" />,
    description: "Verification results and summary",
    descriptionVi: "Kết quả và tóm tắt xác thực",
    required: true,
  },
  {
    id: "error",
    name: "Error",
    nameVi: "Lỗi",
    icon: <AlertCircle className="h-5 w-5" />,
    description: "Something went wrong",
    descriptionVi: "Đã xảy ra lỗi",
    required: false,
  },
];

export const eKYCVerificationDialog: React.FC<eKYCVerificationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  onError,
  onCancel,
  flowType = "DOCUMENT_TO_FACE",
  language = "vi",
  userId,
  loanApplicationId,
  documentType: initialDocumentType,
  autoStart = false,
  showProgress = true,
  allowRetry = true,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("welcome");
  const [selectedDocumentType, setSelectedDocumentType] = useState<VietnameseDocumentType | null>(
    initialDocumentType || null
  );
  const [documentScanned, setDocumentScanned] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const store = useEkycStore();
  const {
    isInitialized,
    isProcessing,
    isCompleted,
    progress,
    error,
    errors,
    warnings,
    initializeSession,
    startVerification,
    completeVerification,
    reset,
  } = useEkycVerification({
    documentType: selectedDocumentType || VIETNAMESE_DOCUMENT_TYPES.CCCD_CHIP,
    flowType,
    language,
    userId,
    loanApplicationId,
    onSessionInitialized: (session) => {
      console.log("eKYC session initialized:", session);
    },
    onCompleted: (result) => {
      setCurrentStep("results");
      onSuccess?.(result);
    },
    onError: (errorMessage) => {
      setCurrentStep("error");
      onError?.(errorMessage);
    },
    onProgress: (newProgress, step) => {
      console.log("Progress:", newProgress, "Step:", step);
    },
    autoStart,
  });

  // Navigation functions
  const goToStep = useCallback((step: VerificationStep) => {
    setCurrentStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    const currentIndex = VERIFICATION_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < VERIFICATION_STEPS.length - 1) {
      const nextStep = VERIFICATION_STEPS[currentIndex + 1];

      // Validate before moving to next step
      if (currentStep === "document_selection" && !selectedDocumentType) {
        toast.error("Please select a document type");
        return;
      }

      if (currentStep === "document_scanner" && !documentScanned) {
        toast.error("Please complete document scanning");
        return;
      }

      if (currentStep === "face_verification" && !faceVerified) {
        toast.error("Please complete face verification");
        return;
      }

      setCurrentStep(nextStep.id);
    }
  }, [currentStep, selectedDocumentType, documentScanned, faceVerified]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = VERIFICATION_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const previousStep = VERIFICATION_STEPS[currentIndex - 1];
      setCurrentStep(previousStep.id);
    }
  }, [currentStep]);

  const handleDocumentScanComplete = useCallback((result: any) => {
    setDocumentScanned(true);
    if (flowType !== "FACE") {
      setTimeout(() => goToNextStep(), 1000);
    }
  }, [flowType, goToNextStep]);

  const handleFaceVerificationComplete = useCallback((result: any) => {
    setFaceVerified(true);
    if (flowType === "FACE") {
      setTimeout(() => goToNextStep(), 1000);
    } else {
      // Move to processing for face comparison
      setCurrentStep("processing");
    }
  }, [flowType, goToNextStep]);

  const handleStartVerification = useCallback(async () => {
    try {
      if (!selectedDocumentType) {
        toast.error("Please select a document type");
        return;
      }

      await initializeSession();
      await startVerification();

      // Start with appropriate step based on flow type
      if (flowType === "FACE_TO_DOCUMENT") {
        goToStep("face_verification");
      } else {
        goToStep("document_scanner");
      }

    } catch (error) {
      console.error("Failed to start verification:", error);
      toast.error("Failed to start verification");
    }
  }, [selectedDocumentType, initializeSession, startVerification, goToStep, flowType]);

  const handleCompleteVerification = useCallback(async () => {
    try {
      setCurrentStep("processing");
      await completeVerification();
    } catch (error) {
      console.error("Failed to complete verification:", error);
      setCurrentStep("error");
    }
  }, [completeVerification]);

  const handleRetry = useCallback(() => {
    reset();
    setCurrentStep("welcome");
    setDocumentScanned(false);
    setFaceVerified(false);
    setSelectedDocumentType(initialDocumentType || null);
  }, [reset, initialDocumentType]);

  const handleClose = useCallback(() => {
    if (allowRetry && currentStep !== "welcome" && currentStep !== "results") {
      // Show confirmation dialog if in middle of process
      if (confirm("Bạn có chắc muốn đóng và hủy quy trình xác thực không?")) {
        onOpenChange(false);
        reset();
      }
    } else {
      onOpenChange(false);
      if (currentStep === "results") {
        // Don't reset on successful completion
        return;
      }
      reset();
    }
  }, [allowRetry, currentStep, onOpenChange, reset]);

  const getStepIndex = (step: VerificationStep): number => {
    return VERIFICATION_STEPS.findIndex(s => s.id === step);
  };

  const getDocumentIcon = (documentType: VietnameseDocumentType) => {
    switch (documentType.code) {
      case "CCCD":
      case "CCCD_CHIP":
        return <Shield className="h-8 w-8" />;
      case "PASSPORT":
        return <FileText className="h-8 w-8" />;
      case "DRIVER_LICENSE":
        return <Camera className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  // Initialize on mount if autoStart is true
  useEffect(() => {
    if (open && autoStart && currentStep === "welcome") {
      setTimeout(() => handleStartVerification(), 1000);
    }
  }, [open, autoStart, currentStep, handleStartVerification]);

  // Handle store state changes
  useEffect(() => {
    if (store.status === "processing" && currentStep !== "processing") {
      setCurrentStep("processing");
    }
  }, [store.status, currentStep]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        size="xl"
        className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Xác thực eKYC
              </DialogTitle>
              <DialogDescription>
                Vui lòng làm theo hướng dẫn để hoàn tất xác thực danh tính
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          {showProgress && currentStep !== "welcome" && currentStep !== "error" && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2">
                {VERIFICATION_STEPS.filter(s => s.required && s.id !== "welcome").map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        getStepIndex(currentStep) > index
                          ? "bg-green-500 text-white"
                          : getStepIndex(currentStep) === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {getStepIndex(currentStep) > index ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs mt-1 text-center max-w-16">
                      {step.nameVi}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Welcome Step */}
          {currentStep === "welcome" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    Chào mừng đến với eKYC
                  </CardTitle>
                  <CardDescription>
                    Hệ thống xác thực danh tính điện tử an toàn và nhanh chóng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Nhanh chóng</h4>
                        <p className="text-sm text-muted-foreground">
                          Hoàn thành trong vòng 3-5 phút
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">An toàn</h4>
                        <p className="text-sm text-muted-foreground">
                          Bảo mật theo tiêu chuẩn Việt Nam
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <User className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Chính xác</h4>
                        <p className="text-sm text-muted-foreground">
                          Công nghệ AI và liveness detection
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Đa dạng</h4>
                        <p className="text-sm text-muted-foreground">
                          Hỗ trợ nhiều loại giấy tờ
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Quy trình xác thực:</h4>
                    <div className="space-y-2">
                      {VERIFICATION_STEPS.filter(s => s.required && s.id !== "welcome").map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step.nameVi}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleStartVerification}
                      className="flex-1"
                      size="lg"
                    >
                      Bắt đầu xác thực
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowHelp(true)}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Trợ giúp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Selection Step */}
          {currentStep === "document_selection" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Chọn loại giấy tờ
                  </CardTitle>
                  <CardDescription>
                    Vui lòng chọn loại giấy tờ tùy thân bạn muốn sử dụng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.values(VIETNAMESE_DOCUMENT_TYPES).map((docType) => (
                      <Card
                        key={docType.code}
                        className={`cursor-pointer transition-all ${
                          selectedDocumentType?.code === docType.code
                            ? "ring-2 ring-primary border-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedDocumentType(docType)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full">
                            {getDocumentIcon(docType)}
                          </div>
                          <h3 className="font-medium">{docType.nameVi}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {docType.descriptionVi}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedDocumentType && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {selectedDocumentType.nameVi} được chọn
                      </h4>
                      <p className="text-sm text-blue-700">
                        {selectedDocumentType.descriptionVi}
                      </p>
                      <div className="mt-3 text-xs text-blue-600">
                        <p>• ID: {selectedDocumentType.validation.idPattern.source}</p>
                        <p>• Yêu cầu mặt sau: {selectedDocumentType.validation.backRequired ? "Có" : "Không"}</p>
                        <p>• Chất lượng tối thiểu: {Math.round(selectedDocumentType.ocrConfig.qualityThreshold * 100)}%</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Quay lại
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={!selectedDocumentType}
                      className="flex-1"
                    >
                      Tiếp tục
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Scanner Step */}
          {currentStep === "document_scanner" && selectedDocumentType && (
            <DocumentScanner
              documentType={selectedDocumentType}
              side="front"
              onCaptureSuccess={handleDocumentScanComplete}
              onCaptureError={onError}
              className="w-full"
            />
          )}

          {/* Face Verification Step */}
          {currentStep === "face_verification" && (
            <FaceVerification
              onCaptureSuccess={handleFaceVerificationComplete}
              onCaptureError={onError}
              enableLivenessChallenges={true}
              className="w-full"
            />
          )}

          {/* Processing Step */}
          {currentStep === "processing" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full">
                    <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    Đang xử lý xác thực
                  </CardTitle>
                  <CardDescription className="mb-6">
                    Vui lòng đợi trong khi hệ thống xử lý thông tin của bạn
                  </CardDescription>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="mt-8 text-sm text-muted-foreground">
                    <p>Đang thực hiện các bước sau:</p>
                    <ul className="mt-2 space-y-1">
                      <li>✓ Quét và OCR giấy tờ</li>
                      <li>✓ Kiểm tra chất lượng hình ảnh</li>
                      <li>✓ Xác thực khuôn mặt</li>
                      <li>✓ Kiểm tra liveness</li>
                      <li>✓ So sánh khuôn mặt</li>
                      <li>⟳ Tạo báo cáo xác thực</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Step */}
          {currentStep === "results" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">
                    Xác thực thành công!
                  </CardTitle>
                  <CardDescription>
                    Danh tính của bạn đã được xác thực thành công
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {store.formData && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Thông tin xác thực:</h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Họ tên:</span>
                          <span className="font-medium">{store.formData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày sinh:</span>
                          <span className="font-medium">{store.formData.dateOfBirth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giới tính:</span>
                          <span className="font-medium">
                            {store.formData.gender === "male" ? "Nam" :
                             store.formData.gender === "female" ? "Nữ" : "Khác"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Địa chỉ:</span>
                          <span className="font-medium max-w-xs truncate">
                            {store.formData.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {store.comparison.isMatch && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">
                        Kết quả so sánh khuôn mặt:
                      </h4>
                      <div className="text-sm text-green-700">
                        <p>• Khớp: {Math.round(store.comparison.similarity)}%</p>
                        <p>• Tình trạng: Thành công</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => onOpenChange(false)}
                      className="flex-1"
                      size="lg"
                    >
                      Hoàn thành
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Step */}
          {currentStep === "error" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl">
                    Xác thực thất bại
                  </CardTitle>
                  <CardDescription>
                    Đã xảy ra lỗi trong quá trình xác thực
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(error || errors.length > 0) && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error || errors.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}

                  {warnings.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    {allowRetry && (
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Thử lại
                      </Button>
                    )}
                    <Button
                      onClick={() => onOpenChange(false)}
                      variant="destructive"
                    >
                      Đóng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== "welcome" && currentStep !== "results" && currentStep !== "error" && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === "document_selection" || isProcessing}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {progress}% hoàn thành
                </Badge>
                {warnings.length > 0 && (
                  <Badge variant="secondary">
                    {warnings.length} cảnh báo
                  </Badge>
                )}
              </div>

              <Button
                onClick={goToNextStep}
                disabled={isProcessing}
                className={currentStep === "face_verification" && documentScanned && faceVerified ? "" : ""}
              >
                {currentStep === "face_verification" && documentScanned && faceVerified ? (
                  <>
                    Hoàn tất
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Tiếp tục
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default eKYCVerificationDialog;