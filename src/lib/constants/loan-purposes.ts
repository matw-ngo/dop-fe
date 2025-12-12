import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * Vietnamese loan purposes with their corresponding codes
 */
export const LOAN_PURPOSES: ISelectBoxOption[] = [
  {
    label: "Vay mua đồ công nghệ",
    value: "cd_loan",
  },
  {
    label: "Vay tiêu dùng hàng ngày",
    value: "consumer_loan",
  },
  {
    label: "Vay học tập/học phí",
    value: "student_loan",
  },
  {
    label: "Vay du lịch",
    value: "travel_loan",
  },
  {
    label: "Vay sửa chữa nhà cửa",
    value: "improvement_loan",
  },
  {
    label: "Vay mua xe",
    value: "motor_loan",
  },
  {
    label: "Vay làm đẹp và chăm sóc sức khỏe",
    value: "healthcare_loan",
  },
  {
    label: "Mục đích khác",
    value: "other_loan",
  },
];

/**
 * Loan purpose descriptions for display purposes
 */
export const LOAN_PURPOSE_DESCRIPTIONS: Record<string, string> = {
  cd_loan: "Mua sắm thiết bị điện tử, công nghệ",
  consumer_loan: "Chi tiêu sinh hoạt, mua sắm hàng ngày",
  student_loan: "Học phí, khóa học, đào tạo",
  travel_loan: "Du lịch trong và ngoài nước",
  improvement_loan: "Sửa chữa, nâng cấp nhà cửa",
  motor_loan: "Mua xe máy, ô tô",
  healthcare_loan: "Chăm sóc sức khỏe, làm đẹp",
  other_loan: "Các mục đích khác",
};

/**
 * Get loan purpose label by value
 */
export const getLoanPurposeLabel = (value: string): string => {
  const purpose = LOAN_PURPOSES.find((p) => p.value === value);
  return purpose?.label || "Mục đích khác";
};

/**
 * Get loan purpose description by value
 */
export const getLoanPurposeDescription = (value: string): string => {
  return LOAN_PURPOSE_DESCRIPTIONS[value] || "Mục đích vay vốn";
};
