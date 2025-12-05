import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComparisonPanel } from "./ComparisonPanel";
import { InsuranceProduct } from "@/types/insurance";

// Example data for demonstration
const exampleProducts: InsuranceProduct[] = [
  {
    id: "example-1",
    slug: "bao-hiem-suc-khoe-abc",
    name: "Bảo hiểm sức khỏe ABC Plus",
    issuer: "Công ty Bảo hiểm ABC",
    category: "health",
    type: "voluntary",
    coverage: {
      personalAccident: { limit: 500000000, disabled: false },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 200000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 1000000000, disabled: false },
      disability: { limit: 500000000, disabled: false },
      hospitalization: { limit: 10000000, disabled: false },
      surgery: { limit: 5000000, disabled: false },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },
    pricing: {
      basePremium: 2400000,
      feeType: "fixed",
      taxRate: 0.1,
      taxAmount: 240000,
      totalPremium: 2640000,
      currency: "VND",
      coveragePeriod: "annually",
    },
    deductibles: {
      standardDeductible: 200000,
      voluntaryDeductibleOptions: [0, 500000, 1000000],
      deductibleType: "fixed",
    },
    exclusions: ["Bệnh hiểm nghèo giai đoạn cuối", "Tự tử trong 2 năm đầu"],
    waitingPeriods: {
      general: 30,
      specific: {
        "Tai nạn": 0,
        "Bệnh thông thường": 30,
        "Thai sản": 270,
      },
    },
    eligibility: {
      ageRange: { min: 18, max: 60 },
      occupation: ["Văn phòng", "Giáo viên", "Kỹ sư"],
    },
    features: [
      "Chi trả chi phí y tế nội trú và ngoại trú",
      "Quyền lợi tai nạn 24/7",
      "Không cần giám định y tế khi vào viện",
      "Mạng lưới bệnh viện toàn quốc"
    ],
    benefits: [
      "An tâm về sức khỏe cho bản thân và gia đình",
      "Giảm gánh nặng tài chính khi không may mắc bệnh",
      "Tiếp cận dịch vụ y tế chất lượng cao"
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: false,
      homeVisit: true,
      worldwideCoverage: true,
    },
    claims: {
      processDescription: "Nộp hồ sơ online qua app hoặc tại văn phòng",
      requiredDocuments: ["Giấy ra viện", "Hóa đơn y tế", "CMND/CCCD"],
      processingTime: 5,
      approvalRate: 96,
      averageClaimTime: 3,
      claimMethods: ["online", "phone", "branch"],
      contactInfo: {
        hotline: "1900 9999",
        email: "claims@abc.com.vn",
        website: "https://abc.com.vn/claims",
      },
    },
    availability: {
      provinces: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ"],
      nationalAvailability: true,
      exclusions: [],
    },
    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking"],
      installmentAvailable: true,
      installmentPlans: [
        { months: 3, interestRate: 0 },
        { months: 6, interestRate: 1.5 },
      ],
    },
    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 15,
      noClaimBonus: {
        maxYears: 5,
        maxDiscount: 25,
      },
    },
    image: "/images/insurance/abc-health.jpg",
    imageAlt: "Bảo hiểm sức khỏe ABC Plus",
    applyLink: "#",
    applyLinkType: "direct",
    rating: 5,
    reviewCount: 1250,
    isRecommended: true,
    tags: ["sức khỏe", "quốc tế", "ưu đãi"],
    lastUpdated: new Date(),
    publishedAt: new Date(),
  },
];

/**
 * Example usage of the ComparisonPanel component
 */
export const ComparisonPanelExample = () => {
  const [products, setProducts] = useState<InsuranceProduct[]>([exampleProducts[0]]);

  const handleAdd = () => {
    // In a real app, this would open a product selection modal or navigate to listing
    alert("Mở danh sách sản phẩm để thêm vào so sánh");
  };

  const handleRemove = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleClear = () => {
    setProducts([]);
  };

  const handleShare = () => {
    // Custom share logic
    const shareData = {
      title: "So sánh sản phẩm bảo hiểm",
      text: `Đang so sánh ${products.length} sản phẩm bảo hiểm`,
      url: window.location.href,
    };
    console.log("Sharing:", shareData);
    alert("Đã chia sẻ liên kết so sánh");
  };

  const handleExport = () => {
    // Custom export logic
    console.log("Exporting comparison for products:", products.map(p => p.id));
    alert("Đã xuất file so sánh");
  };

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ComparisonPanel Example</h1>
        <p className="text-muted-foreground mb-8">
          This example demonstrates the ComparisonPanel component with various states and configurations.
        </p>

        {/* Example 1: With Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">With Products</h2>
          <ComparisonPanel
            products={products}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onClear={handleClear}
            onShare={handleShare}
            onExport={handleExport}
            maxProducts={3}
            isSticky={false}
          />
        </div>

        {/* Example 2: Empty State */}
        <div className="space-y-4 mt-12">
          <h2 className="text-xl font-semibold">Empty State</h2>
          <ComparisonPanel
            products={[]}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onClear={handleClear}
            maxProducts={3}
          />
        </div>

        {/* Example 3: Full State */}
        <div className="space-y-4 mt-12">
          <h2 className="text-xl font-semibold">Full State (Max Products)</h2>
          <ComparisonPanel
            products={[
              exampleProducts[0],
              { ...exampleProducts[0], id: "example-2", name: "Bảo hiểm XYZ" },
              { ...exampleProducts[0], id: "example-3", name: "Bảo hiểm DEF" },
            ]}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onClear={handleClear}
            maxProducts={3}
          />
        </div>

        {/* Example 4: Loading State */}
        <div className="space-y-4 mt-12">
          <h2 className="text-xl font-semibold">Loading State</h2>
          <ComparisonPanel
            products={products}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onClear={handleClear}
            isLoading={true}
          />
        </div>

        {/* Example 5: Sticky Position */}
        <div className="space-y-4 mt-12">
          <h2 className="text-xl font-semibold">Sticky Position</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The panel below has sticky positioning. Scroll down to see it in action.
          </p>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-500">Scroll down to see sticky panel</p>
          </div>
          <ComparisonPanel
            products={products}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onClear={handleClear}
            maxProducts={3}
            isSticky={true}
          />
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mt-4">
            <p className="text-gray-500">Panel should stick to top when scrolling</p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-12 p-4 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Controls</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                if (products.length < 3) {
                  const newProduct = {
                    ...exampleProducts[0],
                    id: `demo-${Date.now()}`,
                    name: `Demo Product ${products.length + 1}`,
                  };
                  setProducts([...products, newProduct]);
                }
              }}
              disabled={products.length >= 3}
            >
              Add Demo Product
            </Button>
            <Button
              variant="outline"
              onClick={() => setProducts([])}
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              onClick={() => setProducts([exampleProducts[0]])}
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanelExample;