import type { Meta, StoryObj } from "@storybook/react";
import { Bold } from "lucide-react";
import { Toggle } from "./toggle";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "outline"],
    },
    size: {
      control: { type: "radio" },
      options: ["default", "sm", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    children: <Bold />,
  },
};

export const WithText: Story = {
  name: "With Text",
  args: {
    children: (
      <>
        <Bold />
        <span>Bold</span>
      </>
    ),
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: <Bold />,
  },
};

export const Small: Story = {
  name: "Size: Small",
  args: {
    size: "sm",
    children: <Bold />,
  },
};

export const Large: Story = {
  name: "Size: Large",
  args: {
    size: "lg",
    children: <Bold />,
  },
};

export const Pressed: Story = {
  name: "State: Pressed",
  args: {
    pressed: true,
    children: <Bold />,
  },
};

export const Disabled: Story = {
  name: "State: Disabled",
  args: {
    disabled: true,
    children: <Bold />,
  },
};
