// Example usage of InsuranceProduct component
import React from "react";
import InsuranceProduct from "./InsuranceProduct";
import {
  InsuranceCategory,
  InsuranceType,
  CoveragePeriod,
  FeeType,
} from "@/types/insurance";

// Example 1: Basic usage with grid view
export const BasicExample = () => {
  const sampleProduct = {
    id: "vehicle-insurance-001",
    slug: "tnds-xe-may-bao-viet",
    name: "Bảo hiểm TNDS Xe máy Bảo Việt",
    issuer: "Bảo Việt",
    category: InsuranceCategory.VEHICLE,
    type: InsuranceType.COMPULSORY,
    image: "/images/insurance/bao-viet-tnds.jpg",
    imageAlt: "Bảo hiểm TNDS Xe máy Bảo Việt",
    rating: 4,
    reviewCount: 1250,
    isRecommended: true,
    isNew: false,
    coverage: {
      personalAccident: { limit: 60000000, disabled: false },
      propertyDamage: { limit: 50000000, disabled: false },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 100000000, disabled: false },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },
    pricing: {
      basePremium: 60000,
      feeType: FeeType.FIXED,
      taxRate: 10,
      taxAmount: 6000,
      totalPremium: 66000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },
    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed" as const,
    },
    exclusions: [],
    waitingPeriods: { general: 0 },
    eligibility: { ageRange: { min: 18 } },
    features: [
      "Bảo hiểm bắt buộc theo pháp luật",
      "Bồi thường nhanh chóng trong 24h",
      "Hỗ trợ 24/7 trên toàn quốc",
    ],
    benefits: [
      "Đảm bảo theo quy định của Bộ Tài chính",
      "Mạng lưới chi nhánh rộng khắp",
      "Ứng dụng di động tiện lợi",
    ],
    claims: {
      processDescription: "Quy trình bồi thường đơn giản, nhanh chóng",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy tờ xe",
        "Căn cứ pháp lý",
      ],
      processingTime: 2,
      approvalRate: 98,
      averageClaimTime: 1,
      claimMethods: ["online", "phone", "branch"],
      contactInfo: {
        hotline: "1900 96696",
        email: "claims@baoviet.com.vn",
        website: "www.baoviet.com.vn",
      },
    },
    availability: {
      provinces: [],
      nationalAvailability: true,
      exclusions: [],
    },
    paymentOptions: {
      methods: ["cash", "bank_transfer", "mobile_banking"],
      installmentAvailable: false,
    },
    renewal: {
      autoRenewal: false,
      renewalReminderDays: 30,
      gracePeriod: 10,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },
    applyLink: "/insurance/tnds-xe-may-bao-viet",
    applyLinkType: "direct" as const,
    tags: ["tnds", "bat-buoc", "xe-may", "bao-viet"],
    lastUpdated: new Date(),
    publishedAt: new Date(),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InsuranceProduct
        product={sampleProduct}
        onCompareToggle={(productId) =>
          console.log("Toggle compare:", productId)
        }
      />
    </div>
  );
};

