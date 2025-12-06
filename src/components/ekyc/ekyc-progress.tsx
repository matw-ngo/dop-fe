/**
 * eKYC Progress Component
 * Displays progress and status of eKYC verification steps
 */

"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  Shield,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEkycStore } from "@/store/use-ekyc-store";

interface eKYCProgressProps {
  showDetails?: boolean;
  showTimeEstimates?: boolean;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

interface StepInfo {
  id: string;
  name: string;
  nameVi: string;
  icon: React.ReactNode;
  estimatedDuration?: number; // in seconds
  description: string;
  descriptionVi: string;
}

const EKYC_STEPS_INFO: StepInfo[] = [
  {
    id: "document_front",
    name: "Document Front",
    nameVi: "Mặt trước giấy tờ",
    icon: <FileText className="h-4 w-4" />,
    estimatedDuration: 30,
    description: "Scan the front side of your document",
    descriptionVi: "Quét mặt trước của giấy tờ",
  },
  {
    id: "document_back",
    name: "Document Back",
    nameVi: "Mặt sau giấy tờ",
    icon: <FileText className="h-4 w-4" />,
    estimatedDuration: 30,
    description: "Scan the back side of your document",
    descriptionVi: "Quét mặt sau của giấy tờ",
  },
  {
    id: "face_capture",
    name: "Face Capture",
    nameVi: "Chụp khuôn mặt",
    icon: <Camera className="h-4 w-4" />,
    estimatedDuration: 20,
    description: "Capture your face photo",
    descriptionVi: "Chụp ảnh khuôn mặt",
  },
  {
    id: "liveness_check",
    name: "Liveness Check",
    nameVi: "Kiểm tra sống",
    icon: <User className="h-4 w-4" />,
    estimatedDuration: 45,
    description: "Complete liveness verification challenges",
    descriptionVi: "Hoàn thành thử thách kiểm tra sống",
  },
  {
    id: "face_comparison",
    name: "Face Comparison",
    nameVi: "So sánh khuôn mặt",
    icon: <Shield className="h-4 w-4" />,
    estimatedDuration: 15,
    description: "Compare face with document photo",
    descriptionVi: "So sánh khuôn mặt với ảnh trên giấy tờ",
  },
  {
    id: "finalization",
    name: "Finalization",
    nameVi: "Hoàn tất",
    icon: <CheckCircle className="h-4 w-4" />,
    estimatedDuration: 10,
    description: "Process and finalize verification",
    descriptionVi: "Xử lý và hoàn tất xác thực",
  },
];

const getStepStatus = (
  step: StepInfo,
  steps: any[],
  currentStep: string,
): "completed" | "in_progress" | "pending" | "failed" | "skipped" => {
  const stepData = steps.find((s) => s.id === step.id);
  if (!stepData) return "pending";

  if (stepData.status === "completed") return "completed";
  if (stepData.status === "failed") return "failed";
  if (stepData.status === "in_progress") return "in_progress";
  if (stepData.status === "skipped") return "skipped";
  if (step.id === currentStep) return "in_progress";
  return "pending";
};

const getStepIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "skipped":
      return <Circle className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}p ${remainingSeconds}s`;
  }
  return `${seconds}s`;
};

const calculateEstimatedTimeRemaining = (
  steps: any[],
  currentStep: string,
): number => {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  if (currentStepIndex === -1) return 0;

  let remainingTime = 0;
  for (let i = currentStepIndex; i < steps.length; i++) {
    const stepInfo = EKYC_STEPS_INFO.find((info) => info.id === steps[i]?.id);
    if (stepInfo && stepInfo.estimatedDuration) {
      remainingTime += stepInfo.estimatedDuration;
    }
  }

  return remainingTime;
};

export const eKYCProgress: React.FC<eKYCProgressProps> = ({
  showDetails = false,
  showTimeEstimates = false,
  className,
  variant = "default",
}) => {
  const { steps, currentStep, progress, status, errors, warnings } =
    useEkycStore();

  // Overall progress stats
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const failedSteps = steps.filter((s) => s.status === "failed").length;
  const totalSteps = steps.length;
  const estimatedTimeRemaining = calculateEstimatedTimeRemaining(
    steps,
    currentStep,
  );

  // Compact variant - simple progress bar
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {completedSteps}/{totalSteps} hoàn thành
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        {warnings.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            <span>{warnings.length} cảnh báo</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant - full card with step breakdown
  if (variant === "detailed") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tiến trình xác thực eKYC
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant={status === "success" ? "default" : "secondary"}>
              {status === "success" ? "Đã hoàn thành" : "Đang xử lý"}
            </Badge>
            {showTimeEstimates && estimatedTimeRemaining > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>~{formatDuration(estimatedTimeRemaining)} còn lại</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Details */}
          <div className="space-y-3">
            {EKYC_STEPS_INFO.map((stepInfo) => {
              const stepStatus = getStepStatus(stepInfo, steps, currentStep);
              const stepData = steps.find((s) => s.id === stepInfo.id);

              return (
                <div
                  key={stepInfo.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    stepStatus === "in_progress" &&
                      "bg-blue-50 border-blue-200",
                    stepStatus === "completed" &&
                      "bg-green-50 border-green-200",
                    stepStatus === "failed" && "bg-red-50 border-red-200",
                  )}
                >
                  <div className="flex-shrink-0">{getStepIcon(stepStatus)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stepInfo.nameVi}</span>
                      {showTimeEstimates && stepInfo.estimatedDuration && (
                        <span className="text-xs text-muted-foreground">
                          (~{formatDuration(stepInfo.estimatedDuration)})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stepInfo.descriptionVi}
                    </p>
                    {stepData?.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Hoàn thành trong{" "}
                        {formatDuration(Math.round(stepData.duration / 1000))}
                      </p>
                    )}
                    {(stepData?.retryCount || 0) > 0 && (
                      <Badge variant="secondary" className="mt-1">
                        Thử lại {stepData?.retryCount || 0} lần
                      </Badge>
                    )}
                  </div>
                  {stepStatus === "in_progress" && (
                    <div className="w-16">
                      <Progress
                        value={stepData?.progress || 0}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Summary */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Lỗi ({errors.length})
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.slice(0, 3).map((error, index) => (
                  <li key={index} className="line-clamp-1">
                    {error}
                  </li>
                ))}
                {errors.length > 3 && (
                  <li className="text-xs text-red-600">
                    Và {errors.length - 3} lỗi khác...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Warning Summary */}
          {warnings.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Cảnh báo ({warnings.length})
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {warnings.slice(0, 3).map((warning, index) => (
                  <li key={index} className="line-clamp-1">
                    {warning}
                  </li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-xs text-amber-600">
                    Và {warnings.length - 3} cảnh báo khác...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedSteps}
              </div>
              <div className="text-xs text-muted-foreground">Hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {steps.filter((s) => s.status === "in_progress").length}
              </div>
              <div className="text-xs text-muted-foreground">
                Đang thực hiện
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {failedSteps}
              </div>
              <div className="text-xs text-muted-foreground">Thất bại</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress}%</div>
              <div className="text-xs text-muted-foreground">Tiến độ</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - balanced view
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Tiến trình xác thực
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSteps}/{totalSteps} bước hoàn thành
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Step */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          <div>
            <div className="font-medium text-blue-900">
              {steps.find((s) => s.id === currentStep)?.nameVi ||
                "Đang xử lý..."}
            </div>
            <div className="text-sm text-blue-700">
              {
                EKYC_STEPS_INFO.find((info) => info.id === currentStep)
                  ?.descriptionVi
              }
            </div>
          </div>
        </div>

        {/* Step Overview */}
        <div className="space-y-2">
          {EKYC_STEPS_INFO.slice(0, 5).map((stepInfo) => {
            const stepStatus = getStepStatus(stepInfo, steps, currentStep);
            return (
              <div key={stepInfo.id} className="flex items-center gap-2">
                {getStepIcon(stepStatus)}
                <span
                  className={cn(
                    "text-sm",
                    stepStatus === "completed" && "text-green-600",
                    stepStatus === "in_progress" && "text-blue-600 font-medium",
                    stepStatus === "failed" && "text-red-600",
                    stepStatus === "skipped" && "text-gray-400 line-through",
                  )}
                >
                  {stepInfo.nameVi}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 pt-2">
          {errors.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.length} lỗi
            </Badge>
          )}
          {warnings.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {warnings.length} cảnh báo
            </Badge>
          )}
          {showTimeEstimates && estimatedTimeRemaining > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />~
              {formatDuration(estimatedTimeRemaining)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default eKYCProgress;
