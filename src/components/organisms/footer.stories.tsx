import type { Meta, StoryObj } from "@storybook/react";
import Footer from "./footer";
import { finZoneFooterConfig, FooterConfig } from "@/configs/footer-config";

const meta: Meta<typeof Footer> = {
  title: "Organisms/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A responsive and highly configurable footer component that dynamically renders content based on company-specific settings. It supports multiple link sections, social media integration, and custom color themes through its configuration.",
      },
    },
  },
  argTypes: {
    company: {
      control: "select",
      options: ["finzone", "example-corp"],
      description:
        "The company identifier to load the specific footer configuration.",
    },
    configOverride: {
      control: "object",
      description:
        "A complete FooterConfig object to override any company-specific configuration. Use this for one-off custom footers.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const FinZone: Story = {
  name: "Default (FinZone)",
  args: {
    company: "finzone",
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the default, full-featured footer for 'FinZone'. This is the default state when no `company` prop is provided.",
    },
  },
};

export const ExampleCorp: Story = {
  name: "Example Corp",
  args: {
    company: "example-corp",
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the footer configured for 'Example Corp', showcasing a different layout, color scheme, and content.",
    },
  },
};

const minimalConfig: FooterConfig = {
  company: "minimal",
  logo: {
    text: "Minimal Inc.",
    href: "/",
    iconColor: "#ffffff",
    iconBgColor: "#4f46e5", // indigo-600
    iconLetter: "M",
  },
  companyInfo: {
    name: "Minimal Inc.",
    description: "Just the essentials.",
    addresses: ["123 Simple Lane, Nowhere, NW 00000"],
    copyright: "© 2023 Minimal Inc.",
  },
  sections: [
    {
      id: "legal",
      title: "LEGAL",
      links: [
        { id: "privacy", label: "Privacy Policy", href: "/privacy" },
        { id: "terms", label: "Terms of Service", href: "/terms" },
      ],
    },
  ],
  socialMedia: [
    { id: "twitter", platform: "twitter", href: "#" },
    { id: "linkedin", platform: "linkedin", href: "#" },
  ],
  theme: {
    backgroundColor: "#312e81", // indigo-900
    textColor: "#ffffff",
    textSecondaryColor: "#c7d2fe", // indigo-200
    borderColor: "#4338ca", // indigo-700
    socialButtonColor: "#4338ca", // indigo-700
    socialButtonHoverColor: "#4f46e5", // indigo-600
  },
};

export const MinimalOverride: Story = {
  name: "Minimal (Config Override)",
  args: {
    configOverride: minimalConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Demonstrates a minimal footer using the `configOverride` prop. This approach is ideal for special pages or contexts that require a unique footer, bypassing the standard company configurations.",
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
        pathname: "/thong-tin-vay/some-details",
      },
    },
    docs: {
      storyDescription:
        "Demonstrates the `hideOnPaths` feature from the 'finzone' config. The footer should not be visible in this story as the path is configured to be hidden.",
    },
  },
  render: (args) => (
    <div className="p-8 bg-red-50 text-red-800">
      <Footer {...args} />
      <p>
        The footer should be hidden on this page (path:
        /thong-tin-vay/some-details). If you see this message but no footer, the
        story is working correctly.
      </p>
    </div>
  ),
};

const dynamicThemeConfig: Omit<FooterConfig, "theme"> = {
  company: "dynamic",
  logo: {
    text: "Dynamic Theme Co.",
    href: "/",
    iconColor: "#16a34a", // green-600
    iconBgColor: "#ffffff",
    iconLetter: "D",
  },
  companyInfo: {
    name: "Dynamic Theme Co.",
    description: "Our styles change with the global theme.",
    addresses: ["123 Themeable Rd, Style Town, ST 12345"],
    copyright: "© 2023 Dynamic Theme Co.",
  },
  sections: [
    {
      id: "company",
      title: "COMPANY",
      links: [
        { id: "about", label: "About", href: "#" },
        { id: "blog", label: "Blog", href: "#" },
      ],
    },
    {
      id: "support",
      title: "SUPPORT",
      links: [
        { id: "contact", label: "Contact Us", href: "#" },
        { id: "faq", label: "FAQ", href: "#" },
      ],
    },
  ],
  socialMedia: [
    { id: "facebook", platform: "facebook", href: "#" },
    { id: "instagram", platform: "instagram", href: "#" },
  ],
};

export const DynamicTheme: Story = {
  name: "Fallback (Dynamic Theme)",
  args: {
    configOverride: dynamicThemeConfig as FooterConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "This story demonstrates the fallback mechanism. By providing a configuration with no `theme` object, the component uses theme-aware Tailwind classes. Try changing the theme and light/dark mode using the Storybook toolbar to see the footer's appearance change dynamically.",
    },
  },
};
