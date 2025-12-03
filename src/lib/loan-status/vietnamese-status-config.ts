/**
 * Vietnamese Loan Application Status Configuration
 * Comprehensive status definitions, transitions, and SLA settings for Vietnamese market
 */

export type LoanApplicationStatus =
  | "da_tiep_nhan"     // Application Received
  | "dang_xu_ly"       // Under Processing
  | "cho_bo_sung_giay_to" // Awaiting Additional Documents
  | "dang_tham_dinh"   // Under Assessment
  | "da_duyet"         // Approved
  | "cho_giai_ngan"    // Awaiting Disbursement
  | "da_giai_ngan"     // Disbursed
  | "bi_tu_choi"       // Rejected
  | "da_huy"           // Cancelled
  | "nhap"             // Draft
  | "tam_dung"         // Suspended/On Hold;

export type DocumentVerificationStatus =
  | "cho_tai_len"      // Awaiting Upload
  | "dang_tai_len"     // Uploading
  | "da_tai_len"       // Uploaded
  | "dang_kiem_tra"    // Under Verification
  | "da_xac_nhan"      // Verified
  | "bi_tu_choi"       // Rejected
  | "het_han"          // Expired;

export type CommunicationChannel =
  | "sms"
  | "email"
  | "in_app"
  | "zalo"
  | "phone_call";

export type LoanType =
  | "vay_tieu_dung"    // Consumer Loan
  | "vay_mua_nha"      // Home Loan
  | "vay_kinh_doanh"   // Business Loan
  | "the_tin_dung"     // Credit Card
  | "vay_xe"           // Car Loan
  | "vay_sinh_vien"    // Student Loan;

/**
 * Status configuration with Vietnamese labels and descriptions
 */
export interface StatusConfig {
  id: LoanApplicationStatus;
  label: string;
  description: string;
  color: string;
  icon: string;
  category: "initial" | "processing" | "review" | "decision" | "completion" | "termination";
  allowUserAction: boolean;
  estimatedDuration?: {
    min: number; // hours
    max: number; // hours
  };
  nextStatuses: LoanApplicationStatus[];
}

/**
 * Document type configuration
 */
export interface DocumentTypeConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  allowedFormats: string[];
  maxSize: number; // MB
  expiryRequired: boolean;
  verificationSteps: string[];
  vietnameseInstructions: string;
}

/**
 * Processing time standards by loan type
 */
export interface ProcessingTimeStandards {
  loanType: LoanType;
  standard: {
    minBusinessDays: number;
    maxBusinessDays: number;
    averageBusinessDays: number;
  };
  expedited?: {
    minBusinessDays: number;
    maxBusinessDays: number;
    conditions: string[];
  };
}

/**
 * Communication template configuration
 */
export interface CommunicationTemplate {
  id: string;
  status: LoanApplicationStatus;
  channel: CommunicationChannel;
  subject: string;
  template: string;
  variables: string[];
  priority: "low" | "normal" | "high" | "urgent";
  sendAutomatically: boolean;
}

/**
 * Status transition rules
 */
export interface StatusTransitionRule {
  from: LoanApplicationStatus;
  to: LoanApplicationStatus;
  conditions: {
    requiredDocuments?: string[];
    minimumTime?: number; // hours
    maximumTime?: number; // hours
    systemChecks?: string[];
    manualApproval?: boolean;
  };
  allowedRoles: string[];
  vietnameseMessage: string;
}

/**
 * Vietnamese status configurations
 */
