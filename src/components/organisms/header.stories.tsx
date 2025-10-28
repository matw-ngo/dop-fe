import type { Meta, StoryObj } from "@storybook/react";
import Header from "./header";
import { NavbarConfig } from "@/configs/navbar-config";

const meta: Meta<typeof Header> = {
  title: "Organisms/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Configurable header component that dynamically renders navigation based on company-specific configuration. It supports multi-level dropdowns, different navigation items per company, and path-based visibility.",
      },
    },
  },
  argTypes: {
    company: {
      control: "select",
      options: ["finzone", "example-corp"],
      description: "The company to load the navigation configuration for.",
    },
    configOverride: {
      control: "object",
      description:
        "A complete NavbarConfig object to override the default configuration. Use this for custom, one-off headers.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const FinZone: Story = {
  name: "Default (FinZone)",
  args: {
    company: "finzone",
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the default header for 'FinZone'. This is the default behavior when no `company` prop is provided or when `company` is 'finzone'.",
    },
  },
};

export const ExampleCorp: Story = {
  args: {
    company: "example-corp",
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the header configured for 'Example Corp', demonstrating the multi-company capability.",
    },
  },
};

const customConfig: NavbarConfig = {
  company: "custom",
  logo: {
    text: "Custom App",
    href: "/",
    iconColor: "#ef4444",
    iconLetter: "C",
  },
  navigation: [
    { id: "home", label: "Home", type: "link", href: "/" },
    {
      id: "products",
      label: "Products",
      type: "dropdown",
      children: [
        { id: "prod-a", label: "Product A", type: "link", href: "/products/a" },
        { id: "prod-b", label: "Product B", type: "link", href: "/products/b" },
      ],
    },
    { id: "about", label: "About Us", type: "link", href: "/about" },
    { id: "contact", label: "Contact", type: "link", href: "/contact" },
  ],
};

export const CustomConfigOverride: Story = {
  name: "Custom Config (Override)",
  args: {
    configOverride: customConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Demonstrates providing a complete custom configuration via the `configOverride` prop. This bypasses the built-in company configs and is useful for special cases.",
    },
  },
};

export const HiddenOnPath: Story = {
  name: "Hidden on Specific Path",
  args: {
    company: "finzone",
  },
  parameters: {
    nextjs: {
      router: {
        // This path is in the `hideOnPaths` array in the finzone config
        pathname: "/thong-tin-vay/some-loan-details",
      },
    },
    docs: {
      storyDescription:
        "Demonstrates the `hideOnPaths` feature. The header for 'FinZone' is configured to be hidden on paths containing `/thong-tin-vay/`. The header should not be visible in this story.",
    },
  },
  render: (args) => (
    <div className="p-8 bg-red-50 text-red-800">
      <Header {...args} />
      <p>
        The header should be hidden on this page (path:
        /thong-tin-vay/some-loan-details). If you see this message but no
        header, the story is working correctly.
      </p>
    </div>
  ),
};

export const StickyBehavior: Story = {
  name: "Sticky Behavior",
  args: {
    company: "finzone",
  },
  render: (args) => (
    <div>
      <Header {...args} />
      <div className="h-[200vh] bg-gradient-to-b from-slate-50 to-white p-8">
        <div className="pt-24 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">
            Scroll Down
          </h1>
          <p className="text-center text-slate-600">
            The header is sticky by default and will remain fixed at the top of
            the viewport as you scroll through the page content. This ensures
            navigation is always accessible.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      storyDescription:
        "The header has a `sticky top-0` class by default, making it stay at the top of the page when scrolling. This story uses a long content area to demonstrate this behavior.",
    },
  },
};
