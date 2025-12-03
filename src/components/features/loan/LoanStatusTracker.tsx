/**
 * Loan Status Tracker Component
 * Comprehensive real-time loan application status tracking for Vietnamese market
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock,
  FileText,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  Download,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";

import { StatusTimeline } from "./StatusTimeline";
import { DocumentRequirementsTracker } from "./DocumentRequirementsTracker";
import { CommunicationHistory } from "./CommunicationHistory";

import type {
  LoanApplicationStatus,
  StatusConfig,
  DocumentVerificationStatus
} from "@/lib/loan-status/vietnamese-status-config";

import {
  getStatusConfig,
  calculateEstimatedCompletionTime,
  getNextAllowedStatuses
} from "@/lib/loan-status/vietnamese-status-config";

/**
 * Loan application data interface
 */
interface LoanApplicationData {
  id: string;
  status: LoanApplicationStatus;
  loanType: string;
  requestedAmount: number;
  applicationDate: string;
  lastUpdated: string;
  estimatedCompletionDate?: string;
  progressPercentage: number;
  assignedOfficer?: {
    name: string;
    phone: string;
    email: string;
  };
}

/**
 * Document status interface
 */
interface DocumentStatus {
  id: string;
  type: string;
  name: string;
  status: DocumentVerificationStatus;
  uploadDate?: string;
  verificationDate?: string;
  rejectionReason?: string;
  expiryDate?: string;
  fileUrl?: string;
}

/**
 * Communication entry interface
 */
interface CommunicationEntry {
  id: string;
  type: "sms" | "email" | "in_app" | "zalo" | "phone_call";
  title: string;
  content: string;
  sentAt: string;
  readAt?: string;
  sender: string;
  hasAttachments: boolean;
  priority: "low" | "normal" | "high" | "urgent";
}

/**
 * Component props
 */
