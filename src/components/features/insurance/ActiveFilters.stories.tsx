import type { Meta, StoryObj } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import InsuranceActiveFilters from "./ActiveFilters";
import { InsuranceFilters, InsuranceCategory, InsuranceType } from "@/types/insurance";
import { DEFAULT_FILTERS } from "@/constants/insurance";

// Mock next-intl
const MockNextIntlClientProvider = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="vi" messages={{}}>
    {children}
  </NextIntlClientProvider>
);

// Example filters
const fullFilters: InsuranceFilters = {
  categories: [InsuranceCategory.VEHICLE, InsuranceCategory.HEALTH, InsuranceCategory.LIFE],
  types: [InsuranceType.COMPULSORY, InsuranceType.VOLUNTARY],
  issuers: ["Bảo Việt", "Bảo Minh", "PVI", "AAA Insurance"],
  coverageRange: {
    personalAccident: { min: 100000000, max: 300000000 },
    propertyDamage: { min: 50000000, max: 100000000 },
    medicalExpenses: { min: 10000000, max: 20000000 },
  },
  specificCoverages: ["car", "motorcycle", "truck"],
  premiumRange: { min: 1000000, max: 3000000 },
  feeTypes: [],
  coveragePeriods: [],
  ageRange: { min: 25, max: 60 },
  includePreExistingConditions: false,
  hasRoadsideAssistance: true,
  hasWorldwideCoverage: true,
  hasMedicalHotline: true,
  hasLegalSupport: true,
  minApprovalRate: 90,
  maxProcessingTime: 7,
  provinces: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"],
  nationalAvailability: false,
  isNew: true,
  isRecommended: true,
  isExclusive: false,
  hasAutoRenewal: true,
  hasInstallments: true,
  minRating: 4,
};

const mediumFilters: InsuranceFilters = {
  categories: [InsuranceCategory.VEHICLE],
  types: [InsuranceType.COMPULSORY],
  issuers: ["Bảo Việt", "Bảo Minh"],
  coverageRange: {
    personalAccident: { min: 0, max: 2000000000 },
    propertyDamage: { min: 0, max: 2000000000 },
    medicalExpenses: { min: 0, max: 1000000000 },
  },
  specificCoverages: ["car"],
  premiumRange: { min: 0, max: 50000000 },
  feeTypes: [],
  coveragePeriods: [],
  ageRange: { min: 18, max: 80 },
  includePreExistingConditions: false,
  hasRoadsideAssistance: true,
  hasWorldwideCoverage: false,
  hasMedicalHotline: false,
  hasLegalSupport: false,
  minApprovalRate: 0,
  maxProcessingTime: 30,
  provinces: ["Hà Nội"],
  nationalAvailability: false,
  isNew: false,
  isRecommended: false,
  isExclusive: false,
  hasAutoRenewal: false,
  hasInstallments: false,
  minRating: 0,
};

const meta: Meta<typeof InsuranceActiveFilters> = {
  title: "Features/Insurance/ActiveFilters",
  component: InsuranceActiveFilters,
  decorators: [
    (Story) => (
      <MockNextIntlClientProvider>
        <div className="p-8 max-w-4xl">
          <Story />
        </div>
      </MockNextIntlClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The ActiveFilters component displays currently active insurance filters as removable pills.
It groups filters by category and provides options to remove individual filters or clear all filters at once.

### Features:
- Displays filters as removable pills
- Groups filters by category (Types, Issuers, Coverage, Features, etc.)
- Shows overflow indicator when filters exceed maxDisplay
- Provides "Clear all" button
- Hover effects and tooltips
- Responsive design
- Vietnamese language support
`,
      },
    },
  },
  argTypes: {
    filters: {
      description: "Current active filters object",
      control: { type: "object" },
    },
    onFiltersChange: {
      description: "Callback function when filters are updated",
      action: "filtersChanged",
    },
    onClearAll: {
      description: "Callback function when clearing all filters",
      action: "clearedAll",
    },
    maxDisplay: {
      description: "Maximum number of filters to display before showing overflow",
      control: { type: "number", min: 1, max: 50, step: 1 },
    },
    className: {
      description: "Additional CSS classes to apply",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    filters: mediumFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
    maxDisplay: 10,
  },
};

// No filters
export const NoFilters: Story = {
  args: {
    filters: DEFAULT_FILTERS,
    onFiltersChange: () => {},
    onClearAll: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "When no filters are active, the component renders nothing.",
      },
    },
  },
};

// Many filters
export const ManyFilters: Story = {
  args: {
    filters: fullFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
    maxDisplay: 10,
  },
  parameters: {
    docs: {
      description: {
        story: "Example with many active filters across different categories.",
      },
    },
  },
};

// Limited display
export const LimitedDisplay: Story = {
  args: {
    filters: fullFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
    maxDisplay: 5,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows only 5 filters with overflow indicator for the rest.",
      },
    },
  },
};

// Only categories
export const OnlyCategories: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      categories: [InsuranceCategory.VEHICLE, InsuranceCategory.HEALTH, InsuranceCategory.LIFE],
    },
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
  },
};

// Only issuers
export const OnlyIssuers: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      issuers: ["Bảo Việt", "Bảo Minh", "PVI", "AAA Insurance", "BIDV Insurance"],
    },
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
  },
};

// Only features
export const OnlyFeatures: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      hasRoadsideAssistance: true,
      hasWorldwideCoverage: true,
      hasMedicalHotline: true,
      hasLegalSupport: true,
      hasAutoRenewal: true,
      hasInstallments: true,
      isNew: true,
      isRecommended: true,
      isExclusive: true,
    },
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
  },
};

// Only provinces
export const OnlyProvinces: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      provinces: [
        "Hà Nội",
        "TP. Hồ Chí Minh",
        "Đà Nẵng",
        "Hải Phòng",
        "Cần Thơ",
        "Nha Trang",
        "Huế",
        "Vũng Tàu",
      ],
    },
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
  },
};

// With custom className
export const CustomStyling: Story = {
  args: {
    filters: mediumFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    onClearAll: () => console.log("Cleared all filters"),
    className: "border-2 border-primary shadow-lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Example with custom styling applied via className prop.",
      },
    },
  },
};

// Interactive demo
export const Interactive: Story = {
  render: (args) => {
    const [filters, setFilters] = React.useState(args.filters);

    return (
      <div className="space-y-4">
        <InsuranceActiveFilters
          {...args}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Current Filter State</summary>
          <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </details>
      </div>
    );
  },
  args: {
    filters: mediumFilters,
    onClearAll: () => {},
    maxDisplay: 8,
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive example where you can see the filter state update in real-time.",
      },
    },
  },
};