export const VIETNAMESE_STATUS_CONFIG: Record<LoanApplicationStatus, StatusConfig> = {
  da_tiep_nhan: {
    id: "da_tiep_nhan",
    label: "Đã tiếp nhận",
    description: "Hồ sơ vay vốn của Quý khách đã được tiếp nhận và đang trong quá trình xử lý ban đầu.",
    color: "#3B82F6", // blue
    icon: "inbox-in",
    category: "initial",
    allowUserAction: false,
    estimatedDuration: { min: 2, max: 8 },
    nextStatuses: ["dang_xu_ly", "bi_tu_choi"],
  },

  dang_xu_ly: {
    id: "dang_xu_ly",
    label: "Đang xử lý",
    description: "Hồ sơ đang được các chuyên viên tín dụng xem xét và kiểm tra thông tin.",
    color: "#F59E0B", // amber
    icon: "arrow-path",
    category: "processing",
    allowUserAction: false,
    estimatedDuration: { min: 4, max: 24 },
    nextStatuses: ["cho_bo_sung_giay_to", "dang_tham_dinh", "bi_tu_choi"],
  },

  cho_bo_sung_giay_to: {
    id: "cho_bo_sung_giay_to",
    label: "Chờ bổ sung giấy tờ",
    description: "Vui lòng cung cấp thêm giấy tờ theo yêu cầu để tiếp tục xử lý hồ sơ.",
    color: "#EF4444", // red
    icon: "document-plus",
    category: "processing",
    allowUserAction: true,
    estimatedDuration: { min: 24, max: 168 }, // 1-7 days
    nextStatuses: ["dang_xu_ly", "bi_tu_choi", "da_huy"],
  },

  dang_tham_dinh: {
    id: "dang_tham_dinh",
    label: "Đang thẩm định",
    description: "Hồ sơ đang được thẩm định chuyên sâu về khả năng trả nợ và tài sản đảm bảo.",
    color: "#8B5CF6", // purple
    icon: "magnifying-glass",
    category: "review",
    allowUserAction: false,
    estimatedDuration: { min: 24, max: 72 },
    nextStatuses: ["da_duyet", "bi_tu_choi", "tam_dung"],
  },

  da_duyet: {
    id: "da_duyet",
    label: "Đã duyệt",
    description: "Hồ sơ đã được phê duyệt. Vui lòng hoàn tất các thủ tục cuối để nhận giải ngân.",
    color: "#10B981", // green
    icon: "check-circle",
    category: "decision",
    allowUserAction: true,
    estimatedDuration: { min: 2, max: 8 },
    nextStatuses: ["cho_giai_ngan", "da_huy"],
  },

  cho_giai_ngan: {
    id: "cho_giai_ngan",
    label: "Chờ giải ngân",
    description: "Hồ sơ đã hoàn tất thủ tục và đang chờ giải ngân.",
    color: "#06B6D4", // cyan
    icon: "banknotes",
    category: "completion",
    allowUserAction: false,
    estimatedDuration: { min: 2, max: 24 },
    nextStatuses: ["da_giai_ngan", "da_huy"],
  },

  da_giai_ngan: {
    id: "da_giai_ngan",
    label: "Đã giải ngân",
    description: "Khoản vay đã được giải ngân thành công vào tài khoản của Quý khách.",
    color: "#059669", // emerald
    icon: "check-badge",
    category: "completion",
    allowUserAction: false,
    nextStatuses: [],
  },

  bi_tu_choi: {
    id: "bi_tu_choi",
    label: "Bị từ chối",
    description: "Hồ sơ không đáp ứng điều kiện vay vốn. Vui lòng liên hệ chi nhánh để biết chi tiết.",
    color: "#DC2626", // red
    icon: "x-circle",
    category: "termination",
    allowUserAction: true,
    nextStatuses: [],
  },

  da_huy: {
    id: "da_huy",
    label: "Đã hủy",
    description: "Hồ sơ vay đã được hủy theo yêu cầu của khách hàng.",
    color: "#6B7280", // gray
    icon: "stop-circle",
    category: "termination",
    allowUserAction: false,
    nextStatuses: [],
  },

  nhap: {
    id: "nhap",
    label: "Nháp",
    description: "Hồ sơ đang được tạo và chưa được gửi đi.",
    color: "#9CA3AF", // gray
    icon: "document-duplicate",
    category: "initial",
    allowUserAction: true,
    nextStatuses: ["da_tiep_nhan", "da_huy"],
  },

  tam_dung: {
    id: "tam_dung",
    label: "Tạm dừng",
    description: "Hồ sơ đang tạm dừng chờ xử lý thêm.",
    color: "#F97316", // orange
    icon: "pause-circle",
    category: "processing",
    allowUserAction: false,
    estimatedDuration: { min: 24, max: 168 },
    nextStatuses: ["dang_xu_ly", "dang_tham_dinh", "bi_tu_choi", "da_huy"],
  },
};

