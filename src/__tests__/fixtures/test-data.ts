/**
 * Test Data Fixtures
 *
 * This file contains test data fixtures for:
 * - Sample verification results
 * - Form configuration examples
 * - User scenarios
 * - Edge cases and error data
 */

import type { VerificationResult } from "@/lib/verification/types";
import { vi } from "vitest";
import type { DynamicFormConfig } from "@/components/form-generation/types";
import { FieldType } from "@/components/form-generation/types";

// Sample verification results
export const sampleVerificationResults = {
  // Successful verification with high confidence
  highConfidenceSuccess: {
    success: true,
    sessionId: "session_high_confidence_123",
    provider: {
      name: "vnpt",
      version: "3.2.0",
    },
    personalData: {
      fullName: "NGUYEN VAN ANH",
      dateOfBirth: "1990-01-15",
      gender: "male" as const,
      nationality: "Việt Nam",
      idNumber: "001234567890",
      address: {
        fullAddress: "123 Nguyễn Văn Linh, Phường Bình Thọ, Quận 2, TP.HCM",
        city: "TP.HCM",
        district: "Quận 2",
        ward: "Phường Bình Thọ",
        street: "123 Nguyễn Văn Linh",
        houseNumber: "123",
      },
      documentType: "CCCD",
      documentTypeName: "Căn cước công dân",
      issuedDate: "2020-01-01",
      expiryDate: "2030-01-01",
      issuedBy: "Công an TP.HCM",
      ethnicity: "Kinh",
      hometown: "Hà Nội",
      religion: "Phật giáo",
    },
    verificationData: {
      confidence: 96,
      livenessScore: 98,
      faceMatchScore: 95,
      documentQuality: 92,
      ocrConfidence: {
        idNumber: 99,
        name: 98,
        dateOfBirth: 97,
        address: 95,
      },
      fraudDetection: {
        isAuthentic: true,
        riskScore: 2,
        warnings: [],
        checks: {
          photocopyDetection: true,
          screenDetection: true,
          digitalManipulation: false,
          faceSwapping: false,
        },
      },
      imageQuality: {
        blurScore: 92,
        brightnessScore: 88,
        glareScore: 95,
        sharpnessScore: 90,
      },
    },
    processing: {
      totalDuration: 2500,
      steps: {
        documentUpload: 600,
        ocrProcessing: 1200,
        faceCapture: 400,
        livenessCheck: 300,
        faceComparison: 200,
      },
      retryCount: 0,
    },
    startedAt: "2024-01-15T10:00:00.000Z",
    completedAt: "2024-01-15T10:00:02.500Z",
  } as VerificationResult,

  // Successful verification with low confidence
  lowConfidenceSuccess: {
    success: true,
    sessionId: "session_low_confidence_456",
    provider: {
      name: "vnpt",
      version: "3.2.0",
    },
    personalData: {
      fullName: "TRẦN THỊ BẢO CHI",
      dateOfBirth: "1985-05-20",
      gender: "female" as const,
      nationality: "Việt Nam",
      idNumber: "098765432123",
      address: {
        fullAddress: "456 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
        city: "TP.HCM",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
      },
      documentType: "PASSPORT",
      documentTypeName: "Hộ chiếu",
      issuedDate: "2018-03-15",
      expiryDate: "2028-03-15",
      issuedBy: "Cơ quan Quản lý xuất nhập cảnh",
    },
    verificationData: {
      confidence: 68,
      livenessScore: 85,
      faceMatchScore: 72,
      documentQuality: 65,
      fraudDetection: {
        isAuthentic: true,
        riskScore: 15,
        warnings: ["Low image quality", "Partial document visible"],
        checks: {
          photocopyDetection: true,
          screenDetection: false,
          digitalManipulation: false,
          faceSwapping: false,
        },
      },
    },
    processing: {
      totalDuration: 1800,
      steps: {},
      retryCount: 1,
    },
    startedAt: "2024-01-15T10:05:00.000Z",
    completedAt: "2024-01-15T10:05:03.000Z",
  } as VerificationResult,

  // Failed verification
  failedVerification: {
    success: false,
    sessionId: "session_failed_789",
    provider: {
      name: "vnpt",
      version: "3.2.0",
    },
    personalData: {},
    verificationData: {
      confidence: 0,
      documentQuality: 0,
      fraudDetection: {
        isAuthentic: false,
        riskScore: 85,
        warnings: ["Document appears to be recaptured", "Poor image quality"],
        checks: {
          photocopyDetection: false,
          screenDetection: true,
          digitalManipulation: false,
          faceSwapping: false,
        },
      },
    },
    processing: {
      totalDuration: 800,
      steps: {},
      retryCount: 0,
    },
    startedAt: "2024-01-15T10:10:00.000Z",
    completedAt: "2024-01-15T10:10:01.000Z",
    error: {
      code: "LOW_QUALITY",
      message: "Document quality too low for verification",
    },
  } as VerificationResult,

  // Verification with incomplete data
  incompleteData: {
    success: true,
    sessionId: "session_incomplete_012",
    provider: {
      name: "vnpt",
      version: "3.2.0",
    },
    personalData: {
      fullName: "LÊ VĂN DŨNG",
      // Missing dateOfBirth
      gender: "male" as const,
      // Missing nationality
      idNumber: "012345678901",
      // Missing address
      documentType: "CMND",
      issuedDate: "2015-06-10",
      expiryDate: "2025-06-10",
      issuedBy: "Công an TP.Đà Nẵng",
    },
    verificationData: {
      confidence: 82,
      livenessScore: 88,
      faceMatchScore: 85,
      documentQuality: 78,
    },
    processing: {
      totalDuration: 2200,
      steps: {},
      retryCount: 0,
    },
    startedAt: "2024-01-15T10:15:00.000Z",
    completedAt: "2024-01-15T10:15:04.000Z",
  } as VerificationResult,
};

