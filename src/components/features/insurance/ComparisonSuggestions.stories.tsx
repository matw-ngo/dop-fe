import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import ComparisonSuggestions from "./ComparisonSuggestions";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import type { InsuranceProduct } from "@/types/insurance";

const meta = {
  title: "Features/Insurance/ComparisonSuggestions",
  component: ComparisonSuggestions,
  parameters: {
    layout: "padded",
    nextIntl: {
      locale: "vi",
      messages: {
        pages: {
          insurance: {
            suggestedProducts: "Gợi ý sản phẩm",
            addToComparison: "Thêm vào so sánh",
            recommended: "Được đề xuất",
            issuer: "Nhà cung cấp",
            premium: "Phí bảo hiểm",
            coverage: "Quyền lợi",
            viewAllProducts: "Xem tất cả sản phẩm",
            noMoreSuggestions: "Không có gợi ý nào khác",
            noMoreSuggestionsDesc: "Tất cả sản phẩm phù hợp đã được thêm vào so sánh.",
          },
        },
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentProducts: {
      description: "Array of currently selected products for comparison",
      control: "object",
    },
    maxSuggestions: {
      description: "Maximum number of suggestions to show",
      control: { type: "number", min: 1, max: 12, step: 1 },
    },
    title: {
      description: "Custom title for the suggestions section",
      control: "text",
    },
    className: {
      description: "Additional CSS classes",
      control: "text",
    },
  },
} satisfies Meta<typeof ComparisonSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample products for stories
const sampleCurrentProducts: InsuranceProduct[] = [
  INSURANCE_PRODUCTS[0], // Bảo hiểm vật chất xe ô tô
  INSURANCE_PRODUCTS[1], // Bảo hiểm tai nạn cá nhân
];

const singleCurrentProduct: InsuranceProduct[] = [INSURANCE_PRODUCTS[2]];

const manyCurrentProducts: InsuranceProduct[] = INSURANCE_PRODUCTS.slice(0, 8);

export const Default: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    onAddToComparison: fn(),
  },
};

export const WithSingleProduct: Story = {
  args: {
    currentProducts: singleCurrentProduct,
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows suggestions when only one product is selected for comparison. The algorithm will find products from the same category and similar price/coverage ranges.",
      },
    },
  },
};

export const WithMaxSuggestions: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    maxSuggestions: 4,
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Limits the number of suggestions to the specified maxSuggestions value.",
      },
    },
  },
};

export const WithCustomTitle: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    title: "Các sản phẩm tương tự bạn có thể quan tâm",
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Uses a custom title instead of the default 'Gợi ý sản phẩm'.",
      },
    },
  },
};

export const WithCustomClassName: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    className: "bg-gray-50 p-6 rounded-lg",
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Applies custom CSS classes to the component container.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    currentProducts: manyCurrentProducts,
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows empty state when all relevant products are already in the comparison list.",
      },
    },
  },
};

export const NoCurrentProducts: Story = {
  args: {
    currentProducts: [],
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows empty state when no products are currently selected for comparison.",
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    onAddToComparison: fn(),
  },
  decorators: [
    (Story) => {
      // Simulate loading state by not advancing timers
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: "Shows skeleton loading state while fetching suggestions. The component displays skeleton cards that match the expected layout.",
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    onAddToComparison: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Shows the mobile layout with carousel navigation. Products are displayed in a swipeable carousel on mobile devices.",
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    currentProducts: sampleCurrentProducts,
    maxSuggestions: 4,
    onAddToComparison: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "Shows the tablet layout with a responsive grid. The grid adjusts from 1 column on mobile to 2-3 columns on larger screens.",
      },
    },
  },
};

export const HighRatingProducts: Story = {
  args: {
    currentProducts: [INSURANCE_PRODUCTS.find(p => p.rating >= 4.5) || INSURANCE_PRODUCTS[0]],
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "When current products have high ratings, the component suggests other highly-rated products as alternatives.",
      },
    },
  },
};

export const SameCategorySuggestions: Story = {
  args: {
    currentProducts: [INSURANCE_PRODUCTS.filter(p => p.category === "vehicle")[0]],
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Prioritizes suggestions from the same category when a single product is selected. Products with matching categories get higher scores.",
      },
    },
  },
};

export const PriceRangeSuggestions: Story = {
  args: {
    currentProducts: [INSURANCE_PRODUCTS.filter(p => p.pricing.totalPremium > 5000000)[0]],
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Shows products with similar premium ranges. The algorithm considers products within 30% of the average premium of current products.",
      },
    },
  },
};

export const WithRecommendedProducts: Story = {
  args: {
    currentProducts: [INSURANCE_PRODUCTS.find(p => !p.isRecommended) || INSURANCE_PRODUCTS[0]],
    onAddToComparison: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Highlights recommended products in the suggestions. Recommended products receive a bonus score and are shown with a special badge.",
      },
    },
  },
};