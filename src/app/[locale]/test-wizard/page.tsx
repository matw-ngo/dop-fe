"use client";

import {
  ConditionOperator,
  FieldType,
  StepWizard,
  ValidationRuleType,
  registerComponent,
  allowCustomComponent,
} from "@/components/form-generation";
import { legacyLoanTheme, FormThemeProvider } from "@/components/form-generation/themes";
import type { DynamicFormConfig, FieldComponentProps } from "@/components/form-generation";
import { useState } from "react";

// Define the custom component
const SectionHeader = ({ field }: FieldComponentProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-6 w-1 bg-[#017848] rounded-full"></div> {/* Green accent from theme */}
      <h3 className="text-xl font-bold text-[#003e2c]">{field.label}</h3>
    </div>
  );
};

// Register and allow the component
try {
  allowCustomComponent("SectionHeader");
  registerComponent("SectionHeader", SectionHeader);
} catch (e) {
  // Ignore registration errors in strict mode / hot reload
}

export default function WizardTestPage() {
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    any
  > | null>(null);

  const wizardConfig: DynamicFormConfig = {
    id: "loan-wizard",
    // theme: legacyLoanTheme, // Removed invalid prop
    steps: [
      {
        id: "loan-info",
        title: "Thông tin vay",
        fields: [
          {
            id: "personal-section-header",
            name: "personalSectionHeader",
            type: FieldType.CUSTOM,
            label: "Thông tin cá nhân",
            options: {
              componentName: "SectionHeader", // Assuming a custom component or just use a label
            },
            i18n: {
              enabled: false
            },
            layout: {
              // We might need to adjust this if there isn't a dedicated header type,
              // but for now let's stick to standard fields or just let the title handle it.
              // Actually, looking at the image, "Thông tin cá nhân" looks like a section header.
              // I'll skip a specific header field for now and rely on standard fields,
              // or maybe just use 'Group' if supported, but flat list is safer.
              // Let's just put fields directly.
              hidden: { xs: true, sm: true, md: true, lg: true, xl: true } // Hide this dummy field, effectively.
            },
            // better to just not include it if not needed, but let's stick to the main fields.
          },
          // To strictly follow the image "Thông tin cá nhân" with icon:
          // The library might support sections within steps.
          // Looking at `examples.tsx`, `sections` are top level, but steps can HAVE fields.
          // `FormStep` has `fields`.
          // Let's just implement the fields.
          {
            id: "fullName",
            name: "fullName",
            type: FieldType.TEXT,
            label: "Họ và tên",
            placeholder: "Họ và tên",
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Họ tên không hợp lệ",
              },
            ],
            i18n: {
              enabled: false
            },
          },
          {
            id: "idCard",
            name: "idCard",
            type: FieldType.TEXT,
            label: "Căn cước công dân 12 Số",
            placeholder: "Căn cước công dân 12 Số",
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng nhập số CCCD",
              },
              {
                type: ValidationRuleType.PATTERN,
                value: "^[0-9]{12}$",
                message: "CCCD phải có 12 số",
              },
            ],
            i18n: {
              enabled: false
            },
          },
          {
            id: "city",
            name: "city",
            type: FieldType.SELECT,
            label: "Tỉnh thành",
            placeholder: "Vui lòng chọn",
            options: {
              choices: [
                { label: "Hà Nội", value: "hanoi" },
                { label: "TP. Hồ Chí Minh", value: "hcm" },
                { label: "Đà Nẵng", value: "danang" },
                // Add more as necessary
              ],
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng chọn tỉnh thành",
              },
            ],
            i18n: {
              enabled: false
            },
          },
          {
            id: "vehicleOwnership",
            name: "vehicleOwnership",
            type: FieldType.SELECT,
            label: "Sở hữu Đăng ký/ Cà vẹt xe chính chủ",
            placeholder: "Vui lòng chọn",
            options: {
              choices: [
                { label: "Có", value: "yes" },
                { label: "Không", value: "no" },
              ],
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
              },
            ],
            i18n: {
              enabled: false
            },
          },
        ],
      },
      {
        id: "income-info",
        title: "Thông tin thu nhập",
        fields: [
          {
            id: "jobStatus",
            name: "jobStatus",
            type: FieldType.SELECT,
            label: "Tình trạng việc làm",
            placeholder: "Vui lòng chọn",
            options: {
              choices: [
                { label: "Đi làm hưởng lương", value: "salaried" },
                { label: "Kinh doanh/Lao động tự do", value: "self_employed" },
                { label: "Không có việc làm", value: "unemployed" },
              ],
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
              },
            ],
            i18n: {
              enabled: false
            },
          },
          // Conditional fields for "Đi làm hưởng lương"
          {
            id: "companyName",
            name: "companyName",
            type: FieldType.TEXT,
            label: "Tên công ty",
            placeholder: "Tên công ty",
            dependencies: [
              {
                conditions: [
                  {
                    fieldId: "jobStatus",
                    operator: ConditionOperator.EQUALS,
                    value: "salaried",
                  },
                ],
                action: "show",
              },
            ],
            validation: [{ type: ValidationRuleType.REQUIRED }],
            i18n: {
              enabled: false
            },
          },
          {
            id: "position",
            name: "position",
            type: FieldType.TEXT,
            label: "Chức vụ",
            placeholder: "Chức vụ",
            dependencies: [
              {
                conditions: [
                  {
                    fieldId: "jobStatus",
                    operator: ConditionOperator.EQUALS,
                    value: "salaried",
                  },
                ],
                action: "show",
              },
            ],
            validation: [{ type: ValidationRuleType.REQUIRED }],
            i18n: {
              enabled: false
            },
          },
          // Conditional field for "Kinh doanh/Lao động tự do"
          {
            id: "businessType",
            name: "businessType",
            type: FieldType.TEXT,
            label: "Lĩnh vực làm việc",
            placeholder: "Lĩnh vực làm việc",
            dependencies: [
              {
                conditions: [
                  {
                    fieldId: "jobStatus",
                    operator: ConditionOperator.EQUALS,
                    value: "self_employed",
                  },
                ],
                action: "show",
              },
            ],
            validation: [{ type: ValidationRuleType.REQUIRED }],
            i18n: {
              enabled: false
            },
          },
          // Conditional income field shared by salaried and self-employed
          {
            id: "monthlyIncome",
            name: "monthlyIncome",
            type: FieldType.SELECT, // Changed to Select based on image "Vui lòng chọn"
            label: "Mức thu nhập",
            placeholder: "Vui lòng chọn",
            options: {
              choices: [
                { label: "Dưới 5 triệu", value: "<5m" },
                { label: "5 - 10 triệu", value: "5-10m" },
                { label: "10 - 20 triệu", value: "10-20m" },
                { label: "Trên 20 triệu", value: ">20m" },
              ]
            },
            dependencies: [
              {
                conditions: [
                  {
                    fieldId: "jobStatus",
                    operator: ConditionOperator.IN,
                    value: ["salaried", "self_employed"],
                  },
                ],
                action: "show",
              },
            ],
            validation: [{ type: ValidationRuleType.REQUIRED }],
            i18n: {
              enabled: false
            },
          },
        ],
      },
      {
        id: "financial-info",
        title: "Thông tin tài chính",
        fields: [
          {
            id: "existingLoans",
            name: "existingLoans",
            type: FieldType.SELECT,
            label:
              "Hiện tại, Bạn đang có khoản vay tổ chức tài chính/ngân hàng không?",
            placeholder: "Vui lòng chọn",
            options: {
              choices: [
                { label: "Không", value: "none" },
                { label: "1 khoản vay", value: "1" },
                { label: "2 khoản vay", value: "2" },
                { label: "3 khoản vay", value: "3" },
                { label: "Trên 3 khoản vay", value: ">3" },
              ],
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
              },
            ],
            i18n: {
              enabled: false
            },
          },
          {
            id: "creditHistory",
            name: "creditHistory",
            type: FieldType.SELECT,
            label: "Lịch sử tín dụng của bạn trong 3 năm gần đây?",
            placeholder: "Vui lòng chọn",
            options: {
              choices: [
                { label: "Không có nợ xấu", value: "none" },
                {
                  label: "Đang có nợ xấu hoặc nợ chậm trả nhóm 2",
                  value: "group2",
                },
                { label: "Nợ xấu nhóm 3 trở lên", value: "group3+" },
              ],
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
              },
            ],
            i18n: {
              enabled: false
            },
          },
        ],
      },
    ],
    navigation: {
      showProgress: true,
      progressType: "bar",
      showStepNumbers: true,
      showStepTitles: true,
    },
  };

  const handleComplete = (data: Record<string, any>) => {
    console.log("Wizard completed:", data);
    setSubmittedData(data);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Multi-Step Wizard Test</h1>
          <p className="text-muted-foreground">
            Testing P5.1 Foundation - StepWizard with Legacy Loan Theme
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <FormThemeProvider theme={legacyLoanTheme}>
            <StepWizard config={wizardConfig} onComplete={handleComplete} />
          </FormThemeProvider>
        </div>

        {submittedData && (
          <div className="rounded-lg border bg-muted p-6">
            <h3 className="font-semibold mb-4">✅ Wizard Completed!</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
