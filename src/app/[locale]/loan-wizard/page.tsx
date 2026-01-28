"use client";

import { useState } from "react";
import {
  ConditionOperator,
  type DynamicFormConfig,
  FieldType,
  FormThemeProvider,
  legacyLoanTheme,
  StepWizard,
  ValidationRuleType,
} from "@/components/form-generation";
import { allowCustomComponent } from "@/components/form-generation/constants";
import { registerComponent } from "@/components/form-generation/registry/ComponentRegistry";
import { LibTrackingAdapter } from "@/components/form-generation/tracking/adapters/LibTrackingAdapter";
import { LoanStepHeader } from "./components/LoanStepHeader";
import {
  CREDIT_HISTORY,
  CREDIT_STATUSES,
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_TYPE,
  FULL_NAME_REGEX,
  INCOME_AMOUNT,
  VEHICLE_REGISTRATION_OPTIONS,
  VN_PROVINCES,
} from "./constants";
import { validateNationalId } from "./utils";

// Register custom component
allowCustomComponent("LoanStepHeader");
registerComponent("LoanStepHeader", LoanStepHeader);

const _trackingBackend = new LibTrackingAdapter();

export default function LoanWizardPage() {
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const wizardConfig: DynamicFormConfig = {
    id: "loan-application-wizard",
    steps: [
      {
        id: "personal",
        title: "Personal Information",
        description: "Thông tin cá nhân",
        fields: [
          {
            id: "personal_header",
            name: "personal_header",
            type: FieldType.CUSTOM,
            options: {
              componentName: "LoanStepHeader",
              title: "Thông tin cá nhân",
              icon: "user",
            },
            i18n: {
              enabled: false,
            },
          },
          {
            id: "full_name",
            name: "full_name",
            type: FieldType.TEXT,
            label: "Họ và tên",
            placeholder: "Họ và tên",
            tracking: {
              trackInput: {
                eventName: "lending_page_input_name",
                debounce: 500,
              },
              trackValidation: {
                eventName: "lending_page_input_name_valid",
              },
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng nhập họ tên",
              },
              {
                type: ValidationRuleType.PATTERN,
                value: FULL_NAME_REGEX,
                message: "Họ và tên chỉ gồm ký tự chữ cái",
              },
            ],
          },
          {
            id: "national_id",
            name: "national_id",
            type: FieldType.TEXT,
            label: "Căn cước công dân 12 Số",
            placeholder: "Căn cước công dân 12 Số",
            tracking: {
              trackInput: {
                eventName: "lending_page_input_nid",
                debounce: 500,
              },
              trackValidation: {
                eventName: "lending_page_input_nid_valid",
              },
            },
            validation: [
              {
                type: ValidationRuleType.CUSTOM,
                validator: (value: unknown) => {
                  const result = validateNationalId(String(value || ""));
                  return result === true;
                },
                message:
                  "Số CCCD không hợp lệ (kiểm tra format, năm sinh, tỉnh thành)",
              },
            ],
          },
          {
            id: "province",
            name: "province",
            type: FieldType.SELECT,
            label: "Tỉnh thành",
            options: {
              choices: VN_PROVINCES,
              placeholder: "Chọn tỉnh thành",
              searchable: true,
            },
            tracking: {
              trackSelection: {
                eventName: "lending_page_select_province",
              },
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng chọn tỉnh thành hiện tại",
              },
            ],
          },
          {
            id: "extra_docs",
            name: "extra_docs",
            type: FieldType.SELECT,
            label: "Sở hữu Đăng ký/ Cà vẹt xe chính chủ",
            options: {
              choices: VEHICLE_REGISTRATION_OPTIONS,
            },
          },
        ],
      },
      {
        id: "income",
        title: "Income Information",
        description: "Thông tin thu nhập",
        fields: [
          {
            id: "income_header",
            name: "income_header",
            type: FieldType.CUSTOM,
            options: {
              componentName: "LoanStepHeader",
              title: "Thông tin thu nhập",
              icon: "income",
            },
            i18n: {
              enabled: false,
            },
          },
          {
            id: "career_status",
            name: "career_status",
            type: FieldType.SELECT,
            label: "Tình trạng việc làm",
            options: {
              choices: EMPLOYMENT_STATUSES,
            },
            tracking: {
              trackSelection: {
                eventName: "lending_page_select_job",
              },
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng chọn tình trạng việc làm",
              },
            ],
          },
          {
            id: "career_type",
            name: "career_type",
            type: FieldType.SELECT,
            label: "Lĩnh vực làm việc",
            options: {
              choices: EMPLOYMENT_TYPE,
            },
            tracking: {
              trackSelection: {
                eventName: "lending_page_select_industry",
              },
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng chọn lĩnh vực nghề nghiệp",
              },
            ],
            dependencies: [
              {
                action: "show",
                conditions: [
                  {
                    fieldId: "career_status",
                    operator: ConditionOperator.EQUALS,
                    value: "employed",
                  },
                ],
              },
            ],
          },
          {
            id: "income",
            name: "income",
            type: FieldType.SELECT,
            label: "Mức thu nhập",
            options: {
              choices: INCOME_AMOUNT,
            },
            tracking: {
              trackSelection: {
                eventName: "lending_page_select_income_range",
              },
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng chọn khoản thu nhập",
              },
            ],
            dependencies: [
              {
                action: "show",
                conditions: [
                  {
                    fieldId: "career_status",
                    operator: ConditionOperator.IN,
                    value: ["employed", "self_employed"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "finance",
        title: "Finance Information",
        description: "Thông tin tài chính",
        fields: [
          {
            id: "finance_header",
            name: "finance_header",
            type: FieldType.CUSTOM,
            options: {
              componentName: "LoanStepHeader",
              title: "Thông tin tài chính",
              icon: "income",
            },
            i18n: {
              enabled: false,
            },
          },
          {
            id: "having_loan",
            name: "having_loan",
            type: FieldType.SELECT,
            label:
              "Hiện tại, Bạn đang có khoản vay tổ chức tài chính/ngân hàng không?",
            options: {
              choices: CREDIT_STATUSES,
            },
            tracking: {
              trackSelection: {
                eventName: "lending_page_select_current_loan",
              },
            },
          },
          {
            id: "credit_status",
            name: "credit_status",
            type: FieldType.SELECT,
            label: "Lịch sử tín dụng của bạn trong 3 năm gần đây?",
            options: {
              choices: CREDIT_HISTORY,
            },
            tracking: {
              trackSelection: {
                eventName: "lending_page_select_credit_history",
              },
            },
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Vui lòng chọn lịch sử tín dụng",
              },
            ],
          },
        ],
      },
    ],
    navigation: {
      showProgress: false,
      progressType: "bar",
      showStepNumbers: false,
      showStepTitles: false,
    },
  };

  const handleComplete = (data: Record<string, unknown>) => {
    console.log("Loan Wizard Completed:", data);
    setSubmittedData(data);
  };

  return (
    <FormThemeProvider theme={legacyLoanTheme}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <StepWizard
              config={wizardConfig}
              onComplete={handleComplete}
              className="max-w-[570px] mx-auto"
            />
          </div>

          {submittedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 font-semibold mb-2">
                Đăng ký thành công!
              </h3>
              <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </FormThemeProvider>
  );
}
