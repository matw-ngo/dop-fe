// Loan Product Demo Component
// Comprehensive demonstration of Vietnamese loan product matching and comparison system

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator,
  Scale,
  CheckCircle,
  TrendingUp,
  Users,
  Building,
  Search,
  Filter,
  Heart,
  BarChart3,
  FileText,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Award,
  Star,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { LoanProductCard } from "./LoanProductCard";
import { LoanProductComparison } from "./LoanProductComparison";
import { LoanEligibilityChecker } from "./LoanEligibilityChecker";
import { LoanCalculator } from "./LoanCalculator";
import { useLoanComparison } from "@/hooks/features/loan/use-loan-comparison";
import { useEligibilityCheck } from "@/hooks/features/loan/use-eligibility-check";
import { useLoanCalculator } from "@/hooks/features/loan/use-loan-calculator";
import { useLoanProductStore } from "@/store/use-loan-product-store";
import {
  vietnameseLoanProducts,
  getFeaturedLoanProducts,
  getLoanProductsByType,
} from "@/lib/loan-products/vietnamese-loan-products";
import type { VietnameseLoanProduct, VietnameseLoanType } from "@/lib/loan-products/vietnamese-loan-products";
import type { ApplicantProfile } from "@/lib/loan-products/eligibility-rules";

