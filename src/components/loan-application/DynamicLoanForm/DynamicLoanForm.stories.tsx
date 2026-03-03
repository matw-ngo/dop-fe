import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import React, { useState } from "react";
import {
  type DynamicFormConfig,
  FieldType,
  ValidationRuleType,
} from "@/components/form-generation";
import { StepWizard } from "@/components/form-generation/wizard";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";

// ============================================================================
// Mock Data - Flow configurations (same structure as API response)
// ============================================================================

const _mockTenant = {
  uuid: "test-tenant-001",
  name: "Test Tenant",
};

// Minimal flow - only purpose fields visible
const minimalFlow = {
  id: "flow-minimal",
  name: "Minimal Flow",
  description: "Flow with only required fields",
  status: "Active" as const,
  steps: [
    {
      id: "step-minimal",
      page: "/",
      useEkyc: false,
      sendOtp: false,
      fields: {
        purpose: { visible: true, required: true },
        phoneNumber: { visible: false, required: false },
        email: { visible: false, required: false },
        fullName: { visible: false, required: false },
        nationalId: { visible: false, required: false },
        secondNationalId: { visible: false, required: false },
        gender: { visible: false, required: false },
        location: { visible: false, required: false },
        birthday: { visible: false, required: false },
        incomeType: { visible: false, required: false },
        income: { visible: false, required: false },
        havingLoan: { visible: false, required: false },
        careerStatus: { visible: false, required: false },
        careerType: { visible: false, required: false },
        creditStatus: { visible: false, required: false },
      },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Standard flow - common fields
const standardFlow = {
  id: "flow-standard",
  name: "Standard Flow",
  description: "Flow with standard fields",
  status: "Active" as const,
  steps: [
    {
      id: "step-standard",
      page: "/",
      useEkyc: false,
      sendOtp: false,
      fields: {
        purpose: { visible: true, required: true },
        phoneNumber: { visible: true, required: false },
        email: { visible: true, required: true },
        fullName: { visible: true, required: true },
        nationalId: { visible: true, required: true },
        secondNationalId: { visible: false, required: false },
        gender: { visible: true, required: true },
        location: { visible: true, required: true },
        birthday: { visible: true, required: true },
        incomeType: { visible: false, required: false },
        income: { visible: true, required: true },
        havingLoan: { visible: false, required: false },
        careerStatus: { visible: false, required: false },
        careerType: { visible: false, required: false },
        creditStatus: { visible: false, required: false },
      },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Full flow - all fields visible
const fullFlow = {
  id: "flow-full",
  name: "Full Flow",
  description: "Flow with all available fields",
  status: "Active" as const,
  steps: [
    {
      id: "step-full",
      page: "/",
      useEkyc: false,
      sendOtp: true,
      fields: {
        purpose: { visible: true, required: true },
        phoneNumber: { visible: true, required: true },
        email: { visible: true, required: true },
        fullName: { visible: true, required: true },
        nationalId: { visible: true, required: true },
        secondNationalId: { visible: true, required: true },
        gender: { visible: true, required: true },
        location: { visible: true, required: true },
        birthday: { visible: true, required: true },
        incomeType: { visible: true, required: true },
        income: { visible: true, required: true },
        havingLoan: { visible: true, required: true },
        careerStatus: { visible: true, required: true },
        careerType: { visible: true, required: true },
        creditStatus: { visible: true, required: true },
      },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Empty flow (no steps)
const _emptyFlow = {
  id: "flow-empty",
  name: "Empty Flow",
  description: "Flow with no steps",
  status: "Active" as const,
  steps: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// ============================================================================
// Helper: Build form config from flow step
// ============================================================================

const loanPurposes = [
  { label: "Vay tiêu dùng", value: "consumer_loan" },
  { label: "Vay học tập/học phí", value: "student_loan" },
  { label: "Vay mua nhà", value: "home_loan" },
  { label: "Vay mua xe", value: "car_loan" },
  { label: "Vay kinh doanh", value: "business_loan" },
];

import type { FormField } from "@/components/form-generation";

function buildFormConfig(flow: typeof minimalFlow): DynamicFormConfig {
  const step = flow.steps?.[0];
  if (!step) {
    return {
      id: "empty-form",
      steps: [],
      navigation: { showProgress: false },
    };
  }

  const fields: FormField[] = [];

  // Amount field
  if (step.fields.purpose.visible) {
    fields.push({
      id: "expected_amount",
      name: "expected_amount",
      type: FieldType.CUSTOM,
      label: "Số tiền vay",
      options: {
        componentName: "AmountField",
        min: 5,
        max: 90,
        step: 5,
      },
      validation: step.fields.purpose.required
        ? [{ type: ValidationRuleType.REQUIRED }]
        : [],
    });
  }

  // Period field
  if (step.fields.purpose.visible) {
    fields.push({
      id: "loan_period",
      name: "loan_period",
      type: FieldType.CUSTOM,
      label: "Thời hạn vay",
      options: {
        componentName: "PeriodField",
        min: 3,
        max: 36,
        step: 1,
      },
      validation: step.fields.purpose.required
        ? [{ type: ValidationRuleType.REQUIRED }]
        : [],
    });
  }

  // Purpose field
  if (step.fields.purpose.visible) {
    fields.push({
      id: "loan_purpose",
      name: "loan_purpose",
      type: FieldType.CUSTOM,
      label: "Mục đích vay",
      options: {
        componentName: "PurposeField",
        options: loanPurposes,
        placeholder: "Chọn mục đích vay",
      },
      validation: step.fields.purpose.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng chọn mục đích vay",
            },
          ]
        : [],
    });
  }

  // Full Name field
  if (step.fields.fullName.visible) {
    fields.push({
      id: "fullName",
      name: "fullName",
      type: FieldType.TEXT,
      label: "Họ và tên",
      placeholder: "Nhập họ và tên",
      validation: step.fields.fullName.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng nhập họ tên",
            },
            {
              type: ValidationRuleType.MIN_LENGTH,
              value: 2,
              message: "Họ tên phải có ít nhất 2 ký tự",
            },
          ]
        : [],
    });
  }

  // National ID field
  if (step.fields.nationalId.visible) {
    fields.push({
      id: "nationalId",
      name: "nationalId",
      type: FieldType.TEXT,
      label: "Căn cước công dân",
      placeholder: "Nhập số CCCD",
      validation: step.fields.nationalId.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng nhập số CCCD",
            },
            {
              type: ValidationRuleType.PATTERN,
              value: "^[0-9]{12}$",
              message: "CCCD phải có 12 số",
            },
          ]
        : [],
    });
  }

  // Email field
  if (step.fields.email.visible) {
    fields.push({
      id: "email",
      name: "email",
      type: FieldType.EMAIL,
      label: "Email",
      placeholder: "Nhập địa chỉ email",
      validation: step.fields.email.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng nhập email",
            },
            { type: ValidationRuleType.EMAIL, message: "Email không hợp lệ" },
          ]
        : [],
    });
  }

  // Gender field
  if (step.fields.gender.visible) {
    fields.push({
      id: "gender",
      name: "gender",
      type: FieldType.RADIO,
      label: "Giới tính",
      options: {
        choices: [
          { label: "Nam", value: "male" },
          { label: "Nữ", value: "female" },
          { label: "Khác", value: "other" },
        ],
      },
      validation: step.fields.gender.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng chọn giới tính",
            },
          ]
        : [],
    });
  }

  // Location field
  if (step.fields.location.visible) {
    fields.push({
      id: "location",
      name: "location",
      type: FieldType.SELECT,
      label: "Tỉnh/Thành phố",
      placeholder: "Chọn tỉnh/thành phố",
      options: {
        choices: [
          { label: "Hà Nội", value: "hanoi" },
          { label: "TP. Hồ Chí Minh", value: "hcm" },
          { label: "Đà Nẵng", value: "danang" },
          { label: "Hải Phòng", value: "haiphong" },
          { label: "Cần Thơ", value: "cantho" },
        ],
      },
      validation: step.fields.location.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng chọn tỉnh/thành phố",
            },
          ]
        : [],
    });
  }

  // Birthday field
  if (step.fields.birthday.visible) {
    fields.push({
      id: "birthday",
      name: "birthday",
      type: FieldType.DATE,
      label: "Ngày sinh",
      placeholder: "Chọn ngày sinh",
      validation: step.fields.birthday.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng chọn ngày sinh",
            },
          ]
        : [],
    });
  }

  // Income field
  if (step.fields.income.visible) {
    fields.push({
      id: "income",
      name: "income",
      type: FieldType.SELECT,
      label: "Mức thu nhập hàng tháng",
      placeholder: "Chọn mức thu nhập",
      options: {
        choices: [
          { label: "Dưới 5 triệu", value: "<5m" },
          { label: "5 - 10 triệu", value: "5-10m" },
          { label: "10 - 20 triệu", value: "10-20m" },
          { label: "Trên 20 triệu", value: ">20m" },
        ],
      },
      validation: step.fields.income.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
              message: "Vui lòng chọn mức thu nhập",
            },
          ]
        : [],
    });
  }

  // Terms Agreement (always present)
  fields.push({
    id: "agreeStatus",
    name: "agreeStatus",
    type: FieldType.CUSTOM,
    label: "",
    options: {
      componentName: "TermsAgreement",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Bạn phải đồng ý với điều khoản",
      },
    ],
  });

  return {
    id: "loan-application-form",
    steps: [
      {
        id: step.id,
        title: "Thông tin đăng ký vay",
        fields,
      },
    ],
    navigation: {
      showProgress: false,
      progressType: "bar",
      showStepNumbers: false,
      showStepTitles: true,
      showStepHeader: true,
      showBackButtonOnFirstStep: false,
      fullWidthButtons: true,
    },
  };
}

