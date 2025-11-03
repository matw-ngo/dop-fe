import type { Meta, StoryObj } from "@storybook/react";
import OnboardingCard from "./onboarding-card";

const meta: Meta<typeof OnboardingCard> = {
  title: "Organisms/Homepage/OnboardingCard",
  component: OnboardingCard,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "creative", "elegant", "gradient", "glassmorphism"],
      description: "Visual style variant",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Card size",
    },
    display: {
      control: { type: "select" },
      options: ["compact", "minimal", "detail", "hero", "split"],
      description: "Display layout style",
    },
    backgroundImage: {
      control: { type: "text" },
      description: "Background image URL (for creative/glassmorphism variants)",
    },
    showParticles: {
      control: { type: "boolean" },
      description: "Show decorative particles",
    },
    features: {
      control: { type: "object" },
      description: "Feature list (for detail/split displays)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingCard>;

// ============================================
// Variant Stories
// ============================================

export const Default: Story = {
  args: {
    variant: "default",
    size: "lg",
    display: "hero",
  },
};

export const Gradient: Story = {
  args: {
    variant: "gradient",
    size: "lg",
    display: "hero",
    showParticles: true,
  },
};

export const Glassmorphism: Story = {
  args: {
    variant: "glassmorphism",
    size: "lg",
    display: "hero",
    backgroundImage:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
    showParticles: true,
  },
};

export const Creative: Story = {
  args: {
    variant: "creative",
    size: "lg",
    display: "hero",
    backgroundImage: "/man-with-credit-cards.jpg",
  },
};

export const Elegant: Story = {
  args: {
    variant: "elegant",
    size: "lg",
    display: "hero",
  },
};

// ============================================
// Size Stories
// ============================================

export const SizeSmall: Story = {
  args: {
    variant: "gradient",
    size: "sm",
    display: "compact",
  },
  parameters: {
    docs: {
      description: {
        story: "Small size variant - perfect for sidebars or tight spaces",
      },
    },
  },
};

export const SizeMedium: Story = {
  args: {
    variant: "gradient",
    size: "md",
    display: "hero",
  },
  parameters: {
    docs: {
      description: {
        story: "Medium size variant - balanced for most use cases",
      },
    },
  },
};

export const SizeLarge: Story = {
  args: {
    variant: "gradient",
    size: "lg",
    display: "hero",
  },
  parameters: {
    docs: {
      description: {
        story: "Large size variant - default size, great for hero sections",
      },
    },
  },
};

export const SizeExtraLarge: Story = {
  args: {
    variant: "gradient",
    size: "xl",
    display: "hero",
  },
  parameters: {
    docs: {
      description: {
        story: "Extra large size - maximum impact for landing pages",
      },
    },
  },
};

export const SizeFull: Story = {
  args: {
    variant: "gradient",
    size: "full",
    display: "split",
    features: [
      "Quick Setup in Minutes",
      "No Credit Card Required",
      "24/7 Customer Support",
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Full width variant - spans entire container width",
      },
    },
  },
};

// ============================================
// Display Stories
// ============================================

export const DisplayCompact: Story = {
  args: {
    variant: "elegant",
    size: "sm",
    display: "compact",
  },
  parameters: {
    docs: {
      description: {
        story: "Compact display - minimal space with essential info only",
      },
    },
  },
};

export const DisplayMinimal: Story = {
  args: {
    variant: "gradient",
    size: "md",
    display: "minimal",
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal display - clean CTA focus without description",
      },
    },
  },
};

export const DisplayDetail: Story = {
  args: {
    variant: "glassmorphism",
    size: "lg",
    display: "detail",
    backgroundImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    features: [
      "Easy 5-minute setup",
      "No credit card required",
      "Free 14-day trial",
      "Cancel anytime",
      "24/7 support",
      "Mobile apps included",
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Detail display - includes feature grid with star icons",
      },
    },
  },
};

export const DisplayHero: Story = {
  args: {
    variant: "gradient",
    size: "xl",
    display: "hero",
    showParticles: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Hero display - large, impactful design for landing pages",
      },
    },
  },
};

export const DisplaySplit: Story = {
  args: {
    variant: "elegant",
    size: "xl",
    display: "split",
    features: [
      "Get started in under 5 minutes with our guided onboarding",
      "No credit card required during your 14-day free trial period",
      "Access to all premium features during trial",
      "24/7 customer support via chat, email, and phone",
      "Cancel anytime with no questions asked",
      "Data export available at any time",
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Split display - two-column layout with features and checkmarks",
      },
    },
  },
};

// ============================================
// Combination Stories
// ============================================

export const GradientHeroLarge: Story = {
  args: {
    variant: "gradient",
    size: "xl",
    display: "hero",
    showParticles: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Most impactful combination - gradient hero with particles",
      },
    },
  },
};

export const GlassmorphismSplitFull: Story = {
  args: {
    variant: "glassmorphism",
    size: "full",
    display: "split",
    backgroundImage:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    features: [
      "Quick Setup - Get started in 5 minutes",
      "Free Trial - 14 days, no credit card",
      "Full Access - All features included",
      "Expert Support - 24/7 assistance",
      "Easy Migration - Import your data",
      "Secure Platform - Bank-level security",
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Premium look - glassmorphism with split layout on full width",
      },
    },
  },
};

export const ElegantDetailMedium: Story = {
  args: {
    variant: "elegant",
    size: "md",
    display: "detail",
    features: [
      "5-min setup",
      "Free trial",
      "No card needed",
      "24/7 support",
      "Cancel anytime",
      "Data export",
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Clean and professional - elegant variant with feature details",
      },
    },
  },
};

export const CompactSidebar: Story = {
  args: {
    variant: "default",
    size: "sm",
    display: "compact",
    showParticles: false,
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story: "Perfect for sidebars - compact size with minimal display",
      },
    },
  },
};

export const MinimalCTA: Story = {
  args: {
    variant: "gradient",
    size: "md",
    display: "minimal",
    showParticles: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Quick CTA - minimal design for focused conversion",
      },
    },
  },
};

// ============================================
// Special Cases
// ============================================

export const WithCustomBackground: Story = {
  args: {
    variant: "creative",
    size: "xl",
    display: "hero",
    backgroundImage:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200",
    showParticles: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom background - creative variant with overlay and particles",
      },
    },
  },
};

export const NoParticles: Story = {
  args: {
    variant: "gradient",
    size: "lg",
    display: "hero",
    showParticles: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Clean version - same as gradient hero but without decorative particles",
      },
    },
  },
};

export const CustomFeatures: Story = {
  args: {
    variant: "elegant",
    size: "lg",
    display: "split",
    features: [
      "🚀 Lightning fast setup process",
      "💳 No credit card required upfront",
      "🎯 Targeted onboarding experience",
      "📊 Real-time analytics dashboard",
      "🔒 Enterprise-grade security",
      "🌍 Global CDN for fast loading",
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom features - split layout with emoji-enhanced feature list",
      },
    },
  },
};

// ============================================
// Responsive Preview
// ============================================

export const ResponsivePreview: Story = {
  args: {
    variant: "gradient",
    size: "lg",
    display: "split",
    showParticles: true,
    features: ["Quick Setup", "Free Trial", "24/7 Support"],
  },
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: "Mobile", styles: { width: "375px", height: "667px" } },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1440px", height: "900px" },
        },
      },
    },
    docs: {
      description: {
        story: "Test responsive behavior - view in different viewport sizes",
      },
    },
  },
};
