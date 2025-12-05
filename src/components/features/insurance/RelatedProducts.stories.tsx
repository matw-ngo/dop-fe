import type { Meta, StoryObj } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import RelatedProducts from "./RelatedProducts";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";

// Mock next-intl provider
const MockProvider = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider
    locale="vi"
    messages={{
      pages: {
        insurance: {
          relatedProducts: "Sản phẩm liên quan",
          noRelatedProducts: "Không tìm thấy sản phẩm liên quan",
          noRelatedProductsDesc: "Hiện tại chưa có sản phẩm nào tương tự.",
          viewAllProducts: "Xem tất cả sản phẩm",
          viewAllInCategory: "Xem tất cả",
          recommended: "Đề xuất",
          viewDetails: "Xem chi tiết",
          premium: "Phí bảo hiểm",
          coverage: "Mức bảo hiểm",
          claimsApproval: "Tỷ lệ duyệt",
        },
      },
    }}
  >
    {children}
  </NextIntlClientProvider>
);

const meta: Meta<typeof RelatedProducts> = {
  title: "Features/Insurance/RelatedProducts",
  component: RelatedProducts,
  decorators: [(Story) => <MockProvider><Story /></MockProvider>],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The RelatedProducts component displays a list of insurance products that are similar or related to the current product being viewed.
It uses a smart algorithm to calculate similarity based on:
- Same category
- Same issuer
- Similar coverage ranges
- Similar premium ranges
- Product ratings and reviews

The component is fully responsive, showing a grid layout on desktop and a carousel/slider on mobile devices.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentProduct: {
      description: "The current insurance product to find related products for",
      control: "object",
    },
    maxProducts: {
      description: "Maximum number of related products to display",
      control: { type: "number", min: 1, max: 12, step: 1 },
    },
    title: {
      description: "Custom title for the section",
      control: "text",
    },
    showViewAll: {
      description: "Whether to show the 'View All' button",
      control: "boolean",
    },
    viewAllLink: {
      description: "Link for the 'View All' button",
      control: "text",
    },
    className: {
      description: "Additional CSS classes for styling",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Vehicle Insurance Example
export const VehicleInsurance: Story = {
  args: {
    currentProduct: INSURANCE_PRODUCTS[0], // TNDS Bảo Việt
    maxProducts: 6,
  },
  parameters: {
    docs: {
      description: {
        story: "Showing related products for vehicle insurance (TNDS Bảo Việt). The algorithm prioritizes other vehicle insurance products from the same or different issuers.",
      },
    },
  },
};

// Health Insurance Example
export const HealthInsurance: Story = {
  args: {
    currentProduct: INSURANCE_PRODUCTS[4], // Sức khỏe Bảo Việt
    maxProducts: 4,
    title: "Gói bảo hiểm sức khỏe khác",
  },
  parameters: {
    docs: {
      description: {
        story: "Showing related health insurance products with custom title and limited to 4 items.",
      },
    },
  },
};

// Life Insurance Example
export const LifeInsurance: Story = {
  args: {
    currentProduct: INSURANCE_PRODUCTS[7], // Nhân thọ Dai-ichi
    maxProducts: 5,
    showViewAll: true,
    viewAllLink: "/insurance/life",
  },
  parameters: {
    docs: {
      description: {
        story: "Showing related life insurance products with a custom 'View All' link.",
      },
    },
  },
};

// Custom Styling Example
export const CustomStyling: Story = {
  args: {
    currentProduct: INSURANCE_PRODUCTS[9], // Du lịch Bảo Minh
    maxProducts: 3,
    title: "Đề xuất cho chuyến đi của bạn",
    className: "bg-gray-50 p-6 rounded-xl",
    showViewAll: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Example with custom styling applied through className prop and 'View All' button hidden.",
      },
    },
  },
};

// Loading State
export const LoadingState: Story = {
  args: {
    currentProduct: INSURANCE_PRODUCTS[0],
    maxProducts: 4,
  },
  render: (args) => {
    // Force loading state by mocking the useEffect
    const MockedComponent = () => {
      const MockedRelatedProducts = RelatedProducts as any;
      MockedRelatedProducts.displayName = "RelatedProducts";

      // Mock the component to always show loading state
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: args.maxProducts }, (_, i) => (
              <div key={i} className="h-80 bg-white rounded-lg shadow-md p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-20 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return <MockProvider><MockedComponent /></MockProvider>;
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state with skeleton loaders while fetching related products.",
      },
    },
  },
};

// Mobile View Example
export const MobileView: Story = {
  args: {
    currentProduct: INSURANCE_PRODUCTS[10], // Nhà tư nhiên PVI
    maxProducts: 3,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Mobile view showing carousel/slider instead of grid layout.",
      },
    },
  },
};

// Empty State
export const EmptyState: Story = {
  args: {
    currentProduct: {
      id: "unique-no-matches",
      name: "Unique Product With No Matches",
      issuer: "Unique Insurance Corp",
      category: "vehicle" as any,
      type: "compulsory" as any,
      slug: "unique-product",
      productCode: "UNIQUE-001",
      coverage: {
        personalAccident: { limit: 999999999, disabled: false },
        propertyDamage: { limit: 999999999, disabled: false },
        medicalExpenses: { limit: 999999999, disabled: false },
        thirdPartyLiability: { limit: 999999999, disabled: false },
        death: { limit: 0, disabled: true },
        disability: { limit: 0, disabled: true },
        hospitalization: { limit: 0, disabled: true },
        surgery: { limit: 0, disabled: true },
        criticalIllness: { limit: 0, disabled: true },
        lossOfIncome: { limit: 0, disabled: true },
      },
      pricing: {
        basePremium: 999999999,
        feeType: "fixed" as any,
        taxRate: 0.1,
        taxAmount: 99999999,
        totalPremium: 1099999998,
        currency: "VND",
        coveragePeriod: "annually" as any,
      },
      deductibles: {
        standardDeductible: 0,
        voluntaryDeductibleOptions: [],
        deductibleType: "fixed",
      },
      exclusions: [],
      waitingPeriods: {
        general: 0,
      },
      eligibility: {
        ageRange: { min: 18, max: 80 },
      },
      features: [],
      benefits: [],
      claims: {
        processDescription: "",
        requiredDocuments: [],
        processingTime: 0,
        approvalRate: 100,
        averageClaimTime: 0,
        claimMethods: [],
        contactInfo: {
          hotline: "",
          email: "",
        },
      },
      availability: {
        provinces: [],
        nationalAvailability: true,
        exclusions: [],
      },
      paymentOptions: {
        methods: [],
        installmentAvailable: false,
      },
      renewal: {
        autoRenewal: false,
        renewalReminderDays: 30,
        gracePeriod: 10,
        noClaimBonus: { maxYears: 0, maxDiscount: 0 },
      },
      image: "",
      imageAlt: "",
      applyLink: "",
      applyLinkType: "direct",
      rating: 5,
      reviewCount: 0,
      tags: [],
      metaTitle: "",
      metaDescription: "",
      lastUpdated: new Date(),
      publishedAt: new Date(),
    } as any,
    maxProducts: 6,
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state when no related products are found. Shows a message and option to view all products.",
      },
    },
  },
};