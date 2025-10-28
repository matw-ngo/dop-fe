import type { Meta, StoryObj } from "@storybook/react";
import Footer from "./footer";
import { FooterConfig } from "@/configs/footer-config";

const meta: Meta<typeof Footer> = {
  title: "Layout/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Configurable footer component that dynamically renders content based on company-specific configuration. It supports multiple sections, social media links, company information, and different themes.",
      },
    },
  },
  argTypes: {
    company: {
      control: "select",
      options: ["finzone", "example-corp"],
      description: "The company to load the footer configuration for.",
    },
    configOverride: {
      control: "object",
      description:
        "A complete FooterConfig object to override the default configuration. Use this for custom, one-off footers.",
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
        "Displays the default footer for 'FinZone' with company information, multiple sections, social media links, and business registration details.",
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
        "Displays the footer configured for 'Example Corp', demonstrating the multi-company capability with different branding and content.",
    },
  },
};

const customConfig: FooterConfig = {
  company: "tech-startup",
  logo: {
    text: "Tech Startup",
    href: "/",
    iconColor: "#7c3aed",
    iconBgColor: "#ffffff",
    iconLetter: "T",
  },
  companyInfo: {
    name: "Tech Startup",
    description: "Innovative Technology Solutions for Modern Businesses",
    addresses: [
      "Head Office: 123 Innovation Street, Tech Valley, CA 94000",
      "Development Center: 456 Code Avenue, Silicon City, NY 10001",
    ],
    businessRegistration: [
      "Business Registration #12345678 issued by State of California",
      "Technology License #TL-2023-001 issued by Department of Technology",
    ],
    copyright: "Copyright © 2023 Tech Startup, All rights reserved",
    disclaimer:
      "Tech Startup provides cutting-edge technology solutions. All services are provided with comprehensive support and warranty coverage. Terms and conditions apply.",
  },
  sections: [
    {
      id: "company",
      title: "COMPANY",
      links: [
        {
          id: "about",
          label: "About Us",
          href: "/about",
        },
        {
          id: "team",
          label: "Our Team",
          href: "/team",
        },
        {
          id: "careers",
          label: "Careers",
          href: "/careers",
        },
      ],
    },
    {
      id: "products",
      title: "PRODUCTS",
      links: [
        {
          id: "software",
          label: "Software Solutions",
          href: "/products/software",
        },
        {
          id: "consulting",
          label: "Consulting",
          href: "/products/consulting",
        },
      ],
    },
    {
      id: "support",
      title: "SUPPORT",
      links: [
        {
          id: "docs",
          label: "Documentation",
          href: "/docs",
        },
        {
          id: "contact",
          label: "Contact",
          href: "/contact",
        },
      ],
    },
  ],
  socialMedia: [
    {
      id: "linkedin",
      platform: "linkedin",
      href: "https://linkedin.com/company/tech-startup",
      ariaLabel: "LinkedIn",
    },
    {
      id: "twitter",
      platform: "twitter",
      href: "https://twitter.com/tech_startup",
      ariaLabel: "Twitter",
    },
    {
      id: "youtube",
      platform: "youtube",
      href: "https://youtube.com/tech-startup",
      ariaLabel: "YouTube",
    },
  ],
  theme: {
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
    textSecondaryColor: "#e9d5ff",
    borderColor: "#8b5cf6",
    socialButtonColor: "#8b5cf6",
    socialButtonHoverColor: "#a78bfa",
  },
};

export const CustomConfigOverride: Story = {
  name: "Custom Config (Tech Startup)",
  args: {
    configOverride: customConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Demonstrates a completely custom footer configuration with purple theme, different sections, and custom branding for a tech startup company.",
    },
  },
};