interface LoanStatusTrackerProps {
  applicationId: string;
  initialData?: LoanApplicationData;
  onStatusUpdate?: (newStatus: LoanApplicationStatus) => void;
  onDocumentUpload?: (documentId: string, file: File) => Promise<void>;
  onSendMessage?: (message: string, type: string) => Promise<void>;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * LoanStatusTracker Component
 */
export const LoanStatusTracker: React.FC<LoanStatusTrackerProps> = ({
  applicationId,
  initialData,
  onStatusUpdate,
  onDocumentUpload,
  onSendMessage,
  className = "",
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [applicationData, setApplicationData] = useState<LoanApplicationData | null>(initialData || null);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [communications, setCommunications] = useState<CommunicationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(autoRefresh);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch application data
  const fetchApplicationData = useCallback(async () => {
    if (!applicationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the API
      // const response = await loanApi.getApplicationStatus(applicationId);
      // setApplicationData(response.data);

      // Mock data for demonstration
      const mockData: LoanApplicationData = {
        id: applicationId,
        status: "dang_tham_dinh",
        loanType: "vay_tieu_dung",
        requestedAmount: 200000000,
        applicationDate: "2024-01-15T09:00:00Z",
        lastUpdated: "2024-01-17T14:30:00Z",
        estimatedCompletionDate: "2024-01-22T17:00:00Z",
        progressPercentage: 65,
        assignedOfficer: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
          email: "nguyenvana@bank.com"
        }
      };

      setApplicationData(mockData);
      setLastRefresh(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin hồ sơ");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!applicationId) return;

    try {
      // Mock documents data
      const mockDocuments: DocumentStatus[] = [
        {
          id: "1",
          type: "cmnd_cccd",
          name: "CMND/CCCD",
          status: "da_xac_nhan",
          uploadDate: "2024-01-15T10:30:00Z",
          verificationDate: "2024-01-15T15:45:00Z",
          fileUrl: "/documents/cmnd.pdf"
        },
        {
          id: "2",
          type: "hop_dong_lao_dong",
          name: "Hợp đồng lao động",
          status: "da_xac_nhan",
          uploadDate: "2024-01-15T11:00:00Z",
          verificationDate: "2024-01-16T09:20:00Z",
          fileUrl: "/documents/hop-dong.pdf"
        },
        {
          id: "3",
          type: "bang_luong",
          name: "Bảng lương",
          status: "cho_tai_len",
          uploadDate: undefined,
          verificationDate: undefined,
        }
      ];

      setDocuments(mockDocuments);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, [applicationId]);

  // Fetch communications
  const fetchCommunications = useCallback(async () => {
    if (!applicationId) return;

    try {
      // Mock communications data
      const mockCommunications: CommunicationEntry[] = [
        {
          id: "1",
          type: "in_app",
          title: "Hồ sơ đã được tiếp nhận",
          content: "Hồ sơ vay vốn của Quý khách đã được tiếp nhận và đang trong quá trình xử lý.",
          sentAt: "2024-01-15T09:30:00Z",
          readAt: "2024-01-15T10:15:00Z",
          sender: "Hệ thống",
          hasAttachments: false,
          priority: "normal"
        },
        {
          id: "2",
          type: "sms",
          title: "Yêu cầu bổ sung giấy tờ",
          content: "Vui lòng cung cấp bảng lương 3 tháng gần nhất để tiếp tục xử lý hồ sơ.",
          sentAt: "2024-01-16T14:20:00Z",
          readAt: "2024-01-16T14:35:00Z",
          sender: "Nguyễn Văn A",
          hasAttachments: false,
          priority: "high"
        },
        {
          id: "3",
          type: "email",
          title: "Hồ sơ đang thẩm định",
          content: "Hồ sơ của Quý khách đang trong giai đoạn thẩm định chuyên sâu.",
          sentAt: "2024-01-17T10:00:00Z",
          readAt: "2024-01-17T10:30:00Z",
          sender: "Hệ thống",
          hasAttachments: true,
          priority: "normal"
        }
      ];

      setCommunications(mockCommunications);
    } catch (err) {
      console.error("Failed to fetch communications:", err);
    }
  }, [applicationId]);

  // Initial data fetch
  useEffect(() => {
    if (applicationId) {
      fetchApplicationData();
      fetchDocuments();
      fetchCommunications();
    }
  }, [applicationId, fetchApplicationData, fetchDocuments, fetchCommunications]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!isRealTimeEnabled || !refreshInterval) return;

    const interval = setInterval(() => {
      fetchApplicationData();
      fetchDocuments();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, refreshInterval, fetchApplicationData, fetchDocuments]);

  // Get status configuration
  const statusConfig = applicationData ? getStatusConfig(applicationData.status) : null;

  // Format date for Vietnamese locale
  const formatVietnameseDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Format currency for Vietnamese locale
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  // Calculate estimated completion
  const estimatedCompletion = applicationData ? calculateEstimatedCompletionTime(
    applicationData.status,
    applicationData.loanType as any
  ) : null;

  // Handle document upload
  const handleDocumentUpload = async (documentId: string, file: File) => {
    try {
      await onDocumentUpload?.(documentId, file);
      // Refresh documents after upload
      await fetchDocuments();
    } catch (err) {
      console.error("Document upload failed:", err);
      throw err;
    }
  };

  // Handle sending message
  const handleSendMessage = async (message: string, type: string) => {
    try {
      await onSendMessage?.(message, type);
      // Refresh communications after sending
      await fetchCommunications();
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  };

  // Render loading state
  if (isLoading && !applicationData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Đang tải thông tin hồ sơ...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={fetchApplicationData}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!applicationData || !statusConfig) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Status Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {statusConfig.label}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Mã hồ sơ: {applicationData.id}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                style={{ backgroundColor: statusConfig.color }}
                className="text-white"
              >
                {statusConfig.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isRealTimeEnabled ? "Tự động" : "Cập nhật"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Tiến độ xử lý
              </span>
              <span className="text-sm text-gray-500">
                {applicationData.progressPercentage}%
              </span>
            </div>
            <Progress
              value={applicationData.progressPercentage}
              className="h-2"
            />
          </div>

          {/* Status Description */}
          <Alert>
            {statusConfig.icon === "check-circle" && <CheckCircle className="h-4 w-4" />}
            {statusConfig.icon === "alert-circle" && <AlertCircle className="h-4 w-4" />}
            {statusConfig.icon === "clock" && <Clock className="h-4 w-4" />}
            <AlertTitle>Thông tin trạng thái</AlertTitle>
            <AlertDescription>
              {statusConfig.description}
            </AlertDescription>
          </Alert>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <FileText className="h-4 w-4 mr-2" />
                Loại vay
              </div>
              <div className="font-semibold text-gray-900">
                {applicationData.loanType === "vay_tieu_dung" ? "Vay tiêu dùng" :
                 applicationData.loanType === "vay_mua_nha" ? "Vay mua nhà" :
                 applicationData.loanType === "vay_kinh_doanh" ? "Vay kinh doanh" :
                 applicationData.loanType === "the_tin_dung" ? "Thẻ tín dụng" :
                 applicationData.loanType}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <FileText className="h-4 w-4 mr-2" />
                Số tiền vay
              </div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(applicationData.requestedAmount)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4 mr-2" />
                Ngày đăng ký
              </div>
              <div className="font-semibold text-gray-900">
                {formatVietnameseDate(applicationData.applicationDate)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4 mr-2" />
                Dự kiến hoàn thành
              </div>
              <div className="font-semibold text-gray-900">
                {estimatedCompletion ?
                  `~${estimatedCompletion.businessDays} ngày làm việc` :
                  applicationData.estimatedCompletionDate ?
                    formatVietnameseDate(applicationData.estimatedCompletionDate) :
                    "Đang cập nhật"
                }
              </div>
            </div>
          </div>

          {/* Assigned Officer */}
          {applicationData.assignedOfficer && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Chuyên viên phụ trách
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{applicationData.assignedOfficer.name}</span>
                    <a
                      href={`tel:${applicationData.assignedOfficer.phone}`}
                      className="flex items-center hover:text-blue-600"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {applicationData.assignedOfficer.phone}
                    </a>
                    <a
                      href={`mailto:${applicationData.assignedOfficer.email}`}
                      className="flex items-center hover:text-blue-600"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Liên hệ
                    </a>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Nhắn tin
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Gọi điện
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Last refresh info */}
          <div className="text-xs text-gray-500 text-right">
            Cập nhật lần cuối: {formatVietnameseDate(lastRefresh.toISOString())}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Lịch sử
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Giấy tờ
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Liên hệ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <StatusTimeline
            applicationId={applicationId}
            currentStatus={applicationData.status}
            applicationDate={applicationData.applicationDate}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentRequirementsTracker
            applicationId={applicationId}
            documents={documents}
            onUpload={handleDocumentUpload}
          />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CommunicationHistory
            applicationId={applicationId}
            communications={communications}
            onSendMessage={handleSendMessage}
            assignedOfficer={applicationData.assignedOfficer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanStatusTracker;