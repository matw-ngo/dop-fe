/**
 * Test Utilities for eKYC Integration Testing
 *
 * This file provides utility functions and helpers for:
 * - Test data generation
 * - Form setup helpers
 * - Verification flow simulation
 * - Assertion helpers
 * - Mock environment setup
 */

import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import type { ReactElement, ReactNode } from "react";
import { expect, vi } from "vitest";
import { FormProvider } from "@/components/form-generation/context/FormContext";
import { DynamicForm } from "@/components/form-generation/DynamicForm";
import type {
  DynamicFormConfig,
  EkycFieldConfig,
} from "@/components/form-generation/types";
import { FieldType } from "@/components/form-generation/types";

// Test wrapper component for form context
interface TestWrapperProps {
  children: ReactNode;
  formConfig?: DynamicFormConfig;
  onSubmit?: (data: any, context: any) => void;
  onFieldChange?: (fieldId: string, value: any) => void;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  formConfig,
  onSubmit = vi.fn(),
  onFieldChange = vi.fn(),
}) => {
  if (formConfig) {
    return (
      <FormProvider>
        <DynamicForm
          config={formConfig}
          onSubmit={(data: Record<string, any>) => onSubmit(data, {})}
          onChange={onFieldChange}
        />
        {children}
      </FormProvider>
    );
  }

  return <FormProvider>{children}</FormProvider>;
};

