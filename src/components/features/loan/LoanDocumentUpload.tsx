// Loan Document Upload Component
// Vietnamese-specific document upload component for loan applications

"use client";

import React, { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Upload,
  File,
  Image,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Info,
  Shield,
  FileText,
  User,
  MapPin,
  Building2,
  CreditCard,
  Calendar,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loanApi } from "@/lib/api/endpoints/loans";
import { useLoanApplicationStore } from "@/store/use-loan-store";
import EkycSdkWrapper from "@/components/features/ekyc/ekyc-sdk-wrapper";
import type { DocumentUploadData, LoanApplicationData } from "@/types/forms/loan-form";

/**
 * File upload configuration
 */
const FILE_UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  allTypes: [
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
};

/**
 * Document type configuration
 */
const DOCUMENT_TYPES = {
  nationalId: {
    title: "Căn cước công dân",
    description: "Ảnh chụp CCCD 2 mặt rõ nét",
    icon: User,
    required: true,
    maxFiles: 2,
    accepts: FILE_UPLOAD_CONFIG.allowedTypes.image,
  },
  faceVerification: {
    title: "Xác minh khuôn mặt",
    description: "Chụp ảnh chân dung hoặc video xác minh",
    icon: Camera,
    required: true,
    maxFiles: 2, // photo + video
    accepts: FILE_UPLOAD_CONFIG.allowedTypes.image,
  },
  addressProof: {
    title: "Giấy tờ chứng minh địa chỉ",
    description: "Hợp đồng thuê nhà, sổ hộ khẩu, hoặc hóa đơn điện/nước",
    icon: MapPin,
    required: true,
    maxFiles: 5,
    accepts: FILE_UPLOAD_CONFIG.allTypes,
  },
  incomeProof: {
    title: "Giấy tờ chứng minh thu nhập",
    description: "Phiếu lương, sao kê ngân hàng, hoặc giấy xác nhận thu nhập",
    icon: CreditCard,
    required: true,
    maxFiles: 10,
    accepts: FILE_UPLOAD_CONFIG.allTypes,
  },
  employmentProof: {
    title: "Giấy tờ chứng minh việc làm",
    description: "Hợp đồng lao động, giấy xác nhận công tác, hoặc giấy phép kinh doanh",
    icon: Building2,
    required: false,
    maxFiles: 5,
    accepts: FILE_UPLOAD_CONFIG.allTypes,
  },
  additional: {
    title: "Giấy tờ bổ sung",
    description: "Các giấy tờ khác cần thiết cho hồ sơ vay vốn",
    icon: FileText,
    required: false,
    maxFiles: 10,
    accepts: FILE_UPLOAD_CONFIG.allTypes,
  },
};

/**
 * Address proof document types
 */
const ADDRESS_PROOF_TYPES = [
  { value: "utility_bill", label: "Hóa đơn điện/nước/tháng", description: "Trong 3 tháng gần nhất" },
  { value: "rental_agreement", label: "Hợp đồng thuê nhà", description: "Còn hiệu lực" },
  { value: "household_registration", label: "Sổ hộ khẩu", description: "Trang có tên người vay" },
  { value: "other", label: "Khác", description: "Giấy tờ chứng minh khác" },
];

/**
 * Income proof document types
 */
const INCOME_PROOF_TYPES = [
  { value: "payslip", label: "Phiếu lương", description: "3 tháng gần nhất" },
  { value: "bank_statement", label: "Sao kê tài khoản ngân hàng", description: "3 tháng gần nhất" },
  { value: "tax_return", label: "Tờ khai thuế thu nhập cá nhân", description: "Năm gần nhất" },
  { value: "certificate", label: "Giấy xác nhận thu nhập", description: "Có xác nhận của công ty" },
  { value: "other", label: "Khác", description: "Giấy tờ chứng minh khác" },
];

/**
 * Employment proof document types
 */