/**
 * Vietnamese document types configuration
 */
export const VIETNAMESE_DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  // Identification Documents
  "cmnd_cccd": {
    id: "cmnd_cccd",
    name: "CMND/CCCD",
    description: "Căn cước công dân hoặc Chứng minh nhân dân",
    category: "giay_to_dinh_danh",
    required: true,
    allowedFormats: ["PDF", "JPG", "JPEG", "PNG"],
    maxSize: 5,
    expiryRequired: true,
    verificationSteps: [
      "Kiểm tra tính hợp lệ của giấy tờ",
      "Xác minh thông tin với CSDL Quốc gia",
      "Kiểm tra tình trạng giấy tờ còn hạn"
    ],
    vietnameseInstructions: "Vui lòng chụp rõ mặt trước và mặt sau của CMND/CCCD, đảm bảo thông tin không bị mờ hay lóa sáng."
  },

  "ho_khau": {
    id: "ho_khau",
    name: "Sổ hộ khẩu",
    description: "Sổ hộ khẩu hoặc Giấy chứng nhận thường trú",
    category: "giay_to_dinh_danh",
    required: true,
    allowedFormats: ["PDF", "JPG", "JPEG", "PNG"],
    maxSize: 10,
    expiryRequired: false,
    verificationSteps: [
      "Kiểm tra tính xác thực của sổ hộ khẩu",
      "Xác minh địa chỉ thường trú",
      "Kiểm tra các thành viên trong hộ khẩu"
    ],
    vietnameseInstructions: "Chụp các trang có thông tin về người vay và người đồng vay (nếu có)."
  },

  // Income Documents
  "hop_dong_lao_dong": {
    id: "hop_dong_lao_dong",
    name: "Hợp đồng lao động",
    description: "Hợp đồng lao động hoặc Quyết định bổ nhiệm",
    category: "giay_to_thu_nhap",
    required: true,
    allowedFormats: ["PDF", "DOC", "DOCX"],
    maxSize: 5,
    expiryRequired: true,
    verificationSteps: [
      "Kiểm tra tính hợp lệ của hợp đồng",
      "Xác minh thời hạn hợp đồng",
      "Kiểm tra chức vụ và mức lương"
    ],
    vietnameseInstructions: "Cung cấp hợp đồng lao động có dấu đóng của công ty và đầy đủ thông tin về lương, chức vụ."
  },

  "bang_luong": {
    id: "bang_luong",
    name: "Bảng lương/Sao kê lương",
    description: "Bảng lương 3 tháng gần nhất hoặc Sao kê lương ngân hàng",
    category: "giay_to_thu_nhap",
    required: true,
    allowedFormats: ["PDF", "JPG", "JPEG", "PNG"],
    maxSize: 8,
    expiryRequired: false,
    verificationSteps: [
      "Kiểm tra sự liên tục của thu nhập",
      "Xác minh mức lương trung bình",
      "Đối chiếu với thông tin hợp đồng lao động"
    ],
    vietnameseInstructions: "Cung cấp bảng lương hoặc sao kê lương 3 tháng gần nhất, có dấu của công ty."
  },

  // Housing Documents
  "giay_chung_nhan_quyen_so_huu_nha": {
    id: "giay_chung_nhan_quyen_so_huu_nha",
    name: "Giấy chứng nhận QSH nhà",
    description: "Giấy chứng nhận quyền sở hữu nhà ở và quyền sử dụng đất",
    category: "giay_to_nha_o",
    required: false,
    allowedFormats: ["PDF", "JPG", "JPEG", "PNG"],
    maxSize: 10,
    expiryRequired: false,
    verificationSteps: [
      "Kiểm tra tính xác thực của giấy chứng nhận",
      "Xác minh tại văn phòng đăng ký đất đai",
      "Kiểm tra tình trạng thế chấp, cầm cố"
    ],
    vietnameseInstructions: "Cung cấp bản gốc hoặc bản sao có công chứng của giấy chứng nhận quyền sở hữu."
  },

  "hop_dong_thue_nha": {
    id: "hop_dong_thue_nha",
    name: "Hợp đồng thuê nhà",
    description: "Hợp đồng thuê nhà (nếu là nhà thuê)",
    category: "giay_to_nha_o",
    required: false,
    allowedFormats: ["PDF", "DOC", "DOCX"],
    maxSize: 5,
    expiryRequired: true,
    verificationSteps: [
      "Kiểm tra tính hợp lệ của hợp đồng",
      "Xác minh thời hạn thuê",
      "Kiểm tra địa chỉ cho thuê"
    ],
    vietnameseInstructions: "Cung cấp hợp đồng thuê nhà có chữ ký của cả hai bên và thời hạn thuê còn hiệu lực."
  },

  // Business Documents
  "giay_phep_kinh_doanh": {
    id: "giay_phep_kinh_doanh",
    name: "Giấy phép kinh doanh",
    description: "Giấy chứng nhận đăng ký kinh doanh",
    category: "giay_to_doanh_nghiep",
    required: false,
    allowedFormats: ["PDF", "JPG", "JPEG", "PNG"],
    maxSize: 8,
    expiryRequired: false,
    verificationSteps: [
      "Kiểm tra tính hợp lệ của giấy phép",
      "Xác minh thông tin tại Cổng thông tin quốc gia",
      "Kiểm tra ngành nghề kinh doanh"
    ],
    vietnameseInstructions: "Cung cấp giấy phép kinh doanh có đầy đủ thông tin về công ty và người đại diện."
  },

  "bao_cao_tai_chinh": {
    id: "bao_cao_tai_chinh",
    name: "Báo cáo tài chính",
    description: "Báo cáo tài chính 2 năm gần nhất",
    category: "giay_to_doanh_nghiep",
    required: false,
    allowedFormats: ["PDF", "XLS", "XLSX"],
    maxSize: 10,
    expiryRequired: false,
    verificationSteps: [
      "Kiểm tra sự nhất quán của số liệu",
      "Phân tích sức khỏe tài chính",
      "Đánh giá khả năng trả nợ"
    ],
    vietnameseInstructions: "Cung cấp báo cáo tài chính đã được kiểm toán (nếu có) hoặc có dấu của công ty."
  },
};