// ============================================================================
// Wrapper Components for Different States
// ============================================================================

// Wrapper that simulates loading state
const LoadingStateWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Wrapper that shows error state
const ErrorStateWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setHasError(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Không thể tải cấu hình form</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Wrapper that shows phone modal
const PhoneModalWrapper: React.FC<{
  children: React.ReactNode;
  onSubmit?: () => void;
}> = ({ children, onSubmit }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(true);

  return (
    <div data-testid="dynamic-loan-form">
      {children}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-center text-2xl font-bold leading-8 mb-3 text-primary">
              Nhập số điện thoại
            </h3>
            <p className="text-center text-sm font-normal leading-6 mb-4 text-gray-600">
              Nhập số điện thoại của bạn để tiếp tục tìm kiếm khoản vay
            </p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Số điện thoại"
                className="w-full p-3 border rounded-lg text-lg"
              />
            </div>
            <button
              type="button"
              className="w-full h-14 bg-primary text-white font-semibold rounded-lg"
              onClick={() => {
                setShowPhoneModal(false);
                onSubmit?.();
              }}
            >
              Tiếp Tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Storybook Meta Configuration
// ============================================================================

const meta: Meta<typeof DynamicLoanForm> = {
  title: "Components/DynamicLoanForm",
  component: DynamicLoanForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "DynamicLoanForm - Core loan application form with backend-driven field configuration. " +
          "Supports multiple field types, validation rules, and modal workflows for phone/OTP verification.",
      },
    },
    chromatic: {
      viewports: [375, 768, 1024, 1440],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl mx-auto p-4 bg-background">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onSubmitSuccess: {
      description: "Callback when form submission is successful",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// 1. Loading State Story
// ============================================================================

export const LoadingState: Story = {
  name: "1. Loading State",
  render: () => (
    <LoadingStateWrapper>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Đang tải cấu hình...</p>
        </div>
      </div>
    </LoadingStateWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading/i }),
    ).toBeInTheDocument();
    await expect(canvas.getByText(/đang tải/i)).toBeInTheDocument();
  },
};

