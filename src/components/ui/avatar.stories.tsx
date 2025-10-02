import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  name: "With Image",
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage
        src="https://thissourcedoesnotexist.com/image.png"
        alt="@fallback"
      />
      <AvatarFallback>FB</AvatarFallback>
    </Avatar>
  ),
  name: "With Fallback",
};