/**
 * Processing time standards by loan type
 */
export const PROCESSING_TIME_STANDARDS: ProcessingTimeStandards[] = [
  {
    loanType: "vay_tieu_dung",
    standard: {
      minBusinessDays: 3,
      maxBusinessDays: 5,
      averageBusinessDays: 4,
    },
    expedited: {
      minBusinessDays: 1,
      maxBusinessDays: 2,
      conditions: [
        "Khách hàng có thu nhập từ lương",
        "Sản phẩm vay tiêu dùng không tài sản đảm bảo",
        "Hồ sơ đầy đủ và hợp lệ",
        "Thủ tục tại chi nhánh"
      ],
    },
  },

  {
    loanType: "vay_mua_nha",
    standard: {
      minBusinessDays: 7,
      maxBusinessDays: 14,
      averageBusinessDays: 10,
    },
    expedited: {
      minBusinessDays: 5,
      maxBusinessDays: 7,
      conditions: [
        "Bất động sản đã có pháp lý rõ ràng",
        "Khách hàng có đủ khả năng trả nợ",
        "Thẩm định nhanh được duyệt",
        "Hồ sơ đầy đủ chứng từ tài sản"
      ],
    },
  },

  {
    loanType: "vay_kinh_doanh",
    standard: {
      minBusinessDays: 10,
      maxBusinessDays: 20,
      averageBusinessDays: 15,
    },
    expedited: {
      minBusinessDays: 7,
      maxBusinessDays: 10,
      conditions: [
        "Doanh nghiệp hoạt động trên 2 năm",
        "Báo cáo tài chính khỏe mạnh",
        "Có tài sản đảm bảo rõ ràng",
        "Khách hàng uy tín tại ngân hàng"
      ],
    },
  },

  {
    loanType: "the_tin_dung",
    standard: {
      minBusinessDays: 2,
      maxBusinessDays: 3,
      averageBusinessDays: 2,
    },
    expedited: {
      minBusinessDays: 1,
      maxBusinessDays: 1,
      conditions: [
        "Khách hàng đã có quan hệ với ngân hàng",
        "Thu nhập ổn định từ lương",
        "Điểm tín dụng CIC tốt",
        "Đăng ký online và eKYC"
      ],
    },
  },

  {
    loanType: "vay_xe",
    standard: {
      minBusinessDays: 5,
      maxBusinessDays: 7,
      averageBusinessDays: 6,
    },
    expedited: {
      minBusinessDays: 3,
      maxBusinessDays: 4,
      conditions: [
        "Xe có giấy tờ pháp lý đầy đủ",
        "Khách hàng có khả năng trả nợ tốt",
        "Thủ tục tại đại lý ủy quyền",
        "Cam kết bảo hiểm xe"
      ],
    },
  },

  {
    loanType: "vay_sinh_vien",
    standard: {
      minBusinessDays: 7,
      maxBusinessDays: 10,
      averageBusinessDays: 8,
    },
    expedited: {
      minBusinessDays: 5,
      maxBusinessDays: 7,
      conditions: [
        "Sinh viên trường có đối tác với ngân hàng",
        "Có người bảo lãnh thu nhập",
        "Hồ sơ đầy đủ theo quy định",
        "Xác thực thông tin trường học"
      ],
    },
  },
];

