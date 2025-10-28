import type { Meta, StoryObj } from "@storybook/react";
import Community from "./community";
import { CommunityConfig } from "@/configs/homepage-config";

const meta: Meta<typeof Community> = {
  title: "Organisms/Homepage/Community",
  component: Community,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    config: {
      control: "object",
      description: "The configuration object for the community section.",
    },
    company: {
      control: "text",
      description: "The company identifier (not used in this component).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Community>;

export const Default: Story = {
  name: "Default Config",
  args: {},
  parameters: {
    docs: {
      storyDescription:
        "Displays the component with the default hardcoded configuration.",
    },
  },
};

const customCommunityConfig: CommunityConfig = {
  id: "custom-community",
  title: "Join Our Developer Network",
  description:
    "Connect with thousands of developers worldwide, get support, and share your projects.",
  socialLinks: [
    {
      id: "github",
      platform: "tiktok", // Using tiktok icon as a placeholder for github
      href: "#",
      ariaLabel: "GitHub",
      className: "bg-gray-800 hover:bg-gray-900",
    },
    {
      id: "discord",
      platform: "youtube", // Using youtube icon as a placeholder for discord
      href: "#",
      ariaLabel: "Discord",
      className: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      id: "linkedin",
      platform: "linkedin",
      href: "#",
      ariaLabel: "LinkedIn",
      className: "bg-blue-700 hover:bg-blue-800",
    },
    {
      id: "twitter",
      platform: "twitter",
      href: "#",
      ariaLabel: "Twitter",
      className: "bg-sky-500 hover:bg-sky-600",
    },
  ],
  background: {
    className: "bg-background",
  },
};

export const CustomConfig: Story = {
  name: "Custom Config",
  args: {
    config: customCommunityConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the component with a custom configuration passed via props.",
    },
  },
};
