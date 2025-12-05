/**
 * Loan Notification System
 * Comprehensive notification management for Vietnamese loan applications
 * Multi-channel delivery with Vietnamese language support
 */

import type {
  LoanApplicationStatus,
  StatusConfig,
} from "@/lib/loan-status/vietnamese-status-config";

import { getStatusConfig } from "@/lib/loan-status/vietnamese-status-config";

/**
 * Notification channel types
 */
export type NotificationChannel =
  | "sms"
  | "email"
  | "in_app"
  | "zalo"
  | "phone_call";

/**
 * Notification priority levels
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Notification template interface
 */
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: NotificationChannel[];
  subject: string;
  content: string;
  variables: string[];
  conditions?: {
    loanTypes?: string[];
    statuses?: LoanApplicationStatus[];
    amounts?: {
      min?: number;
      max?: number;
    };
  };
  frequency: "once" | "daily" | "weekly";
  enabled: boolean;
}

/**
 * Notification message interface
 */
export interface NotificationMessage {
  id: string;
  applicationId: string;
  templateId: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  recipient: {
    name: string;
    phone?: string;
    email?: string;
    zaloId?: string;
  };
  subject: string;
  content: string;
  variables: Record<string, any>;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  deliveryAttempts: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Delivery receipt interface
 */
export interface DeliveryReceipt {
  id: string;
  messageId: string;
  channel: NotificationChannel;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  provider?: string;
  externalId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  applicationId?: string;
  channels: {
    sms: boolean;
    email: boolean;
    in_app: boolean;
    zalo: boolean;
    phone_call: boolean;
  };
  frequency: "real_time" | "daily" | "weekly" | "never";
  doNotDisturb?: {
    enabled: boolean;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    timezone: string;
  };
  urgentOnly: boolean;
  language: "vi" | "en";
  format: "text" | "html";
}

/**
 * Vietnamese notification templates
 */
export const VIETNAMESE_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Application received
  {
    id: "application_received",
    name: "Hồ sơ được tiếp nhận",
    description: "Thông báo khi hồ sơ vay được tiếp nhận thành công",
    category: "status_updates",
    channels: ["in_app", "sms", "email"],
    subject: "Hồ sơ vay vốn đã được tiếp nhận",
    content:
      "Chào anh/chị {{customerName}},\n\nHồ sơ vay vốn mã {{applicationId}} của Quý khách đã được tiếp nhận thành công vào {{applicationDate}}.\n\nTrạng thái hiện tại: {{currentStatus}}\nSố tiền vay: {{requestedAmount}} VNĐ\nThời hạn vay: {{loanTerm}} tháng\n\nChúng tôi sẽ xử lý hồ sơ và cập nhật cho Quý khách trong thời gian sớm nhất.\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "applicationDate",
      "currentStatus",
      "requestedAmount",
      "loanTerm",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  // Status change notifications
  {
    id: "status_under_processing",
    name: "Hồ sơ đang xử lý",
    description: "Thông báo khi hồ sơ bắt đầu được xử lý",
    category: "status_updates",
    channels: ["in_app", "sms"],
    subject: "Hồ sơ đang được xử lý",
    content:
      "Chào anh/chị {{customerName}},\n\nHồ sơ {{applicationId}} của Quý khách đang được các chuyên viên tín dụng xem xét và kiểm tra.\n\nThời gian xử lý dự kiến: {{estimatedTime}} ngày làm việc.\n\nQuý khách không cần thực hiện thêm thao tác nào lúc này.\n\nTrân trọng,\n{{bankName}}",
    variables: ["customerName", "applicationId", "estimatedTime", "bankName"],
    frequency: "once",
    enabled: true,
  },

  {
    id: "status_documents_required",
    name: "Yêu cầu bổ sung giấy tờ",
    description: "Thông báo khi cần bổ sung giấy tờ",
    category: "document_requests",
    channels: ["in_app", "sms", "email"],
    subject: "Yêu cầu bổ sung giấy tờ cho hồ sơ vay vốn",
    content:
      "Chào anh/chị {{customerName}},\n\nĐể tiếp tục xử lý hồ sơ {{applicationId}}, Quý khách vui lòng bổ sung các giấy tờ sau:\n\n{{requiredDocuments}}\n\nVui lòng tải lên giấy tờ trước {{deadline}}.\n\nNếu cần hỗ trợ, Quý khách có thể liên hệ:\n- Hotline: {{hotline}}\n- Email: {{supportEmail}}\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "requiredDocuments",
      "deadline",
      "hotline",
      "supportEmail",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  {
    id: "status_under_assessment",
    name: "Hồ sơ đang thẩm định",
    description: "Thông báo khi hồ sơ đang trong giai đoạn thẩm định",
    category: "status_updates",
    channels: ["in_app", "email"],
    subject: "Hồ sơ đang được thẩm định chuyên sâu",
    content:
      "Chào anh/chị {{customerName}},\n\nHồ sơ {{applicationId}} của Quý khách đã hoàn thành giai đoạn kiểm tra ban đầu và đang được thẩm định chuyên sâu.\n\nThẩm định viên: {{officerName}}\nĐiện thoại: {{officerPhone}}\n\nThời gian thẩm định dự kiến: {{estimatedTime}} ngày làm việc.\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "officerName",
      "officerPhone",
      "estimatedTime",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  {
    id: "status_approved",
    name: "Hồ sơ được duyệt",
    description: "Thông báo khi hồ sơ được phê duyệt",
    category: "status_updates",
    channels: ["in_app", "sms", "email"],
    subject: "Chúc mừng! Hồ sơ vay vốn đã được phê duyệt",
    content:
      "Chào anh/chị {{customerName}},\n\nChúc mừng! Hồ sơ vay vốn {{applicationId}} của Quý khách đã được phê duyệt.\n\nThông tin khoản vay được duyệt:\n- Số tiền: {{approvedAmount}} VNĐ\n- Lãi suất: {{interestRate}}%/năm\n- Thời hạn: {{approvedTerm}} tháng\n- Phương thức trả nợ: {{repaymentMethod}}\n\nQuý khách vui lòng hoàn tất các thủ tục sau để nhận giải ngân:\n{{nextSteps}}\n\nChuyên viên phụ trách: {{officerName}} - {{officerPhone}}\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "approvedAmount",
      "interestRate",
      "approvedTerm",
      "repaymentMethod",
      "nextSteps",
      "officerName",
      "officerPhone",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  {
    id: "status_awaiting_disbursement",
    name: "Chờ giải ngân",
    description: "Thông báo khi hồ sơ chờ giải ngân",
    category: "status_updates",
    channels: ["in_app", "sms"],
    subject: "Hồ sơ đang chờ giải ngân",
    content:
      "Chào anh/chị {{customerName}},\n\nHồ sơ {{applicationId}} đã hoàn tất tất cả thủ tục và đang chờ giải ngân.\n\nSố tiền giải ngân: {{disbursementAmount}} VNĐ\nTài khoản nhận: {{bankAccount}}\n\nThời gian giải ngân dự kiến: {{estimatedTime}}.\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "disbursementAmount",
      "bankAccount",
      "estimatedTime",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  {
    id: "status_disbursed",
    name: "Đã giải ngân",
    description: "Thông báo khi khoản vay đã được giải ngân",
    category: "status_updates",
    channels: ["in_app", "sms", "email", "zalo"],
    subject: "Khoản vay đã được giải ngân thành công",
    content:
      "Chào anh/chị {{customerName}},\n\nKhoản vay {{applicationId}} đã được giải ngân thành công vào tài khoản của Quý khách.\n\nSố tiền: {{disbursementAmount}} VNĐ\nThời gian giải ngân: {{disbursementTime}}\nTài khoản nhận: {{bankAccount}}\n\nThông tin trả nợ:\n- Ngày trả nợ đầu tiên: {{firstPaymentDate}}\n- Số tiền trả nợ hàng tháng: {{monthlyPayment}} VNĐ\n- Tài khoản trích nợ: {{repaymentAccount}}\n\nQuý khách vui lòng đảm bảo số dư tài khoản đủ vào ngày trả nợ.\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "disbursementAmount",
      "disbursementTime",
      "bankAccount",
      "firstPaymentDate",
      "monthlyPayment",
      "repaymentAccount",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  {
    id: "status_rejected",
    name: "Hồ sơ bị từ chối",
    description: "Thông báo khi hồ sơ bị từ chối",
    category: "status_updates",
    channels: ["in_app", "email", "phone_call"],
    subject: "Thông báo về kết quả hồ sơ vay vốn",
    content:
      "Chào anh/chị {{customerName}},\n\nSau khi xem xét kỹ lưỡng, rất tiếc hồ sơ vay vốn {{applicationId}} của Quý khách chưa đáp ứng điều kiện phê duyệt tại thời điểm này.\n\nLý do: {{rejectionReason}}\n\nQuý khách có thể:\n1. Cải thiện tình hình tài chính và nộp lại hồ sơ sau 3 tháng\n2. Liên hệ chuyên viên để được tư vấn các sản phẩm phù hợp khác\n\nChuyên viên tư vấn: {{officerName}} - {{officerPhone}}\n\nCảm ơn Quý khách đã tin tưởng và lựa chọn {{bankName}}.\n\nTrân trọng,\n{{bankName}}",
    variables: [
      "customerName",
      "applicationId",
      "rejectionReason",
      "officerName",
      "officerPhone",
      "bankName",
    ],
    frequency: "once",
    enabled: true,
  },

  // Document notifications
  {
    id: "document_uploaded",
    name: "Giấy tờ đã tải lên",
    description: "Xác nhận khi giấy tờ được tải lên thành công",
    category: "document_updates",
    channels: ["in_app"],
    subject: "Giấy tờ đã được tải lên thành công",
    content:
      "Giấy tờ {{documentName}} đã được tải lên thành công cho hồ sơ {{applicationId}}.\n\nTrạng thái: Đang chờ xác minh.",
    variables: ["documentName", "applicationId"],
    frequency: "once",
    enabled: true,
  },

  {
    id: "document_verified",
    name: "Giấy tờ đã xác minh",
    description: "Thông báo khi giấy tờ được xác minh thành công",
    category: "document_updates",
    channels: ["in_app", "sms"],
    subject: "Giấy tờ đã được xác minh",
    content:
      "Giấy tờ {{documentName}} đã được xác minh thành công cho hồ sơ {{applicationId}}.",
    variables: ["documentName", "applicationId"],
    frequency: "once",
    enabled: true,
  },

  {
    id: "document_rejected",
    name: "Giấy tờ bị từ chối",
    description: "Thông báo khi giấy tờ bị từ chối",
    category: "document_updates",
    channels: ["in_app", "sms", "email"],
    subject: "Giấy tờ cần được tải lại",
    content:
      "Giấy tờ {{documentName}} đã bị từ chối cho hồ sơ {{applicationId}}.\n\nLý do: {{rejectionReason}}\n\nVui lòng tải lại giấy tờ hợp lệ để tiếp tục xử lý hồ sơ.",
    variables: ["documentName", "applicationId", "rejectionReason"],
    frequency: "once",
    enabled: true,
  },

  // Reminder notifications
  {
    id: "reminder_document_upload",
    name: "Nhắc nhở tải giấy tờ",
    description: "Nhắc nhở khi cần tải giấy tờ",
    category: "reminders",
    channels: ["in_app", "sms"],
    subject: "Nhắc nhở: Vui lòng tải lên giấy tờ còn thiếu",
    content:
      "Nhắc nhở: Hồ sơ {{applicationId}} của Quý khách vẫn còn {{pendingDocuments}} giấy tờ chưa được tải lên.\n\nVui lòng hoàn tất trước {{deadline}} để không ảnh hưởng đến tiến độ xử lý.",
    variables: ["applicationId", "pendingDocuments", "deadline"],
    frequency: "daily",
    enabled: true,
  },

  {
    id: "reminder_payment_due",
    name: "Nhắc nhở ngày trả nợ",
    description: "Nhắc nhở trước ngày trả nợ",
    category: "reminders",
    channels: ["sms", "email", "zalo"],
    subject: "Nhắc nhở ngày trả nợ khoản vay",
    content:
      "Nhắc nhở: Khoản vay {{applicationId}} có ngày trả nợ vào {{paymentDate}}.\n\nSố tiền thanh toán: {{paymentAmount}} VNĐ\nVui lòng đảm bảo số dư tài khoản {{repaymentAccount}} đủ để thanh toán đúng hạn.",
    variables: [
      "applicationId",
      "paymentDate",
      "paymentAmount",
      "repaymentAccount",
    ],
    frequency: "once",
    enabled: true,
  },

  // System notifications
  {
    id: "system_maintenance",
    name: "Bảo trì hệ thống",
    description: "Thông báo bảo trì hệ thống",
    category: "system",
    channels: ["in_app", "email"],
    subject: "Thông báo bảo trì hệ thống",
    content:
      "Hệ thống quản lý khoản vay sẽ được bảo trì từ {{startTime}} đến {{endTime}} ngày {{maintenanceDate}}.\n\nTrong thời gian này, Quý khách có thể không thể truy cập các tính năng sau:\n- Kiểm tra trạng thái hồ sơ\n- Tải lên giấy tờ\n- Gửi yêu cầu hỗ trợ\n\nChúng tôi xin lỗi vì sự bất tiện này.",
    variables: ["startTime", "endTime", "maintenanceDate"],
    frequency: "once",
    enabled: true,
  },
];

/**
 * Channel delivery configurations
 */
export const CHANNEL_CONFIGS = {
  sms: {
    name: "SMS",
    maxLength: 1600,
    supportedFormats: ["text"],
    deliveryTime: "1-5 phút",
    cost: "per_sms",
    retryAttempts: 3,
    workingHours: {
      start: "08:00",
      end: "20:00",
      timezone: "Asia/Ho_Chi_Minh",
    },
  },
  email: {
    name: "Email",
    maxLength: 1000000,
    supportedFormats: ["text", "html"],
    deliveryTime: "1-10 phút",
    cost: "per_email",
    retryAttempts: 5,
    workingHours: {
      start: "00:00",
      end: "23:59",
      timezone: "Asia/Ho_Chi_Minh",
    },
  },
  in_app: {
    name: "In-App",
    maxLength: 10000,
    supportedFormats: ["text", "html"],
    deliveryTime: "ngay lập tức",
    cost: "free",
    retryAttempts: 1,
    workingHours: {
      start: "00:00",
      end: "23:59",
      timezone: "Asia/Ho_Chi_Minh",
    },
  },
  zalo: {
    name: "Zalo",
    maxLength: 2000,
    supportedFormats: ["text"],
    deliveryTime: "1-3 phút",
    cost: "per_message",
    retryAttempts: 3,
    workingHours: {
      start: "08:00",
      end: "20:00",
      timezone: "Asia/Ho_Chi_Minh",
    },
  },
  phone_call: {
    name: "Phone Call",
    maxLength: 300, // seconds
    supportedFormats: ["voice"],
    deliveryTime: "1-10 phút",
    cost: "per_minute",
    retryAttempts: 2,
    workingHours: {
      start: "08:00",
      end: "18:00",
      timezone: "Asia/Ho_Chi_Minh",
    },
  },
} as const;

/**
 * Loan Notification Manager Class
 */
export class LoanNotificationManager {
  private templates: NotificationTemplate[] = VIETNAMESE_NOTIFICATION_TEMPLATES;

  /**
   * Get notification template by ID
   */
  getTemplate(templateId: string): NotificationTemplate | null {
    return (
      this.templates.find((template) => template.id === templateId) || null
    );
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): NotificationTemplate[] {
    return this.templates.filter((template) => template.category === category);
  }

  /**
   * Get templates by status
   */
  getTemplatesByStatus(status: LoanApplicationStatus): NotificationTemplate[] {
    return this.templates.filter(
      (template) => template.conditions?.statuses?.includes(status) || false,
    );
  }

  /**
   * Render notification template with variables
   */
  renderTemplate(
    template: NotificationTemplate,
    variables: Record<string, any>,
  ): {
    subject: string;
    content: string;
  } {
    let subject = template.subject;
    let content = template.content;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, "g"), String(value));
      content = content.replace(new RegExp(placeholder, "g"), String(value));
    });

    return { subject, content };
  }

  /**
   * Validate notification message
   */
  validateMessage(message: NotificationMessage): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required fields
    if (!message.applicationId) errors.push("Application ID is required");
    if (!message.templateId) errors.push("Template ID is required");
    if (!message.channel) errors.push("Channel is required");
    if (!message.recipient.name) errors.push("Recipient name is required");

    // Validate channel-specific requirements
    const channelConfig = CHANNEL_CONFIGS[message.channel];
    if (channelConfig) {
      if (message.content.length > channelConfig.maxLength) {
        errors.push(`Content exceeds maximum length for ${channelConfig.name}`);
      }
    }

    // Validate phone number for SMS/Zalo
    if (
      (message.channel === "sms" || message.channel === "zalo") &&
      !message.recipient.phone
    ) {
      errors.push("Phone number is required for SMS/Zalo notifications");
    }

    // Validate email for email channel
    if (message.channel === "email" && !message.recipient.email) {
      errors.push("Email address is required for email notifications");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if notification should be sent based on preferences
   */
  shouldSendNotification(
    message: NotificationMessage,
    preferences: NotificationPreferences,
  ): boolean {
    // Check if channel is enabled
    if (!preferences.channels[message.channel]) {
      return false;
    }

    // Check urgent only setting
    if (preferences.urgentOnly && message.priority !== "urgent") {
      return false;
    }

    // Check frequency
    if (preferences.frequency === "never") {
      return false;
    }

    // Check do not disturb hours
    if (preferences.doNotDisturb?.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      // Simple time comparison (could be improved with timezone handling)
      if (
        currentTime >= preferences.doNotDisturb.startTime &&
        currentTime <= preferences.doNotDisturb.endTime
      ) {
        return message.priority === "urgent"; // Only send urgent messages during DND
      }
    }

    return true;
  }

  /**
   * Schedule notification
   */
  scheduleNotification(
    applicationId: string,
    templateId: string,
    channel: NotificationChannel,
    recipient: NotificationMessage["recipient"],
    variables: Record<string, any>,
    options?: {
      priority?: NotificationPriority;
      scheduledAt?: string;
    },
  ): NotificationMessage {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const { subject, content } = this.renderTemplate(template, variables);

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicationId,
      templateId,
      channel,
      priority: options?.priority || "normal",
      recipient,
      subject,
      content,
      variables,
      scheduledAt: options?.scheduledAt,
      status: "pending",
      deliveryAttempts: 0,
    };
  }

  /**
   * Create status change notification
   */
  createStatusChangeNotification(
    applicationId: string,
    newStatus: LoanApplicationStatus,
    recipient: NotificationMessage["recipient"],
    applicationData: Record<string, any>,
  ): NotificationMessage[] {
    const messages: NotificationMessage[] = [];
    const statusConfig = getStatusConfig(newStatus);

    if (!statusConfig) {
      return messages;
    }

    // Get relevant templates for this status
    const relevantTemplates = this.getTemplatesByStatus(newStatus);

    relevantTemplates.forEach((template) => {
      try {
        const message = this.scheduleNotification(
          applicationId,
          template.id,
          template.channels[0] as NotificationChannel, // Use first available channel
          recipient,
          {
            ...applicationData,
            newStatus: statusConfig.label,
            statusDescription: statusConfig.description,
          },
        );
        messages.push(message);
      } catch (error) {
        console.error(
          `Failed to create notification for template ${template.id}:`,
          error,
        );
      }
    });

    return messages;
  }

  /**
   * Create document notification
   */
  createDocumentNotification(
    applicationId: string,
    documentType: string,
    action: "uploaded" | "verified" | "rejected",
    recipient: NotificationMessage["recipient"],
    metadata?: Record<string, any>,
  ): NotificationMessage | null {
    const templateId = `document_${action}`;
    const template = this.getTemplate(templateId);

    if (!template) {
      return null;
    }

    try {
      return this.scheduleNotification(
        applicationId,
        templateId,
        "in_app",
        recipient,
        {
          documentName: documentType,
          applicationId,
          rejectionReason: metadata?.rejectionReason,
          ...metadata,
        },
      );
    } catch (error) {
      console.error(`Failed to create document notification:`, error);
      return null;
    }
  }

  /**
   * Format Vietnamese currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  /**
   * Format Vietnamese date
   */
  formatDate(date: string | Date, format: "short" | "long" = "short"): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (format === "long") {
      return dateObj.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return dateObj.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  /**
   * Check if current time is within working hours for a channel
   */
  isWithinWorkingHours(channel: NotificationChannel): boolean {
    const config = CHANNEL_CONFIGS[channel];
    if (!config || !config.workingHours) {
      return true; // No restrictions
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { start, end } = config.workingHours;

    return currentTime >= start && currentTime <= end;
  }

  /**
   * Get next available delivery time
   */
  getNextAvailableTime(channel: NotificationChannel): Date {
    const config = CHANNEL_CONFIGS[channel];
    if (!config?.workingHours || this.isWithinWorkingHours(channel)) {
      return new Date();
    }

    const now = new Date();
    const { start } = config.workingHours;
    const [startHour, startMinute] = start.split(":").map(Number);

    const nextAvailable = new Date();
    nextAvailable.setHours(startHour, startMinute, 0, 0);

    // If the next available time is today but has passed, move to tomorrow
    if (nextAvailable <= now) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }
}

// Export singleton instance
export const loanNotificationManager = new LoanNotificationManager();

/**
 * Utility function to create notification preferences with Vietnamese defaults
 */
export function createDefaultNotificationPreferences(
  applicationId?: string,
): NotificationPreferences {
  return {
    applicationId,
    channels: {
      sms: true,
      email: true,
      in_app: true,
      zalo: false,
      phone_call: false,
    },
    frequency: "real_time",
    doNotDisturb: {
      enabled: false,
      startTime: "22:00",
      endTime: "07:00",
      timezone: "Asia/Ho_Chi_Minh",
    },
    urgentOnly: false,
    language: "vi",
    format: "text",
  };
}

/**
 * Utility function to check if a notification template is applicable
 */
export function isTemplateApplicable(
  template: NotificationTemplate,
  applicationData: {
    status?: LoanApplicationStatus;
    loanType?: string;
    amount?: number;
  },
): boolean {
  // Check if template is enabled
  if (!template.enabled) {
    return false;
  }

  // Check status conditions
  if (template.conditions?.statuses && applicationData.status) {
    if (!template.conditions.statuses.includes(applicationData.status)) {
      return false;
    }
  }

  // Check loan type conditions
  if (template.conditions?.loanTypes && applicationData.loanType) {
    if (!template.conditions.loanTypes.includes(applicationData.loanType)) {
      return false;
    }
  }

  // Check amount conditions
  if (template.conditions?.amounts && applicationData.amount) {
    const { min, max } = template.conditions.amounts;
    if (min && applicationData.amount < min) return false;
    if (max && applicationData.amount > max) return false;
  }

  return true;
}