const EMPLOYMENT_PROOF_TYPES = [
  { value: "employment_contract", label: "Hợp đồng lao động", description: "Còn hiệu lực" },
  { value: "work_certificate", label: "Giấy xác nhận công tác", description: "Có dấu công ty" },
  { value: "business_license", label: "Giấy phép kinh doanh", description: "Đối với chủ doanh nghiệp" },
  { value: "other", label: "Khác", description: "Giấy tờ chứng minh khác" },
];

/**
 * File upload state interface
 */
interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  preview?: string;
  documentId?: string;
}

/**
 * Document section state interface
 */
interface DocumentSectionState {
  type: keyof typeof DOCUMENT_TYPES;
  files: FileUploadState[];
  additionalData?: {
    documentType?: string;
    description?: string;
  };
}

/**
 * Loan Document Upload Component Props
 */
interface LoanDocumentUploadProps {
  /** Application ID for document uploads */
  applicationId?: string;
  /** Initial document data */
  initialData?: Partial<DocumentUploadData>;
  /** Form submission handler */
  onSubmit: (data: DocumentUploadData) => void | Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Enable eKYC integration */
  enableEkyc?: boolean;
}

/**
 * LoanDocumentUpload Component
 */
export const LoanDocumentUpload: React.FC<LoanDocumentUploadProps> = ({
  applicationId,
  initialData,
  onSubmit,
  isLoading = false,
  className,
  readOnly = false,
  enableEkyc = true,
}) => {
  const t = useTranslations("loan.documentUpload");
  const { updateDocuments, setDocumentUploadStatus, documentUploadStatus } = useLoanApplicationStore();

  const [documentSections, setDocumentSections] = useState<DocumentSectionState[]>(() => {
    const sections: DocumentSectionState[] = [];

    // Initialize document sections
    Object.entries(DOCUMENT_TYPES).forEach(([key, config]) => {
      const type = key as keyof typeof DOCUMENT_TYPES;
      sections.push({
        type,
        files: [],
        additionalData: type === "addressProof" ? { documentType: "utility_bill" } :
                       type === "incomeProof" ? { documentType: "payslip" } :
                       type === "employmentProof" ? { documentType: "employment_contract" } :
                       undefined,
      });
    });

    return sections;
  });

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [showEkyc, setShowEkyc] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<keyof typeof DOCUMENT_TYPES | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  // Validate file
  const validateFile = (file: File, documentType: keyof typeof DOCUMENT_TYPES): string | null => {
    const config = DOCUMENT_TYPES[documentType];

    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.maxFileSize) {
      return `Kích thước file không được vượt quá ${Math.round(FILE_UPLOAD_CONFIG.maxFileSize / (1024 * 1024))}MB`;
    }

    // Check file type
    if (!config.accepts.includes(file.type)) {
      const allowedExtensions = config.accepts
        .map(type => type.split('/')[1])
        .join(', ');
      return `Chỉ chấp nhận file định dạng: ${allowedExtensions}`;
    }

    return null;
  };

  // Generate file preview
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        resolve(''); // No preview for non-image files
      }
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: keyof typeof DOCUMENT_TYPES
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const section = documentSections.find(s => s.type === documentType);
    if (!section) return;

    const config = DOCUMENT_TYPES[documentType];

    // Check max files limit
    if (section.files.length + files.length > config.maxFiles) {
      setUploadErrors(prev => ({
        ...prev,
        [documentType]: `Chỉ được tải lên tối đa ${config.maxFiles} file`
      }));
      return;
    }

    // Validate and process files
    const newFiles: FileUploadState[] = [];

    for (const file of files) {
      const error = validateFile(file, documentType);
      if (error) {
        setUploadErrors(prev => ({
          ...prev,
          [documentType]: error
        }));
        return;
      }

      const preview = await generatePreview(file);
      newFiles.push({
        file,
        progress: 0,
        status: "pending",
        preview,
      });
    }

    // Update section files
    setDocumentSections(prev => prev.map(section => {
      if (section.type === documentType) {
        return {
          ...section,
          files: [...section.files, ...newFiles]
        };
      }
      return section;
    }));

    // Clear input
    if (fileInputRefs.current[documentType]) {
      fileInputRefs.current[documentType].value = '';
    }
  }, [documentSections]);

  // Upload file to server
  const uploadFile = useCallback(async (
    fileState: FileUploadState,
    documentType: keyof typeof DOCUMENTTypes
  ): Promise<void> => {
    if (!applicationId) {
      // Mock upload for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      fileState.status = "completed";
      fileState.progress = 100;
      return;
    }

    try {
      fileState.status = "uploading";
      fileState.progress = 0;

      const documentId = await loanApi.uploadDocument(
        applicationId,
        documentType,
        fileState.file,
        (progress) => {
          fileState.progress = progress;
          setUploadProgress(prev => ({
            ...prev,
            [`${documentType}-${fileState.file.name}`]: progress
          }));
        }
      );

      fileState.status = "completed";
      fileState.progress = 100;
      fileState.documentId = documentId;

      setDocumentUploadStatus(documentType, "completed");
    } catch (error) {
      fileState.status = "failed";
      fileState.error = error instanceof Error ? error.message : "Upload failed";
      setDocumentUploadStatus(documentType, "failed");
      throw error;
    }
  }, [applicationId, setDocumentUploadStatus]);

  // Remove file
  const removeFile = useCallback((
    documentType: keyof typeof DOCUMENT_TYPES,
    fileIndex: number
  ) => {
    setDocumentSections(prev => prev.map(section => {
      if (section.type === documentType) {
        const newFiles = section.files.filter((_, index) => index !== fileIndex);
        return { ...section, files: newFiles };
      }
      return section;
    }));

    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[documentType];
      return newErrors;
    });
  }, []);

  // Upload all files
  const uploadAllFiles = useCallback(async () => {
    try {
      for (const section of documentSections) {
        const config = DOCUMENT_TYPES[section.type];

        // Skip optional sections with no files
        if (!config.required && section.files.length === 0) continue;

        // Upload all files in this section
        await Promise.all(
          section.files.map(fileState => uploadFile(fileState, section.type))
        );
      }
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }, [documentSections, uploadFile]);

  // Handle eKYC integration
  const handleEkycComplete = useCallback((result: any) => {
    // Update national ID and face verification with eKYC results
    setDocumentSections(prev => prev.map(section => {
      if (section.type === "nationalId") {
        return {
          ...section,
          files: [
            {
              file: new File([], "ekyc-national-id-front"),
              progress: 100,
              status: "completed",
              documentId: result.nationalIdFront,
            },
            {
              file: new File([], "ekyc-national-id-back"),
              progress: 100,
              status: "completed",
              documentId: result.nationalIdBack,
            }
          ]
        };
      }
      if (section.type === "faceVerification") {
        return {
          ...section,
          files: [
            {
              file: new File([], "ekyc-face-photo"),
              progress: 100,
              status: "completed",
              documentId: result.facePhoto,
            }
          ]
        };
      }
      return section;
    }));

    setShowEkyc(false);
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    try {
      // Upload all pending files
      await uploadAllFiles();

      // Prepare document data
      const documentData: DocumentUploadData = {
        nationalId: {
          frontFile: documentSections.find(s => s.type === "nationalId")?.files[0]?.file,
          backFile: documentSections.find(s => s.type === "nationalId")?.files[1]?.file,
          uploadStatus: documentUploadStatus.nationalId || "pending",
          verificationStatus: "pending",
        },
        faceVerification: {
          photoFile: documentSections.find(s => s.type === "faceVerification")?.files[0]?.file,
          uploadStatus: documentUploadStatus.faceVerification || "pending",
          verificationStatus: "pending",
        },
        addressProof: {
          documentType: documentSections.find(s => s.type === "addressProof")?.additionalData?.documentType || "utility_bill",
          files: documentSections.find(s => s.type === "addressProof")?.files.map(f => f.file) || [],
          uploadStatus: documentUploadStatus.addressProof || "pending",
          verificationStatus: "pending",
        },
        incomeProof: {
          documentTypes: [documentSections.find(s => s.type === "incomeProof")?.additionalData?.documentType || "payslip"],
          files: {
            [documentSections.find(s => s.type === "incomeProof")?.additionalData?.documentType || "payslip"]:
              documentSections.find(s => s.type === "incomeProof")?.files.map(f => f.file) || [],
          },
          uploadStatus: documentUploadStatus.incomeProof || "pending",
          verificationStatus: "pending",
        },
        employmentProof: {
          documentTypes: [documentSections.find(s => s.type === "employmentProof")?.additionalData?.documentType || "employment_contract"],
          files: {
            [documentSections.find(s => s.type === "employmentProof")?.additionalData?.documentType || "employment_contract"]:
              documentSections.find(s => s.type === "employmentProof")?.files.map(f => f.file) || [],
          },
          uploadStatus: documentUploadStatus.employmentProof || "pending",
          verificationStatus: "pending",
        },
        additionalDocuments: [],
      };

      // Update store
      updateDocuments(documentData);

      // Call onSubmit prop
      await onSubmit(documentData);
    } catch (error) {
      console.error("Document upload submission error:", error);
      throw error;
    }
  }, [documentSections, documentUploadStatus, updateDocuments, uploadAllFiles, onSubmit]);

  // Check if all required documents are uploaded
  const allRequiredUploaded = React.useMemo(() => {
    return Object.entries(DOCUMENT_TYPES)
      .filter(([_, config]) => config.required)
      .every(([type]) => {
        const section = documentSections.find(s => s.type === type);
        return section && section.files.length > 0 && section.files.every(f => f.status === "completed");
      });
  }, [documentSections]);

  // Calculate upload progress
  const totalUploadProgress = React.useMemo(() => {
    const totalFiles = documentSections.reduce((sum, section) => sum + section.files.length, 0);
    if (totalFiles === 0) return 0;

    const totalProgress = documentSections.reduce((sum, section) => {
      return sum + section.files.reduce((fileSum, file) => fileSum + file.progress, 0);
    }, 0);

    return Math.round(totalProgress / totalFiles);
  }, [documentSections]);

  // Render file item
  const renderFileItem = (fileState: FileUploadState, documentType: keyof typeof DOCUMENT_TYPES, index: number) => (
    <Card key={index} className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {fileState.preview ? (
              <img
                src={fileState.preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                <File className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium truncate">{fileState.file.name}</h4>
              <Badge variant="secondary">
                {(fileState.file.size / (1024 * 1024)).toFixed(1)}MB
              </Badge>
            </div>

            {fileState.status === "uploading" && (
              <div className="mt-2">
                <Progress value={fileState.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {fileState.progress}% đã tải lên
                </p>
              </div>
            )}

            {fileState.status === "failed" && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {fileState.error || "Tải lên thất bại"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex items-center gap-2">
            {fileState.status === "completed" && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Hoàn thành
              </Badge>
            )}

            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFile(documentType, index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render document section
  const renderDocumentSection = (section: DocumentSectionState) => {
    const config = DOCUMENT_TYPES[section.type];
    const Icon = config.icon;
    const error = uploadErrors[section.type];

    return (
      <Card key={section.type} className={cn(
        config.required && section.files.length === 0 && "border-red-200 bg-red-50"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.title}
            {config.required && <Badge variant="destructive">Bắt buộc</Badge>}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Document type selector for certain sections */}
          {section.type === "addressProof" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ADDRESS_PROOF_TYPES.map(type => (
                <div
                  key={type.value}
                  className={cn(
                    "p-3 border rounded-md cursor-pointer transition-colors",
                    section.additionalData?.documentType === type.value
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => {
                    if (!readOnly) {
                      setDocumentSections(prev => prev.map(s => {
                        if (s.type === "addressProof") {
                          return {
                            ...s,
                            additionalData: { ...s.additionalData, documentType: type.value }
                          };
                        }
                        return s;
                      }));
                    }
                  }}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              ))}
            </div>
          )}

          {section.type === "incomeProof" && (
            <Select
              value={section.additionalData?.documentType || "payslip"}
              onValueChange={(value) => {
                if (!readOnly) {
                  setDocumentSections(prev => prev.map(s => {
                    if (s.type === "incomeProof") {
                      return {
                        ...s,
                        additionalData: { ...s.additionalData, documentType: value }
                      };
                    }
                    return s;
                  }));
                }
              }}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCOME_PROOF_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {section.type === "employmentProof" && (
            <Select
              value={section.additionalData?.documentType || "employment_contract"}
              onValueChange={(value) => {
                if (!readOnly) {
                  setDocumentSections(prev => prev.map(s => {
                    if (s.type === "employmentProof") {
                      return {
                        ...s,
                        additionalData: { ...s.additionalData, documentType: value }
                      };
                    }
                    return s;
                  }));
                }
              }}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_PROOF_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* File upload area */}
          {!readOnly && section.files.length < config.maxFiles && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={el => fileInputRefs.current[section.type] = el!}
                type="file"
                multiple
                accept={config.accepts.join(',')}
                onChange={(e) => handleFileSelect(e, section.type)}
                className="hidden"
                id={`file-upload-${section.type}`}
              />
              <label
                htmlFor={`file-upload-${section.type}`}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Chọn file để tải lên
                  </span>
                  <span className="text-gray-500">
                    {" hoặc kéo thả file vào đây"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Tối đa {config.maxFiles} file, mỗi file tối đa {Math.round(FILE_UPLOAD_CONFIG.maxFileSize / (1024 * 1024))}MB
                </p>
              </label>
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File list */}
          {section.files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Danh sách file ({section.files.length}/{config.maxFiles})
                </h4>
              </div>
              <div className="space-y-3">
                {section.files.map((fileState, index) =>
                  renderFileItem(fileState, section.type, index)
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("title", "Tải lên giấy tờ")}
            </CardTitle>
            <CardDescription>
              {t("description", "Vui lòng tải lên các giấy tờ cần thiết để hoàn tất hồ sơ vay vốn")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* eKYC Integration */}
            {enableEkyc && (
              <div className="mb-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">Xác minh điện tử (eKYC)</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Sử dụng công nghệ AI để xác minh CCCD và khuôn mặt nhanh chóng
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowEkyc(true)}
                        disabled={readOnly || isLoading}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Bắt đầu eKYC
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upload Progress */}
            {totalUploadProgress > 0 && totalUploadProgress < 100 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Đang tải lên giấy tờ...</span>
                  <span className="text-sm text-muted-foreground">{totalUploadProgress}%</span>
                </div>
                <Progress value={totalUploadProgress} className="h-2" />
              </div>
            )}

            {/* Document Sections */}
            <div className="space-y-6">
              {documentSections.map(section => renderDocumentSection(section))}
            </div>

            {/* Submit Button */}
            {!readOnly && (
              <div className="flex justify-between items-center pt-6">
                <div className="flex items-center gap-2">
                  {allRequiredUploaded ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã tải lên đầy đủ giấy tờ
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Cần tải lên thêm giấy tờ bắt buộc
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !allRequiredUploaded}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t("uploading", "Đang tải lên...")}
                    </span>
                  ) : (
                    t("continue", "Tiếp tục")
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* eKYC Dialog */}
        <Dialog open={showEkyc} onOpenChange={setShowEkyc}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Xác minh điện tử (eKYC)</DialogTitle>
              <DialogDescription>
                Vui lòng chuẩn bị CCCD và thực hiện theo hướng dẫn để hoàn tất xác minh
              </DialogDescription>
            </DialogHeader>
            <EkycSdkWrapper
              flowType="DOCUMENT_TO_FACE"
              language="vi"
              useMethod="BOTH"
              style={{ height: "600px" }}
              className="w-full"
            />
          </DialogContent>
        </Dialog>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Chất lượng ảnh</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Giấy tờ cần rõ nét, đủ sáng, không bị mờ hay tràn cạnh.
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
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Bảo mật thông tin</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Mọi giấy tờ được mã hóa và bảo vệ tuyệt đối.
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
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Thời gian xử lý</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Giấy tờ được xác minh trong vòng 24 giờ làm việc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LoanDocumentUpload;