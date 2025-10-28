import type { Meta, StoryObj } from "@storybook/react";
import Homepage from "./homepage";
import {
  finZoneHomepageConfig,
  exampleCompanyHomepageConfig,
} from "@/configs/homepage-config";

const meta: Meta<typeof Homepage> = {
  title: "⭐ Trang chủ/Toàn bộ trang",
  component: Homepage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    config: {
      control: "object",
      description: "The full configuration object for the entire homepage.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Homepage>;

export const FinZone: Story = {
  name: "FinZone Homepage",
  args: {
    config: finZoneHomepageConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the complete homepage layout for the 'FinZone' company.",
    },
  },
};

export const ExampleCorp: Story = {
  name: "Example Corp Homepage",
  args: {
    config: exampleCompanyHomepageConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the complete homepage layout for the 'Example Corp' company.",
    },
  },
};
