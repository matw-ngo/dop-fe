"use client";

import React, { useState } from "react";
import InsuranceGrid from "./InsuranceGrid";
import {
  InsuranceProduct,
  InsuranceCategory,
  InsuranceType,
  CoveragePeriod,
  FeeType,
} from "@/types/insurance";

// Example usage of InsuranceGrid component
const InsuranceGridExample: React.FC = () => {
  const [comparingProducts, setComparingProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Example insurance products data
  const exampleProducts: InsuranceProduct[] = [
    {
      id: "ins-001",
      slug: "bao-hiem-xe-may-abc",
      name: "Bảo hiểm xe máy ABC",
      issuer: "Công ty Bảo hiểm ABC",
      category: InsuranceCategory.VEHICLE,
      type: InsuranceType.COMPULSORY,
      coverage: {
        personalAccident: { limit: 100000000, disabled: false },
        propertyDamage: { limit: 50000000, disabled: false },
        medicalExpenses: { limit: 20000000, disabled: false },
        thirdPartyLiability: { limit: 60000000, disabled: false },
        death: { limit: 0, disabled: true },
        disability: { limit: 0, disabled: true },
        hospitalization: { limit: 0, disabled: true },
        surgery: { limit: 0, disabled: true },
        criticalIllness: { limit: 0, disabled: true },
        lossOfIncome: { limit: 0, disabled: true },
      },
      pricing: {
        basePremium: 66000,
        feeType: FeeType.FIXED,
        taxRate: 10,
        taxAmount: 6600,
        totalPremium: 72600,
        currency: "VND",
        coveragePeriod: CoveragePeriod.ANNUALLY,
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
        ageRange: { min: 18, max: 70 },
      },
      features: ["Bồi thường nhanh", "Hỗ trợ 24/7", "Chi phí hợp lý"],
      benefits: ["Bảo vệ tài sản", "An tâm tham gia giao thông"],
      additionalServices: {
        roadsideAssistance: true,
        medicalHotline: false,
        legalSupport: false,
        homeVisit: false,
        worldwideCoverage: false,
      },
      claims: {
        processDescription: "Quy trình bồi thường nhanh chóng",
        requiredDocuments: ["Giấy đăng ký xe", "Giấy đăng kiểm", "CMND/CCCD"],
        processingTime: 3,
        approvalRate: 95,
        averageClaimTime: 5,
        claimMethods: ["online", "phone", "branch"],
        contactInfo: {
          hotline: "1900-1234",
          email: "support@abc.com",
          website: "https://abc.com",
        },
      },
      availability: {
        provinces: [],
        nationalAvailability: true,
        exclusions: [],
      },
      paymentOptions: {
        methods: ["cash", "bank_transfer", "credit_card", "mobile_banking"],
        installmentAvailable: false,
      },
      renewal: {
        autoRenewal: true,
        renewalReminderDays: 30,
        gracePeriod: 15,
        noClaimBonus: {
          maxYears: 5,
          maxDiscount: 20,
        },
      },
      image: "/images/insurance-abc.jpg",
      imageAlt: "Bảo hiểm xe máy ABC",
      applyLink: "https://abc.com/apply",
      applyLinkType: "affiliate",
      rating: 4,
      reviewCount: 1250,
      isRecommended: true,
      isNew: false,
      tags: ["tnds", "bat buoc", "xe may"],
      lastUpdated: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "ins-002",
      slug: "bao-hiem-suc-khoe-xyz",
      name: "Bảo hiểm sức khỏe XYZ",
      issuer: "Công ty Bảo hiểm XYZ",
      category: InsuranceCategory.HEALTH,
      type: InsuranceType.VOLUNTARY,
      coverage: {
        personalAccident: { limit: 500000000, disabled: false },
        propertyDamage: { limit: 0, disabled: true },
        medicalExpenses: { limit: 1000000000, disabled: false },
        thirdPartyLiability: { limit: 0, disabled: true },
        death: { limit: 200000000, disabled: false },
        disability: { limit: 100000000, disabled: false },
        hospitalization: { limit: 2000000000, disabled: false },
        surgery: { limit: 500000000, disabled: false },
        criticalIllness: { limit: 1000000000, disabled: false },
        lossOfIncome: { limit: 0, disabled: true },
      },
      pricing: {
        basePremium: 2000000,
        feeType: FeeType.TIERED,
        taxRate: 10,
        taxAmount: 200000,
        totalPremium: 2200000,
        currency: "VND",
        coveragePeriod: CoveragePeriod.ANNUALLY,
      },
      deductibles: {
        standardDeductible: 100000,
        voluntaryDeductibleOptions: [50000, 100000, 200000],
        deductibleType: "fixed",
      },
      exclusions: ["Bệnh sẵn có", "Thẩm mỹ"],
      waitingPeriods: {
        general: 30,
        specific: {
          "Thai sản": 180,
          "Bệnh nan y": 90,
        },
      },
      eligibility: {
        ageRange: { min: 18, max: 60 },
        medicalRequirements: ["Khám sức khỏe"],
      },
      features: [
        "Bảo vệ toàn diện",
        "Mạng lưới bệnh viện lớn",
        "Không giới hạn số lần khám",
        "Bảo hộ du lịch quốc tế",
      ],
      benefits: ["An tâm sức khỏe", "Tiết kiệm chi phí"],
      additionalServices: {
        roadsideAssistance: false,
        medicalHotline: true,
        legalSupport: false,
        homeVisit: true,
        worldwideCoverage: true,
      },
      claims: {
        processDescription: "Quy trình bồi thường chuyên nghiệp",
        requiredDocuments: ["Hồ sơ bệnh án", "Hóa đơn chi phí"],
        processingTime: 5,
        approvalRate: 92,
        averageClaimTime: 7,
        claimMethods: ["online", "mobile_app"],
        contactInfo: {
          hotline: "1900-5678",
          email: "claims@xyz.com",
          website: "https://xyz.com",
        },
      },
      availability: {
        provinces: [],
        nationalAvailability: true,
        exclusions: [],
      },
      paymentOptions: {
        methods: ["bank_transfer", "credit_card", "mobile_banking"],
        installmentAvailable: true,
        installmentPlans: [
          { months: 6, interestRate: 0 },
          { months: 12, interestRate: 1.5 },
        ],
      },
      renewal: {
        autoRenewal: true,
        renewalReminderDays: 30,
        gracePeriod: 30,
        noClaimBonus: {
          maxYears: 0,
          maxDiscount: 10,
        },
      },
      image: "/images/insurance-xyz.jpg",
      imageAlt: "Bảo hiểm sức khỏe XYZ",
      applyLink: "https://xyz.com/apply",
      applyLinkType: "direct",
      rating: 5,
      reviewCount: 850,
      isRecommended: true,
      isNew: true,
      tags: ["suc khoe", "toan dien", "quoc te"],
      lastUpdated: new Date(),
      publishedAt: new Date(),
    },
  ];

  const handleProductClick = (product: InsuranceProduct) => {
    console.log("Product clicked:", product.name);
    // Navigate to product detail page
    // router.push(`/insurance/${product.slug}`);
  };

  const handleCompareToggle = (productId: string) => {
    setComparingProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 products at a time");
        return prev;
      }
      return [...prev, productId];
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insurance Products</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Default Grid Layout */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Default Grid Layout</h2>
        <InsuranceGrid
          products={exampleProducts}
          onProductClick={handleProductClick}
          onCompareToggle={handleCompareToggle}
          comparingProducts={comparingProducts}
        />
      </div>

      {/* Dense Grid with 4 columns */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dense Grid (4 columns)</h2>
        <InsuranceGrid
          products={exampleProducts}
          columns={4}
          gap="4"
          onProductClick={handleProductClick}
          onCompareToggle={handleCompareToggle}
          comparingProducts={comparingProducts}
        />
      </div>

      {/* List View */}
      <div>
        <h2 className="text-lg font-semibold mb-4">List View</h2>
        <InsuranceGrid
          products={exampleProducts}
          viewMode="list"
          onProductClick={handleProductClick}
          onCompareToggle={handleCompareToggle}
          comparingProducts={comparingProducts}
        />
      </div>

      {/* Loading State */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Loading State</h2>
        <InsuranceGrid products={[]} loading={true} />
      </div>

      {/* Empty State */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Empty State</h2>
        <InsuranceGrid
          products={[]}
          emptyStateMessage="No insurance products match your criteria. Please try different filters."
        />
      </div>

      {comparingProducts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
          <p>Comparing {comparingProducts.length} product(s)</p>
          <button
            onClick={() => console.log("View comparison")}
            className="mt-2 bg-white text-primary px-4 py-2 rounded"
          >
            Compare Now
          </button>
        </div>
      )}
    </div>
  );
};

export default InsuranceGridExample;
