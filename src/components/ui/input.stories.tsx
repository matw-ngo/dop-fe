import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "text" },
      description: "Input type",
      defaultValue: "text",
    },
    placeholder: {
      control: { type: "text" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter your email...",
  },
};

export const WithValue: Story = {
  args: {
    value: "hello@example.com",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: "password",
    value: "password123",
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input {...args} id="email" placeholder="Email" />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-2">Email</Label>
      <Input {...args} id="email-2" placeholder="Email" />
      <p className="text-sm text-muted-foreground">Enter your email address.</p>
    </div>
  ),
};
