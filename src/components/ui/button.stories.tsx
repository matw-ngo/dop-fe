import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

// Meta information: định nghĩa component này là gì, ở đâu trong Storybook
const meta: Meta<typeof Button> = {
  title: "UI/Button", // Tên hiển thị trên sidebar của Storybook
  component: Button,
  tags: ["autodocs"], // Tự động tạo trang tài liệu
  argTypes: {
    // Định nghĩa các control trong Storybook
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Story 1: Trạng thái mặc định
export const Default: Story = {
  args: {
    children: "Default Button",
  },
};

// Story 2: Biến thể Primary
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Button",
  },
};

// Story 3: Biến thể Destructive
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive Button",
  },
};

// Story 4: Trạng thái Loading
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
};

// Story 5: Trạng thái Disabled
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};
