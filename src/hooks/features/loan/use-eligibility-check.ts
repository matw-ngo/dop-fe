// Loan Eligibility Check Hook
// Custom hook for loan eligibility verification

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { VietnameseLoanProduct } from "@/lib/loan-products/vietnamese-loan-products";
import type { ApplicantProfile, EligibilityResult } from "@/lib/loan-products/eligibility-rules";
import { VietnameseEligibilityEngine } from "@/lib/loan-products/eligibility-rules";
import { loanProductApi } from "@/lib/api/endpoints/loans";
import { useLoanProductStore } from "@/store/use-loan-product-store";

interface UseEligibilityCheckOptions {
  /** Auto-check on profile change */
  autoCheck?: boolean;
  /** Include detailed results */
  detailed?: boolean;
  /** Check multiple products at once */
  batchCheck?: boolean;
  /** Cache results */
  cacheResults?: boolean;
}

interface EligibilityCheckResult {
  /** Product ID */
  productId: string;
  /** Product */
  product: VietnameseLoanProduct;
  /** Eligibility result */
  result: EligibilityResult;
  /** Check timestamp */
  timestamp: string;
}

export function useEligibilityCheck(
  options: UseEligibilityCheckOptions = {}
) {
  const {
    autoCheck = true,
    detailed = true,
    batchCheck = false,
    cacheResults = true,
  } = options;

  const queryClient = useQueryClient();
  const store = useLoanProductStore();

  const [checking, setChecking] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<EligibilityCheckResult[]>([]);

  // Get applicant profile from store
  const applicantProfile = useLoanProductStore((state) => state.applicantProfile);

  // Update applicant profile
  const updateProfile = useCallback((profile: Partial<ApplicantProfile>) => {
    store.updateApplicantProfile(profile);
  }, [store]);

  // Check eligibility for a single product
  const checkEligibility = useCallback(async (
    product: VietnameseLoanProduct,
    profile?: Partial<ApplicantProfile>
  ): Promise<EligibilityResult> => {
    // Set checking state
    setChecking(prev => new Set(prev).add(product.id));

    try {
      // Use provided profile or fall back to store profile
      const profileToUse = profile || applicantProfile;

      // Ensure we have a complete profile
      const completeProfile: ApplicantProfile = {
        personalInfo: {
          fullName: profileToUse.personalInfo?.fullName || "",
          dateOfBirth: profileToUse.personalInfo?.dateOfBirth || "1990-01-01",
          gender: profileToUse.personalInfo?.gender || "male",
          nationalId: profileToUse.personalInfo?.nationalId || "",
          phoneNumber: profileToUse.personalInfo?.phoneNumber || "",
          email: profileToUse.personalInfo?.email || "",
          vietnameseCitizen: profileToUse.personalInfo?.vietnameseCitizen ?? true,
          maritalStatus: profileToUse.personalInfo?.maritalStatus || "single",
          dependentsCount: profileToUse.personalInfo?.dependentsCount || 0,
          ...profileToUse.personalInfo,
        },
        residenceInfo: {
          currentAddress: profileToUse.residenceInfo?.currentAddress || {
            province: "",
            district: "",
            ward: "",
            street: "",
          },
          residenceStatus: profileToUse.residenceInfo?.residenceStatus || "renter",
          durationMonths: profileToUse.residenceInfo?.durationMonths || 12,
          permanentAddressMatches: profileToUse.residenceInfo?.permanentAddressMatches ?? true,
          ...profileToUse.residenceInfo,
        },
        employmentInfo: {
          employmentType: profileToUse.employmentInfo?.employmentType || "formal",
          employmentStatus: profileToUse.employmentInfo?.employmentStatus || "full_time",
          companyName: profileToUse.employmentInfo?.companyName,
          jobTitle: profileToUse.employmentInfo?.jobTitle,
          industry: profileToUse.employmentInfo?.industry,
          workDurationMonths: profileToUse.employmentInfo?.workDurationMonths || 12,
          totalWorkExperienceYears: profileToUse.employmentInfo?.totalWorkExperienceYears || 5,
          monthlyIncome: profileToUse.employmentInfo?.monthlyIncome || 15000000,
          incomeSource: profileToUse.employmentInfo?.incomeSource || "salary",
          incomeStability: profileToUse.employmentInfo?.incomeStability || "stable",
          canProvideIncomeProof: profileToUse.employmentInfo?.canProvideIncomeProof ?? true,
          ...profileToUse.employmentInfo,
        },
        financialInfo: {
          existingMonthlyDebtPayments: profileToUse.financialInfo?.existingMonthlyDebtPayments || 0,
          hasBankAccount: profileToUse.financialInfo?.hasBankAccount ?? true,
          bankAccountDurationMonths: profileToUse.financialInfo?.bankAccountDurationMonths || 12,
          creditScore: profileToUse.financialInfo?.creditScore,
          creditHistoryLengthMonths: profileToUse.financialInfo?.creditHistoryLengthMonths || 24,
          previousLoanHistory: {
            hasPreviousLoans: profileToUse.financialInfo?.previousLoanHistory?.hasPreviousLoans ?? false,
            onTimePaymentsPercentage: profileToUse.financialInfo?.previousLoanHistory?.onTimePaymentsPercentage || 95,
            currentOverdueAmount: profileToUse.financialInfo?.previousLoanHistory?.currentOverdueAmount || 0,
            pastDefaultsCount: profileToUse.financialInfo?.previousLoanHistory?.pastDefaultsCount || 0,
            ...profileToUse.financialInfo?.previousLoanHistory,
          },
          assets: {
            hasRealEstate: profileToUse.financialInfo?.assets?.hasRealEstate ?? false,
            realEstateValue: profileToUse.financialInfo?.assets?.realEstateValue,
            hasVehicle: profileToUse.financialInfo?.assets?.hasVehicle ?? false,
            vehicleValue: profileToUse.financialInfo?.assets?.vehicleValue,
            hasSavings: profileToUse.financialInfo?.assets?.hasSavings ?? false,
            savingsAmount: profileToUse.financialInfo?.assets?.savingsAmount,
            hasOtherAssets: profileToUse.financialInfo?.assets?.hasOtherAssets ?? false,
            otherAssetsValue: profileToUse.financialInfo?.assets?.otherAssetsValue,
            ...profileToUse.financialInfo?.assets,
          },
          ...profileToUse.financialInfo,
        },
        loanRequirements: {
          requestedAmount: profileToUse.loanRequirements?.requestedAmount || 2000000000,
          requestedTerm: profileToUse.loanRequirements?.requestedTerm || 24,
          loanPurpose: profileToUse.loanRequirements?.loanPurpose || product.loanType,
          collateralAvailable: profileToUse.loanRequirements?.collateralAvailable ?? false,
          collateralType: profileToUse.loanRequirements?.collateralType,
          collateralValue: profileToUse.loanRequirements?.collateralValue,
          preferredRepaymentMethod: profileToUse.loanRequirements?.preferredRepaymentMethod || "bank_transfer",
          applicationUrgency: profileToUse.loanRequirements?.applicationUrgency || "within_month",
          ...profileToUse.loanRequirements,
        },
        specialCircumstances: profileToUse.specialCircumstances,
      };

      // Check eligibility using the engine
      const result = VietnameseEligibilityEngine.checkEligibility(completeProfile, product);

      // Cache result if enabled
      if (cacheResults) {
        store.setEligibilityResult(product.id, result);
      }

      // Update local results
      setResults(prev => {
        const filtered = prev.filter(r => r.productId !== product.id);
        return [...filtered, {
          productId: product.id,
          product,
          result,
          timestamp: new Date().toISOString(),
        }];
      });

      return result;
    } finally {
      // Clear checking state
      setChecking(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  }, [applicantProfile, store, cacheResults]);

  // Check eligibility for multiple products
  const checkMultipleEligibility = useCallback(async (
    products: VietnameseLoanProduct[],
    profile?: Partial<ApplicantProfile>
  ): Promise<EligibilityCheckResult[]> => {
    const promises = products.map(product =>
      checkEligibility(product, profile).then(result => ({
        productId: product.id,
        product,
        result,
        timestamp: new Date().toISOString(),
      }))
    );

    return Promise.all(promises);
  }, [checkEligibility]);

  // Check eligibility via API
  const checkEligibilityApi = useCallback(async (
    productIds: string[],
    profile: Partial<ApplicantProfile>
  ) => {
    // Convert profile to API format
    const apiProfile = {
      personalInfo: {
        fullName: profile.personalInfo?.fullName || "",
        dateOfBirth: profile.personalInfo?.dateOfBirth || "",
        gender: profile.personalInfo?.gender || "male",
        nationalId: profile.personalInfo?.nationalId || "",
        phoneNumber: profile.personalInfo?.phoneNumber || "",
        email: profile.personalInfo?.email || "",
        vietnameseCitizen: profile.personalInfo?.vietnameseCitizen ?? true,
      },
      residenceInfo: {
        currentAddress: {
          province: profile.residenceInfo?.currentAddress?.province || "",
          district: profile.residenceInfo?.currentAddress?.district || "",
          ward: profile.residenceInfo?.currentAddress?.ward || "",
          street: profile.residenceInfo?.currentAddress?.street || "",
        },
        residenceStatus: profile.residenceInfo?.residenceStatus || "renter",
        durationMonths: profile.residenceInfo?.durationMonths || 12,
      },
      employmentInfo: {
        employmentType: profile.employmentInfo?.employmentType || "formal",
        employmentStatus: profile.employmentInfo?.employmentStatus || "full_time",
        companyName: profile.employmentInfo?.companyName,
        jobTitle: profile.employmentInfo?.jobTitle,
        workDurationMonths: profile.employmentInfo?.workDurationMonths || 12,
        monthlyIncome: profile.employmentInfo?.monthlyIncome || 15000000,
        incomeSource: profile.employmentInfo?.incomeSource || "salary",
        canProvideIncomeProof: profile.employmentInfo?.canProvideIncomeProof ?? true,
      },
      financialInfo: {
        existingMonthlyDebtPayments: profile.financialInfo?.existingMonthlyDebtPayments || 0,
        hasBankAccount: profile.financialInfo?.hasBankAccount ?? true,
        creditScore: profile.financialInfo?.creditScore,
        previousLoanHistory: {
          hasPreviousLoans: profile.financialInfo?.previousLoanHistory?.hasPreviousLoans ?? false,
          onTimePaymentsPercentage: profile.financialInfo?.previousLoanHistory?.onTimePaymentsPercentage || 95,
        },
      },
      loanRequirements: {
        requestedAmount: profile.loanRequirements?.requestedAmount || 2000000000,
        requestedTerm: profile.loanRequirements?.requestedTerm || 24,
        collateralAvailable: profile.loanRequirements?.collateralAvailable ?? false,
        collateralType: profile.loanRequirements?.collateralType,
        collateralValue: profile.loanRequirements?.collateralValue,
      },
    };

    return loanProductApi.checkEligibility({
      productIds,
      applicantProfile: apiProfile,
    });
  }, []);

  // API mutation for batch eligibility check
  const batchCheckMutation = useMutation({
    mutationFn: ({
      productIds,
      profile,
    }: {
      productIds: string[];
      profile: Partial<ApplicantProfile>;
    }) => checkEligibilityApi(productIds, profile),
  });

  // Get eligibility result for a product
  const getEligibilityResult = useCallback((productId: string) => {
    // Check local results first
    const localResult = results.find(r => r.productId === productId);
    if (localResult) return localResult.result;

    // Check store
    return store.getEligibilityResult(productId);
  }, [results, store]);

  // Clear eligibility results
  const clearResults = useCallback(() => {
    setResults([]);
    store.clearEligibilityResults();
  }, [store]);

  // Auto-check when profile changes if enabled
  useEffect(() => {
    if (autoCheck && applicantProfile && Object.keys(applicantProfile).length > 0) {
      // Get selected products from store
      const selectedProducts = store.selectedProducts;

      if (selectedProducts.length > 0) {
        if (batchCheck) {
          // Batch check all selected products
          checkMultipleEligibility(selectedProducts, applicantProfile);
        } else {
          // Check individually (with delay to avoid overwhelming)
          selectedProducts.forEach((product, index) => {
            setTimeout(() => {
              checkEligibility(product, applicantProfile);
            }, index * 200); // 200ms delay between checks
          });
        }
      }
    }
  }, [applicantProfile, autoCheck, batchCheck, checkEligibility, checkMultipleEligibility, store.selectedProducts]);

  // Get products sorted by eligibility score
  const productsByEligibility = useMemo(() => {
    return results
      .sort((a, b) => b.result.score - a.result.score)
      .map(item => item.product);
  }, [results]);

  // Get eligible products
  const eligibleProducts = useMemo(() => {
    return results
      .filter(item => item.result.eligible)
      .sort((a, b) => b.result.score - a.result.score)
      .map(item => item.product);
  }, [results]);

  // Get ineligible products with reasons
  const ineligibleProducts = useMemo(() => {
    return results
      .filter(item => !item.result.eligible)
      .map(item => ({
        product: item.product,
        reasons: item.result.failedCriteria.map(c => c.reasonVi),
        criticalIssues: item.result.failedCriteria
          .filter(c => c.importance === "critical")
          .map(c => c.reasonVi),
      }));
  }, [results]);

  // Get eligibility statistics
  const statistics = useMemo(() => {
    const total = results.length;
    const eligible = results.filter(r => r.result.eligible).length;
    const ineligible = total - eligible;
    const averageScore = total > 0 ? results.reduce((sum, r) => sum + r.result.score, 0) / total : 0;
    const highConfidence = results.filter(r => r.result.confidence === "high").length;
    const mediumConfidence = results.filter(r => r.result.confidence === "medium").length;
    const lowConfidence = results.filter(r => r.result.confidence === "low").length;

    return {
      total,
      eligible,
      ineligible,
      eligibilityRate: total > 0 ? (eligible / total) * 100 : 0,
      averageScore,
      confidence: {
        high: highConfidence,
        medium: mediumConfidence,
        low: lowConfidence,
      },
    };
  }, [results]);

  return {
    // State
    checking: Array.from(checking),
    results,
    productsByEligibility,
    eligibleProducts,
    ineligibleProducts,
    statistics,

    // Loading states
    isLoading: batchCheckMutation.isPending,
    isChecking: checking.size > 0,

    // Actions
    checkEligibility,
    checkMultipleEligibility,
    checkEligibilityApi: batchCheckMutation.mutateAsync,
    updateProfile,
    getEligibilityResult,
    clearResults,

    // Computed properties
    hasResults: results.length > 0,
    hasEligibleProducts: eligibleProducts.length > 0,
    eligibilityRate: statistics.eligibilityRate,

    // Error handling
    error: batchCheckMutation.error,
  };
}