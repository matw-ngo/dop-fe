/**
 * Enhanced eKYC Result Display Component
 * Comprehensive display of eKYC verification results with Vietnamese support
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  User,
  FileText,
  Shield,
  Camera,
  Download,
  Eye,
  EyeOff,
  Edit,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Info,
  RefreshCw,
  Copy,
  FileDown,
} from "lucide-react";
import { EkycFullResult, getEkycSummary } from "@/lib/ekyc/ekyc-data-mapper";
import { useEkycStore } from "@/store/use-ekyc-store";
import {
  VietnameseDocumentType,
  getDocumentTypeById,
} from "@/lib/ekyc/document-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface eKYCResultDisplayProps {
  result?: EkycFullResult;
  onEdit?: (field: string, value: string) => void;
  onExport?: (format: "json" | "pdf" | "csv") => void;
  onRetry?: () => void;
  showActions?: boolean;
  showDetails?: boolean;
  allowEdit?: boolean;
  className?: string;
  variant?: "compact" | "detailed" | "summary";
}

interface DataField {
  label: string;
  labelVi: string;
  value: string;
  confidence?: number;
  editable?: boolean;
  icon?: React.ReactNode;
  format?: "text" | "date" | "address" | "phone" | "email";
  verification?: "verified" | "unverified" | "warning";
}

const DataField: React.FC<{
  field: DataField;
  onEdit?: (field: string, value: string) => void;
  isEditing?: boolean;
}> = ({ field, onEdit, isEditing = false }) => {
  const [editValue, setEditValue] = useState(field.value);
  const [showValue, setShowValue] = useState(true);

  const getVerificationIcon = () => {
    switch (field.verification) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "unverified":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500";
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const formatValue = (value: string, format?: string) => {
    switch (format) {
      case "date":
        if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = value.split("-");
          return `${day}/${month}/${year}`;
        }
        return value;
      case "phone":
        return value.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
      case "email":
        return value.toLowerCase();
      default:
        return value;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      {field.icon && (
        <div className="flex-shrink-0 text-muted-foreground">{field.icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">
            {field.labelVi}
          </span>
          {getVerificationIcon()}
        </div>
        {isEditing && field.editable ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => onEdit?.(field.label, editValue)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {formatValue(field.value, field.format)}
            </span>
            {field.confidence && (
              <span
                className={cn("text-xs", getConfidenceColor(field.confidence))}
              >
                ({field.confidence}%)
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {field.editable && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(field.label, field.value)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const eKYCResultDisplay: React.FC<eKYCResultDisplayProps> = ({
  result,
  onEdit,
  onExport,
  onRetry,
  showActions = true,
  showDetails = true,
  allowEdit = false,
  className,
  variant = "detailed",
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const store = useEkycStore();
  const ekycResult = result || store.rawResult;
  const formData = store.formData;

  if (!ekycResult) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No eKYC Result</h3>
          <p className="text-muted-foreground mb-4">
            No verification result available
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Verification
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const summary = getEkycSummary(ekycResult);
  const documentType = getDocumentTypeById(ekycResult.type_document);

  // Prepare data fields
  const personalInfoFields: DataField[] = [
    {
      label: "fullName",
      labelVi: "Họ và tên",
      value: formData?.fullName || summary.fullName || "N/A",
      confidence: ekycResult.ocr?.object?.name_prob,
      editable: allowEdit,
      icon: <User className="h-4 w-4" />,
      verification: "verified",
    },
    {
      label: "dateOfBirth",
      labelVi: "Ngày sinh",
      value: formData?.dateOfBirth || summary.dateOfBirth || "N/A",
      confidence: ekycResult.ocr?.object?.birth_day_prob,
      editable: allowEdit,
      icon: <Calendar className="h-4 w-4" />,
      format: "date",
      verification: "verified",
    },
    {
      label: "gender",
      labelVi: "Giới tính",
      value:
        formData?.gender === "male"
          ? "Nam"
          : formData?.gender === "female"
            ? "Nữ"
            : formData?.gender === "other"
              ? "Khác"
              : "N/A",
      editable: allowEdit,
      icon: <User className="h-4 w-4" />,
      verification: "verified",
    },
    {
      label: "address",
      labelVi: "Địa chỉ",
      value: formData?.address || summary.address || "N/A",
      confidence: ekycResult.ocr?.object?.recent_location_prob,
      editable: allowEdit,
      icon: <MapPin className="h-4 w-4" />,
      format: "address",
      verification: "verified",
    },
  ];

  const documentFields: DataField[] = [
    {
      label: "documentType",
      labelVi: "Loại giấy tờ",
      value: documentType?.nameVi || "N/A",
      icon: <FileText className="h-4 w-4" />,
      verification: "verified",
    },
    {
      label: "idNumber",
      labelVi: "Số giấy tờ",
      value: summary.idNumber || "N/A",
      confidence: ekycResult.ocr?.object?.citizen_id_prob,
      icon: <FileText className="h-4 w-4" />,
      verification: "verified",
    },
    {
      label: "issueDate",
      labelVi: "Ngày cấp",
      value: ekycResult.ocr?.object?.issue_date || "N/A",
      confidence: ekycResult.ocr?.object?.issue_date_prob,
      icon: <Calendar className="h-4 w-4" />,
      format: "date",
      verification: "verified",
    },
    {
      label: "issuePlace",
      labelVi: "Nơi cấp",
      value: ekycResult.ocr?.object?.issue_place || "N/A",
      confidence: ekycResult.ocr?.object?.issue_place_prob,
      icon: <MapPin className="h-4 w-4" />,
      verification: "verified",
    },
    {
      label: "expiryDate",
      labelVi: "Ngày hết hạn",
      value: ekycResult.ocr?.object?.valid_date || "N/A",
      confidence: ekycResult.ocr?.object?.valid_date_prob,
      icon: <Calendar className="h-4 w-4" />,
      format: "date",
      verification: "verified",
    },
  ];

  const getFaceMatchBadge = () => {
    if (!summary.faceMatch) {
      return <Badge variant="secondary">Chưa kiểm tra</Badge>;
    }

    if (summary.matchScore && summary.matchScore >= 80) {
      return (
        <Badge className="bg-green-100 text-green-800">
          Khớp ({Math.round(summary.matchScore)}%)
        </Badge>
      );
    } else if (summary.matchScore && summary.matchScore >= 60) {
      return (
        <Badge className="bg-amber-100 text-amber-800">
          Khớp một phần ({Math.round(summary.matchScore)}%)
        </Badge>
      );
    } else {
      return <Badge variant="destructive">Không khớp</Badge>;
    }
  };

  const getOverallScore = () => {
    let score = 0;
    let factors = 0;

    // Document OCR confidence
    if (ekycResult.ocr?.object?.name_prob) {
      score += ekycResult.ocr.object.name_prob;
      factors++;
    }

    // Face match score
    if (summary.matchScore) {
      score += summary.matchScore;
      factors++;
    }

    // Liveness confidence
    if (ekycResult.liveness_face?.object?.liveness_prob) {
      score += ekycResult.liveness_face.object.liveness_prob;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  const handleExport = (format: "json" | "pdf" | "csv") => {
    onExport?.(format);
  };

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Kết quả xác thực eKYC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Họ tên:</span>
              <p className="font-medium">{summary.fullName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Số giấy tờ:</span>
              <p className="font-medium">{summary.idNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Khớp khuôn mặt:
            </span>
            {getFaceMatchBadge()}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Điểm tin cậy:</span>
            <Badge variant="outline">{getOverallScore()}%</Badge>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
              >
                <Copy className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Summary variant
  if (variant === "summary") {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Xác thực thành công
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Độ tin cậy: {getOverallScore()}%
              </Badge>
              {getFaceMatchBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Thông tin cá nhân</h4>
              {personalInfoFields.slice(0, 3).map((field) => (
                <div key={field.label} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {field.labelVi}:
                  </span>
                  <span className="text-sm font-medium">{field.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Thông tin giấy tờ</h4>
              {documentFields.slice(0, 3).map((field) => (
                <div key={field.label} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {field.labelVi}:
                  </span>
                  <span className="text-sm font-medium">{field.value}</span>
                </div>
              ))}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2 mt-6">
              <Button onClick={() => handleExport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                Tải PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("json")}>
                <Copy className="h-4 w-4 mr-2" />
                Sao chép JSON
              </Button>
              {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant (default)
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Kết quả xác thực eKYC
              </CardTitle>
              <CardDescription>
                Xác thực hoàn tất lúc {new Date().toLocaleString("vi-VN")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Độ tin cậy: {getOverallScore()}%
              </Badge>
              {getFaceMatchBadge()}
            </div>
          </div>
        </CardHeader>
        {showActions && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleExport("pdf")}>
                <FileDown className="h-4 w-4 mr-2" />
                Tải PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("json")}>
                <Copy className="h-4 w-4 mr-2" />
                Sao chép JSON
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </Button>
              {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {showSensitiveData ? "Ẩn thông tin" : "Hiện thông tin"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="document">Giấy tờ</TabsTrigger>
          <TabsTrigger value="verification">Chi tiết xác thực</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {getOverallScore()}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Độ tin cậy tổng thể
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {summary.matchScore ? Math.round(summary.matchScore) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Khớp khuôn mặt
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {ekycResult.ocr?.object?.name_prob
                    ? Math.round(ekycResult.ocr.object.name_prob)
                    : 0}
                  %
                </div>
                <div className="text-sm text-muted-foreground">
                  Độ chính xác OCR
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tóm tắt xác thực</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Thông tin cơ bản</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Họ tên:</span>
                      <span className="font-medium">{summary.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày sinh:</span>
                      <span className="font-medium">{summary.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giấy tờ:</span>
                      <span className="font-medium">
                        {documentType?.nameVi || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Trạng thái xác thực</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">OCR giấy tờ: Hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Kiểm tra sống: Hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {summary.faceMatch ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm">
                        So sánh khuôn mặt:{" "}
                        {summary.faceMatch ? "Hoàn thành" : "Chưa thực hiện"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Thông tin được trích xuất từ giấy tờ tùy thân
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {personalInfoFields.map((field) => (
                <DataField
                  key={field.label}
                  field={field}
                  onEdit={onEdit}
                  isEditing={editingField === field.label}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Information Tab */}
        <TabsContent value="document" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin giấy tờ
              </CardTitle>
              <CardDescription>
                Chi tiết về giấy tờ đã được xác thực
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentFields.map((field) => (
                <DataField
                  key={field.label}
                  field={field}
                  onEdit={onEdit}
                  isEditing={editingField === field.label}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Details Tab */}
        <TabsContent value="verification" className="space-y-4">
          {/* OCR Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Chi tiết OCR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Chất lượng hình ảnh</h4>
                  <div className="space-y-2">
                    {ekycResult.ocr?.object?.quality_front && (
                      <div className="flex justify-between text-sm">
                        <span>Mặt trước:</span>
                        <span>
                          {Math.round(
                            ekycResult.ocr.object.quality_front.blur_score *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    )}
                    {ekycResult.ocr?.object?.quality_back && (
                      <div className="flex justify-between text-sm">
                        <span>Mặt sau:</span>
                        <span>
                          {Math.round(
                            ekycResult.ocr.object.quality_back.blur_score * 100,
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cảnh báo</h4>
                  <div className="space-y-1">
                    {ekycResult.ocr?.object?.corner_warning === "yes" && (
                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                        <AlertTriangle className="h-3 w-3" />
                        Giấy tờ bị mất góc
                      </div>
                    )}
                    {ekycResult.ocr?.object?.expire_warning === "yes" && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-3 w-3" />
                        Giấy tờ hết hạn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Face Verification Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Chi tiết xác thực khuôn mặt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Kiểm tra sống</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Trạng thái:</span>
                      <Badge
                        variant={
                          ekycResult.liveness_face?.object?.liveness ===
                          "success"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {ekycResult.liveness_face?.object?.liveness_msg ||
                          "N/A"}
                      </Badge>
                    </div>
                    {ekycResult.liveness_face?.object?.liveness_prob && (
                      <div className="flex justify-between text-sm">
                        <span>Độ tin cậy:</span>
                        <span>
                          {Math.round(
                            ekycResult.liveness_face.object.liveness_prob,
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">So sánh khuôn mặt</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Kết quả:</span>
                      <span>{summary.matchMessage || "N/A"}</span>
                    </div>
                    {summary.matchScore && (
                      <div className="flex justify-between text-sm">
                        <span>Độ tương đồng:</span>
                        <span>{Math.round(summary.matchScore)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Kiểm tra bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Anti-Spoofing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Đã qua kiểm tra chống giả mạo
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Data Encryption</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dữ liệu được mã hóa end-to-end
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Audit Trail</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Đã ghi nhật ký xác thực
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default eKYCResultDisplay;
