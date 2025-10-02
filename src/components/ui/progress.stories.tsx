import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "The percentage of progress (0-100).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 33,
    className: "w-[300px]",
  },
};

export const Indeterminate: Story = {
  name: "State: Indeterminate",
  args: {
    value: null, // Radix UI uses null for indeterminate state
    className: "w-[300px]",
  },
  parameters: {
    // Disable the value control for this story as it's not applicable
    argTypes: {
      value: { control: { disable: true } },
    },
  },
};