/**
 * Status transition rules
 */
export const STATUS_TRANSITION_RULES: StatusTransitionRule[] = [
  {
    from: "nhap",
    to: "da_tiep_nhan",
    conditions: {
      systemChecks: ["validateRequiredFields", "checkDuplicateApplication"],
    },
    allowedRoles: ["customer", "staff"],
    vietnameseMessage: "Hồ sơ đã được gửi thành công và đang chờ xử lý."
  },

  {
    from: "da_tiep_nhan",
    to: "dang_xu_ly",
    conditions: {
      minimumTime: 0,
      manualApproval: false,
    },
    allowedRoles: ["system", "staff"],
    vietnameseMessage: "Hồ sơ đang được chuyên viên xử lý."
  },

  {
    from: "dang_xu_ly",
    to: "cho_bo_sung_giay_to",
    conditions: {
      systemChecks: ["checkMissingDocuments"],
    },
    allowedRoles: ["staff"],
    vietnameseMessage: "Vui lòng bổ sung các giấy tờ theo yêu cầu để tiếp tục xử lý."
  },

  {
    from: "dang_xu_ly",
    to: "dang_tham_dinh",
    conditions: {
      requiredDocuments: ["cmnd_cccd", "hop_dong_lao_dong", "bang_luong"],
      minimumTime: 4,
    },
    allowedRoles: ["staff"],
    vietnameseMessage: "Hồ sơ đủ điều kiện và đang trong giai đoạn thẩm định."
  },

  {
    from: "cho_bo_sung_giay_to",
    to: "dang_xu_ly",
    conditions: {
      systemChecks: ["validateUploadedDocuments"],
    },
    allowedRoles: ["customer"],
    vietnameseMessage: "Giấy tờ đã được cập nhật. Hồ sơ đang được xử lý tiếp."
  },

  {
    from: "dang_tham_dinh",
    to: "da_duyet",
    conditions: {
      systemChecks: ["creditScoreCheck", "debtToIncomeCheck"],
      manualApproval: true,
    },
    allowedRoles: ["credit_officer", "manager"],
    vietnameseMessage: "Chúc mừng! Hồ sơ đã được phê duyệt."
  },

  {
    from: "da_duyet",
    to: "cho_giai_ngan",
    conditions: {
      systemChecks: ["validateContract", "verifyCollateral"],
      manualApproval: true,
    },
    allowedRoles: ["staff", "manager"],
    vietnameseMessage: "Hồ sơ đã hoàn tất thủ tục và đang chờ giải ngân."
  },

  {
    from: "cho_giai_ngan",
    to: "da_giai_ngan",
    conditions: {
      systemChecks: ["verifyAccount", "finalComplianceCheck"],
    },
    allowedRoles: ["system", "staff"],
    vietnameseMessage: "Khoản vay đã được giải ngân thành công."
  },
];