// ============================================================================
// 2. Error State Story - No Config
// ============================================================================

export const ErrorStateNoConfig: Story = {
  name: "2. Error - No Config",
  render: () => (
    <ErrorStateWrapper>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Không thể tải cấu hình form</p>
        </div>
      </div>
    </ErrorStateWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/không thể tải cấu hình form/i),
    ).toBeInTheDocument();
  },
};

// ============================================================================
// 3. Minimal Flow Story (Amount + Period + Purpose)
// ============================================================================

export const MinimalFlow: Story = {
  name: "3. Minimal Flow",
  render: () => {
    const config = buildFormConfig(minimalFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    await expect(canvas.getByText("Thời hạn vay")).toBeInTheDocument();
    await expect(canvas.getByText("Mục đích vay")).toBeInTheDocument();
    await expect(
      canvas.getByText("Điều khoản sử dụng dịch vụ"),
    ).toBeInTheDocument();
  },
};

// ============================================================================
// 4. Standard Flow Story (More fields)
// ============================================================================

export const StandardFlow: Story = {
  name: "4. Standard Flow",
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    await expect(canvas.getByText("Thời hạn vay")).toBeInTheDocument();
    await expect(canvas.getByText("Mục đích vay")).toBeInTheDocument();
    await expect(canvas.getByText("Họ và tên")).toBeInTheDocument();
    await expect(canvas.getByText("Căn cước công dân")).toBeInTheDocument();
    await expect(canvas.getByText("Email")).toBeInTheDocument();
  },
};

