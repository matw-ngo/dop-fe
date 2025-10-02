import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: (args) => (
    <div>
      <Label {...args} htmlFor="email">
        Your email address
      </Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};