/**
 * Get status configuration by ID
 */
export const getStatusConfig = (statusId: LoanApplicationStatus): StatusConfig | null => {
  return VIETNAMESE_STATUS_CONFIG[statusId] || null;
};

/**
 * Get document type configuration by ID
 */
export const getDocumentTypeConfig = (documentId: string): DocumentTypeConfig | null => {
  return VIETNAMESE_DOCUMENT_TYPES[documentId] || null;
};

/**
 * Get processing time standards by loan type
 */
export const getProcessingTimeStandards = (loanType: LoanType): ProcessingTimeStandards | null => {
  return PROCESSING_TIME_STANDARDS.find(standard => standard.loanType === loanType) || null;
};

/**
 * Check if status transition is allowed
 */
export const isStatusTransitionAllowed = (
  fromStatus: LoanApplicationStatus,
  toStatus: LoanApplicationStatus,
  userRole: string
): boolean => {
  const rule = STATUS_TRANSITION_RULES.find(
    r => r.from === fromStatus && r.to === toStatus
  );

  if (!rule) return false;

  return rule.allowedRoles.includes(userRole) || rule.allowedRoles.includes("*");
};

/**
 * Get next allowed statuses for current status
 */
export const getNextAllowedStatuses = (
  currentStatus: LoanApplicationStatus,
  userRole: string = "customer"
): LoanApplicationStatus[] => {
  const statusConfig = getStatusConfig(currentStatus);
  if (!statusConfig) return [];

  return statusConfig.nextStatuses.filter(nextStatus =>
    isStatusTransitionAllowed(currentStatus, nextStatus, userRole)
  );
};

/**
 * Calculate estimated completion time based on current status and loan type
 */
export const calculateEstimatedCompletionTime = (
  currentStatus: LoanApplicationStatus,
  loanType: LoanType,
  currentStatusDuration: number = 0
): { hours: number; businessDays: number } => {
  const statusConfig = getStatusConfig(currentStatus);
  const timeStandard = getProcessingTimeStandards(loanType);

  if (!statusConfig || !timeStandard) {
    return { hours: 0, businessDays: 0 };
  }

  // Calculate remaining time in current status
  let remainingHoursInCurrentStatus = 0;
  if (statusConfig.estimatedDuration) {
    const avgDuration = (statusConfig.estimatedDuration.min + statusConfig.estimatedDuration.max) / 2;
    remainingHoursInCurrentStatus = Math.max(0, avgDuration - currentStatusDuration);
  }

  // Calculate total remaining business days
  const totalBusinessDays = timeStandard.standard.maxBusinessDays;
  const avgBusinessDays = timeStandard.standard.averageBusinessDays;

  // Convert to hours (8 hours per business day)
  const totalHours = avgBusinessDays * 8;

  return {
    hours: Math.round(remainingHoursInCurrentStatus + totalHours),
    businessDays: Math.ceil((remainingHoursInCurrentStatus + totalHours) / 8),
  };
};