// Form configuration examples
export const formConfigExamples = {
  // Basic eKYC form
  basicEkycForm: {
    id: "basic-ekyc-form",
    title: "Identity Verification Form",
    fields: [
      {
        id: "identity_verification",
        name: "identity_verification",
        type: FieldType.EKYC,
        label: "Identity Verification",
        verification: {
          provider: "vnpt",
          providerOptions: {
            documentType: "CCCD",
            flowType: "DOCUMENT_TO_FACE",
            enableLiveness: true,
            enableFaceMatch: true,
          },
          autofillMapping: {
            full_name: "fullName",
            date_of_birth: "dateOfBirth",
            national_id: "idNumber",
            address: "address.fullAddress",
          },
          required: true,
          buttonText: "Verify Identity Now",
          onVerified: vi.fn(),
          onError: vi.fn(),
        },
      },
      {
        id: "full_name",
        name: "full_name",
        type: FieldType.TEXT,
        label: "Full Name",
        required: true,
        readOnly: true,
      },
      {
        id: "date_of_birth",
        name: "date_of_birth",
        type: FieldType.DATE,
        label: "Date of Birth",
        required: true,
        readOnly: true,
      },
      {
        id: "national_id",
        name: "national_id",
        type: FieldType.TEXT,
        label: "National ID",
        required: true,
        readOnly: true,
        validation: {
          pattern: "^[0-9]{9,12}$",
          message: "ID must be 9-12 digits",
        },
      },
      {
        id: "address",
        name: "address",
        type: FieldType.TEXTAREA,
        label: "Address",
        required: true,
        readOnly: true,
      },
    ],
    submitButton: {
      text: "Submit Verification",
    },
  } as DynamicFormConfig,

  // Loan application with eKYC
  loanApplicationForm: {
    id: "loan-application-form",
    title: "Loan Application",
    type: "wizard" as const,
    steps: [
      {
        id: "loan_details",
        title: "Loan Details",
        fields: [
          {
            id: "loan_amount",
            name: "loan_amount",
            type: FieldType.NUMBER,
            label: "Loan Amount (VND)",
            required: true,
            validation: {
              min: 10000000,
              max: 500000000,
            },
          },
          {
            id: "loan_purpose",
            name: "loan_purpose",
            type: FieldType.SELECT,
            label: "Loan Purpose",
            required: true,
            options: [
              { value: "personal", label: "Personal Loan" },
              { value: "business", label: "Business Loan" },
              { value: "home", label: "Home Loan" },
            ],
          },
          {
            id: "loan_term",
            name: "loan_term",
            type: FieldType.SELECT,
            label: "Loan Term",
            required: true,
            options: [
              { value: 6, label: "6 months" },
              { value: 12, label: "12 months" },
              { value: 24, label: "24 months" },
              { value: 36, label: "36 months" },
            ],
          },
        ],
      },
      {
        id: "identity_verification",
        title: "Identity Verification",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "Verify Your Identity",
            verification: {
              provider: "vnpt",
              providerOptions: {
                documentType: "CCCD",
                flowType: "DOCUMENT_TO_FACE",
                enableLiveness: true,
                enableFaceMatch: true,
                enableAuthenticityCheck: true,
              },
              autofillMapping: {
                full_name: "fullName",
                date_of_birth: "dateOfBirth",
                national_id: "idNumber",
                address: "address.fullAddress",
                phone: "phone",
                email: "email",
              },
              required: true,
              confidenceThreshold: 70,
              buttonText: "Start Verification",
              onVerified: vi.fn(),
              onError: vi.fn(),
              uiConfig: {
                showProgress: true,
                allowRetry: true,
                maxRetries: 3,
              },
            },
          },
        ],
      },
      {
        id: "personal_info",
        title: "Personal Information",
        fields: [
          {
            id: "full_name",
            name: "full_name",
            type: FieldType.TEXT,
            label: "Full Name",
            required: true,
            readOnly: true,
          },
          {
            id: "date_of_birth",
            name: "date_of_birth",
            type: FieldType.DATE,
            label: "Date of Birth",
            required: true,
            readOnly: true,
          },
          {
            id: "national_id",
            name: "national_id",
            type: FieldType.TEXT,
            label: "National ID",
            required: true,
            readOnly: true,
          },
          {
            id: "phone",
            name: "phone",
            type: FieldType.TEXT,
            label: "Phone Number",
            required: true,
            validation: {
              pattern: "^(0|\\+84)[0-9]{9,10}$",
              message: "Invalid phone number",
            },
          },
          {
            id: "email",
            name: "email",
            type: FieldType.EMAIL,
            label: "Email Address",
            required: true,
          },
          {
            id: "monthly_income",
            name: "monthly_income",
            type: FieldType.NUMBER,
            label: "Monthly Income (VND)",
            required: true,
            validation: {
              min: 3000000,
            },
          },
        ],
      },
    ],
    submitButton: {
      text: "Submit Application",
    },
  } as DynamicFormConfig,

  // Multi-verification form
  multiVerificationForm: {
    id: "multi-verification-form",
    title: "Multi-Document Verification",
    fields: [
      {
        id: "primary_verification",
        name: "primary_verification",
        type: FieldType.EKYC,
        label: "Primary Document (CCCD)",
        verification: {
          provider: "vnpt",
          providerOptions: {
            documentType: "CCCD",
            flowType: "DOCUMENT_TO_FACE",
          },
          autofillMapping: {
            primary_name: "fullName",
            primary_id: "idNumber",
            primary_address: "address.fullAddress",
          },
          buttonText: "Verify CCCD",
        },
      },
      {
        id: "secondary_verification",
        name: "secondary_verification",
        type: FieldType.EKYC,
        label: "Secondary Document (Passport)",
        verification: {
          provider: "vnpt",
          providerOptions: {
            documentType: "PASSPORT",
            flowType: "DOCUMENT_ONLY",
          },
          autofillMapping: {
            secondary_name: "fullName",
            secondary_id: "idNumber",
          },
          buttonText: "Verify Passport",
        },
      },
      {
        id: "primary_name",
        name: "primary_name",
        type: FieldType.TEXT,
        label: "Name from CCCD",
        readOnly: true,
      },
      {
        id: "secondary_name",
        name: "secondary_name",
        type: FieldType.TEXT,
        label: "Name from Passport",
        readOnly: true,
      },
      {
        id: "primary_id",
        name: "primary_id",
        type: FieldType.TEXT,
        label: "CCCD Number",
        readOnly: true,
      },
      {
        id: "secondary_id",
        name: "secondary_id",
        type: FieldType.TEXT,
        label: "Passport Number",
        readOnly: true,
      },
    ],
  } as DynamicFormConfig,
};

