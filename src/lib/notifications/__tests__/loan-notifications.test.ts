/**
 * Loan Notification System Tests
 * Comprehensive test coverage for the loan notification system
 */

import {
  loanNotificationManager,
  VIETNAMESE_NOTIFICATION_TEMPLATES,
  CHANNEL_CONFIGS,
  createDefaultNotificationPreferences,
  isTemplateApplicable,
} from "../loan-notifications";

import type {
  NotificationTemplate,
  NotificationMessage,
  NotificationChannel,
  NotificationPriority,
  NotificationPreferences,
} from "../loan-notifications";

import type {
  LoanApplicationStatus,
} from "@/lib/loan-status/vietnamese-status-config";

describe("Loan Notification Manager", () => {
  describe("Template Management", () => {
    test("should get template by ID", () => {
      const template = loanNotificationManager.getTemplate("application_received");
      expect(template).toBeDefined();
      expect(template?.id).toBe("application_received");
      expect(template?.name).toBe("Hồ sơ được tiếp nhận");
    });

    test("should return null for invalid template ID", () => {
      const template = loanNotificationManager.getTemplate("invalid_template");
      expect(template).toBeNull();
    });

    test("should get templates by category", () => {
      const statusTemplates = loanNotificationManager.getTemplatesByCategory("status_updates");
      expect(statusTemplates.length).toBeGreaterThan(0);
      expect(statusTemplates.every(t => t.category === "status_updates")).toBe(true);
    });

    test("should get templates by status", () => {
      const approvedTemplates = loanNotificationManager.getTemplatesByStatus("da_duyet");
      expect(approvedTemplates.length).toBeGreaterThan(0);
      expect(approvedTemplates.every(t => t.conditions?.statuses?.includes("da_duyet"))).toBe(true);
    });

    test("should have all required Vietnamese templates", () => {
      const requiredTemplates = [
        "application_received",
        "status_under_processing",
        "status_documents_required",
        "status_under_assessment",
        "status_approved",
        "status_awaiting_disbursement",
        "status_disbursed",
        "status_rejected",
      ];

      requiredTemplates.forEach(templateId => {
        const template = loanNotificationManager.getTemplate(templateId);
        expect(template).toBeDefined();
        expect(template?.subject).toMatch(/[\u00C0-\u017F]/); // Vietnamese characters
        expect(template?.content).toMatch(/[\u00C0-\u017F]/);
      });
    });
  });

  describe("Template Rendering", () => {
    test("should render template with variables", () => {
      const template = loanNotificationManager.getTemplate("application_received");
      expect(template).toBeDefined();

      const variables = {
        customerName: "Nguyễn Văn A",
        applicationId: "APP-001",
        applicationDate: "15/01/2024",
        currentStatus: "Đã tiếp nhận",
        requestedAmount: 200000000,
        loanTerm: 12,
        bankName: "Ngân hàng ABC",
      };

      const rendered = loanNotificationManager.renderTemplate(template!, variables);

      expect(rendered.subject).toContain("Hồ sơ vay vốn đã được tiếp nhận");
      expect(rendered.content).toContain("Nguyễn Văn A");
      expect(rendered.content).toContain("APP-001");
      expect(rendered.content).toContain("200.000.000");
    });

    test("should handle missing variables gracefully", () => {
      const template = loanNotificationManager.getTemplate("application_received");
      expect(template).toBeDefined();

      const variables = {
        customerName: "Nguyễn Văn A",
        // Missing other variables
      };

      const rendered = loanNotificationManager.renderTemplate(template!, variables);

      expect(rendered.content).toContain("Nguyễn Văn A");
      // Missing variables should remain as placeholders or be handled gracefully
    });

    test("should handle empty variables", () => {
      const template = loanNotificationManager.getTemplate("application_received");
      expect(template).toBeDefined();

      const rendered = loanNotificationManager.renderTemplate(template!, {});

      expect(rendered.subject).toBeTruthy();
      expect(rendered.content).toBeTruthy();
    });
  });

  describe("Message Validation", () => {
    test("should validate complete message", () => {
      const message: NotificationMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "normal",
        recipient: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        subject: "Test Subject",
        content: "Test Content",
        variables: {},
        status: "pending",
        deliveryAttempts: 0,
      };

      const validation = loanNotificationManager.validateMessage(message);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test("should detect missing required fields", () => {
      const message = {
        id: "msg-001",
        applicationId: "",
        templateId: "",
        channel: "sms",
        priority: "normal",
        recipient: {
          name: "",
        },
        subject: "Test Subject",
        content: "Test Content",
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      } as NotificationMessage;

      const validation = loanNotificationManager.validateMessage(message);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Application ID is required");
      expect(validation.errors).toContain("Template ID is required");
      expect(validation.errors).toContain("Recipient name is required");
    });

    test("should validate channel-specific requirements", () => {
      // Test SMS without phone number
      const smsMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "normal",
        recipient: {
          name: "Nguyễn Văn A",
          phone: "",
        },
        subject: "Test Subject",
        content: "Test Content",
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      };

      const smsValidation = loanNotificationManager.validateMessage(smsMessage);
      expect(smsValidation.isValid).toBe(false);
      expect(smsValidation.errors).toContain("Phone number is required for SMS/Zalo notifications");

      // Test email without email address
      const emailMessage = {
        ...smsMessage,
        channel: "email",
        recipient: {
          name: "Nguyễn Văn A",
          email: "",
        },
      };

      const emailValidation = loanNotificationManager.validateMessage(emailMessage);
      expect(emailValidation.isValid).toBe(false);
      expect(emailValidation.errors).toContain("Email address is required for email notifications");
    });

    test("should validate content length", () => {
      const longContent = "a".repeat(2000); // Exceeds SMS limit
      const message: NotificationMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "normal",
        recipient: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        subject: "Test Subject",
        content: longContent,
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      };

      const validation = loanNotificationManager.validateMessage(message);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes("exceeds maximum length"))).toBe(true);
    });
  });

  describe("Notification Scheduling", () => {
    test("should schedule notification successfully", () => {
      const message = loanNotificationManager.scheduleNotification(
        "APP-001",
        "application_received",
        "sms",
        {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        {
          customerName: "Nguyễn Văn A",
          applicationId: "APP-001",
        }
      );

      expect(message.applicationId).toBe("APP-001");
      expect(message.templateId).toBe("application_received");
      expect(message.channel).toBe("sms");
      expect(message.priority).toBe("normal");
      expect(message.status).toBe("pending");
    });

    test("should throw error for invalid template", () => {
      expect(() => {
        loanNotificationManager.scheduleNotification(
          "APP-001",
          "invalid_template",
          "sms",
          { name: "Nguyễn Văn A", phone: "0912345678" },
          {}
        );
      }).toThrow("Template not found: invalid_template");
    });

    test("should create status change notifications", () => {
      const messages = loanNotificationManager.createStatusChangeNotification(
        "APP-001",
        "da_duyet",
        {
          name: "Nguyễn Văn A",
          phone: "0912345678",
          email: "nguyen.van.a@example.com",
        },
        {
          requestedAmount: 200000000,
          loanTerm: 12,
        }
      );

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.every(msg => msg.applicationId === "APP-001")).toBe(true);
    });

    test("should create document notifications", () => {
      const message = loanNotificationManager.createDocumentNotification(
        "APP-001",
        "cmnd_cccd",
        "uploaded",
        {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        }
      );

      expect(message).toBeDefined();
      expect(message?.templateId).toBe("document_uploaded");
      expect(message?.channel).toBe("in_app");
    });

    test("should return null for invalid document notification", () => {
      const message = loanNotificationManager.createDocumentNotification(
        "APP-001",
        "cmnd_cccd",
        "invalid_action" as any,
        {
          name: "Nguyễn Văn A",
        }
      );

      expect(message).toBeNull();
    });
  });

  describe("Notification Preferences", () => {
    test("should allow notifications when preferences allow", () => {
      const preferences: NotificationPreferences = {
        channels: {
          sms: true,
          email: true,
          in_app: true,
          zalo: false,
          phone_call: false,
        },
        frequency: "real_time",
        urgentOnly: false,
        language: "vi",
        format: "text",
      };

      const message: NotificationMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "normal",
        recipient: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        subject: "Test",
        content: "Test",
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      };

      const shouldSend = loanNotificationManager.shouldSendNotification(message, preferences);
      expect(shouldSend).toBe(true);
    });

    test("should block notifications when channel is disabled", () => {
      const preferences: NotificationPreferences = {
        channels: {
          sms: false, // Disabled
          email: true,
          in_app: true,
          zalo: false,
          phone_call: false,
        },
        frequency: "real_time",
        urgentOnly: false,
        language: "vi",
        format: "text",
      };

      const message: NotificationMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "normal",
        recipient: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        subject: "Test",
        content: "Test",
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      };

      const shouldSend = loanNotificationManager.shouldSendNotification(message, preferences);
      expect(shouldSend).toBe(false);
    });

    test("should block non-urgent notifications when urgent only is enabled", () => {
      const preferences: NotificationPreferences = {
        channels: {
          sms: true,
          email: true,
          in_app: true,
          zalo: false,
          phone_call: false,
        },
        frequency: "real_time",
        urgentOnly: true, // Only urgent messages
        language: "vi",
        format: "text",
      };

      const normalMessage: NotificationMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "normal", // Not urgent
        recipient: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        subject: "Test",
        content: "Test",
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      };

      const shouldSend = loanNotificationManager.shouldSendNotification(normalMessage, preferences);
      expect(shouldSend).toBe(false);
    });

    test("should allow urgent messages when urgent only is enabled", () => {
      const preferences: NotificationPreferences = {
        channels: {
          sms: true,
          email: true,
          in_app: true,
          zalo: false,
          phone_call: false,
        },
        frequency: "real_time",
        urgentOnly: true,
        language: "vi",
        format: "text",
      };

      const urgentMessage: NotificationMessage = {
        id: "msg-001",
        applicationId: "APP-001",
        templateId: "application_received",
        channel: "sms",
        priority: "urgent", // Urgent message
        recipient: {
          name: "Nguyễn Văn A",
          phone: "0912345678",
        },
        subject: "Test",
        content: "Test",
        variables: {},
        status: "pending" as const,
        deliveryAttempts: 0,
      };

      const shouldSend = loanNotificationManager.shouldSendNotification(urgentMessage, preferences);
      expect(shouldSend).toBe(true);
    });
  });

  describe("Working Hours", () => {
    test("should check working hours for SMS", () => {
      // Mock current time to be within working hours
      const mockDate = new Date();
      mockDate.setHours(10, 0, 0, 0); // 10:00 AM

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const isWithinHours = loanNotificationManager.isWithinWorkingHours("sms");
      expect(isWithinHours).toBe(true);

      jest.restoreAllMocks();
    });

    test("should check working hours for different channels", () => {
      // Test channels with no working hour restrictions
      const emailWithinHours = loanNotificationManager.isWithinWorkingHours("email");
      expect(emailWithinHours).toBe(true);

      const inAppWithinHours = loanNotificationManager.isWithinWorkingHours("in_app");
      expect(inAppWithinHours).toBe(true);
    });

    test("should get next available time for channels with restrictions", () => {
      // Mock current time to be outside working hours
      const mockDate = new Date();
      mockDate.setHours(22, 30, 0, 0); // 10:30 PM (outside SMS working hours)

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const nextTime = loanNotificationManager.getNextAvailableTime("sms");
      expect(nextTime).toBeInstanceOf(Date);
      expect(nextTime.getTime()).toBeGreaterThan(mockDate.getTime());

      jest.restoreAllMocks();
    });
  });

  describe("Utility Functions", () => {
    test("should format Vietnamese currency", () => {
      const formatted = loanNotificationManager.formatCurrency(200000000);
      expect(formatted).toBe("₫200.000.000");
    });

    test("should format Vietnamese date", () => {
      const date = "2024-01-15T10:30:00Z";
      const formatted = loanNotificationManager.formatDate(date);
      expect(formatted).toBe("15/01/2024");
    });

    test("should format Vietnamese date with long format", () => {
      const date = "2024-01-15T10:30:00Z";
      const formatted = loanNotificationManager.formatDate(date, "long");
      expect(formatted).toMatch(/15\/01\/2024/);
      expect(formatted).toMatch(/10:30/);
    });

    test("should format date for Date object", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = loanNotificationManager.formatDate(date);
      expect(formatted).toBe("15/01/2024");
    });
  });
});

