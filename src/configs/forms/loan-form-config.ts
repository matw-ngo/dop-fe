/**
 * Loan Application Form Configuration
 *
 * This configuration defines the multi-step loan information form using the
 * DynamicFormConfig system from the form-generation library.
 *
 * Structure:
 * - Step 1: Personal Information (loan-info)
 * - Step 2: Income Information (income-info) with conditional logic based on job status
 * - Step 3: Financial Information (financial-info)
 *
 * Usage:
 * ```typescript
 * import { loanFormWizardConfig } from "@/configs/forms/loan-form-config";
 * import { FormThemeProvider, legacyLoanTheme } from "@/components/form-generation/themes";
 * import { StepWizard } from "@/components/form-generation";
 *
 * <FormThemeProvider theme={legacyLoanTheme}>
 *   <StepWizard config={loanFormWizardConfig} onComplete={handleComplete} />
 * </FormThemeProvider>
 * ```
 */

import type { DynamicFormConfig } from "@/components/form-generation";
import {
  allowCustomComponent,
  ConditionOperator,
  FieldType,
  registerComponent,
  ValidationRuleType,
} from "@/components/form-generation";
import { SectionHeader } from "./SectionHeader";

// Register the SectionHeader component
try {
  allowCustomComponent("SectionHeader");
  registerComponent("SectionHeader", SectionHeader);
} catch {
  // Ignore registration errors in strict mode / hot reload
}

/**
 * Loan Application Form Wizard Configuration
 *
 * @remarks
 * The form uses the legacyLoanTheme for styling which provides:
 * - Primary color: #017848 (green)
 * - Dark green accent: #003e2c
 *
 * @see legacyLoanTheme in @/components/form-generation/themes
 */
export const loanFormWizardConfig: DynamicFormConfig = {
  id: "loan-wizard",
  steps: [
    /**
     * Step 1: Personal Information
     *
     * Collects basic personal information:
     * - Full name
     * - National ID (CCCD) - 12 digits
     * - City/Province selection
     * - Vehicle ownership status
     */
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
            componentName: "SectionHeader",
          },
          i18n: {
            enabled: false,
          },
          layout: {
            hidden: { xs: true, sm: true, md: true, lg: true, xl: true },
          },
        },
        {
          id: "fullName",
          name: "fullName",
          type: FieldType.TEXT,
          label: "Họ và tên",
          placeholder: "Họ và tên",
          validation: [
            {
              type: ValidationRuleType.REQUIRED,
            },
            {
              type: ValidationRuleType.MIN_LENGTH,
              value: 2,
            },
          ],
          i18n: {
            enabled: false,
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
            },
            {
              type: ValidationRuleType.PATTERN,
              value: "^[0-9]{12}$",
              message: "pages.form.errors.pattern",
            },
          ],
          i18n: {
            enabled: false,
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
            ],
          },
          validation: [
            {
              type: ValidationRuleType.REQUIRED,
            },
          ],
          i18n: {
            enabled: false,
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
            enabled: false,
          },
        },
      ],
    },
    /**
     * Step 2: Income Information
     *
     * Collects employment and income information with conditional logic:
     * - If jobStatus == "salaried": Show companyName, position
     * - If jobStatus == "self_employed": Show businessType
     * - If jobStatus in ["salaried", "self_employed"]: Show monthlyIncome
     *
     * If jobStatus == "unemployed": Only show jobStatus field (no income step shown)
     */
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
            enabled: false,
          },
        },
        /**
         * Conditional field for "Đi làm hưởng lương"
         * Shows only when jobStatus equals "salaried"
         */
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
            enabled: false,
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
            enabled: false,
          },
        },
        /**
         * Conditional field for "Kinh doanh/Lao động tự do"
         * Shows only when jobStatus equals "self_employed"
         */
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
            enabled: false,
          },
        },
        /**
         * Conditional income field
         * Shows for both "salaried" and "self_employed" job statuses
         */
        {
          id: "monthlyIncome",
          name: "monthlyIncome",
          type: FieldType.SELECT,
          label: "Mức thu nhập",
          placeholder: "Vui lòng chọn",
          options: {
            choices: [
              { label: "Dưới 5 triệu", value: "<5m" },
              { label: "5 - 10 triệu", value: "5-10m" },
              { label: "10 - 20 triệu", value: "10-20m" },
              { label: "Trên 20 triệu", value: ">20m" },
            ],
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
            enabled: false,
          },
        },
      ],
    },
    /**
     * Step 3: Financial Information
     *
     * Collects financial background information:
     * - Existing loan count
     * - Credit history for the past 3 years
     */
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
            enabled: false,
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
            enabled: false,
          },
        },
      ],
    },
  ],
  navigation: {
    showProgress: false,
    progressType: "bar",
    showStepNumbers: false,
    showStepTitles: false,
    showStepHeader: false,
    showBackButtonOnFirstStep: false,
    fullWidthButtons: true,
  },
};