// User scenarios
export const userScenarios = {
  // Young professional applying for personal loan
  youngProfessional: {
    age: 28,
    employment: "Software Engineer",
    income: 25000000,
    loanAmount: 50000000,
    loanPurpose: "personal",
    documents: ["CCCD"],
    expectedBehavior: {
      techSavvy: true,
      prefersDigitalProcess: true,
      wantsQuickApproval: true,
    },
  },

  // Small business owner applying for business loan
  businessOwner: {
    age: 45,
    employment: "Business Owner",
    income: 80000000,
    loanAmount: 200000000,
    loanPurpose: "business",
    documents: ["CCCD", "Business License"],
    expectedBehavior: {
      techSavvy: false,
      prefersPersonalContact: true,
      needsDetailedExplanation: true,
    },
  },

  // Elderly person applying for home loan
  elderly: {
    age: 65,
    employment: "Retired",
    income: 15000000,
    loanAmount: 300000000,
    loanPurpose: "home",
    documents: ["CMND"],
    expectedBehavior: {
      techSavvy: false,
      needsAssistance: true,
      prefersInPersonVerification: true,
    },
  },

  // Student applying for education loan
  student: {
    age: 20,
    employment: "Student",
    income: 0,
    loanAmount: 30000000,
    loanPurpose: "education",
    documents: ["CCCD", "Student ID"],
    expectedBehavior: {
      techSavvy: true,
      needsParentalGuarantee: true,
      flexibleOnRequirements: true,
    },
  },
};

