import type { Meta, StoryObj } from "@storybook/react";
import Stats from "./stats";
import { StatsConfig } from "@/configs/homepage-config";

const meta: Meta<typeof Stats> = {
  title: "Organisms/Homepage/Stats",
  component: Stats,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    config: {
      control: "object",
      description: "The configuration object for the stats section.",
    },
    company: {
      control: "text",
      description:
        "The company identifier (not used in this component directly but for context).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stats>;

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

const customStatsConfig: StatsConfig = {
  id: "custom-stats",
  title: "Our Achievements",
  stats: [
    {
      id: "projects",
      icon: "🚀",
      number: "500+",
      label: "projects delivered",
      description:
        "We have successfully completed over 500 projects for our clients.",
    },
    {
      id: "clients",
      icon: "😊",
      number: "99%",
      label: "client satisfaction",
      description: "Our clients love our work and keep coming back for more.",
    },
    {
      id: "team",
      icon: "👩‍💻",
      number: "50+",
      label: "expert developers",
      description:
        "Our team consists of over 50 talented and experienced developers.",
    },
  ],
  communitySection: {
    title: "Join Our Developer Community",
    description:
      "Connect with other developers, share knowledge, and stay updated with the latest tech.",
    buttonText: "Join on Discord",
    buttonHref: "#",
    background: {
      className: "bg-indigo-600",
    },
    profiles: [
      {
        id: "p1",
        image: "/placeholder-user.jpg",
        alt: "User 1",
        position: "absolute top-4 left-4",
        size: "w-16 h-16",
      },
      {
        id: "p2",
        image: "/placeholder-user.jpg",
        alt: "User 2",
        position: "absolute bottom-4 right-4",
        size: "w-20 h-20",
      },
    ],
    socialIcons: [
      {
        id: "si1",
        platform: "linkedin",
        position: "absolute bottom-8 left-24",
        className: "bg-blue-700",
      },
    ],
  },
};

export const CustomConfig: Story = {
  name: "Custom Config",
  args: {
    config: customStatsConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the component with a custom configuration passed via props. This demonstrates the component's flexibility.",
    },
  },
};