describe("Vietnamese Notification Templates", () => {
  test("should have Vietnamese content in all templates", () => {
    VIETNAMESE_NOTIFICATION_TEMPLATES.forEach(template => {
      expect(template.name).toMatch(/[\u00C0-\u017F]/); // Vietnamese characters
      expect(template.subject).toMatch(/[\u00C0-\u017F]/);
      expect(template.content).toMatch(/[\u00C0-\u017F]/);
    });
  });

  test("should have all required Vietnamese status templates", () => {
    const statusTemplateIds = [
      "application_received",
      "status_under_processing",
      "status_documents_required",
      "status_under_assessment",
      "status_approved",
      "status_awaiting_disbursement",
      "status_disbursed",
      "status_rejected",
    ];

    statusTemplateIds.forEach(templateId => {
      const template = VIETNAMESE_NOTIFICATION_TEMPLATES.find(t => t.id === templateId);
      expect(template).toBeDefined();
    });
  });

  test("should have proper Vietnamese variables", () => {
    const template = VIETNAMESE_NOTIFICATION_TEMPLATES.find(t => t.id === "application_received");
    expect(template?.variables).toContain("customerName");
    expect(template?.variables).toContain("applicationId");
    expect(template?.variables).toContain("requestedAmount");
  });

  test("should have appropriate channels for each template", () => {
    VIETNAMESE_NOTIFICATION_TEMPLATES.forEach(template => {
      expect(Array.isArray(template.channels)).toBe(true);
      expect(template.channels.length).toBeGreaterThan(0);
      expect(template.channels.every(channel => CHANNEL_CONFIGS[channel as keyof typeof CHANNEL_CONFIGS])).toBe(true);
    });
  });

  test("should have proper frequencies", () => {
    const validFrequencies = ["once", "daily", "weekly"];
    VIETNAMESE_NOTIFICATION_TEMPLATES.forEach(template => {
      expect(validFrequencies).toContain(template.frequency);
    });
  });
});

