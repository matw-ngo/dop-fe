import type { Meta, StoryObj } from "@storybook/react";
import Features from "./features";
import { FeaturesConfig } from "@/configs/homepage-config";

const meta: Meta<typeof Features> = {
  title: "Organisms/Homepage/Features",
  component: Features,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    config: {
      control: "object",
      description: "The configuration object for the features section.",
    },
    company: {
      control: "text",
      description: "The company identifier (not used in this component).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Features>;

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

const customFeaturesConfig: FeaturesConfig = {
  id: "custom-features",
  title: "Why Choose Us?",
  subtitle:
    "We provide the best services in the industry. Here are a few reasons why.",
  layout: "grid",
  background: {
    className: "bg-background",
  },
  features: [
    {
      id: "feature-1",
      title: "24/7 Support",
      description:
        "Our team is available around the clock to help you with any issues or questions you may have.",
      image: "/placeholder.svg",
      imageAlt: "Support icon",
    },
    {
      id: "feature-2",
      title: "Global Reach",
      description:
        "We have a presence in over 50 countries, ensuring you can reach your audience wherever they are.",
      image: "/placeholder.svg",
      imageAlt: "Globe icon",
    },
    {
      id: "feature-3",
      title: "Cutting-Edge Tech",
      description:
        "We use the latest technology to deliver fast, secure, and reliable services.",
      image: "/placeholder.svg",
      imageAlt: "Tech icon",
    },
    {
      id: "feature-4",
      title: "Affordable Pricing",
      description:
        "Our flexible pricing plans are designed to fit any budget, big or small.",
      image: "/placeholder.svg",
      imageAlt: "Price tag icon",
    },
  ],
};

export const CustomConfig: Story = {
  name: "Custom Config",
  args: {
    config: customFeaturesConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the component with a custom configuration passed via props, showing 4 features.",
    },
  },
};

const listLayoutConfig: FeaturesConfig = {
  ...customFeaturesConfig,
  title: "Our Services (List Layout)",
  layout: "list",
  features: customFeaturesConfig.features.slice(0, 2),
};

export const ListLayout: Story = {
  name: "List Layout",
  args: {
    config: listLayoutConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the component using a list layout instead of a grid.",
    },
  },
};