export function LoanProductDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProducts, setSelectedProducts] = useState<VietnameseLoanProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<VietnameseLoanType | "all">("all");
  const [loanAmount, setLoanAmount] = useState(2000000000); // 2 tỷ VND
  const [loanTerm, setLoanTerm] = useState(24); // 24 months
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const store = useLoanProductStore();

  // Initialize demo data
  useEffect(() => {
    if (isDemoMode) {
      // Load featured products
      const featured = getFeaturedLoanProducts();
      store.setProducts(featured);
    }
  }, [isDemoMode, store]);

  // Custom hooks
  const comparison = useLoanComparison(loanAmount, loanTerm, {
    autoCalculate: true,
    includeFees: true,
    includePromotions: true,
  });

  const eligibility = useEligibilityCheck({
    autoCheck: false,
    detailed: true,
  });

  const calculator = useLoanCalculator(
    {
      principal: loanAmount,
      term: loanTerm,
    },
    { autoCalculate: true }
  );

  // Demo applicant profile
  const demoProfile: Partial<ApplicantProfile> = {
    personalInfo: {
      fullName: "Nguyễn Văn A",
      dateOfBirth: "1985-05-15",
      gender: "male",
      nationalId: "001234567890",
      phoneNumber: "0912345678",
      email: "nguyenvana@email.com",
      vietnameseCitizen: true,
      maritalStatus: "married",
      dependentsCount: 2,
    },
    residenceInfo: {
      currentAddress: {
        province: "Hà Nội",
        district: "Cầu Giấy",
        ward: "Dịch Vọng Hậu",
        street: "Phạm Văn Đồng",
      },
      residenceStatus: "owner",
      durationMonths: 60,
      permanentAddressMatches: true,
    },
    employmentInfo: {
      employmentType: "formal",
      employmentStatus: "full_time",
      companyName: "Công ty Công nghệ ABC",
      jobTitle: "Quản lý dự án",
      industry: "Công nghệ thông tin",
      workDurationMonths: 36,
      totalWorkExperienceYears: 10,
      monthlyIncome: 25000000, // 25 triệu VND
      incomeSource: "salary",
      incomeStability: "stable",
      canProvideIncomeProof: true,
    },
    financialInfo: {
      existingMonthlyDebtPayments: 3000000, // 3 triệu VND existing debt
      hasBankAccount: true,
      bankAccountDurationMonths: 48,
      creditScore: 750,
      creditHistoryLengthMonths: 60,
      previousLoanHistory: {
        hasPreviousLoans: true,
        onTimePaymentsPercentage: 98,
        currentOverdueAmount: 0,
        pastDefaultsCount: 0,
      },
      assets: {
        hasRealEstate: true,
        realEstateValue: 3000000000, // 3 tỷ VND
        hasVehicle: true,
        vehicleValue: 800000000, // 800 triệu VND
        hasSavings: true,
        savingsAmount: 500000000, // 500 triệu VND
      },
    },
    loanRequirements: {
      requestedAmount: loanAmount,
      requestedTerm: loanTerm,
      loanPurpose: "home_loan",
      collateralAvailable: true,
      collateralType: "real_estate",
      collateralValue: 3000000000,
    },
    specialCircumstances: {
      isGovernmentEmployee: false,
      isHealthcareWorker: false,
      isTeacher: false,
      isFirstTimeBorrower: false,
      salaryAccountHolder: {
        bankCode: "VCB",
        durationMonths: 24,
      },
    },
  };

  // Filter products
  const filteredProducts = React.useMemo(() => {
    let products = vietnameseLoanProducts.filter(product => product.active);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(product =>
        product.nameVi.toLowerCase().includes(term) ||
        product.bank.nameVi.toLowerCase().includes(term) ||
        product.descriptionVi.toLowerCase().includes(term)
      );
    }

    if (filterType !== "all") {
      products = products.filter(product => product.loanType === filterType);
    }

    return products;
  }, [searchTerm, filterType]);

  // Handle product selection
  const handleProductSelect = (product: VietnameseLoanProduct) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      comparison.deselectProduct(product.id);
    } else {
      if (selectedProducts.length < 3) {
        setSelectedProducts(prev => [...prev, product]);
        comparison.selectProduct(product);
      }
    }
  };

  // Demo steps for guided tour
  const demoSteps = [
    {
      title: "Tìm kiếm sản phẩm vay",
      description: "Khám phá các sản phẩm vay từ các ngân hàng hàng đầu Việt Nam",
      component: "browse",
    },
    {
      title: "So sánh sản phẩm",
      description: "So sánh chi tiết các gói vay để tìm lựa chọn tốt nhất",
      component: "compare",
    },
    {
      title: "Kiểm tra đủ điều kiện",
      description: "Kiểm tra xem bạn có đủ điều kiện cho các sản phẩm vay đã chọn",
      component: "eligibility",
    },
    {
      title: "Tính toán khoản vay",
      description: "Sử dụng máy tính khoản vay để ước tính chi phí",
      component: "calculator",
    },
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Hệ thống so sánh vay vốn Việt Nam
                </h1>
                <p className="text-sm text-gray-600">
                  Tìm kiếm, so sánh và chọn gói vay tốt nhất
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {filteredProducts.length} sản phẩm
              </Badge>
              <Button
                variant={isDemoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDemoMode(!isDemoMode)}
              >
                {isDemoMode ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isDemoMode ? "Demo Mode" : "Live Mode"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Progress */}
      {isDemoMode && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  Hướng dẫn sử dụng:
                </span>
                <div className="flex items-center space-x-2">
                  {demoSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                        index === currentStep
                          ? "bg-blue-600 text-white"
                          : index < currentStep
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Quay lại
                </Button>
                <Button
                  size="sm"
                  onClick={nextStep}
                  disabled={currentStep === demoSteps.length - 1}
                >
                  Tiếp theo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium">Tìm kiếm</div>
                    <div className="text-sm text-gray-600">{filteredProducts.length} sản phẩm</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Scale className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium">So sánh</div>
                    <div className="text-sm text-gray-600">{selectedProducts.length} đã chọn</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-medium">Đủ điều kiện</div>
                    <div className="text-sm text-gray-600">
                      {eligibility.eligibleProducts.length} phù hợp
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                  <Calculator className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-medium">Tính toán</div>
                    <div className="text-sm text-gray-600">
                      {calculator.formattedValues?.monthlyPayment || "---"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Số tiền vay</Label>
                  <Input
                    type="text"
                    value={loanAmount.toLocaleString("vi-VN")}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setLoanAmount(value);
                    }}
                    placeholder="Nhập số tiền"
                  />
                </div>
                <div>
                  <Label>Thời gian vay (tháng)</Label>
                  <Input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(parseInt(e.target.value) || 0)}
                    min={1}
                    max={360}
                  />
                </div>
                <div>
                  <Label>Tìm kiếm</Label>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                  />
                </div>
                <div>
                  <Label>Loại hình vay</Label>
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="home_loan">Vay mua nhà</SelectItem>
                      <SelectItem value="auto_loan">Vay mua xe</SelectItem>
                      <SelectItem value="consumer_loan">Vay tiêu dùng</SelectItem>
                      <SelectItem value="business_loan">Vay kinh doanh</SelectItem>
                      <SelectItem value="student_loan">Vay sinh viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Làm mới
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center">
              <Scale className="h-4 w-4 mr-2" />
              So sánh
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Đủ điều kiện
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Máy tính
            </TabsTrigger>
          </TabsList>

          {/* Browse Products Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.slice(0, 9).map((product) => (
                <LoanProductCard
                  key={product.id}
                  product={product}
                  loanAmount={loanAmount}
                  loanTerm={loanTerm}
                  selected={selectedProducts.some(p => p.id === product.id)}
                  onSelectionChange={(selected) => {
                    if (selected) {
                      comparison.selectProduct(product);
                      setSelectedProducts(prev => [...prev, product]);
                    } else {
                      comparison.deselectProduct(product.id);
                      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
                    }
                  }}
                  onApply={() => {
                    console.log("Apply for product:", product.nameVi);
                  }}
                  onDetails={() => {
                    console.log("View details for:", product.nameVi);
                  }}
                  showCompare={true}
                  showCalculations={true}
                />
              ))}
            </div>

            {filteredProducts.length > 9 && (
              <div className="text-center">
                <Button variant="outline">
                  Xem thêm sản phẩm ({filteredProducts.length - 9} còn lại)
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare" className="space-y-6">
            {selectedProducts.length >= 2 ? (
              <LoanProductComparison
                products={vietnameseLoanProducts}
                loanAmount={loanAmount}
                loanTerm={loanTerm}
                selectedProducts={selectedProducts}
                onSelectionChange={setSelectedProducts}
                onProductApply={(product) => {
                  console.log("Apply for product:", product.nameVi);
                }}
                onProductDetails={(product) => {
                  console.log("View details for:", product.nameVi);
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn sản phẩm để so sánh
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vui lòng chọn ít nhất 2 sản phẩm để bắt đầu so sánh
                  </p>
                  <Button onClick={() => setActiveTab("overview")}>
                    Chọn sản phẩm
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-6">
            {selectedProducts.length > 0 ? (
              <div className="space-y-6">
                {selectedProducts.map((product) => (
                  <LoanEligibilityChecker
                    key={product.id}
                    product={product}
                    profile={demoProfile}
                    onProfileUpdate={eligibility.updateProfile}
                    showDetailedResults={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn sản phẩm để kiểm tra
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vui lòng chọn sản phẩm để kiểm tra điều kiện vay
                  </p>
                  <Button onClick={() => setActiveTab("overview")}>
                    Chọn sản phẩm
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <LoanCalculator
              initialParams={{
                principal: loanAmount,
                term: loanTerm,
              }}
              showComparison={true}
              showSchedule={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}