describe("Channel Configurations", () => {
  test("should have configuration for all channels", () => {
    const requiredChannels: NotificationChannel[] = ["sms", "email", "in_app", "zalo", "phone_call"];
    requiredChannels.forEach(channel => {
      expect(CHANNEL_CONFIGS[channel as keyof typeof CHANNEL_CONFIGS]).toBeDefined();
      expect(CHANNEL_CONFIGS[channel as keyof typeof CHANNEL_CONFIGS].name).toBeTruthy();
      expect(CHANNEL_CONFIGS[channel as keyof typeof CHANNEL_CONFIGS].maxLength).toBeGreaterThan(0);
    });
  });

  test("should have proper working hours configuration", () => {
    const smsConfig = CHANNEL_CONFIGS.sms;
    expect(smsConfig.workingHours).toBeDefined();
    expect(smsConfig.workingHours.start).toMatch(/^\d{2}:\d{2}$/);
    expect(smsConfig.workingHours.end).toMatch(/^\d{2}:\d{2}$/);
    expect(smsConfig.workingHours.timezone).toBe("Asia/Ho_Chi_Minh");
  });

  test("should have reasonable max lengths", () => {
    expect(CHANNEL_CONFIGS.sms.maxLength).toBeLessThanOrEqual(2000);
    expect(CHANNEL_CONFIGS.email.maxLength).toBeGreaterThan(CHANNEL_CONFIGS.sms.maxLength);
    expect(CHANNEL_CONFIGS.in_app.maxLength).toBeLessThan(CHANNEL_CONFIGS.email.maxLength);
  });
});

