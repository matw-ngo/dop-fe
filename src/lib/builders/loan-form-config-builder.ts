/**
 * Loan Form Config Builder
 *
 * Builds DynamicFormConfig dynamically based on API flow response.
 * Uses existing ApplyLoanForm components via FieldType.CUSTOM
 */

import type {
  DynamicFormConfig,
  FormField,
} from "@/components/form-generation";
import {
  allowCustomComponent,
  FieldType,
  registerComponent,
  ValidationRuleType,
} from "@/components/form-generation";
import {
  AmountFieldWrapper,
  PeriodFieldWrapper,
  PurposeFieldWrapper,
  TermsAgreementWrapper,
} from "@/components/loan-application/wrappers";
import type { ISelectBoxOption } from "@/components/ui/select-group";
import type { MappedStep } from "@/mappers/flowMapper";

// Register wrapper components for use in dynamic form config
try {
  allowCustomComponent("AmountField");
  registerComponent("AmountField", AmountFieldWrapper);

  allowCustomComponent("PeriodField");
  registerComponent("PeriodField", PeriodFieldWrapper);

  allowCustomComponent("PurposeField");
  registerComponent("PurposeField", PurposeFieldWrapper);

  allowCustomComponent("TermsAgreement");
  registerComponent("TermsAgreement", TermsAgreementWrapper);
} catch {
  // Ignore registration errors (e.g., in strict mode or hot reload)
}

/**
 * Builds a DynamicFormConfig for the loan application form
 * based on the API step configuration (step with page === "/" or "/index")
 */
export function buildLoanFormConfigFromStep(
  step: MappedStep,
  loanPurposes: ISelectBoxOption[],
): DynamicFormConfig {
  const fields: FormField[] = [];

  // 1. Amount field (maps to purpose in API)
  if (step.fields.purpose.visible) {
    fields.push({
      id: "expected_amount",
      name: "expected_amount",
      type: FieldType.CUSTOM,
      options: {
        componentName: "AmountField",
        min: 5,
        max: 90,
        step: 5,
      },
      validation: step.fields.purpose.required
        ? [{ type: ValidationRuleType.REQUIRED }]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 2. Period field (maps to purpose in API)
  if (step.fields.purpose.visible) {
    fields.push({
      id: "loan_period",
      name: "loan_period",
      type: FieldType.CUSTOM,
      options: {
        componentName: "PeriodField",
        min: 3,
        max: 36,
        step: 1,
      },
      validation: step.fields.purpose.required
        ? [{ type: ValidationRuleType.REQUIRED }]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 3. Purpose field
  if (step.fields.purpose.visible) {
    fields.push({
      id: "loan_purpose",
      name: "loan_purpose",
      type: FieldType.CUSTOM,
      options: {
        componentName: "PurposeField",
        options: loanPurposes,
      },
      validation: step.fields.purpose.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 4. Full Name field
  if (step.fields.fullName.visible) {
    fields.push({
      id: "fullName",
      name: "fullName",
      type: FieldType.TEXT,
      validation: step.fields.fullName.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
            },
            {
              type: ValidationRuleType.MIN_LENGTH,
              value: 2,
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 5. National ID field
  if (step.fields.nationalId.visible) {
    fields.push({
      id: "nationalId",
      name: "nationalId",
      type: FieldType.TEXT,
      validation: step.fields.nationalId.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
            },
            {
              type: ValidationRuleType.PATTERN,
              value: "^[0-9]{12}$",
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 6. Email field
  if (step.fields.email.visible) {
    fields.push({
      id: "email",
      name: "email",
      type: FieldType.EMAIL,
      validation: step.fields.email.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
            },
            { type: ValidationRuleType.EMAIL },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 7. Location field
  if (step.fields.location.visible) {
    fields.push({
      id: "location",
      name: "location",
      type: FieldType.SELECT,
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
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 8. Birthday field
  if (step.fields.birthday.visible) {
    fields.push({
      id: "birthday",
      name: "birthday",
      type: FieldType.DATE,
      validation: step.fields.birthday.required
        ? [
            {
              type: ValidationRuleType.REQUIRED,
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 9. Gender field
  if (step.fields.gender.visible) {
    fields.push({
      id: "gender",
      name: "gender",
      type: FieldType.RADIO,
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
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 10. Income field
  if (step.fields.income.visible) {
    fields.push({
      id: "income",
      name: "income",
      type: FieldType.SELECT,
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
            },
          ]
        : [],
      i18n: {
        enabled: true,
      },
    });
  }

  // 11. Terms Agreement field (always required)
  fields.push({
    id: "agreeStatus",
    name: "agreeStatus",
    type: FieldType.CUSTOM,
    options: {
      componentName: "TermsAgreement",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
      },
    ],
    i18n: {
      enabled: true,
    },
  });

  return {
    id: "loan-application",
    i18n: {
      namespace: "loan-application",
    },
    steps: [
      {
        id: step.id,
        // title: "Thông tin đăng ký vay",
        fields,
      },
    ],
    navigation: {
      showProgress: false,
      progressType: "bar" as const,
      showStepNumbers: false,
      showStepTitles: true,
      showStepHeader: true,
      showBackButtonOnFirstStep: false,
      fullWidthButtons: true,
    },
  };
}
