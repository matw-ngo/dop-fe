import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";
import { Label } from "./label";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: { type: "text" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type your message here.",
  },
};

export const WithValue: Story = {
  args: {
    value: "This is some pre-filled text in the textarea.",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "This textarea is disabled",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea {...args} placeholder="Type your message here." id="message" />
    </div>
  ),
  name: "With Label",
};

export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-2">Your Message</Label>
      <Textarea
        {...args}
        placeholder="Type your message here."
        id="message-2"
      />
      <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  ),
  name: "With Helper Text",
};