describe("Default Notification Preferences", () => {
  test("should create default preferences", () => {
    const prefs = createDefaultNotificationPreferences();
    expect(prefs.channels.sms).toBe(true);
    expect(prefs.channels.email).toBe(true);
    expect(prefs.channels.in_app).toBe(true);
    expect(prefs.channels.zalo).toBe(false);
    expect(prefs.channels.phone_call).toBe(false);
    expect(prefs.frequency).toBe("real_time");
    expect(prefs.language).toBe("vi");
    expect(prefs.format).toBe("text");
  });

  test("should include application ID when provided", () => {
    const prefs = createDefaultNotificationPreferences("APP-001");
    expect(prefs.applicationId).toBe("APP-001");
  });

  test("should have default do not disturb settings", () => {
    const prefs = createDefaultNotificationPreferences();
    expect(prefs.doNotDisturb).toBeDefined();
    expect(prefs.doNotDisturb?.enabled).toBe(false);
    expect(prefs.doNotDisturb?.startTime).toBe("22:00");
    expect(prefs.doNotDisturb?.endTime).toBe("07:00");
    expect(prefs.doNotDisturb?.timezone).toBe("Asia/Ho_Chi_Minh");
  });
});

describe("Template Applicability", () => {
  test("should check template applicability", () => {
    const template = VIETNAMESE_NOTIFICATION_TEMPLATES[0]; // application_received
    expect(template).toBeDefined();

    // Should be applicable for general application
    const isApplicable = isTemplateApplicable(template!, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      loanType: "vay_tieu_dung",
      amount: 100000000,
    });

    expect(isApplicable).toBe(true);
  });

  test("should not apply disabled templates", () => {
    const disabledTemplate = {
      ...VIETNAMESE_NOTIFICATION_TEMPLATES[0],
      enabled: false,
    };

    const isApplicable = isTemplateApplicable(disabledTemplate, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      loanType: "vay_tieu_dung",
      amount: 100000000,
    });

    expect(isApplicable).toBe(false);
  });

  test("should check status conditions", () => {
    const statusTemplate = VIETNAMESE_NOTIFICATION_TEMPLATES.find(t => t.id === "status_approved");
    expect(statusTemplate).toBeDefined();
    expect(statusTemplate!.conditions?.statuses).toContain("da_duyet");

    const isApplicable = isTemplateApplicable(statusTemplate!, {
      status: "da_duyet" as LoanApplicationStatus,
    });

    expect(isApplicable).toBe(true);

    const isNotApplicable = isTemplateApplicable(statusTemplate!, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
    });

    expect(isNotApplicable).toBe(false);
  });

  test("should check loan type conditions", () => {
    const templateWithLoanType = {
      ...VIETNAMESE_NOTIFICATION_TEMPLATES[0],
      conditions: {
        loanTypes: ["vay_tieu_dung", "vay_mua_nha"],
      },
    };

    const isApplicable = isTemplateApplicable(templateWithLoanType, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      loanType: "vay_tieu_dung",
    });

    expect(isApplicable).toBe(true);

    const isNotApplicable = isTemplateApplicable(templateWithLoanType, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      loanType: "vay_kinh_doanh",
    });

    expect(isNotApplicable).toBe(false);
  });

  test("should check amount conditions", () => {
    const templateWithAmount = {
      ...VIETNAMESE_NOTIFICATION_TEMPLATES[0],
      conditions: {
        amounts: {
          min: 50000000,
          max: 500000000,
        },
      },
    };

    const isApplicable = isTemplateApplicable(templateWithAmount, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      amount: 100000000,
    });

    expect(isApplicable).toBe(true);

    const isBelowMin = isTemplateApplicable(templateWithAmount, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      amount: 30000000,
    });

    expect(isBelowMin).toBe(false);

    const isAboveMax = isTemplateApplicable(templateWithAmount, {
      status: "da_tiep_nhan" as LoanApplicationStatus,
      amount: 600000000,
    });

    expect(isAboveMax).toBe(false);
  });
});