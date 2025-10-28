import type { Meta, StoryObj } from "@storybook/react";
import Hero from "./hero";
import { HeroConfig } from "@/configs/homepage-config";

const meta: Meta<typeof Hero> = {
  title: "Organisms/Homepage/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Configurable hero section component for homepage. Supports custom headings, subheadings with highlights, decorative icons, and background themes.",
      },
    },
  },
  argTypes: {
    company: {
      control: "select",
      options: ["finzone", "example-corp"],
      description: "The company to load the hero configuration for.",
    },
    config: {
      control: "object",
      description:
        "A complete HeroConfig object to override the default configuration.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const FinZone: Story = {
  name: "Default (FinZone)",
  args: {
    company: "finzone",
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the default FinZone hero section with financial services messaging, teal gradient background, and decorative icons.",
    },
  },
};

export const ExampleCorp: Story = {
  name: "Example Corporation",
  args: {
    config: {
      id: "hero",
      decorativeIcons: ["🚀", "💼"],
      heading: "Transform Your Business with Innovation",
      subheading: {
        text: "We provide cutting-edge solutions for",
        highlights: [
          {
            text: "MODERN ENTERPRISES",
            className: "font-bold text-blue-900",
          },
          {
            text: "helping you achieve",
          },
          {
            text: "DIGITAL TRANSFORMATION",
            className: "font-bold text-blue-900",
          },
          {
            text: "and business growth.",
          },
        ],
      },
      background: {
        className: "bg-gradient-to-b from-blue-50 to-white",
      },
    },
  },
  parameters: {
    docs: {
      storyDescription:
        "Shows a business-focused hero section with blue theme and corporate messaging.",
    },
  },
};

export const MinimalHero: Story = {
  name: "Minimal Configuration",
  args: {
    config: {
      id: "hero-minimal",
      decorativeIcons: ["✨"],
      heading: "Simple. Powerful. Effective.",
      subheading: {
        text: "Everything you need to",
        highlights: [
          {
            text: "SUCCEED",
            className: "font-bold text-green-600",
          },
          {
            text: "in one place.",
          },
        ],
      },
      background: {
        className: "bg-gradient-to-b from-green-50 to-white",
      },
    },
  },
  parameters: {
    docs: {
      storyDescription:
        "Demonstrates a minimal hero configuration with simple messaging and green accent.",
    },
  },
};

export const NoIcons: Story = {
  name: "Without Decorative Icons",
  args: {
    config: {
      id: "hero-no-icons",
      decorativeIcons: [],
      heading: "Clean and Professional Design",
      subheading: {
        text: "Focus on",
        highlights: [
          {
            text: "CONTENT",
            className: "font-bold text-purple-600",
          },
          {
            text: "without distractions.",
          },
        ],
      },
      background: {
        className: "bg-gradient-to-b from-purple-50 to-white",
      },
    },
  },
  parameters: {
    docs: {
      storyDescription:
        "Shows the hero component without decorative icons, focusing purely on typography.",
    },
  },
};

export const TechStartup: Story = {
  name: "Tech Startup Theme",
  args: {
    config: {
      id: "hero-tech",
      decorativeIcons: ["⚡", "🔮", "🎯"],
      heading: "Building the Future of Technology",
      subheading: {
        text: "Join us in creating",
        highlights: [
          {
            text: "INNOVATIVE SOLUTIONS",
            className:
              "font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent",
          },
          {
            text: "that shape tomorrow's world with",
          },
          {
            text: "CUTTING-EDGE AI",
            className:
              "font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent",
          },
          {
            text: "and machine learning technologies.",
          },
        ],
      },
      background: {
        className:
          "bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white",
      },
    },
  },
  parameters: {
    docs: {
      storyDescription:
        "Demonstrates a modern tech startup hero with dark theme, gradient text effects, and multiple decorative icons.",
    },
  },
};

export const WithLongContent: Story = {
  name: "With Page Context",
  args: {
    company: "finzone",
  },
  render: (args) => (
    <div>
      <Hero {...args} />
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Content Below Hero</h2>
          <p className="text-gray-600">
            This demonstrates how the hero section integrates with the rest of
            the page content. The hero provides a strong visual impact at the
            top of the page while maintaining proper spacing and flow to the
            content below.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      storyDescription:
        "Shows the hero component in context with additional page content below.",
    },
  },
};
