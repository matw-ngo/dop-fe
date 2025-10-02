import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta: Meta<typeof ToggleGroup> = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: { type: "radio" },
      options: ["single", "multiple"],
    },
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
type Story = StoryObj<typeof ToggleGroup>;

const ToggleGroupContent = () => (
  <>
    <ToggleGroupItem value="bold" aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </ToggleGroupItem>
    <ToggleGroupItem value="italic" aria-label="Toggle italic">
      <Italic className="h-4 w-4" />
    </ToggleGroupItem>
    <ToggleGroupItem value="underline" aria-label="Toggle underline">
      <Underline className="h-4 w-4" />
    </ToggleGroupItem>
  </>
);

export const Default: Story = {
  name: "Type: Single (Default)",
  args: {
    type: "single",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupContent />
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  name: "Type: Multiple",
  args: {
    type: "multiple",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupContent />
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  name: "Variant: Outline",
  args: {
    type: "single",
    variant: "outline",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupContent />
    </ToggleGroup>
  ),
};

export const Disabled: Story = {
  name: "State: Disabled",
  args: {
    type: "single",
    disabled: true,
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupContent />
    </ToggleGroup>
  ),
};
