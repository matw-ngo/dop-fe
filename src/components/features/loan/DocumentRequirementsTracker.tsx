/**
 * Document Requirements Tracker Component
 * Comprehensive document status tracking and verification for Vietnamese loan applications
 */

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  Download,
  Eye,
  AlertCircle,
  RefreshCw,
  Info,
  Calendar,
  User
} from "lucide-react";

import type {
  DocumentVerificationStatus,
  DocumentTypeConfig
} from "@/lib/loan-status/vietnamese-status-config";

import {
  getDocumentTypeConfig,
  VIETNAMESE_DOCUMENT_TYPES
} from "@/lib/loan-status/vietnamese-status-config";

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
  fileName?: string;
  fileSize?: number;
  uploadedBy?: string;
  verifiedBy?: string;
  comments?: string;
}

/**
 * Upload progress interface
 */
interface UploadProgress {
  documentId: string;
  progress: number;
  isUploading: boolean;
  error?: string;
}

/**
 * Component props
 */
interface DocumentRequirementsTrackerProps {
  applicationId: string;
  documents: DocumentStatus[];
  onUpload?: (documentId: string, file: File) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  onResubmit?: (documentId: string, file: File) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

/**
 * Vietnamese status labels and colors
 */
const VERIFICATION_STATUS_CONFIG = {
  cho_tai_len: {
    label: "Chờ tải lên",
    color: "#9CA3AF", // gray
    icon: Clock,
    description: "Vui lòng tải lên giấy tờ theo yêu cầu"
  },
  dang_tai_len: {
    label: "Đang tải lên",
    color: "#F59E0B", // amber
    icon: Upload,
    description: "Giấy tờ đang được tải lên hệ thống"
  },
  da_tai_len: {
    label: "Đã tải lên",
    color: "#3B82F6", // blue
    icon: FileText,
    description: "Giấy tờ đã được tải lên và chờ xác minh"
  },
  dang_kiem_tra: {
    label: "Đang kiểm tra",
    color: "#8B5CF6", // purple
    icon: Clock,
    description: "Giấy tờ đang được kiểm tra và xác minh"
  },
  da_xac_nhan: {
    label: "Đã xác nhận",
    color: "#10B981", // green
    icon: CheckCircle2,
    description: "Giấy tờ đã được xác nhận hợp lệ"
  },
  bi_tu_choi: {
    label: "Bị từ chối",
    color: "#EF4444", // red
    icon: AlertCircle,
    description: "Giấy tờ không hợp lệ, vui lòng tải lại"
  },
  het_han: {
    label: "Hết hạn",
    color: "#F97316", // orange
    icon: AlertTriangle,
    description: "Giấy tờ đã hết hạn, vui lòng cập nhật mới"
  }
} as const;

/**
 * DocumentRequirementsTracker Component
 */
export const DocumentRequirementsTracker: React.FC<DocumentRequirementsTrackerProps> = ({
  applicationId,
  documents,
  onUpload,
  onDelete,
  onResubmit,
  className = "",
  readOnly = false
}) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [selectedDocument, setSelectedDocument] = useState<DocumentStatus | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Group documents by category
  const getDocumentsByCategory = () => {
    const categories = [
      {
        id: "giay_to_dinh_danh",
        name: "Giấy tờ định danh",
        description: "CMND/CCCD, Hộ khẩu, Giấy phép lái xe",
        color: "#3B82F6",
        icon: "user"
      },
      {
        id: "giay_to_thu_nhap",
        name: "Giấy tờ thu nhập",
        description: "Hợp đồng lao động, Bảng lương, Sao kê lương",
        color: "#10B981",
        icon: "money"
      },
      {
        id: "giay_to_nha_o",
        name: "Giấy tờ nhà ở",
        description: "Sổ đỏ, Hợp đồng thuê nhà, Giấy chứng nhận",
        color: "#F59E0B",
        icon: "home"
      },
      {
        id: "giay_to_doanh_nghiep",
        name: "Giấy tờ doanh nghiệp",
        description: "Giấy phép kinh doanh, Báo cáo tài chính",
        color: "#8B5CF6",
        icon: "business"
      },
      {
        id: "giay_to_dam_bao",
        name: "Giấy tờ đảm bảo",
        description: "Giấy tờ tài sản đảm bảo, bảo hiểm",
        color: "#EF4444",
        icon: "shield"
      }
    ];

    return categories.map(category => ({
      ...category,
      documents: documents.filter(doc => {
        const docTypeConfig = getDocumentTypeConfig(doc.type);
        return docTypeConfig?.category === category.id;
      })
    }));
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (documents.length === 0) return 0;

    const statusWeights = {
      cho_tai_len: 0,
      dang_tai_len: 25,
      da_tai_len: 50,
      dang_kiem_tra: 75,
      da_xac_nhan: 100,
      bi_tu_choi: 25,
      het_han: 0
    };

    const totalWeight = documents.reduce((sum, doc) => {
      return sum + (statusWeights[doc.status] || 0);
    }, 0);

    return Math.round(totalWeight / documents.length);
  };