// Custom render function with form context
const _customRender = (
  ui: ReactElement,
  options?: RenderOptions & {
    wrapperProps?: TestWrapperProps;
  },
) => {
  const { wrapperProps, ...renderOptions } = options || {};

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <TestWrapper {...wrapperProps}>{children}</TestWrapper>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Test data generators
export const testDataGenerator = {
  // Generate realistic Vietnamese personal data
  vietnamesePersonalData: () => ({
    fullName: (() => {
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
      const middleNames = [
        "Văn",
        "Thị",
        "Quốc",
        "Ngọc",
        "Minh",
        "Thanh",
        "Đình",
      ];
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

      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const middleName =
        middleNames[Math.floor(Math.random() * middleNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      return `${firstName} ${middleName} ${lastName}`;
    })(),

    dateOfBirth: (() => {
      const start = new Date(1960, 0, 1);
      const end = new Date(2000, 11, 31);
      const date = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
      );
      return date.toISOString().split("T")[0];
    })(),

    gender: ["male", "female", "other"][Math.floor(Math.random() * 3)] as
      | "male"
      | "female"
      | "other",

    idNumber: (() => {
      const prefix = ["001", "002", "003", "004", "005", "006", "007", "008"][
        Math.floor(Math.random() * 8)
      ];
      const suffix = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0");
      return `${prefix}${suffix}`;
    })(),

    address: {
      fullAddress: (() => {
        const streets = [
          "Nguyễn Văn Linh",
          "Võ Văn Kiệt",
          "Điện Biên Phủ",
          "Lê Lợi",
          "Hàm Nghi",
        ];
        const wards = [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
        ];
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
      })(),
      city: ["TP. Hồ Chí Minh", "TP. Hà Nội", "TP. Đà Nẵng"][
        Math.floor(Math.random() * 3)
      ],
      district: `Quận ${Math.floor(Math.random() * 12) + 1}`,
      ward: `Phường ${Math.floor(Math.random() * 30) + 1}`,
      street: `${Math.floor(Math.random() * 999)} Đường Test`,
    },

    phone: (() => {
      const prefixes = [
        "090",
        "091",
        "093",
        "094",
        "097",
        "098",
        "032",
        "033",
        "034",
        "035",
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0");
      return `${prefix}${suffix}`;
    })(),

    email: (name: string) => {
      const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
      const cleanName = name
        .toLowerCase()
        .replace(/\s+/g, ".")
        .replace(/[đ]/g, "d");
      const randomNum = Math.floor(Math.random() * 1000);
      return `${cleanName}${randomNum}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
  }),

  // Generate loan application data
  loanApplicationData: () => ({
    amount: Math.floor(Math.random() * 200000000) + 10000000, // 10M - 210M VND
    purpose: ["Personal Loan", "Business Loan", "Home Loan", "Car Loan"][
      Math.floor(Math.random() * 4)
    ],
    term: `${[6, 12, 24, 36, 48, 60][Math.floor(Math.random() * 6)]} months`,
    monthlyIncome: Math.floor(Math.random() * 50000000) + 5000000, // 5M - 55M VND
  }),
};

// Form configuration builders
export const formConfigBuilder = {
  // Build basic eKYC form configuration
  buildEkycForm: (
    options: {
      required?: boolean;
      autofillFields?: string[];
      buttonText?: string;
      renderMode?: "button" | "inline" | "modal";
    } = {},
  ) => {
    const {
      required = true,
      autofillFields = ["full_name", "date_of_birth", "national_id", "address"],
      buttonText = "Verify Identity",
      renderMode = "button",
    } = options;

    const autofillMapping: Record<string, string> = {};
    autofillFields.forEach((field) => {
      const mapping: Record<string, string> = {
        full_name: "fullName",
        date_of_birth: "dateOfBirth",
        national_id: "idNumber",
        address: "address.fullAddress",
        phone: "phone",
        email: "email",
      };
      const mappedValue = mapping[field];
      if (mappedValue) {
        autofillMapping[field] = mappedValue;
      }
    });

    const config: DynamicFormConfig = {
      id: "ekyc-test-form",
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
            autofillMapping,
            required,
            buttonText,
            onVerified: vi.fn(),
            onError: vi.fn(),
          },
          renderMode,
        },
        {
          id: "full_name",
          name: "full_name",
          type: FieldType.TEXT,
          label: "Full Name",
          validation: [
            { type: "required" as any, message: "Full Name is required" },
          ],
          readOnly: autofillFields.includes("full_name"),
        },
        {
          id: "date_of_birth",
          name: "date_of_birth",
          type: FieldType.DATE,
          label: "Date of Birth",
          validation: [
            { type: "required" as any, message: "Date of Birth is required" },
          ],
          readOnly: autofillFields.includes("date_of_birth"),
        },
        {
          id: "national_id",
          name: "national_id",
          type: FieldType.TEXT,
          label: "National ID",
          validation: [
            { type: "required" as any, message: "National ID is required" },
            {
              type: "pattern" as any,
              value: "^[0-9]{9,12}$",
              message: "ID must be 9-12 digits",
            },
          ],
          readOnly: autofillFields.includes("national_id"),
        },
        {
          id: "address",
          name: "address",
          type: FieldType.TEXTAREA,
          label: "Address",
          validation: [
            { type: "required" as any, message: "Address is required" },
          ],
          readOnly: autofillFields.includes("address"),
        },
        ...(autofillFields.includes("phone")
          ? [
              {
                id: "phone",
                name: "phone",
                type: FieldType.TEXT,
                label: "Phone Number",
                validation: [
                  {
                    type: "required" as any,
                    message: "Phone Number is required",
                  },
                  {
                    type: "pattern" as any,
                    value: "^(0|\\+84)[0-9]{9,10}$",
                    message: "Invalid phone number",
                  },
                ],
              },
            ]
          : []),
        ...(autofillFields.includes("email")
          ? [
              {
                id: "email",
                name: "email",
                type: FieldType.EMAIL,
                label: "Email Address",
                validation: [
                  {
                    type: "required" as any,
                    message: "Email Address is required",
                  },
                ],
              },
            ]
          : []),
      ],
      submitButton: {
        label: "Submit Application",
      },
    };

    return config;
  },

  // Build multi-step form with eKYC
  buildMultiStepForm: () => {
    return {
      id: "multi-step-ekyc-form",
      type: "wizard" as const,
      steps: [
        {
          id: "loan_info",
          title: "Loan Information",
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
          id: "personal_info",
          title: "Personal Information",
          fields: [
            {
              id: "ekyc_verification",
              name: "ekyc_verification",
              type: FieldType.EKYC,
              label: "Identity Verification",
              verification: {
                provider: "vnpt",
                providerOptions: {
                  documentType: "CCCD",
                  flowType: "DOCUMENT_TO_FACE",
                },
                autofillMapping: {
                  full_name: "fullName",
                  date_of_birth: "dateOfBirth",
                  national_id: "idNumber",
                  address: "address.fullAddress",
                },
                required: true,
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
            },
          ],
        },
        {
          id: "additional_info",
          title: "Additional Information",
          fields: [
            {
              id: "phone",
              name: "phone",
              type: FieldType.TEXT,
              label: "Phone Number",
              required: true,
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
    } as DynamicFormConfig;
  },
};

// Assertion helpers
export const assertions = {
  // Assert eKYC field is properly configured
  assertEkycFieldConfig: (
    config: EkycFieldConfig,
    expected?: Partial<EkycFieldConfig>,
  ) => {
    expect(config.type).toBe(FieldType.EKYC);
    expect(config.verification).toBeDefined();
    expect(config.verification?.provider).toBe("vnpt");
    expect(config.verification?.autofillMapping).toBeDefined();

    if (expected) {
      Object.entries(expected).forEach(([key, value]) => {
        expect((config as any)[key]).toEqual(value);
      });
    }
  },

  // Assert form contains eKYC field
  assertFormHasEkycField: (config: DynamicFormConfig) => {
    const ekycField = config.fields?.find((f) => f.type === FieldType.EKYC);
    expect(ekycField).toBeDefined();
    assertions.assertEkycFieldConfig(ekycField as EkycFieldConfig);
  },

  // Assert autofill mapping is valid
  assertAutofillMapping: (mapping: Record<string, string>) => {
    expect(Object.keys(mapping)).not.toHaveLength(0);

    Object.entries(mapping).forEach(([targetField, sourcePath]) => {
      expect(typeof targetField).toBe("string");
      expect(targetField.length).toBeGreaterThan(0);
      expect(typeof sourcePath).toBe("string");
      expect(sourcePath.length).toBeGreaterThan(0);
    });
  },
};

// Mock environment setup
export const mockEnvironment = {
  // Setup DOM environment for testing
  setupDOM: () => {
    // Mock matchMedia for responsive testing
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    // Mock sessionStorage
    const sessionStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(window, "sessionStorage", {
      value: sessionStorageMock,
    });
  },

  // Setup API mocks
  setupAPIMocks: () => {
    // Mock fetch API
    global.fetch = vi.fn();

    // Mock File and FileReader for file uploads
    global.File = class File {
      name: string;
      size: number;
      type: string;
      lastModified: number;

      constructor(
        chunks: any[],
        name: string,
        options: { type?: string } = {},
      ) {
        this.name = name;
        this.size = chunks[0]?.length || 0;
        this.type = options.type || "application/octet-stream";
        this.lastModified = Date.now();
      }
    } as any;

    global.FileReader = class FileReader {
      result: string | ArrayBuffer | null = null;
      error: any = null;
      readyState: number = 0;
      onload: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;

      readAsDataURL = vi.fn((_file: File) => {
        setTimeout(() => {
          this.result = "data:image/png;base64,mock-image-data";
          this.readyState = 2;
          this.onload?.({ target: this } as any);
        }, 100);
      });
    } as any;
  },

  // Cleanup mocks
  cleanup: () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  },
};

// Test utilities are exported throughout the file

// Re-export testing utilities
export * from "@testing-library/react";
export { userEvent };
