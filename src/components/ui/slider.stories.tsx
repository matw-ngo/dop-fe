import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      control: "boolean",
    },
    min: {
      control: "number",
    },
    max: {
      control: "number",
    },
    step: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  name: "Default (Single Value)",
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    className: "w-[300px]",
  },
};

export const Range: Story = {
  name: "Range (Multiple Values)",
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
    className: "w-[300px]",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [40],
    disabled: true,
    className: "w-[300px]",
  },
};