  // Get documents requiring action
  const getDocumentsRequiringAction = () => {
    return documents.filter(doc =>
      ["cho_tai_len", "bi_tu_choi", "het_han"].includes(doc.status) && !readOnly
    );
  };

  // Handle file upload
  const handleFileUpload = async (documentId: string, file: File) => {
    if (!onUpload || readOnly) return;

    // Validate file
    const docTypeConfig = getDocumentTypeConfig(documentId);
    if (docTypeConfig) {
      // Check file type
      const fileExtension = file.name.split('.').pop()?.toUpperCase();
      const allowedFormats = docTypeConfig.allowedFormats.map(f => f.split('.').pop()?.toUpperCase());

      if (!fileExtension || !allowedFormats.includes(fileExtension)) {
        setUploadProgress(prev => ({
          ...prev,
          [documentId]: {
            documentId,
            progress: 0,
            isUploading: false,
            error: `Định dạng file không hợp lệ. Vui lòng chọn file: ${docTypeConfig.allowedFormats.join(', ')}`
          }
        }));
        return;
      }

      // Check file size
      if (file.size > docTypeConfig.maxSize * 1024 * 1024) {
        setUploadProgress(prev => ({
          ...prev,
          [documentId]: {
            documentId,
            progress: 0,
            isUploading: false,
            error: `Kích thước file quá lớn. Tối đa: ${docTypeConfig.maxSize}MB`
          }
        }));
        return;
      }
    }

    // Start upload
    setUploadProgress(prev => ({
      ...prev,
      [documentId]: {
        documentId,
        progress: 0,
        isUploading: true,
        error: undefined
      }
    }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[documentId];
          if (!current || current.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return {
            ...prev,
            [documentId]: {
              ...current,
              progress: current.progress + 10
            }
          };
        });
      }, 200);

      await onUpload(documentId, file);

      clearInterval(progressInterval);

