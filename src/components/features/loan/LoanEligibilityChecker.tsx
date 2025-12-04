// Loan Eligibility Checker Component
// Vietnamese loan eligibility verification system

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  User,
  Calendar,
  DollarSign,
  Briefcase,
  Home,
  Car,
  FileText,
  Clock,
  TrendingUp,
  Shield,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  GraduationCap,
  Award,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VietnameseLoanProduct } from "@/lib/loan-products/vietnamese-loan-products";
import type {
  ApplicantProfile,
  EligibilityResult,
  EligibilityCriterion,
  DocumentRequirement,
} from "@/lib/loan-products/eligibility-rules";
import { VietnameseEligibilityEngine } from "@/lib/loan-products/eligibility-rules";
import { formatVND } from "@/lib/loan-products/interest-calculations";

interface EligibilityCheckerProps {
  /** Loan product to check */
  product: VietnameseLoanProduct;
  /** Current applicant profile */
  profile?: Partial<ApplicantProfile>;
  /** On profile update */
  onProfileUpdate?: (profile: Partial<ApplicantProfile>) => void;
  /** On eligibility complete */
  onEligibilityComplete?: (result: EligibilityResult) => void;
  /** Show detailed results */
  showDetailedResults?: boolean;
  /** Compact view */
  compact?: boolean;
  /** Auto-check on mount */
  autoCheck?: boolean;
}

export function LoanEligibilityChecker({
  product,
  profile = {},
  onProfileUpdate,
  onEligibilityComplete,
  showDetailedResults = true,
  compact = false,
  autoCheck = true,
}: EligibilityCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["summary", "failed"]),
  );
  const [showAllCriteria, setShowAllCriteria] = useState(false);

  // Complete default profile with required fields
  const completeProfile: ApplicantProfile = useMemo(
    () => ({
      personalInfo: {
        fullName: profile.personalInfo?.fullName || "",
        dateOfBirth: profile.personalInfo?.dateOfBirth || "1990-01-01",
        gender: profile.personalInfo?.gender || "male",
        nationalId: profile.personalInfo?.nationalId || "",
        phoneNumber: profile.personalInfo?.phoneNumber || "",
        email: profile.personalInfo?.email || "",
        vietnameseCitizen: profile.personalInfo?.vietnameseCitizen ?? true,
        maritalStatus: profile.personalInfo?.maritalStatus || "single",
        dependentsCount: profile.personalInfo?.dependentsCount || 0,
      },
      residenceInfo: {
        currentAddress: profile.residenceInfo?.currentAddress || {
          province: "",
          district: "",
          ward: "",
          street: "",
        },
        residenceStatus: profile.residenceInfo?.residenceStatus || "renter",
        durationMonths: profile.residenceInfo?.durationMonths || 12,
        permanentAddressMatches:
          profile.residenceInfo?.permanentAddressMatches ?? true,
      },
      employmentInfo: {
        employmentType: profile.employmentInfo?.employmentType || "formal",
        employmentStatus:
          profile.employmentInfo?.employmentStatus || "full_time",
        companyName: profile.employmentInfo?.companyName || "",
        jobTitle: profile.employmentInfo?.jobTitle || "",
        industry: profile.employmentInfo?.industry || "",
        workDurationMonths: profile.employmentInfo?.workDurationMonths || 12,
        totalWorkExperienceYears:
          profile.employmentInfo?.totalWorkExperienceYears || 5,
        monthlyIncome: profile.employmentInfo?.monthlyIncome || 15000000,
        incomeSource: profile.employmentInfo?.incomeSource || "salary",
        incomeStability: profile.employmentInfo?.incomeStability || "stable",
        canProvideIncomeProof:
          profile.employmentInfo?.canProvideIncomeProof ?? true,
      },
      financialInfo: {
        existingMonthlyDebtPayments:
          profile.financialInfo?.existingMonthlyDebtPayments || 0,
        hasBankAccount: profile.financialInfo?.hasBankAccount ?? true,
        bankAccountDurationMonths:
          profile.financialInfo?.bankAccountDurationMonths || 12,
        creditScore: profile.financialInfo?.creditScore || 700,
        creditHistoryLengthMonths:
          profile.financialInfo?.creditHistoryLengthMonths || 24,
        previousLoanHistory: {
          hasPreviousLoans:
            profile.financialInfo?.previousLoanHistory?.hasPreviousLoans ??
            false,
          onTimePaymentsPercentage:
            profile.financialInfo?.previousLoanHistory
              ?.onTimePaymentsPercentage || 95,
          currentOverdueAmount:
            profile.financialInfo?.previousLoanHistory?.currentOverdueAmount ||
            0,
          pastDefaultsCount:
            profile.financialInfo?.previousLoanHistory?.pastDefaultsCount || 0,
        },
        assets: {
          hasRealEstate: profile.financialInfo?.assets?.hasRealEstate ?? false,
          realEstateValue: profile.financialInfo?.assets?.realEstateValue,
          hasVehicle: profile.financialInfo?.assets?.hasVehicle ?? false,
          vehicleValue: profile.financialInfo?.assets?.vehicleValue,
          hasSavings: profile.financialInfo?.assets?.hasSavings ?? false,
          savingsAmount: profile.financialInfo?.assets?.savingsAmount,
          hasOtherAssets:
            profile.financialInfo?.assets?.hasOtherAssets ?? false,
          otherAssetsValue: profile.financialInfo?.assets?.otherAssetsValue,
        },
      },
      loanRequirements: {
        requestedAmount:
          profile.loanRequirements?.requestedAmount || 2000000000,
        requestedTerm: profile.loanRequirements?.requestedTerm || 24,
        loanPurpose: profile.loanRequirements?.loanPurpose || product.loanType,
        collateralAvailable:
          profile.loanRequirements?.collateralAvailable ?? false,
        collateralType: profile.loanRequirements?.collateralType,
        collateralValue: profile.loanRequirements?.collateralValue,
        preferredRepaymentMethod:
          profile.loanRequirements?.preferredRepaymentMethod || "bank_transfer",
        applicationUrgency:
          profile.loanRequirements?.applicationUrgency || "within_month",
      },
      specialCircumstances: profile.specialCircumstances,
    }),
    [profile, product.loanType],
  );

  // Auto-check eligibility when component mounts or profile changes
  useEffect(() => {
    if (autoCheck) {
      checkEligibility();
    }
  }, [completeProfile, product.id]);

  // Check eligibility
  const checkEligibility = async () => {
    setChecking(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const eligibilityResult = VietnameseEligibilityEngine.checkEligibility(
        completeProfile,
        product,
      );
      setResult(eligibilityResult);
      onEligibilityComplete?.(eligibilityResult);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    } finally {
      setChecking(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Get criterion icon
  const getCriterionIcon = (criterion: EligibilityCriterion) => {
    switch (criterion.name) {
      case "Minimum Age":
      case "Maximum Age at Maturity":
        return <Calendar className="h-4 w-4" />;
      case "Minimum Monthly Income":
      case "Maximum Monthly Income":
        return <DollarSign className="h-4 w-4" />;
      case "Employment Type":
      case "Employment Duration":
        return <Briefcase className="h-4 w-4" />;
      case "Credit Score":
      case "Payment History":
        return <CreditCard className="h-4 w-4" />;
      case "Collateral Requirement":
      case "Collateral Type":
        return <Home className="h-4 w-4" />;
      case "Vietnamese Citizenship":
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (eligible: boolean, confidence: string) => {
    if (eligible && confidence === "high") return "text-green-600";
    if (eligible && confidence === "medium") return "text-blue-600";
    if (eligible && confidence === "low") return "text-yellow-600";
    return "text-red-600";
  };

  // Get status badge
  const getStatusBadge = (eligible: boolean, confidence: string) => {
    if (eligible && confidence === "high") {
      return (
        <Badge className="bg-green-100 text-green-800">Đủ điều kiện cao</Badge>
      );
    }
    if (eligible && confidence === "medium") {
      return (
        <Badge className="bg-blue-100 text-blue-800">Có thể đủ điều kiện</Badge>
      );
    }
    if (eligible && confidence === "low") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Cần xem xét</Badge>
      );
    }
    return <Badge variant="destructive">Chưa đủ điều kiện</Badge>;
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                <div
                  className={cn(
                    "absolute inset-0 rounded-full border-4",
                    result?.eligible ? "border-green-500" : "border-red-500",
                  )}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${result ? `${result.score * 3.6}% 0%, ${result.score * 3.6}% 100%, 50% 100%` : "0% 100%, 0% 100%, 50% 100%"})`,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {result?.score || 0}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Kiểm tra đủ điều kiện</h3>
                <p className="text-sm text-gray-600">
                  {result?.eligible
                    ? "Đủ điều kiện vay"
                    : "Chưa đủ điều kiện vay"}
                </p>
              </div>
            </div>
            <Button size="sm" onClick={checkEligibility} disabled={checking}>
              {checking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Kiểm tra đủ điều kiện vay
          </h2>
          <p className="text-gray-600 mt-1">
            Sản phẩm: {product.nameVi} - {product.bank.nameVi}
          </p>
        </div>
        <Button onClick={checkEligibility} disabled={checking}>
          {checking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Kiểm tra lại
            </>
          )}
        </Button>
      </div>

      {checking && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <div>
                <h3 className="font-semibold">Đang phân tích hồ sơ...</h3>
                <p className="text-sm text-gray-600">
                  Hệ thống đang kiểm tra các tiêu chí đủ điều kiện cho khoản vay
                  của bạn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !checking && (
        <>
          {/* Summary Card */}
          <Card
            className={cn(
              "border-2",
              result.eligible &&
                result.confidence === "high" &&
                "border-green-500 bg-green-50",
              result.eligible &&
                result.confidence === "medium" &&
                "border-blue-500 bg-blue-50",
              result.eligible &&
                result.confidence === "low" &&
                "border-yellow-500 bg-yellow-50",
              !result.eligible && "border-red-500 bg-red-50",
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Score Circle */}
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - result.score / 100)}`}
                        className={cn(
                          "transition-all duration-1000",
                          result.eligible &&
                            result.confidence === "high" &&
                            "text-green-600",
                          result.eligible &&
                            result.confidence === "medium" &&
                            "text-blue-600",
                          result.eligible &&
                            result.confidence === "low" &&
                            "text-yellow-600",
                          !result.eligible && "text-red-600",
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {result.score}%
                        </div>
                        <div className="text-xs text-gray-600">Điểm</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <CardTitle
                      className={cn(
                        "text-xl",
                        getStatusColor(result.eligible, result.confidence),
                      )}
                    >
                      {result.eligible
                        ? "Đủ điều kiện vay"
                        : "Chưa đủ điều kiện vay"}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusBadge(result.eligible, result.confidence)}
                      <Badge variant="outline" className="text-xs">
                        {result.confidence === "high"
                          ? "Cao"
                          : result.confidence === "medium"
                            ? "Trung bình"
                            : "Thấp"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSection("summary")}
                >
                  {expandedSections.has("summary") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.has("summary") && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-green-600">
                      {result.passedCriteria.length}
                    </div>
                    <div className="text-sm text-gray-600">Điều kiện đạt</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-red-600">
                      {result.failedCriteria.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Điều kiện chưa đạt
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-yellow-600">
                      {result.warningCriteria.length}
                    </div>
                    <div className="text-sm text-gray-600">Cần lưu ý</div>
                  </div>
                </div>

                {/* Quick Recommendations */}
                {result.recommendationsVi.length > 0 && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Khuyến nghị
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {result.recommendationsVi
                        .slice(0, 3)
                        .map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Detailed Results */}
          {showDetailedResults && (
            <Tabs defaultValue="criteria" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="criteria">Tiêu chí</TabsTrigger>
                <TabsTrigger value="documents">Tài liệu</TabsTrigger>
                <TabsTrigger value="nextsteps">Các bước tiếp theo</TabsTrigger>
              </TabsList>

              <TabsContent value="criteria" className="space-y-4">
                {/* Failed Criteria */}
                {result.failedCriteria.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-red-600 flex items-center">
                          <XCircle className="h-5 w-5 mr-2" />
                          Các điều kiện chưa đạt ({result.failedCriteria.length}
                          )
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection("failed")}
                        >
                          {expandedSections.has("failed") ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {expandedSections.has("failed") && (
                      <CardContent className="space-y-3">
                        {result.failedCriteria.map((criterion, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getCriterionIcon(criterion)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-red-900">
                                  {criterion.nameVi}
                                </h4>
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {criterion.importance === "critical"
                                    ? "Quan trọng"
                                    : criterion.importance === "important"
                                      ? "Quan trọng"
                                      : "Tùy chọn"}
                                </Badge>
                              </div>
                              <p className="text-sm text-red-700 mt-1">
                                {criterion.reasonVi}
                              </p>
                              <div className="text-xs text-red-600 mt-1">
                                Giá trị hiện tại: {criterion.actualValue} | Yêu
                                cầu: {criterion.requiredValue}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Warning Criteria */}
                {result.warningCriteria.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-yellow-600 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Cần lưu ý ({result.warningCriteria.length})
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection("warnings")}
                        >
                          {expandedSections.has("warnings") ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {expandedSections.has("warnings") && (
                      <CardContent className="space-y-3">
                        {result.warningCriteria.map((criterion, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getCriterionIcon(criterion)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-yellow-900">
                                {criterion.nameVi}
                              </h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                {criterion.reasonVi}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Passed Criteria */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-600 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Điều kiện đạt ({result.passedCriteria.length})
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllCriteria(!showAllCriteria)}
                        >
                          {showAllCriteria ? "Ẩn bớt" : "Hiển thị tất cả"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection("passed")}
                        >
                          {expandedSections.has("passed") ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedSections.has("passed") && (
                    <CardContent className="space-y-3">
                      {result.passedCriteria
                        .slice(0, showAllCriteria ? undefined : 5)
                        .map((criterion, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getCriterionIcon(criterion)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-green-900">
                                {criterion.nameVi}
                              </h4>
                              <div className="text-xs text-green-600 mt-1">
                                Giá trị: {criterion.actualValue}
                              </div>
                            </div>
                          </div>
                        ))}
                      {!showAllCriteria && result.passedCriteria.length > 5 && (
                        <div className="text-center text-sm text-gray-600">
                          ... và {result.passedCriteria.length - 5} điều kiện
                          khác
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Tài liệu cần thiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.requiredDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {doc.mandatory ? (
                              <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                                *
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs">
                                i
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{doc.typeVi}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.descriptionVi}
                            </p>
                            {doc.whereToObtainVi && (
                              <p className="text-xs text-gray-500 mt-1">
                                Nơi cấp: {doc.whereToObtainVi}
                              </p>
                            )}
                            {doc.validityRequirements && (
                              <div className="flex items-center space-x-2 mt-2">
                                {doc.validityRequirements.maxAgeMonths && (
                                  <Badge variant="outline" className="text-xs">
                                    Hết hạn sau{" "}
                                    {doc.validityRequirements.maxAgeMonths}{" "}
                                    tháng
                                  </Badge>
                                )}
                                {doc.validityRequirements.originalRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Yêu cầu bản gốc
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nextsteps" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Các bước tiếp theo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.nextStepsVi.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 flex-1">{step}</p>
                        </div>
                      ))}
                    </div>

                    {result.eligible && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-800 mb-2">
                          <Award className="h-5 w-5" />
                          <span className="font-semibold">Chúc mừng!</span>
                        </div>
                        <p className="text-sm text-green-700 mb-4">
                          Bạn đủ điều kiện cho sản phẩm vay này. Hãy bắt đầu quy
                          trình đăng ký.
                        </p>
                        <Button className="w-full">Bắt đầu đăng ký ngay</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