// Edge cases and error data
export const edgeCases = {
  // Invalid verification results
  invalidResults: {
    emptyData: {} as VerificationResult,
    nullPersonalData: {
      success: true,
      sessionId: "test",
      provider: { name: "vnpt", version: "1.0" },
      personalData: null as any,
      verificationData: { confidence: 0 },
      processing: { totalDuration: 0, steps: {}, retryCount: 0 },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    } as VerificationResult,
    undefinedConfidence: {
      success: true,
      sessionId: "test",
      provider: { name: "vnpt", version: "1.0" },
      personalData: { fullName: "Test" },
      verificationData: { confidence: undefined as any },
      processing: { totalDuration: 0, steps: {}, retryCount: 0 },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    } as VerificationResult,
  },

  // Invalid form configurations
  invalidConfigs: {
    emptyFields: {
      id: "invalid-form",
      fields: [],
    } as DynamicFormConfig,
    missingVerification: {
      id: "invalid-form",
      fields: [
        {
          id: "ekyc_field",
          name: "ekyc_field",
          type: FieldType.EKYC,
          label: "eKYC",
          // Missing verification config
        },
      ] as DynamicFormConfig,
    },
    emptyAutofillMapping: {
      id: "invalid-form",
      fields: [
        {
          id: "ekyc_field",
          name: "ekyc_field",
          type: FieldType.EKYC,
          label: "eKYC",
          verification: {
            provider: "vnpt",
            autofillMapping: {} as any,
          },
        },
      ] as DynamicFormConfig,
    },
    invalidProvider: {
      id: "invalid-form",
      fields: [
        {
          id: "ekyc_field",
          name: "ekyc_field",
          type: FieldType.EKYC,
          label: "eKYC",
          verification: {
            provider: "invalid_provider" as any,
            autofillMapping: { field: "fullName" },
          },
        },
      ] as DynamicFormConfig,
    },
  },

  // Network and system error scenarios
  errorScenarios: {
    networkTimeout: {
      error: "Network timeout after 30 seconds",
      code: "TIMEOUT",
      recoverable: true,
    },
    providerUnavailable: {
      error: "eKYC provider service is down",
      code: "SERVICE_UNAVAILABLE",
      recoverable: false,
    },
    quotaExceeded: {
      error: "Daily verification quota exceeded",
      code: "QUOTA_EXCEEDED",
      recoverable: false,
    },
    deviceNotSupported: {
      error: "Device does not support required features",
      code: "DEVICE_NOT_SUPPORTED",
      recoverable: false,
    },
    browserIncompatible: {
      error: "Browser version not supported",
      code: "BROWSER_INCOMPATIBLE",
      recoverable: true,
    },
  },
};

