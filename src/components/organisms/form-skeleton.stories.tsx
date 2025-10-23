import type { Meta, StoryObj } from "@storybook/react";
import { FormSkeleton } from "./form-skeleton";

const meta: Meta<typeof FormSkeleton> = {
  title: "Organisms/FormSkeleton",
  component: FormSkeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    fields: {
      control: { type: "object" },
      description: "An array of field types to render skeletons for.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormSkeleton>;

export const Default: Story = {
  args: {
    fields: ["input", "input", "select"],
    className: "w-[600px]",
  },
};

export const MixedTypes: Story = {
  name: "With Mixed Field Types",
  args: {
    fields: ["avatar", "input", "input", "textarea", "checkbox"],
    className: "w-[600px]",
  },
};

export const LongForm: Story = {
  name: "For a Long Form",
  args: {
    fields: ["input", "input", "select", "input", "input", "textarea"],
    className: "w-[600px]",
  },
};