      setUploadProgress(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          progress: 100,
          isUploading: false
        }
      }));

      // Clear progress after success
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[documentId];
          return newProgress;
        });
      }, 2000);

    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          progress: 0,
          isUploading: false,
          error: error instanceof Error ? error.message : "Tải lên thất bại"
        }
      }));
    }
  };

  // Handle file input change
  const handleFileInputChange = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(documentId, file);
    }
  };

  // Get status configuration
  const getStatusConfig = (status: DocumentVerificationStatus) => {
    return VERIFICATION_STATUS_CONFIG[status];
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 KB";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${Math.round(size * 100) / 100} ${sizes[i]}`;
  };

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

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const documentsByCategory = getDocumentsByCategory();
  const overallProgress = calculateOverallProgress();
  const documentsRequiringAction = getDocumentsRequiringAction();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              Quản lý giấy tờ hồ sơ
            </CardTitle>
            <Badge variant="outline" className="ml-2">
              {overallProgress}% hoàn tất
            </Badge>
          </div>

          <div className="mt-4">
            <Progress value={overallProgress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              {documents.filter(d => d.status === "da_xac_nhan").length}/{documents.length} giấy tờ đã xác nhận
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Documents requiring action alert */}
          {documentsRequiringAction.length > 0 && !readOnly && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">
                Cần hành động
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                {documentsRequiringAction.length} giấy tờ cần được tải lên hoặc cập nhật.
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {documents.filter(d => d.status === "da_xac_nhan").length}
              </div>
              <div className="text-sm text-gray-600">Đã xác nhận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {documents.filter(d => ["dang_tai_len", "da_tai_len", "dang_kiem_tra"].includes(d.status)).length}
              </div>
              <div className="text-sm text-gray-600">Đang xử lý</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {documents.filter(d => ["bi_tu_choi", "het_han"].includes(d.status)).length}
              </div>
              <div className="text-sm text-gray-600">Cần cập nhật</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {documents.filter(d => d.status === "cho_tai_len").length}
              </div>
              <div className="text-sm text-gray-600">Chờ tải lên</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tất cả ({documents.length})</TabsTrigger>
          {documentsByCategory.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name.split(' ')[0]} ({category.documents.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DocumentCategoryGrid
            categories={documentsByCategory}
            onFileInputChange={handleFileInputChange}
            getStatusConfig={getStatusConfig}
            getDocumentTypeConfig={getDocumentTypeConfig}
            formatFileSize={formatFileSize}
            formatVietnameseDate={formatVietnameseDate}
            getDaysUntilExpiry={getDaysUntilExpiry}
            uploadProgress={uploadProgress}
            setSelectedDocument={setSelectedDocument}
            fileInputRefs={fileInputRefs}
            readOnly={readOnly}
          />
        </TabsContent>

        {documentsByCategory.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <DocumentCategoryCard
              category={category}
              onFileInputChange={handleFileInputChange}
              getStatusConfig={getStatusConfig}
              getDocumentTypeConfig={getDocumentTypeConfig}
              formatFileSize={formatFileSize}
              formatVietnameseDate={formatVietnameseDate}
              getDaysUntilExpiry={getDaysUntilExpiry}
              uploadProgress={uploadProgress}
              setSelectedDocument={setSelectedDocument}
              fileInputRefs={fileInputRefs}
              readOnly={readOnly}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết giấy tờ</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              {/* Status information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge
                      style={{
                        backgroundColor: getStatusConfig(selectedDocument.status).color + "20",
                        color: getStatusConfig(selectedDocument.status).color
                      }}
                      className="flex items-center"
                    >
                      {React.createElement(getStatusConfig(selectedDocument.status).icon, {
                        className: "h-3 w-3 mr-1"
                      })}
                      {getStatusConfig(selectedDocument.status).label}
                    </Badge>
                  </div>
                </div>

                {selectedDocument.uploadDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ngày tải lên</Label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatVietnameseDate(selectedDocument.uploadDate)}
                    </div>
                  </div>
                )}

                {selectedDocument.verificationDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ngày xác minh</Label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatVietnameseDate(selectedDocument.verificationDate)}
                    </div>
                  </div>
                )}

                {selectedDocument.fileName && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tên file</Label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedDocument.fileName}
                    </div>
                  </div>
                )}
              </div>

              {/* Document information */}
              {getDocumentTypeConfig(selectedDocument.type) && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Hướng dẫn</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {getDocumentTypeConfig(selectedDocument.type).vietnameseInstructions}
                  </div>
                </div>
              )}

              {/* Comments */}
              {selectedDocument.comments && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ghi chú</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    {selectedDocument.comments}
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {selectedDocument.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Lý do từ chối</Label>
                  <div className="mt-1 p-3 bg-red-50 rounded-lg text-sm text-red-800">
                    {selectedDocument.rejectionReason}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                {selectedDocument.fileUrl && (
                  <Button variant="outline" asChild>
                    <a href={selectedDocument.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Xem tài liệu
                    </a>
                  </Button>
                )}

                {selectedDocument.fileUrl && (
                  <Button variant="outline" asChild>
                    <a href={selectedDocument.fileUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </a>
                  </Button>
                )}

                {(selectedDocument.status === "bi_tu_choi" || selectedDocument.status === "het_han") && !readOnly && (
                  <Button
                    onClick={() => {
                      fileInputRefs.current[selectedDocument.id]?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lại tài liệu
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs */}
      {documents.map(doc => (
        <input
          key={doc.id}
          type="file"
          ref={el => fileInputRefs.current[doc.id] = el}
          onChange={(e) => handleFileInputChange(doc.id, e)}
          accept={getDocumentTypeConfig(doc.type)?.allowedFormats.join(",")}
          className="hidden"
        />
      ))}
    </div>
  );
};

/**
 * Document Category Grid Component
 */
interface DocumentCategoryGridProps {
  categories: any[];
  onFileInputChange: (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  getStatusConfig: (status: DocumentVerificationStatus) => any;
  getDocumentTypeConfig: (documentId: string) => DocumentTypeConfig | null;
  formatFileSize: (bytes?: number) => string;
  formatVietnameseDate: (dateString: string) => string;
  getDaysUntilExpiry: (expiryDate?: string) => number | null;
  uploadProgress: Record<string, UploadProgress>;
  setSelectedDocument: (doc: DocumentStatus | null) => void;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  readOnly: boolean;
}

const DocumentCategoryGrid: React.FC<DocumentCategoryGridProps> = ({
  categories,
  onFileInputChange,
  getStatusConfig,
  getDocumentTypeConfig,
  formatFileSize,
  formatVietnameseDate,
  getDaysUntilExpiry,
  uploadProgress,
  setSelectedDocument,
  fileInputRefs,
  readOnly
}) => {
  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category.id}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {category.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.documents.map(document => (
              <DocumentCard
                key={document.id}
                document={document}
                getStatusConfig={getStatusConfig}
                getDocumentTypeConfig={getDocumentTypeConfig}
                formatFileSize={formatFileSize}
                formatVietnameseDate={formatVietnameseDate}
                getDaysUntilExpiry={getDaysUntilExpiry}
                uploadProgress={uploadProgress[document.id]}
                setSelectedDocument={setSelectedDocument}
                onFileInputChange={() => fileInputRefs.current[document.id]?.click()}
                readOnly={readOnly}
              />
            ))}

            {category.documents.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Không có giấy tờ nào trong danh mục này.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Document Category Card Component
 */
interface DocumentCategoryCardProps {
  category: any;
  onFileInputChange: (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  getStatusConfig: (status: DocumentVerificationStatus) => any;
  getDocumentTypeConfig: (documentId: string) => DocumentTypeConfig | null;
  formatFileSize: (bytes?: number) => string;
  formatVietnameseDate: (dateString: string) => string;
  getDaysUntilExpiry: (expiryDate?: string) => number | null;
  uploadProgress: Record<string, UploadProgress>;
  setSelectedDocument: (doc: DocumentStatus | null) => void;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  readOnly: boolean;
}

const DocumentCategoryCard: React.FC<DocumentCategoryCardProps> = ({
  category,
  onFileInputChange,
  getStatusConfig,
  getDocumentTypeConfig,
  formatFileSize,
  formatVietnameseDate,
  getDaysUntilExpiry,
  uploadProgress,
  setSelectedDocument,
  fileInputRefs,
  readOnly
}) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <div
          className="p-2 rounded-lg mr-3"
          style={{ backgroundColor: category.color + "20" }}
        >
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600">{category.description}</p>
        </div>
      </div>

      <div className="space-y-4 ml-11">
        {category.documents.map(document => (
          <DocumentCard
            key={document.id}
            document={document}
            getStatusConfig={getStatusConfig}
            getDocumentTypeConfig={getDocumentTypeConfig}
            formatFileSize={formatFileSize}
            formatVietnameseDate={formatVietnameseDate}
            getDaysUntilExpiry={getDaysUntilExpiry}
            uploadProgress={uploadProgress[document.id]}
            setSelectedDocument={setSelectedDocument}
            onFileInputChange={() => fileInputRefs.current[document.id]?.click()}
            readOnly={readOnly}
          />
        ))}

        {category.documents.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Không có giấy tờ nào trong danh mục này.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual Document Card Component
 */
interface DocumentCardProps {
  document: DocumentStatus;
  getStatusConfig: (status: DocumentVerificationStatus) => any;
  getDocumentTypeConfig: (documentId: string) => DocumentTypeConfig | null;
  formatFileSize: (bytes?: number) => string;
  formatVietnameseDate: (dateString: string) => string;
  getDaysUntilExpiry: (expiryDate?: string) => number | null;
  uploadProgress?: UploadProgress;
  setSelectedDocument: (doc: DocumentStatus | null) => void;
  onFileInputChange: () => void;
  readOnly: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  getStatusConfig,
  getDocumentTypeConfig,
  formatFileSize,
  formatVietnameseDate,
  getDaysUntilExpiry,
  uploadProgress,
  setSelectedDocument,
  onFileInputChange,
  readOnly
}) => {
  const statusConfig = getStatusConfig(document.status);
  const docTypeConfig = getDocumentTypeConfig(document.type);
  const StatusIcon = statusConfig.icon;

  const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  return (
    <Card className={`transition-all hover:shadow-md ${
      document.status === "bi_tu_choi" ? "border-red-200" :
      document.status === "het_han" ? "border-orange-200" :
      document.status === "da_xac_nhan" ? "border-green-200" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <StatusIcon
              className="h-5 w-5 mr-2"
              style={{ color: statusConfig.color }}
            />
            <h4 className="font-medium text-gray-900">{document.name}</h4>
            {docTypeConfig?.required && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>

          <Badge
            variant="outline"
            style={{
              borderColor: statusConfig.color,
              color: statusConfig.color
            }}
            className="text-xs"
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Upload progress */}
        {uploadProgress?.isUploading && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Đang tải lên...</span>
              <span>{uploadProgress.progress}%</span>
            </div>
            <Progress value={uploadProgress.progress} className="h-2" />
          </div>
        )}

        {/* Upload error */}
        {uploadProgress?.error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {uploadProgress.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Document info */}
        <div className="space-y-2 text-sm">
          {document.fileName && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">File:</span>
              <span className="text-gray-900 truncate ml-2">{document.fileName}</span>
            </div>
          )}

          {document.fileSize && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Kích thước:</span>
              <span className="text-gray-900">{formatFileSize(document.fileSize)}</span>
            </div>
          )}

          {document.uploadDate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ngày tải:</span>
              <span className="text-gray-900">{formatVietnameseDate(document.uploadDate)}</span>
            </div>
          )}

          {document.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Hết hạn:</span>
              <span className={`font-medium ${
                isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-900"
              }`}>
                {formatVietnameseDate(document.expiryDate)}
                {isExpired && " (Hết hạn)"}
                {isExpiringSoon && ` (Còn ${daysUntilExpiry} ngày)`}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDocument(document)}
          >
            <Info className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>

          {!readOnly && (
            <div className="flex space-x-2">
              {["cho_tai_len", "bi_tu_choi", "het_han"].includes(document.status) && (
                <Button
                  size="sm"
                  onClick={onFileInputChange}
                  disabled={uploadProgress?.isUploading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploadProgress?.isUploading ? "Đang tải..." : "Tải lên"}
                </Button>
              )}

              {document.fileUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </a>
                </Button>
              )}
            </div>
          )}

          {readOnly && document.fileUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-1" />
                Xem
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentRequirementsTracker;