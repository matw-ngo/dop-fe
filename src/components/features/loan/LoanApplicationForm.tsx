// Loan Application Form Component
// Main loan application form using MultiStepFormRenderer for Vietnamese digital lending platform

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary, useErrorHandler } from "@/components/ui/error-boundary";
import {
  LoanPersonalInfo,
} from "./LoanPersonalInfo";
import {
  LoanFinancialInfo,
} from "./LoanFinancialInfo";
import {
  LoanEmploymentInfo,
} from "./LoanEmploymentInfo";
import {
  LoanDocumentUpload,
} from "./LoanDocumentUpload";
import { loanApi } from "@/lib/api/endpoints/loans";
import { useLoanApplicationStore } from "@/store/use-loan-store";
import { useAuthStore } from "@/store/use-auth-store";
import { sanitizeApplicationData, formSubmissionRateLimiter } from "@/lib/utils/sanitization";
import {
  Building2,
  DollarSign,
  Briefcase,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Save,
  Eye,
  Info,
  Shield,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { LoanApplicationData, LoanProductConfig } from "@/types/forms/loan-form";

/**
 * Loan Application Form Configuration
 */
const LOAN_APPLICATION_CONFIG = {
  steps: [
    {
      id: "loan-details",
      title: "Thông tin khoản vay",
      description: "Chọn sản phẩm vay và thông tin chi tiết",
      icon: DollarSign,
      optional: false,
    },
    {
      id: "personal-info",
      title: "Thông tin cá nhân",
      description: "Thông tin cơ bản và địa chỉ của người vay",
      icon: Building2,
      optional: false,
    },
    {
      id: "financial-info",
      title: "Thông tin tài chính",
      description: "Thu nhập, chi phí và tài sản hiện có",
      icon: DollarSign,
      optional: false,
    },
    {
      id: "employment-info",
      title: "Thông tin việc làm",
      description: "Công việc và kinh nghiệm làm việc",
      icon: Briefcase,
      optional: false,
    },
    {
      id: "document-upload",
      title: "Tải lên giấy tờ",
      description: "Giấy tờ cần thiết cho hồ sơ vay",
      icon: FileText,
      optional: false,
    },
    {
      id: "review",
      title: "Xem lại và xác nhận",
      description: "Kiểm tra thông tin và hoàn tất hồ sơ",
      icon: Eye,
      optional: false,
    },
  ],
  persistData: true,
  persistKey: "loan-application-data",
  allowBackNavigation: true,
  showProgress: true,
  progressStyle: "steps",
};

/**
 * Loan Application Form Props
 */
interface LoanApplicationFormProps {
  /** Loan product configuration */
  loanProduct?: LoanProductConfig;
  /** Pre-selected loan amount */
  initialAmount?: number;
  /** Pre-selected loan term */
  initialTerm?: number;
  /** Custom className */
  className?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Enable eKYC */
  enableEkyc?: boolean;
  /** On completion callback */
  onComplete?: (applicationId: string) => void;
  /** Application ID for editing existing application */
  applicationId?: string;
}

/**
 * Loan Application Form Component
 */
export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  loanProduct,
  initialAmount,
  initialTerm,
  className,
  readOnly = false,
  enableEkyc = true,
  onComplete,
  applicationId,
}) => {
  const t = useTranslations("loan.applicationForm");
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { handleError, clearError } = useErrorHandler();

  const {
    applicationData,
    currentStep,
    isSubmitting,
    submissionStatus,
    submissionError,
    updateApplicationData,
    updateLoanDetails,
    startSubmission,
    setSubmissionSuccess,
    setSubmissionError,
    resetSubmissionStatus,
    getCompletionPercentage,
    isReadyForSubmission,
    generateSummary,
    resetForm,
    clearPersistedData,
  } = useLoanApplicationStore();

  const [loanProducts, setLoanProducts] = useState<LoanProductConfig[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProductConfig | null>(loanProduct || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load loan products on mount
  useEffect(() => {
    const loadLoanProducts = async () => {
      try {
        const products = await loanApi.getLoanProducts();
        setLoanProducts(products || []);
      } catch (error) {
        console.error("Failed to load loan products:", error);
        toast.error("Không thể tải danh sách sản phẩm vay");
      }
    };
    loadLoanProducts();
  }, []);

  // Load existing application if applicationId is provided
  useEffect(() => {
    if (applicationId) {
      const loadApplication = async () => {
        try {
          setIsLoading(true);
          const application = await loanApi.getApplicationStatus(applicationId);
          if (application) {
            updateApplicationData(application);
          }
        } catch (error) {
          console.error("Failed to load application:", error);
          toast.error("Không thể tải thông tin hồ sơ");
        } finally {
          setIsLoading(false);
        }
      };
      loadApplication();
    }
  }, [applicationId, updateApplicationData]);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = setTimeout(async () => {
      if (applicationData && Object.keys(applicationData).length > 0 && !readOnly) {
        try {
          setIsSavingDraft(true);
          await loanApi.saveDraftApplication(applicationData);
          setLastSaveTime(new Date());
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 2000);
        } catch (error) {
          console.error("Failed to save draft:", error);
        } finally {
          setIsSavingDraft(false);
        }
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(saveDraft);
  }, [applicationData, readOnly]);

  // Handle step data update with sanitization
  const handleStepData = useCallback((stepId: string, data: any) => {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeApplicationData(data);
      updateApplicationData({ [stepId]: sanitizedData });
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Data validation failed'));
      toast.error('Invalid input data. Please check your entries.');
    }
  }, [updateApplicationData, handleError]);

  // Handle step validation with enhanced error handling
  const validateStep = useCallback(async (stepId: string, data: any): Promise<boolean> => {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeApplicationData(data);

      const result = await loanApi.validateApplicationData({
        step: stepId,
        data: sanitizedData,
        loanType: selectedProduct?.id,
      });

      if (!result?.valid) {
        // Display validation errors to user
        const errors = result?.errors || [];
        if (errors.length > 0) {
          errors.forEach((error: string) => {
            toast.error(`Validation Error: ${error}`);
          });
        } else {
          toast.error("Please check your input and try again.");
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Step validation failed:", error);
      handleError(error instanceof Error ? error : new Error('Validation service unavailable'));

      // Don't allow submission if validation fails
      toast.error("Validation service unavailable. Please try again later.");
      return false;
    }
  }, [selectedProduct, handleError]);

  // Handle final submission with rate limiting and enhanced security
  const handleSubmit = useCallback(async (allData: any) => {
    try {
      // Check rate limiting
      if (!formSubmissionRateLimiter.canAttempt()) {
        const remainingTime = formSubmissionRateLimiter.getRemainingTime();
        const remainingMinutes = Math.ceil(remainingTime / 60000);
        toast.error(`Too many submission attempts. Please try again in ${remainingMinutes} minutes.`);
        return;
      }

      if (!user) {
        toast.error("Vui lòng đăng nhập để nộp hồ sơ");
        router.push("/login");
        return;
      }

      if (!selectedProduct) {
        toast.error("Vui lòng chọn sản phẩm vay");
        return;
      }

      startSubmission();

      try {
        // Sanitize all application data
        const sanitizedData = sanitizeApplicationData(allData);

        // Prepare final application data with security enhancements
        const finalData: LoanApplicationData = {
          ...sanitizedData,
          loanDetails: {
            ...sanitizedData.loanDetails,
            productId: selectedProduct.id,
          },
          metadata: {
            ...sanitizedData.metadata,
            applicationDate: new Date().toISOString(),
            ipAddress: "", // Would be filled by backend
            userAgent: navigator.userAgent,
            sourceChannel: "web",
            securityVersion: "1.0", // Track security version
          },
        };

        // Submit application
        const result = await loanApi.submitFinalApplication(finalData);

        if (result.success) {
          setSubmissionSuccess();
          toast.success("Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm.");

          // Clear persisted data
          clearPersistedData();

          // Call completion callback
          if (onComplete) {
            onComplete(result.applicationId);
          } else {
            // Redirect to success page
            router.push(`/loan/application/success?applicationId=${result.applicationId}`);
          }
        } else {
          throw new Error(result.message || "Nộp hồ sơ thất bại");
        }
      } catch (submissionError) {
        handleError(submissionError instanceof Error ? submissionError : new Error('Submission failed'));
        throw submissionError;
      }
    } catch (error) {
      console.error("Application submission failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Nộp hồ sơ thất bại. Vui lòng thử lại.";
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    }
  }, [
    user,
    selectedProduct,
    startSubmission,
    setSubmissionSuccess,
    setSubmissionError,
    clearPersistedData,
    onComplete,
    router,
    handleError,
  ]);

  // Manual save draft
  const handleSaveDraft = useCallback(async () => {
    if (!applicationData || readOnly) return;

    try {
      setIsSavingDraft(true);
      await loanApi.saveDraftApplication(applicationData);
      setLastSaveTime(new Date());
      toast.success("Đã lưu bản nháp");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Lưu bản nháp thất bại");
    } finally {
      setIsSavingDraft(false);
    }
  }, [applicationData, readOnly]);

  // Render step content
  const renderStepContent = useCallback((stepId: string) => {
    switch (stepId) {
      case "loan-details":
        return <LoanDetailsStep
          product={selectedProduct}
          products={loanProducts}
          onProductChange={setSelectedProduct}
          initialAmount={initialAmount}
          initialTerm={initialTerm}
          readOnly={readOnly}
        />;

      case "personal-info":
        return (
          <LoanPersonalInfo
            initialData={applicationData.personalInfo}
            onSubmit={(data) => handleStepData("personalInfo", data)}
            readOnly={readOnly}
          />
        );

      case "financial-info":
        return (
          <LoanFinancialInfo
            initialData={applicationData.financialInfo}
            loanAmount={applicationData.loanDetails?.requestedAmount}
            onSubmit={(data) => handleStepData("financialInfo", data)}
            readOnly={readOnly}
          />
        );

      case "employment-info":
        return (
          <LoanEmploymentInfo
            initialData={applicationData.employmentInfo}
            onSubmit={(data) => handleStepData("employmentInfo", data)}
            readOnly={readOnly}
          />
        );

      case "document-upload":
        return (
          <LoanDocumentUpload
            applicationId={applicationId}
            initialData={applicationData.documents}
            enableEkyc={enableEkyc}
            onSubmit={(data) => handleStepData("documents", data)}
            readOnly={readOnly}
          />
        );

      case "review":
        return (
          <ReviewStep
            applicationData={applicationData}
            loanProduct={selectedProduct}
            onEdit={(stepId) => {
              // Navigate to specific step for editing
              // This would need to be integrated with MultiStepFormRenderer
            }}
            onSubmit={handleSubmit}
            readOnly={readOnly}
          />
        );

      default:
        return <div>Bước không xác định: {stepId}</div>;
    }
  }, [
    selectedProduct,
    loanProducts,
    initialAmount,
    initialTerm,
    applicationData,
    applicationId,
    enableEkyc,
    readOnly,
    handleStepData,
    handleSubmit,
  ]);

  // Form configuration
  const formConfig = {
    ...LOAN_APPLICATION_CONFIG,
    steps: LOAN_APPLICATION_CONFIG.steps.map((step, index) => ({
      ...step,
      fields: [
        {
          fieldName: `${step.id}-content`,
          component: "Custom",
          props: {
            renderContent: () => renderStepContent(step.id),
          },
        },
      ],
      stepValidation: {
        validate: async (data: any) => {
          return await validateStep(step.id, data);
        },
      },
    })),
    onComplete: handleSubmit,
  };

  const completionPercentage = getCompletionPercentage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto mb-4" />
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Loan Application Form Error:', error, errorInfo);
        // You could also send this to a monitoring service
      }}
    >
      <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
        {/* Header */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("title", "Đăng ký vay vốn")}
              </CardTitle>
              <CardDescription>
                {selectedProduct
                  ? `Sản phẩm: ${selectedProduct.name}`
                  : t("description", "Hoàn tất thông tin để được xét duyệt vay vốn nhanh chóng")
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Draft Button */}
              {!readOnly && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
                </Button>
              )}

              {/* Completion Badge */}
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage}% hoàn thành
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Tiến độ hoàn thành hồ sơ</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Last Save Time */}
          {lastSaveTime && (
            <p className="text-xs text-muted-foreground mt-2">
              Lưu lần cuối: {lastSaveTime.toLocaleTimeString("vi-VN")}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {submissionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}

      {/* Multi-Step Form Renderer */}
      <MultiStepFormRenderer
        config={formConfig}
        translationNamespace="loan.applicationForm"
      />

      {/* Quick Summary (Floating) */}
      {!readOnly && completionPercentage > 0 && (
        <Card className="sticky bottom-4 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Tóm tắt hồ sơ</h4>
                  <p className="text-sm text-blue-700">
                    {completionPercentage}% hoàn thành • {!isReadyForSubmission() && "Cần hoàn thành thêm thông tin"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSummary(!showSummary)}
              >
                {showSummary ? "Ẩn" : "Xem"} chi tiết
              </Button>
            </div>

            {showSummary && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <ApplicationSummary
                  applicationData={applicationData}
                  loanProduct={selectedProduct}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Bảo mật</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Thông tin của bạn được bảo vệ tuyệt đối
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Nhanh chóng</h4>
                <p className="text-sm text-green-700 mt-1">
                  Duyệt vay trong vòng 24 giờ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-purple-900">Lãi suất tốt</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Lãi suất cạnh tranh, minh bạch
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-orange-900">Dễ dàng</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Thủ tục đơn giản, giải ngân nhanh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </ErrorBoundary>
  );
};

/**
 * Loan Details Step Component
 */
const LoanDetailsStep: React.FC<{
  product?: LoanProductConfig | null;
  products: LoanProductConfig[];
  onProductChange: (product: LoanProductConfig) => void;
  initialAmount?: number;
  initialTerm?: number;
  readOnly?: boolean;
}> = ({ product, products, onProductChange, initialAmount, initialTerm, readOnly }) => {
  const [amount, setAmount] = useState(initialAmount?.toString() || "");
  const [term, setTerm] = useState(initialTerm?.toString() || "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chọn sản phẩm vay</CardTitle>
          <CardDescription>
            Chọn sản phẩm phù hợp nhất với nhu cầu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  product?.id === p.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => !readOnly && onProductChange(p)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{p.name}</h4>
                  {product?.id === p.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                <div className="space-y-1 text-sm">
                  <div>Lãi suất: {p.interestRate.annual}%/năm</div>
                  <div>Khoản vay: {p.amountLimits.min.toLocaleString("vi-VN")} - {p.amountLimits.max.toLocaleString("vi-VN")} VNĐ</div>
                  <div>Kỳ hạn: {p.termOptions.min} - {p.termOptions.max} tháng</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {product && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết khoản vay</CardTitle>
            <CardDescription>
              Nhập số tiền và kỳ hạn vay mong muốn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Số tiền vay (VNĐ)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={product.amountLimits.min}
                max={product.amountLimits.max}
                placeholder={product.amountLimits.min.toLocaleString("vi-VN")}
                disabled={readOnly}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Giới hạn: {product.amountLimits.min.toLocaleString("vi-VN")} - {product.amountLimits.max.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Kỳ hạn vay (tháng)</label>
              <Input
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                min={product.termOptions.min}
                max={product.termOptions.max}
                placeholder={product.termOptions.default.toString()}
                disabled={readOnly}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Giới hạn: {product.termOptions.min} - {product.termOptions.max} tháng
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Review Step Component
 */
const ReviewStep: React.FC<{
  applicationData: Partial<LoanApplicationData>;
  loanProduct?: LoanProductConfig | null;
  onEdit?: (stepId: string) => void;
  onSubmit: () => void;
  readOnly?: boolean;
}> = ({ applicationData, loanProduct, onEdit, onSubmit, readOnly }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xem lại thông tin</CardTitle>
          <CardDescription>
            Kiểm tra lại toàn bộ thông tin trước khi nộp hồ sơ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationSummary applicationData={applicationData} loanProduct={loanProduct} />

          {!readOnly && (
            <div className="flex justify-end mt-6">
              <Button onClick={onSubmit} size="lg">
                Nộp hồ sơ vay vốn
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Application Summary Component
 */
const ApplicationSummary: React.FC<{
  applicationData: Partial<LoanApplicationData>;
  loanProduct?: LoanProductConfig | null;
}> = ({ applicationData, loanProduct }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Tóm tắt thông tin</h4>

      {applicationData.personalInfo && (
        <div className="border rounded-lg p-4">
          <h5 className="font-medium mb-2">Thông tin cá nhân</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Họ tên:</div>
            <div>{applicationData.personalInfo.fullName}</div>
            <div>Số điện thoại:</div>
            <div>{applicationData.personalInfo.phoneNumber}</div>
            <div>Email:</div>
            <div>{applicationData.personalInfo.email}</div>
          </div>
        </div>
      )}

      {applicationData.loanDetails && (
        <div className="border rounded-lg p-4">
          <h5 className="font-medium mb-2">Khoản vay</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Sản phẩm:</div>
            <div>{loanProduct?.name}</div>
            <div>Số tiền:</div>
            <div>{applicationData.loanDetails.requestedAmount?.toLocaleString("vi-VN")} VNĐ</div>
            <div>Kỳ hạn:</div>
            <div>{applicationData.loanDetails.loanTerm} tháng</div>
            <div>Mục đích:</div>
            <div>{applicationData.loanDetails.loanPurpose}</div>
          </div>
        </div>
      )}

      {applicationData.financialInfo && (
        <div className="border rounded-lg p-4">
          <h5 className="font-medium mb-2">Tài chính</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Khoảng thu nhập:</div>
            <div>{applicationData.financialInfo.monthlyIncomeRange}</div>
            <div>Nguồn thu nhập:</div>
            <div>{applicationData.financialInfo.incomeSource}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicationForm;