import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { type ISelectBoxOption, SelectGroup } from "./index";

const meta: Meta<typeof SelectGroup> = {
  title: "UI/SelectGroup/Legacy",
  component: SelectGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label for the select group",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when no value is selected",
      defaultValue: "Vui lòng chọn",
    },
    value: {
      control: "text",
      description: "Current selected value",
    },
    theme: {
      control: "select",
      options: ["light", "dark"],
      description: "Theme for the select group",
      defaultValue: "light",
    },
    options: {
      control: "object",
      description: "Array of options to display",
    },
    onChange: {
      action: "changed",
      description: "Callback when value changes",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleOptions: ISelectBoxOption[] = [
  { label: "Vay mua đồ công nghệ", value: "tech_loan" },
  { label: "Vay tiêu dùng hàng ngày", value: "consumer_loan" },
  { label: "Vay học tập/học phí", value: "student_loan" },
  { label: "Vay du lịch", value: "travel_loan" },
  { label: "Vay sửa chữa nhà cửa", value: "home_loan" },
  { label: "Vay mua xe", value: "vehicle_loan" },
  { label: "Vay làm đẹp và chăm sóc sức khỏe", value: "health_loan" },
  { label: "Mục đích khác", value: "other_loan" },
];

const optionsWithIcons: ISelectBoxOption[] = [
  { label: "🏠 Nhà cửa", value: "home" },
  { label: "🚗 Xe cộ", value: "vehicle" },
  { label: "💻 Công nghệ", value: "tech" },
  { label: "✈️ Du lịch", value: "travel" },
  { label: "📚 Học tập", value: "education" },
];

// Basic story
export const Default: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    placeholder: "- Chọn -",
  },
};

// With pre-selected value
export const WithValue: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    value: "consumer_loan",
    placeholder: "- Chọn -",
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    theme: "dark",
    placeholder: "- Chọn -",
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

// With help component
export const WithHelpComponent: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    placeholder: "- Chọn -",
    helpComponent: (
      <span className="text-xs text-gray-500 cursor-help">ℹ️ Xem hướng dẫn</span>
    ),
  },
};

// With icons in options
export const WithIcons: Story = {
  args: {
    label: "Danh mục",
    options: optionsWithIcons,
    placeholder: "- Chọn danh mục -",
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    placeholder: "- Chọn -",
    className: "max-w-sm",
  },
};

// Large list
export const LargeList: Story = {
  args: {
    label: "Thành phố",
    options: Array.from({ length: 50 }, (_, i) => ({
      label: `Thành phố ${i + 1}`,
      value: `city_${i + 1}`,
    })),
    placeholder: "- Chọn thành phố -",
  },
};

// Disabled state (simulated through props)
export const Disabled: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    placeholder: "- Chọn -",
    value: "disabled_value",
    className: "opacity-50 cursor-not-allowed",
  },
  decorators: [
    (Story) => (
      <div className="space-y-2">
        <Story />
        <p className="text-xs text-gray-500 mt-2">
          Note: This component doesn't have built-in disabled prop. Use CSS
          classes to simulate.
        </p>
      </div>
    ),
  ],
};

// Interactive example with state
export const Interactive: Story = {
  render: (args) => {
    const [selectedValue, setSelectedValue] = React.useState<string>("");

    return (
      <div className="space-y-4 p-4">
        <SelectGroup
          {...args}
          options={sampleOptions}
          value={selectedValue}
          onChange={(value) => {
            setSelectedValue(value);
            args.onChange?.(value);
          }}
        />
        <div className="text-sm text-gray-600">
          Selected value: <strong>{selectedValue || "None"}</strong>
        </div>
      </div>
    );
  },
  args: {
    label: "Mục đích vay",
    placeholder: "- Chọn -",
  },
};

// Error state
export const WithError: Story = {
  args: {
    label: "Mục đích vay",
    options: sampleOptions,
    placeholder: "- Chọn -",
    className: "border-red-500",
  },
  decorators: [
    (Story) => (
      <div className="space-y-2">
        <Story />
        <p className="text-xs text-red-500 mt-1">Vui lòng chọn mục đích vay</p>
      </div>
    ),
  ],
};

// Multiple SelectGroups
export const MultipleGroups: Story = {
  render: () => {
    const [purpose, setPurpose] = React.useState<string>("");
    const [period, setPeriod] = React.useState<string>("");

    return (
      <div className="space-y-6 p-4 max-w-md">
        <SelectGroup
          label="Mục đích vay"
          options={sampleOptions}
          value={purpose}
          onChange={setPurpose}
          placeholder="- Chọn mục đích -"
        />
        <SelectGroup
          label="Thời hạn vay"
          options={[
            { label: "3 tháng", value: "3" },
            { label: "6 tháng", value: "6" },
            { label: "12 tháng", value: "12" },
            { label: "24 tháng", value: "24" },
            { label: "36 tháng", value: "36" },
          ]}
          value={period}
          onChange={setPeriod}
          placeholder="- Chọn thời hạn -"
        />
      </div>
    );
  },
};