// Test data generators for dynamic testing
export const dataGenerators = {
  // Generate random Vietnamese names
  vietnameseName: () => {
    const firstNames = [
      "Nguyễn",
      "Trần",
      "Lê",
      "Phạm",
      "Huỳnh",
      "Hoàng",
      "Võ",
      "Đặng",
    ];
    const middleNames = ["Văn", "Thị", "Quốc", "Ngọc", "Minh", "Thanh", "Đình"];
    const lastNames = [
      "An",
      "Bình",
      "Chi",
      "Dũng",
      "Hà",
      "Long",
      "Nam",
      "Phong",
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName =
      middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${middleName} ${lastName}`;
  },

  // Generate random Vietnamese ID
  vietnameseId: () => {
    const prefix = ["001", "002", "003", "004", "005", "006", "007", "008"];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomSuffix = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0");
    return `${randomPrefix}${randomSuffix}`;
  },

  // Generate random address
  vietnameseAddress: () => {
    const streets = [
      "Nguyễn Văn Linh",
      "Võ Văn Kiệt",
      "Điện Biên Phủ",
      "Lê Lợi",
      "Hàm Nghi",
    ];
    const wards = ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5"];
    const districts = [
      "Quận 1",
      "Quận 3",
      "Quận 7",
      "Quận 10",
      "Quận Bình Thạnh",
    ];
    const cities = [
      "TP. Hồ Chí Minh",
      "TP. Hà Nội",
      "TP. Đà Nẵng",
      "TP. Cần Thơ",
    ];

    return `${Math.floor(Math.random() * 999)} ${streets[Math.floor(Math.random() * streets.length)]}, ${wards[Math.floor(Math.random() * wards.length)]}, ${districts[Math.floor(Math.random() * districts.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`;
  },

  // Generate verification result with customizable confidence
  verificationResult: (confidence: number = 95) =>
    ({
      success: confidence > 70,
      sessionId: `test_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      provider: {
        name: "vnpt",
        version: "3.2.0",
      },
      personalData: {
        fullName: dataGenerators.vietnameseName(),
        dateOfBirth: "1990-01-15",
        gender: ["male", "female"][Math.floor(Math.random() * 2)] as
          | "male"
          | "female",
        idNumber: dataGenerators.vietnameseId(),
        address: {
          fullAddress: dataGenerators.vietnameseAddress(),
        },
      },
      verificationData: {
        confidence,
        livenessScore: Math.min(100, confidence + Math.random() * 10 - 5),
        faceMatchScore: Math.min(100, confidence + Math.random() * 10 - 5),
        documentQuality: Math.min(100, confidence + Math.random() * 10 - 5),
      },
      processing: {
        totalDuration: 1000 + Math.random() * 2000,
        steps: {},
        retryCount: Math.floor(Math.random() * 3),
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 1500).toISOString(),
    }) as VerificationResult,
};