// Example 2: List view with comparison enabled
export const ListWithComparisonExample = () => {
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

  const sampleProducts = [
    {
      id: "health-insurance-001",
      slug: "suc-khoe-vitality-prudential",
      name: "Bảo hiểm sức khỏe Prudential Vitality",
      issuer: "Prudential",
      category: InsuranceCategory.HEALTH,
      type: InsuranceType.VOLUNTARY,
      image: "/images/insurance/prudential-health.jpg",
      imageAlt: "Bảo hiểm sức khỏe Prudential Vitality",
      rating: 5,
      reviewCount: 892,
      isRecommended: true,
      isNew: true,
      coverage: {
        personalAccident: { limit: 0, disabled: true },
        propertyDamage: { limit: 0, disabled: true },
        medicalExpenses: { limit: 2000000000, disabled: false },
        thirdPartyLiability: { limit: 0, disabled: true },
        death: { limit: 500000000, disabled: false },
        disability: { limit: 0, disabled: true },
        hospitalization: { limit: 1500000000, disabled: false },
        surgery: { limit: 500000000, disabled: false },
        criticalIllness: { limit: 1000000000, disabled: false },
        lossOfIncome: { limit: 0, disabled: true },
      },
      pricing: {
        basePremium: 12000000,
        feeType: FeeType.FIXED,
        taxRate: 10,
        taxAmount: 1200000,
        totalPremium: 13200000,
        currency: "VND",
        coveragePeriod: CoveragePeriod.ANNUALLY,
      },
      deductibles: {
        standardDeductible: 1000000,
        voluntaryDeductibleOptions: [500000, 1000000, 2000000],
        deductibleType: "fixed" as const,
      },
      exclusions: ["Bệnh hiểm nghèo trong 30 ngày đầu"],
      waitingPeriods: {
        general: 30,
        specific: { "Bệnh hiểm nghèo": 90, "Thai sản": 270 },
      },
      eligibility: {
        ageRange: { min: 18, max: 60 },
        occupation: [],
        medicalRequirements: ["Khám sức khỏe"],
      },
      features: [
        "Quyền lợi y tế toàn diện",
        "Chăm sóc sức khỏe 24/7",
        "Mạng lưới bệnh viện quốc tế",
      ],
      benefits: [
        "Không giới hạn số lần điều trị",
        "Chi phí khám chữa bệnh nội trú",
        "Chi phí phẫu thuật và cấp cứu",
      ],
      additionalServices: {
        roadsideAssistance: false,
        medicalHotline: true,
        legalSupport: false,
        homeVisit: true,
        worldwideCoverage: true,
      },
      claims: {
        processDescription: "Bồi thường nhanh chóng, giấy tờ đơn giản",
        requiredDocuments: ["Đơn yêu cầu", "Hồ sơ bệnh án", "Hóa đơn chi phí"],
        processingTime: 5,
        approvalRate: 96,
        averageClaimTime: 3,
        claimMethods: ["online", "mobile_app", "phone"],
        contactInfo: {
          hotline: "1800 9999",
          email: "claims@prudential.com.vn",
          website: "www.prudential.com.vn",
        },
      },
      availability: {
        provinces: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ"],
        nationalAvailability: false,
        exclusions: [],
      },
      paymentOptions: {
        methods: ["credit_card", "bank_transfer", "mobile_banking"],
        installmentAvailable: true,
        installmentPlans: [
          { months: 3, interestRate: 0 },
          { months: 6, interestRate: 0.5 },
          { months: 12, interestRate: 1.2 },
        ],
      },
      renewal: {
        autoRenewal: true,
        renewalReminderDays: 30,
        gracePeriod: 15,
        noClaimBonus: { maxYears: 5, maxDiscount: 20 },
      },
      applyLink: "/insurance/suc-khoe-prudential-vitality",
      applyLinkType: "affiliate" as const,
      brochureLink: "/files/prudential-vitality-brochure.pdf",
      policyDocumentLink: "/files/prudential-vitality-policy.pdf",
      tags: ["suc-khoe", "tam-truc", "quoc-te", "prudential"],
      lastUpdated: new Date(),
      publishedAt: new Date(),
    },
  ];

  const handleCompareToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sản phẩm bảo hiểm sức khỏe</h2>
        {selectedProducts.length > 0 && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() =>
              console.log("Navigate to compare page:", selectedProducts)
            }
          >
            So sánh ({selectedProducts.length})
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sampleProducts.map((product) => (
          <InsuranceProduct
            key={product.id}
            product={product}
            viewMode="list"
            showCompareButton
            onCompareToggle={handleCompareToggle}
            isComparing={selectedProducts.includes(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Example 3: Compact view for comparison table
export const CompactComparisonExample = () => {
  const products = [
    {
      id: "life-insurance-001",
      slug: "nhan-tho-dai-ichi",
      name: "Bảo hiểm nhân thọ Daiichi Life An Phát",
      issuer: "Daiichi Life",
      category: InsuranceCategory.LIFE,
      type: InsuranceType.VOLUNTARY,
      image: "/images/insurance/daiichi-life.jpg",
      imageAlt: "Bảo hiểm nhân thọ Daiichi Life",
      rating: 4,
      reviewCount: 456,
      coverage: {
        personalAccident: { limit: 0, disabled: true },
        propertyDamage: { limit: 0, disabled: true },
        medicalExpenses: { limit: 0, disabled: true },
        thirdPartyLiability: { limit: 0, disabled: true },
        death: { limit: 500000000, disabled: false },
        disability: { limit: 300000000, disabled: false },
        hospitalization: { limit: 0, disabled: true },
        surgery: { limit: 0, disabled: true },
        criticalIllness: { limit: 0, disabled: true },
        lossOfIncome: { limit: 0, disabled: true },
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
        standardDeductible: 0,
        voluntaryDeductibleOptions: [],
        deductibleType: "fixed" as const,
      },
      exclusions: [],
      waitingPeriods: { general: 0 },
      eligibility: { ageRange: { min: 0, max: 65 } },
      features: ["Bảo vệ toàn diện", "Tích lũy tài chính", "Đầu tư sinh lời"],
      benefits: [
        "Quyền lợi tử vong",
        "Quyền lợi thương tật",
        "Giá trị hoàn lại",
      ],
      claims: {
        processDescription: "Thủ tục đơn giản",
        requiredDocuments: [
          "Giấy chứng tử",
          "Giấy tờ tùy thân",
          "Hợp đồng bảo hiểm",
        ],
        processingTime: 7,
        approvalRate: 99,
        averageClaimTime: 5,
        claimMethods: ["branch", "phone"],
        contactInfo: {
          hotline: "1900 6169",
          email: "claims@daiichilife.vn",
        },
      },
      availability: {
        provinces: [],
        nationalAvailability: true,
        exclusions: [],
      },
      paymentOptions: {
        methods: ["bank_transfer", "credit_card"],
        installmentAvailable: false,
      },
      renewal: {
        autoRenewal: true,
        renewalReminderDays: 30,
        gracePeriod: 30,
        noClaimBonus: { maxYears: 0, maxDiscount: 0 },
      },
      applyLink: "/insurance/nhan-tho-daiichi-an-phat",
      applyLinkType: "direct" as const,
      tags: ["nhan-tho", "tich-luy", "daiichi-life"],
      lastUpdated: new Date(),
      publishedAt: new Date(),
    },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Sản phẩm</th>
            <th className="px-4 py-2 text-left">Nhà cung cấp</th>
            <th className="px-4 py-2 text-left">Loại</th>
            <th className="px-4 py-2 text-left">Phí bảo hiểm</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="px-4 py-2">
                <InsuranceProduct product={product} viewMode="compact" />
              </td>
              <td className="px-4 py-2">{product.issuer}</td>
              <td className="px-4 py-2">
                <span className="text-sm text-gray-600">Tự nguyện</span>
              </td>
              <td className="px-4 py-2">5.500.000 VNĐ/năm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
