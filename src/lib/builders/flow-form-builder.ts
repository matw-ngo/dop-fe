import type {
  DynamicFormConfig,
  FormField,
} from "@/components/form-generation";
import {
  ConditionOperator,
  FieldType,
  ValidationRuleType,
} from "@/components/form-generation";
import type { MappedFlow, MappedStep } from "@/mappers/flowMapper";

/**
 * Mapping of API field keys to Form Generation field definitions
 * This defines the default configuration (label, type, validation) for each field
 */
const FIELD_DEFINITIONS: Record<string, Partial<FormField>> = {
  purpose: {
    type: FieldType.TEXT,
    label: "Mục đích vay",
    placeholder: "Nhập mục đích vay",
  },
  phoneNumber: {
    type: FieldType.TEXT,
    label: "Số điện thoại",
    placeholder: "Nhập số điện thoại",
    validation: [
      {
        type: ValidationRuleType.PATTERN,
        value: "^(0[3|5|7|8|9])+([0-9]{8})$",
        message: "Số điện thoại không hợp lệ",
      },
    ],
  },
  email: {
    type: FieldType.TEXT,
    label: "Email",
    placeholder: "Nhập địa chỉ email",
    validation: [
      {
        type: ValidationRuleType.EMAIL,
        message: "Email không hợp lệ",
      },
    ],
  },
  fullName: {
    type: FieldType.TEXT,
    label: "Họ và tên",
    placeholder: "Nhập họ và tên",
    validation: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        message: "Họ tên phải có ít nhất 2 ký tự",
      },
    ],
  },
  nationalId: {
    type: FieldType.TEXT,
    label: "Căn cước công dân",
    placeholder: "Nhập số CCCD (12 số)",
    validation: [
      {
        type: ValidationRuleType.PATTERN,
        value: "^[0-9]{12}$",
        message: "CCCD phải có 12 số",
      },
    ],
  },
  secondNationalId: {
    type: FieldType.TEXT,
    label: "CMND/CCCD cũ (nếu có)",
    placeholder: "Nhập số CMND/CCCD cũ",
  },
  gender: {
    type: FieldType.SELECT,
    label: "Giới tính",
    placeholder: "Chọn giới tính",
    options: {
      choices: [
        { label: "Nam", value: "male" },
        { label: "Nữ", value: "female" },
      ],
    },
  },
  location: {
    type: FieldType.SELECT,
    label: "Tỉnh/Thành phố",
    placeholder: "Chọn tỉnh/thành phố",
    options: {
      choices: [
        { label: "Hà Nội", value: "hanoi" },
        { label: "TP. Hồ Chí Minh", value: "hcm" },
        { label: "Đà Nẵng", value: "danang" },
        // TODO: This should ideally come from a separate API or constant
      ],
    },
  },
  birthday: {
    type: FieldType.DATE,
    label: "Ngày sinh",
    placeholder: "Chọn ngày sinh",
  },
  incomeType: {
    type: FieldType.SELECT,
    label: "Nguồn thu nhập",
    placeholder: "Chọn nguồn thu nhập",
    options: {
      choices: [
        { label: "Lương chuyển khoản", value: "salary_transfer" },
        { label: "Lương tiền mặt", value: "salary_cash" },
        { label: "Kinh doanh tự do", value: "business" },
      ],
    },
  },
  income: {
    type: FieldType.SELECT,
    label: "Thu nhập hàng tháng",
    placeholder: "Chọn mức thu nhập",
    options: {
      choices: [
        { label: "Dưới 5 triệu", value: "<5m" },
        { label: "5 - 10 triệu", value: "5-10m" },
        { label: "10 - 20 triệu", value: "10-20m" },
        { label: "Trên 20 triệu", value: ">20m" },
      ],
    },
  },
  havingLoan: {
    type: FieldType.SELECT,
    label: "Khoản vay hiện tại",
    placeholder: "Chọn số lượng khoản vay",
    options: {
      choices: [
        { label: "Không có", value: "none" },
        { label: "1 khoản", value: "1" },
        { label: "2 khoản", value: "2" },
        { label: "Trên 2 khoản", value: ">2" },
      ],
    },
  },
  careerStatus: {
    type: FieldType.SELECT,
    label: "Tình trạng việc làm",
    placeholder: "Chọn tình trạng",
    options: {
      choices: [
        { label: "Đang đi làm", value: "employed" },
        { label: "Tự kinh doanh", value: "self_employed" },
        { label: "Thất nghiệp", value: "unemployed" },
      ],
    },
  },
  careerType: {
    type: FieldType.TEXT,
    label: "Nghề nghiệp",
    placeholder: "Nhập nghề nghiệp",
  },
  creditStatus: {
    type: FieldType.SELECT,
    label: "Lịch sử tín dụng",
    placeholder: "Chọn lịch sử tín dụng",
    options: {
      choices: [
        { label: "Không có nợ xấu", value: "none" },
        { label: "Có nợ xấu nhóm 2", value: "group2" },
        { label: "Nợ xấu nhóm 3+", value: "group3+" },
      ],
    },
  },
};

/**
 * Builds a DynamicFormConfig from the MappedFlow data
 */
export function buildFormConfigFromFlow(flow: MappedFlow): DynamicFormConfig {
  return {
    id: `flow-${flow.id}`,
    steps: flow.steps.map((step, index) => buildStepConfig(step, index)),
    navigation: {
      showProgress: true,
      progressType: "bar",
      fullWidthButtons: true,
    },
  };
}

/**
 * Maps a single MappedStep to a FormStep
 */
function buildStepConfig(step: MappedStep, index: number) {
  const fields: FormField[] = [];

  // 1. Handle Phone Verification (OTP)
  if (step.sendOtp) {
    fields.push({
      id: `otp-verification-${step.id}`,
      name: "phoneVerification",
      type: FieldType.CUSTOM,
      label: "Xác thực số điện thoại",
      options: {
        componentName: "PhoneVerification", // We will register this component
      },
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Vui lòng xác thực số điện thoại",
        },
      ],
    });
  }

  // 2. Map standard fields
  Object.entries(step.fields).forEach(([key, config]) => {
    // Skip if not visible
    if (!config.visible) return;

    // Get default definition
    const definition = FIELD_DEFINITIONS[key];
    if (!definition) {
      console.warn(`No definition found for field: ${key}`);
      return;
    }

    // Build the field config
    const fieldConfig: FormField = {
      id: `${key}-${step.id}`, // Ensure unique ID per step
      name: key,
      type: definition.type || FieldType.TEXT,
      label: definition.label || key,
      placeholder: definition.placeholder,
      options: definition.options,
      validation: [...(definition.validation || [])],
      ...definition, // Spread any other props
    };

    // Add required validation if needed
    if (config.required) {
      // Check if required rule already exists
      const hasRequired = fieldConfig.validation?.some(
        (v) => v.type === ValidationRuleType.REQUIRED,
      );

      if (!hasRequired) {
        fieldConfig.validation = [
          ...(fieldConfig.validation || []),
          {
            type: ValidationRuleType.REQUIRED,
            message: `${fieldConfig.label} là bắt buộc`,
          },
        ];
      }
    }

    fields.push(fieldConfig);
  });

  return {
    id: step.id,
    title: `Bước ${index + 1}`,
    fields,
  };
}