// ============================================================================
// 5. Full Flow Story (All fields)
// ============================================================================

export const FullFlowAllFields: Story = {
  name: "5. Full Flow - All Fields",
  render: () => {
    const config = buildFormConfig(fullFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    await expect(canvas.getByText("Thời hạn vay")).toBeInTheDocument();
    await expect(canvas.getByText("Mục đích vay")).toBeInTheDocument();
    await expect(canvas.getByText("Họ và tên")).toBeInTheDocument();
    await expect(canvas.getByText("Căn cước công dân")).toBeInTheDocument();
    await expect(canvas.getByText("Email")).toBeInTheDocument();
    await expect(canvas.getByText("Giới tính")).toBeInTheDocument();
    await expect(canvas.getByText("Tỉnh/Thành phố")).toBeInTheDocument();
    await expect(canvas.getByText("Ngày sinh")).toBeInTheDocument();
    await expect(
      canvas.getByText("Mức thu nhập hàng tháng"),
    ).toBeInTheDocument();
  },
};

// ============================================================================
// 6. Phone Modal Story
// ============================================================================

export const PhoneModalDefault: Story = {
  name: "6. Phone Modal",
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <PhoneModalWrapper>
        <TenantThemeProvider>
          <StepWizard
            config={config}
            onComplete={(data) => console.log("Form completed:", data)}
          />
        </TenantThemeProvider>
      </PhoneModalWrapper>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: /nhập số điện thoại/i }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText(/số điện thoại/i),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Tiếp Tục")).toBeInTheDocument();
  },
};

// ============================================================================
// 7. Validation - Required Fields
// ============================================================================

export const ValidationRequiredFields: Story = {
  name: "7. Validation - Required Fields",
  render: () => {
    const config = buildFormConfig(minimalFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
    await userEvent.click(submitButton);
    await expect(
      canvas.getByText(/Vui lòng chọn mục đích vay/i),
    ).toBeInTheDocument();
  },
};

// ============================================================================
// 8. Validation - Invalid Email
// ============================================================================

export const ValidationInvalidEmail: Story = {
  name: "8. Validation - Invalid Email",
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    const emailInput = canvas.getByPlaceholderText(/nhập địa chỉ email/i);
    await userEvent.type(emailInput, "invalid-email");
    const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
    await userEvent.click(submitButton);
    await expect(canvas.getByText(/email không hợp lệ/i)).toBeInTheDocument();
  },
};

// ============================================================================
// 9. Validation - Invalid National ID
// ============================================================================

export const ValidationInvalidNationalId: Story = {
  name: "9. Validation - Invalid National ID",
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    const nationalIdInput = canvas.getByPlaceholderText(/nhập số cccd/i);
    await userEvent.type(nationalIdInput, "123");
    const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
    await userEvent.click(submitButton);
    await expect(canvas.getByText(/cccd phải có 12 số/i)).toBeInTheDocument();
  },
};

// ============================================================================
// 10. Responsive - Mobile View
// ============================================================================

export const MobileView: Story = {
  name: "10. Responsive - Mobile",
  parameters: {
    viewport: { defaultViewport: "iphone14" },
  },
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <div className="max-w-sm mx-auto">
        <TenantThemeProvider>
          <StepWizard
            config={config}
            onComplete={(data) => console.log("Form completed:", data)}
          />
        </TenantThemeProvider>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
    await expect(canvas.getByText("Thời hạn vay")).toBeInTheDocument();
  },
};

// ============================================================================
// 11. Responsive - Tablet View
// ============================================================================

export const TabletView: Story = {
  name: "11. Responsive - Tablet",
  parameters: {
    viewport: { defaultViewport: "ipadMini" },
  },
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <div className="max-w-md mx-auto">
        <TenantThemeProvider>
          <StepWizard
            config={config}
            onComplete={(data) => console.log("Form completed:", data)}
          />
        </TenantThemeProvider>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();
  },
};

// ============================================================================
// 12. Responsive - Desktop View
// ============================================================================

export const DesktopView: Story = {
  name: "12. Responsive - Desktop",
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeInTheDocument();
  },
};

