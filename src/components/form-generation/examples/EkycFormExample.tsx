/**
 * eKYC Form Example
 *
 * Example implementation showing how to use the eKYC field
 * in a dynamic form with auto-fill functionality.
 */

import React from "react";
import { DynamicForm } from "@/components/form-generation";
import type { DynamicFormConfig } from "@/components/form-generation/types";
import {
  FieldType,
  ValidationRuleType,
} from "@/components/form-generation/types";

// Example form configuration with eKYC integration
const loanApplicationForm: DynamicFormConfig = {
  id: "loan-application",

  fields: [
    // eKYC Verification Field
    {
      id: "identity_verification",
      name: "identity_verification",
      type: FieldType.EKYC,
      label: "Identity Verification",
      renderMode: "button", // Options: "button", "inline", "modal", "custom"

      verification: {
        provider: "vnpt",

        providerOptions: {
          documentType: "CCCD_CHIP", // Options: "CCCD_CHIP", "CMND_12", "PASSPORT", etc.
          flowType: "DOCUMENT_TO_FACE", // Options: "DOCUMENT_TO_FACE", "FACE_TO_DOCUMENT", "DOCUMENT", "FACE"
          enableLiveness: true,
          enableFaceMatch: true,
          enableAuthenticityCheck: true,
        },

        // Auto-fill mapping - maps eKYC results to form fields
        autofillMapping: {
          full_name: "fullName",
          national_id: "idNumber",
          date_of_birth: "dateOfBirth",
          gender: "gender",
          address: "address.fullAddress",
          city: "address.city",
          district: "address.district",
          ward: "address.ward",
          id_issued_date: "issuedDate",
          id_expiry_date: "expiryDate",
          issuing_place: "issuedBy",
        },

        // Callback when verification completes successfully
        onVerified: (result) => {
          console.log("eKYC verified:", result);

          // Track verification event
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "ekyc_verification_success", {
              provider: result.provider.name,
              confidence: result.verificationData.confidence,
              document_type: result.personalData.documentType,
            });
          }
        },

        // Callback when verification fails
        onError: (error) => {
          console.error("eKYC verification failed:", error);

          // Track error event
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "ekyc_verification_error", {
              error_message: error.message,
            });
          }
        },

        buttonText: "Xác thực danh tính",
        required: true,
        confidenceThreshold: 70, // Minimum confidence to accept
        showResultPreview: true,
        allowManualOverride: false,

        // UI Configuration
        uiConfig: {
          theme: "light",
          showProgress: true,
          allowRetry: true,
          maxRetries: 3,
        },
      },
    },

    // Personal Information (to be auto-filled by eKYC)
    {
      id: "full_name",
      name: "full_name",
      type: FieldType.TEXT,
      label: "Họ và tên",
      placeholder: "Họ và tên đầy đủ",
      readOnly: true, // Lock after eKYC verification
      validation: [
        { type: ValidationRuleType.REQUIRED, message: "Vui lòng nhập họ tên" },
      ],
    },

    {
      id: "national_id",
      name: "national_id",
      type: FieldType.TEXT,
      label: "Số CCCD/CMND",
      placeholder: "Số căn cước công dân",
      readOnly: true,
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng nhập số CCCD/CMND",
        },
        {
          type: ValidationRuleType.MIN_LENGTH,
          value: 9,
          message: "Số CCCD/CMND không hợp lệ",
        },
      ],
    },

    {
      id: "date_of_birth",
      name: "date_of_birth",
      type: FieldType.DATE,
      label: "Ngày sinh",
      readOnly: true,
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng chọn ngày sinh",
        },
      ],
    },

    {
      id: "gender",
      name: "gender",
      type: FieldType.RADIO,
      label: "Giới tính",
      readOnly: true,
      options: {
        choices: [
          { label: "Nam", value: "male" },
          { label: "Nữ", value: "female" },
          { label: "Khác", value: "other" },
        ],
        layout: "horizontal",
      },
    },

    {
      id: "address",
      name: "address",
      type: FieldType.TEXT,
      label: "Địa chỉ thường trú",
      placeholder: "Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố",
      readOnly: true,
      validation: [
        { type: ValidationRuleType.REQUIRED, message: "Vui lòng nhập địa chỉ" },
      ],
    },

    {
      id: "city",
      name: "city",
      type: FieldType.SELECT,
      label: "Tỉnh/Thành phố",
      readOnly: true,
      options: {
        choices: [
          { label: "--- Chọn Tỉnh/Thành phố ---", value: "" },
          { label: "Hà Nội", value: "Hà Nội" },
          { label: "TP. Hồ Chí Minh", value: "TP. Hồ Chí Minh" },
          { label: "Đà Nẵng", value: "Đà Nẵng" },
          { label: "Cần Thơ", value: "Cần Thơ" },
          // Add more cities...
        ],
      },
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng chọn tỉnh/thành phố",
        },
      ],
    },

    {
      id: "district",
      name: "district",
      type: FieldType.TEXT,
      label: "Quận/Huyện",
      readOnly: true,
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng nhập quận/huyện",
        },
      ],
    },

    {
      id: "ward",
      name: "ward",
      type: FieldType.TEXT,
      label: "Phường/Xã",
      readOnly: true,
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng nhập phường/xã",
        },
      ],
    },

    {
      id: "id_issued_date",
      name: "id_issued_date",
      type: FieldType.DATE,
      label: "Ngày cấp CCCD",
      readOnly: true,
    },

    {
      id: "id_expiry_date",
      name: "id_expiry_date",
      type: FieldType.DATE,
      label: "Ngày hết hạn CCCD",
      readOnly: true,
    },

    {
      id: "issuing_place",
      name: "issuing_place",
      type: FieldType.TEXT,
      label: "Nơi cấp",
      readOnly: true,
    },

    // Additional loan information
    {
      id: "loan_amount",
      name: "loan_amount",
      type: FieldType.CURRENCY,
      label: "Số tiền vay mong muốn (VND)",
      placeholder: "0",
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng nhập số tiền vay",
        },
        {
          type: ValidationRuleType.MIN,
          value: 1000000,
          message: "Số tiền vay tối thiểu là 1,000,000 VND",
        },
        {
          type: ValidationRuleType.MAX,
          value: 1000000000,
          message: "Số tiền vay tối đa là 1,000,000,000 VND",
        },
      ],
    },

    {
      id: "loan_purpose",
      name: "loan_purpose",
      type: FieldType.SELECT,
      label: "Mục đích vay",
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng chọn mục đích vay",
        },
      ],
      options: {
        choices: [
          { label: "--- Chọn mục đích ---", value: "" },
          { label: "Mua nhà", value: "buy_house" },
          { label: "Mua xe", value: "buy_car" },
          { label: "Kinh doanh", value: "business" },
          { label: "Tiêu dùng", value: "consumption" },
          { label: "Khác", value: "other" },
        ],
      },
    },

    {
      id: "loan_term",
      name: "loan_term",
      type: FieldType.SELECT,
      label: "Thời gian vay",
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng chọn thời gian vay",
        },
      ],
      options: {
        choices: [
          { label: "--- Chọn thời gian ---", value: "" },
          { label: "6 tháng", value: 6 },
          { label: "12 tháng", value: 12 },
          { label: "24 tháng", value: 24 },
          { label: "36 tháng", value: 36 },
          { label: "48 tháng", value: 48 },
          { label: "60 tháng", value: 60 },
        ],
      },
    },
  ],

  onSubmit: async (data) => {
    console.log("Form submitted:", data);

    // Here you would typically send the data to your backend
    const response = await fetch("/api/loan-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        // Add verification data
        ekyc_session_id: data.identity_verification?.sessionId,
        ekyc_confidence: data.identity_verification?.confidence,
      }),
    });

    if (response.ok) {
      alert("Đơn vay đã được gửi thành công!");
    } else {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  },

  onChange: (fieldName, value) => {
    console.log(`Field ${fieldName} changed:`, value);
  },
};

