import { render, screen } from "@testing-library/react";
import InsuranceProduct from "./InsuranceProduct";
import {
  InsuranceCategory,
  InsuranceType,
  CoveragePeriod,
  FeeType,
} from "@/types/insurance";

// Mock Next.js components
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      "pages.insurance": {
        viewDetails: "View Details",
        compare: "Compare",
        inComparison: "In Comparison",
        recommended: "Recommended",
        new: "New",
        premium: "Premium",
        coverage: "Coverage",
        claimsApproval: "Claims Approval",
        processingTime: "Processing Time",
        keyCoverages: "Key Coverages",
        roadsideAssistance: "Roadside Assistance",
        more: "more",
      },
    };
    return (subKey: string) => translations[key]?.[subKey] || subKey;
  },
}));

// Mock constants
jest.mock("@/constants/insurance", () => ({
  INSURANCE_CATEGORIES: {
    [InsuranceCategory.VEHICLE]: {
      id: InsuranceCategory.VEHICLE,
      name: "Vehicle Insurance",
      icon: "car",
    },
  },
  INSURANCE_TYPES: {
    [InsuranceType.COMPULSORY]: {
      id: InsuranceType.COMPULSORY,
      name: "Compulsory",
    },
    [InsuranceType.VOLUNTARY]: {
      id: InsuranceType.VOLUNTARY,
      name: "Voluntary",
    },
  },
  COVERAGE_PERIODS: {
    [CoveragePeriod.ANNUALLY]: {
      id: CoveragePeriod.ANNUALLY,
      name: "Annually",
    },
  },
}));

const mockProduct = {
  id: "test-product-1",
  slug: "test-insurance",
  name: "Test Insurance Product",
  issuer: "Test Insurance Company",
  category: InsuranceCategory.VEHICLE,
  type: InsuranceType.COMPULSORY,
  image: "/test-image.jpg",
  imageAlt: "Test Insurance Product",
  rating: 4,
  reviewCount: 100,
  isRecommended: true,
  isNew: false,
  coverage: {
    personalAccident: {
      limit: 100000000,
      disabled: false,
    },
    propertyDamage: {
      limit: 200000000,
      disabled: false,
    },
    medicalExpenses: {
      limit: 50000000,
      disabled: false,
    },
    thirdPartyLiability: {
      limit: 300000000,
      disabled: false,
    },
    death: {
      limit: 0,
      disabled: true,
    },
    disability: {
      limit: 0,
      disabled: true,
    },
    hospitalization: {
      limit: 0,
      disabled: true,
    },
    surgery: {
      limit: 0,
      disabled: true,
    },
    criticalIllness: {
      limit: 0,
      disabled: true,
    },
    lossOfIncome: {
      limit: 0,
      disabled: true,
    },
  },
  pricing: {
    basePremium: 5000000,
    feeType: FeeType.FIXED,
    taxRate: 10,
    taxAmount: 500000,
    totalPremium: 5500000,
    currency: "VND",
    coveragePeriod: CoveragePeriod.ANNUALLY,
  },
  deductibles: {
    standardDeductible: 100000,
    voluntaryDeductibleOptions: [50000, 100000, 200000],
    deductibleType: "fixed" as const,
  },
  exclusions: [],
  waitingPeriods: {
    general: 30,
  },
  eligibility: {
    ageRange: {
      min: 18,
      max: 65,
    },
  },
  features: ["24/7 Support", "Online Claims", "Quick Settlement"],
  benefits: ["Comprehensive Coverage", "No Medical Checkup Required"],
  claims: {
    processDescription: "Simple and quick claim process",
    requiredDocuments: ["Claim Form", "ID Card", "Police Report"],
    processingTime: 3,
    approvalRate: 95,
    averageClaimTime: 2,
    claimMethods: ["online", "phone"],
    contactInfo: {
      hotline: "1900-1234",
      email: "claims@test.com",
    },
  },
  availability: {
    provinces: ["Ho Chi Minh", "Hanoi"],
    nationalAvailability: true,
    exclusions: [],
  },
  paymentOptions: {
    methods: ["credit_card", "bank_transfer"],
    installmentAvailable: true,
  },
  renewal: {
    autoRenewal: true,
    renewalReminderDays: 30,
    gracePeriod: 15,
    noClaimBonus: {
      maxYears: 5,
      maxDiscount: 30,
    },
  },
  applyLink: "/apply/test-insurance",
  applyLinkType: "direct" as const,
  tags: ["popular", "vehicle", "compulsory"],
  lastUpdated: new Date(),
  publishedAt: new Date(),
};

describe("InsuranceProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders insurance product in grid view", () => {
    render(<InsuranceProduct product={mockProduct} />);

    expect(screen.getByText("Test Insurance Product")).toBeInTheDocument();
    expect(screen.getByText("Test Insurance Company")).toBeInTheDocument();
    expect(screen.getByText("Vehicle Insurance")).toBeInTheDocument();
    expect(screen.getByText("Compulsory")).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("displays premium and coverage information", () => {
    render(<InsuranceProduct product={mockProduct} />);

    // Premium should be formatted as VND
    expect(screen.getByText(/5\.500\.000/)).toBeInTheDocument();
    expect(screen.getByText("Annually")).toBeInTheDocument();
  });

  it("shows key coverage highlights", () => {
    render(<InsuranceProduct product={mockProduct} />);

    expect(screen.getByText("Key Coverages")).toBeInTheDocument();
    expect(screen.getByText("Tai nạn cá nhân")).toBeInTheDocument();
    expect(screen.getByText("Thiệt hại tài sản")).toBeInTheDocument();
    expect(screen.getByText("Chi phí y tế")).toBeInTheDocument();
  });

  it("displays claims information", () => {
    render(<InsuranceProduct product={mockProduct} />);

    expect(screen.getByText("Claims Approval")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("Processing Time")).toBeInTheDocument();
    expect(screen.getByText("3 ngày")).toBeInTheDocument();
  });

  it("renders in list view", () => {
    render(<InsuranceProduct product={mockProduct} viewMode="list" />);

    expect(screen.getByText("Test Insurance Product")).toBeInTheDocument();
    expect(screen.getByText("Test Insurance Company")).toBeInTheDocument();
  });

  it("renders in compact view", () => {
    render(<InsuranceProduct product={mockProduct} viewMode="compact" />);

    expect(screen.getByText("Test Insurance Product")).toBeInTheDocument();
    expect(screen.getByText("Test Insurance Company")).toBeInTheDocument();
  });

  it("shows compare button when enabled", () => {
    const onCompareToggle = jest.fn();
    render(
      <InsuranceProduct
        product={mockProduct}
        showCompareButton
        onCompareToggle={onCompareToggle}
      />,
    );

    const compareButton = screen.getByRole("button", { name: /compare/i });
    expect(compareButton).toBeInTheDocument();
  });

  it("shows in comparison state", () => {
    render(
      <InsuranceProduct
        product={mockProduct}
        isComparing={true}
        showCompareButton
      />,
    );

    expect(screen.getByText("In Comparison")).toBeInTheDocument();
  });

  it("renders new badge when product is new", () => {
    const newProduct = { ...mockProduct, isNew: true };
    render(<InsuranceProduct product={newProduct} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<InsuranceProduct product={mockProduct} />);

    // Check for proper alt text on image
    const image = screen.getByAltText("Test Insurance Product");
    expect(image).toBeInTheDocument();
  });
});