// ============================================================================
// 13. Accessibility - Keyboard Navigation
// ============================================================================

export const AccessibilityKeyboardNav: Story = {
  name: "13. Accessibility - Keyboard Nav",
  render: () => {
    const config = buildFormConfig(minimalFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();

    // Test keyboard navigation
    await userEvent.tab();
    await expect(
      canvas.getByRole("slider", { name: /số tiền vay/i }),
    ).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getAllByRole("slider")[1]).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole("combobox")).toHaveFocus();

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: /bắt đầu tìm kiếm khoản vay/i }),
    ).toHaveFocus();
  },
};

// ============================================================================
// 14. Form Interaction - Purpose Select
// ============================================================================

export const FormInteractionPurposeSelect: Story = {
  name: "14. Form Interaction - Purpose Select",
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Mục đích vay")).toBeInTheDocument();

    const purposeSelect = canvas.getByRole("combobox");
    await userEvent.click(purposeSelect);
    await expect(canvas.getByText("Vay tiêu dùng")).toBeInTheDocument();
    await userEvent.selectOptions(purposeSelect, "consumer_loan");
    await expect(purposeSelect).toHaveValue("consumer_loan");
  },
};

// ============================================================================
// 15. Form Interaction - Gender Radio
// ============================================================================

export const FormInteractionGenderRadio: Story = {
  name: "15. Form Interaction - Gender Radio",
  render: () => {
    const config = buildFormConfig(fullFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Giới tính")).toBeInTheDocument();

    const maleRadio = canvas.getByLabelText("Nam");
    const femaleRadio = canvas.getByLabelText("Nữ");

    await userEvent.click(maleRadio);
    await expect(maleRadio).toBeChecked();

    await userEvent.click(femaleRadio);
    await expect(femaleRadio).toBeChecked();
    await expect(maleRadio).not.toBeChecked();
  },
};

// ============================================================================
// 16. Callback - Submit Success
// ============================================================================

export const WithSubmitSuccessCallback: Story = {
  name: "16. Callback - Submit Success",
  args: {
    onSubmitSuccess: fn(),
  },
  render: () => {
    const config = buildFormConfig(minimalFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
};

// ============================================================================
// 17. Edge Case - Long Name
// ============================================================================

export const EdgeCaseLongName: Story = {
  name: "17. Edge Case - Long Name",
  render: () => {
    const config = buildFormConfig(standardFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Họ và tên")).toBeInTheDocument();

    const nameInput = canvas.getByPlaceholderText(/nhập họ và tên/i);
    await userEvent.type(
      nameInput,
      "Nguyễn Văn A B C D E F G H I J K L M N O P Q R S T U V W X Y Z",
    );
    await expect(nameInput).toHaveValue(expect.stringContaining("Nguyễn Văn"));
  },
};

// ============================================================================
// 18. Edge Case - All Optional Fields
// ============================================================================

const optionalFlow = {
  ...standardFlow,
  steps: [
    {
      ...standardFlow.steps[0],
      fields: {
        purpose: { visible: true, required: false },
        phoneNumber: { visible: true, required: false },
        email: { visible: true, required: false },
        fullName: { visible: true, required: false },
        nationalId: { visible: true, required: false },
        secondNationalId: { visible: true, required: false },
        gender: { visible: true, required: false },
        location: { visible: true, required: false },
        birthday: { visible: true, required: false },
        incomeType: { visible: true, required: false },
        income: { visible: true, required: false },
        havingLoan: { visible: true, required: false },
        careerStatus: { visible: true, required: false },
        careerType: { visible: true, required: false },
        creditStatus: { visible: true, required: false },
      },
    },
  ],
};

export const EdgeCaseAllOptionalFields: Story = {
  name: "18. Edge Case - All Optional Fields",
  render: () => {
    const config = buildFormConfig(optionalFlow);
    return (
      <TenantThemeProvider>
        <StepWizard
          config={config}
          onComplete={(data) => console.log("Form completed:", data)}
        />
      </TenantThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Số tiền vay")).toBeInTheDocument();

    // All fields should be present but not required
    const agreeRadio = canvas.getByLabelText(/tôi đồng ý/i);
    await userEvent.click(agreeRadio);

    const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
    await userEvent.click(submitButton);

    // Should show phone modal (since form is valid with optional fields)
    await expect(
      canvas.getByRole("heading", { name: /nhập số điện thoại/i }),
    ).toBeInTheDocument();
  },
};