// Example component
export function EkycFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Loan Application with eKYC
      </h1>
      <p className="text-gray-600 mb-6">
        This example demonstrates eKYC integration with auto-fill functionality.
      </p>

      <DynamicForm config={loanApplicationForm} />
    </div>
  );
}

// Export the configuration for reuse
export { loanApplicationForm as ekycFormConfig };

// Alternative: Multi-step wizard example
export const loanWizardConfig: DynamicFormConfig = {
  id: "loan-wizard",

  steps: [
    {
      id: "identity",
      title: "Step 1: Identity Verification",
      description: "Verify your identity using eKYC",

      fields: [
        {
          id: "identity_verification",
          name: "identity_verification",
          type: FieldType.EKYC,
          label: "Identity Verification",
          renderMode: "modal", // Use modal for wizard

          verification: {
            provider: "vnpt",
            providerOptions: {
              documentType: "CCCD_CHIP",
              flowType: "DOCUMENT_TO_FACE",
            },
            autofillMapping: {
              full_name: "fullName",
              national_id: "idNumber",
              date_of_birth: "dateOfBirth",
              address: "address.fullAddress",
            },
            modalConfig: {
              title: "Xác thực danh tính điện tử",
              size: "lg",
              closeOnOverlayClick: false,
            },
            onVerified: (result) => {
              console.log("Wizard eKYC verified:", result);
            },
          },
        },
      ],

      validation: {
        validateOnNext: true,
        customValidator: (data) => {
          if (!data.identity_verification?.verified) {
            return "Please complete identity verification to proceed";
          }
          return true;
        },
      },
    },

    {
      id: "personal",
      title: "Step 2: Personal Information",
      description: "Review and confirm your personal information",

      fields: [
        // Same personal fields as above but with readOnly: true
        // to show auto-filled data
      ],
    },

    {
      id: "loan",
      title: "Step 3: Loan Details",
      description: "Provide loan information",

      fields: [
        // Loan amount, purpose, term fields
      ],
    },

    {
      id: "review",
      title: "Step 4: Review & Submit",
      description: "Review your application before submitting",

      fields: [
        // Summary fields or just use a custom component
      ],
    },
  ],

  navigation: {
    showProgress: true,
    progressType: "stepper",
  },

  onComplete: async (data) => {
    console.log("Wizard completed:", data);
    // Submit to backend
  },
};
