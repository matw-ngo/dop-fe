// Loan Financial Information Component
// Vietnamese-specific financial information form for loan applications

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DollarSign,
  PiggyBank,
  CreditCard,
  Building2,
  FileText,
  Calculator,
  TrendingUp,
  Home,
  Car,
  Briefcase,
  AlertCircle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loanApi } from "@/lib/api/endpoints/loans";
import { useLoanApplicationStore } from "@/store/use-loan-store";
import type { FinancialInfoData } from "@/types/forms/loan-form";

/**
 * Vietnamese validation schemas for financial information
 */
const financialInfoSchema = z.object({
  monthlyIncomeRange: z.string().min(1, "Vui lòng chọn khoảng thu nhập"),
  exactMonthlyIncome: z.number().optional(),
  incomeSource: z.enum(["salary", "business", "investment", "rental", "pension", "other"], {
    required_error: "Vui lòng chọn nguồn thu nhập",
  }),
  incomeSourceDetails: z.string().optional(),

  bankInfo: z.object({
    bankName: z.string().min(1, "Vui lòng chọn ngân hàng"),
    bankBranch: z.string().min(1, "Vui lòng nhập chi nhánh"),
    accountNumber: z
      .string()
      .min(1, "Vui lòng nhập số tài khoản")
      .regex(/^[0-9]+$/, "Số tài khoản chỉ được chứa số"),
    accountHolderName: z
      .string()
      .min(1, "Vui lòng nhập tên chủ tài khoản")
      .regex(
        /^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]+$/,
        "Tên chỉ được chứa chữ cái và khoảng trắng"
      ),
  }),

  existingLoans: z.object({
    hasExistingLoans: z.boolean(),
    loans: z.array(
      z.object({
        provider: z.string().min(1, "Vui lòng nhập đơn vị cho vay"),
        outstandingAmount: z.number().min(0, "Số tiền dư nợ không âm"),
        monthlyPayment: z.number().min(0, "Số tiền trả hàng tháng không âm"),
        loanType: z.enum(["personal", "mortgage", "car", "credit_card", "other"]),
      })
    ).optional(),
  }),

  creditCardInfo: z.object({
    hasCreditCards: z.boolean(),
    cardCount: z.number().optional(),
    totalCreditLimit: z.number().optional(),
    currentBalance: z.number().optional(),
  }),

  monthlyExpenses: z.object({
    housing: z.number().min(0, "Chi phí nhà ở không âm"),
    transportation: z.number().min(0, "Chi phí đi lại không âm"),
    foodAndUtilities: z.number().min(0, "Chi phí ăn uống và điện nước không âm"),
    other: z.number().min(0, "Chi phí khác không âm"),
  }),

  assets: z.object({
    hasRealEstate: z.boolean(),
    realEstateDetails: z.string().optional(),
    hasVehicle: z.boolean(),
    vehicleDetails: z.string().optional(),
    otherAssets: z.string().optional(),
  }),
}).refine(
  (data) => {
    // If has existing loans, must provide loan details
    if (data.existingLoans.hasExistingLoans) {
      return data.existingLoans.loans && data.existingLoans.loans.length > 0;
    }
    return true;
  },
  {
    message: "Vui lòng cung cấp thông tin khoản vay hiện tại",
    path: ["existingLoans.loans"],
  }
).refine(
  (data) => {
    // If has credit cards, must provide card details
    if (data.creditCardInfo.hasCreditCards) {
      return (
        data.creditCardInfo.cardCount &&
        data.creditCardInfo.cardCount > 0 &&
        data.creditCardInfo.totalCreditLimit
      );
    }
    return true;
  },
  {
    message: "Vui lòng cung cấp thông tin thẻ tín dụng",
    path: ["creditCardInfo"],
  }
);

type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;

/**
 * Vietnamese income ranges and options
 */
const INCOME_RANGES = [
  { value: "0-10000000", label: "Dưới 10 triệu", min: 0, max: 10000000 },
  { value: "10000000-20000000", label: "10 - 20 triệu", min: 10000000, max: 20000000 },
  { value: "20000000-30000000", label: "20 - 30 triệu", min: 20000000, max: 30000000 },
  { value: "30000000-50000000", label: "30 - 50 triệu", min: 30000000, max: 50000000 },
  { value: "50000000-100000000", label: "50 - 100 triệu", min: 50000000, max: 100000000 },
  { value: "100000000+", label: "Trên 100 triệu", min: 100000000, max: Infinity },
];

const INCOME_SOURCES = [
  { value: "salary", label: "Lương tháng", icon: Briefcase },
  { value: "business", label: "Kinh doanh tự do", icon: Building2 },
  { value: "investment", label: "Đầu tư", icon: TrendingUp },
  { value: "rental", label: "Cho thuê", icon: Home },
  { value: "pension", label: "Lương hưu", icon: PiggyBank },
  { value: "other", label: "Khác", icon: DollarSign },
];

const LOAN_TYPES = [
  { value: "personal", label: "Vay cá nhân" },
  { value: "mortgage", label: "Vay mua nhà" },
  { value: "car", label: "Vay mua xe" },
  { value: "credit_card", label: "Thẻ tín dụng" },
  { value: "other", label: "Khác" },
];

/**
 * Loan Financial Information Component Props
 */
interface LoanFinancialInfoProps {
  /** Initial form data */
  initialData?: Partial<FinancialInfoData>;
  /** Form submission handler */
  onSubmit: (data: FinancialInfoData) => void | Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Loan amount for eligibility check */
  loanAmount?: number;
}

/**
 * LoanFinancialInfo Component
 */
export const LoanFinancialInfo: React.FC<LoanFinancialInfoProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  className,
  readOnly = false,
  loanAmount,
}) => {
  const t = useTranslations("loan.financialInfo");
  const [banks, setBanks] = useState<any[]>([]);
  const [incomeSources, setIncomeSources] = useState<any[]>([]);
  const [showExactIncome, setShowExactIncome] = useState(false);
  const [showExistingLoans, setShowExistingLoans] = useState(false);
  const [showCreditCards, setShowCreditCards] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const { updateFinancialInfo } = useLoanApplicationStore();

  const form = useForm<FinancialInfoFormData>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      monthlyIncomeRange: "",
      exactMonthlyIncome: undefined,
      incomeSource: "salary",
      incomeSourceDetails: "",
      bankInfo: {
        bankName: "",
        bankBranch: "",
        accountNumber: "",
        accountHolderName: "",
      },
      existingLoans: {
        hasExistingLoans: false,
        loans: [],
      },
      creditCardInfo: {
        hasCreditCards: false,
        cardCount: 0,
        totalCreditLimit: 0,
        currentBalance: 0,
      },
      monthlyExpenses: {
        housing: 0,
        transportation: 0,
        foodAndUtilities: 0,
        other: 0,
      },
      assets: {
        hasRealEstate: false,
        realEstateDetails: "",
        hasVehicle: false,
        vehicleDetails: "",
        otherAssets: "",
      },
      ...initialData,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Load banks and income sources on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [banksData, sourcesData] = await Promise.all([
          loanApi.getBanks(),
          loanApi.getIncomeSources(),
        ]);
        setBanks(banksData || []);
        setIncomeSources(sourcesData || INCOME_SOURCES);
      } catch (error) {
        console.error("Failed to load financial data:", error);
        // Use fallback data
        setIncomeSources(INCOME_SOURCES);
      }
    };
    loadData();
  }, []);

  // Watch income range to show/hide exact income input
  const watchedIncomeRange = form.watch("monthlyIncomeRange");
  useEffect(() => {
    setShowExactIncome(watchedIncomeRange === "100000000+");
  }, [watchedIncomeRange]);

  // Watch existing loans flag
  const watchedHasExistingLoans = form.watch("existingLoans.hasExistingLoans");
  useEffect(() => {
    setShowExistingLoans(watchedHasExistingLoans);
    if (!watchedHasExistingLoans) {
      form.setValue("existingLoans.loans", []);
    }
  }, [watchedHasExistingLoans, form]);

  // Watch credit cards flag
  const watchedHasCreditCards = form.watch("creditCardInfo.hasCreditCards");
  useEffect(() => {
    setShowCreditCards(watchedHasCreditCards);
    if (!watchedHasCreditCards) {
      form.setValue("creditCardInfo.cardCount", 0);
      form.setValue("creditCardInfo.totalCreditLimit", 0);
      form.setValue("creditCardInfo.currentBalance", 0);
    }
  }, [watchedHasCreditCards, form]);

  // Check loan eligibility
  const checkEligibility = async () => {
    const formData = form.getValues();
    if (!formData.monthlyIncomeRange || !loanAmount) return;

    setIsCheckingEligibility(true);
    try {
      const incomeRange = INCOME_RANGES.find(r => r.value === formData.monthlyIncomeRange);
      const monthlyIncome = formData.exactMonthlyIncome || incomeRange?.min || 0;

      const criteria = {
        monthlyIncome,
        loanAmount,
        existingLoans: formData.existingLoans.loans?.reduce(
          (sum, loan) => sum + loan.outstandingAmount,
          0
        ) || 0,
        creditCardBalance: formData.creditCardInfo.currentBalance || 0,
        monthlyExpenses: Object.values(formData.monthlyExpenses).reduce(
          (sum, expense) => sum + expense,
          0
        ),
      };

      const result = await loanApi.checkEligibility(criteria);
      setEligibilityResult(result);
    } catch (error) {
      console.error("Eligibility check failed:", error);
      setEligibilityResult({
        eligible: false,
        message: "Không thể kiểm tra điều kiện, vui lòng thử lại sau.",
      });
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Calculate total monthly expenses
  const watchedExpenses = form.watch("monthlyExpenses");
  const totalMonthlyExpenses = React.useMemo(() => {
    return Object.values(watchedExpenses || {}).reduce((sum, expense) => sum + (expense || 0), 0);
  }, [watchedExpenses]);

  // Calculate debt-to-income ratio
  const debtToIncomeRatio = React.useMemo(() => {
    const formData = form.getValues();
    const incomeRange = INCOME_RANGES.find(r => r.value === formData.monthlyIncomeRange);
    const monthlyIncome = formData.exactMonthlyIncome || incomeRange?.min || 0;

    if (monthlyIncome === 0) return 0;

    const monthlyDebtPayments =
      (formData.existingLoans.loans?.reduce((sum, loan) => sum + loan.monthlyPayment, 0) || 0) +
      (formData.creditCardInfo.currentBalance || 0) * 0.05; // Assume 5% minimum payment for credit cards

    return Math.round((monthlyDebtPayments / monthlyIncome) * 100);
  }, [form.watch()]);

  // Form submission handler
  const handleSubmit = async (data: FinancialInfoFormData) => {
    try {
      // Add calculated fields
      const enhancedData: FinancialInfoData = {
        ...data,
        // Add any computed fields if needed
      };

      // Update store
      updateFinancialInfo(enhancedData);

      // Call onSubmit prop
      await onSubmit(enhancedData);
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    }
  };

  // Add existing loan
  const addExistingLoan = () => {
    const currentLoans = form.getValues("existingLoans.loans") || [];
    form.setValue("existingLoans.loans", [
      ...currentLoans,
      {
        provider: "",
        outstandingAmount: 0,
        monthlyPayment: 0,
        loanType: "personal",
      },
    ]);
  };

  // Remove existing loan
  const removeExistingLoan = (index: number) => {
    const currentLoans = form.getValues("existingLoans.loans") || [];
    form.setValue(
      "existingLoans.loans",
      currentLoans.filter((_, i) => i !== index)
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("title", "Thông tin tài chính")}
            </CardTitle>
            <CardDescription>
              {t("description", "Vui lòng cung cấp thông tin chi tiết về thu nhập và tình hình tài chính của bạn")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Income Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    {t("incomeInfo", "Thông tin thu nhập")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyIncomeRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("monthlyIncomeRange", "Khoảng thu nhập hàng tháng")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn khoảng thu nhập" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INCOME_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {showExactIncome && (
                      <FormField
                        control={form.control}
                        name="exactMonthlyIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("exactMonthlyIncome", "Thu nhập chính xác (VNĐ)")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="150000000"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="incomeSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("incomeSource", "Nguồn thu nhập chính")} *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            disabled={readOnly || isLoading}
                          >
                            {INCOME_SOURCES.map((source) => {
                              const Icon = source.icon;
                              return (
                                <div key={source.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={source.value} id={source.value} />
                                  <FormLabel htmlFor={source.value} className="font-normal flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {source.label}
                                  </FormLabel>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incomeSourceDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("incomeSourceDetails", "Mô tả chi tiết nguồn thu nhập")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ví dụ: Giảng viên tại Đại học ABC, 5 năm kinh nghiệm"
                            disabled={readOnly || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Bank Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t("bankInfo", "Thông tin ngân hàng")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankInfo.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankName", "Ngân hàng")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn ngân hàng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {banks.map((bank) => (
                                <SelectItem key={bank.code} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankInfo.bankBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankBranch", "Chi nhánh")} *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Chi nhánh Hà Nội"
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankInfo.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("accountNumber", "Số tài khoản")} *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123456789"
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankInfo.accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("accountHolderName", "Tên chủ tài khoản")} *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="NGUYEN VAN A"
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Existing Loans Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("existingLoans", "Khoản vay hiện tại")}
                  </h3>

                  <FormField
                    control={form.control}
                    name="existingLoans.hasExistingLoans"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={readOnly || isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            {t("hasExistingLoans", "Có khoản vay đang hoạt động")}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {showExistingLoans && (
                    <div className="space-y-4">
                      {form.watch("existingLoans.loans")?.map((_, index) => (
                        <Card key={index} className="border-dashed">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Khoản vay #{index + 1}</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeExistingLoan(index)}
                                disabled={readOnly || isLoading}
                              >
                                Xóa
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`existingLoans.loans.${index}.provider`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("provider", "Đơn vị cho vay")} *</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Ngân hàng ABC"
                                        disabled={readOnly || isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`existingLoans.loans.${index}.loanType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("loanType", "Loại vay")} *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Chọn loại vay" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {LOAN_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`existingLoans.loans.${index}.outstandingAmount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("outstandingAmount", "Số tiền dư nợ (VNĐ)")} *</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="50000000"
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        disabled={readOnly || isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`existingLoans.loans.${index}.monthlyPayment`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("monthlyPayment", "Trả hàng tháng (VNĐ)")} *</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="2000000"
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        disabled={readOnly || isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addExistingLoan}
                        disabled={readOnly || isLoading}
                        className="w-full"
                      >
                        + Thêm khoản vay
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Credit Card Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t("creditCardInfo", "Thông tin thẻ tín dụng")}
                  </h3>

                  <FormField
                    control={form.control}
                    name="creditCardInfo.hasCreditCards"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={readOnly || isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            {t("hasCreditCards", "Có thẻ tín dụng")}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {showCreditCards && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="creditCardInfo.cardCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("cardCount", "Số lượng thẻ")} *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                placeholder="2"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="creditCardInfo.totalCreditLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("totalCreditLimit", "Hạn mức tổng (VNĐ)")} *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="100000000"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="creditCardInfo.currentBalance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("currentBalance", "Dư nợ hiện tại (VNĐ)")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="20000000"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Monthly Expenses Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {t("monthlyExpenses", "Chi phí hàng tháng")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyExpenses.housing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            {t("housing", "Chi phí nhà ở (VNĐ)")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="5000000"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthlyExpenses.transportation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            {t("transportation", "Chi phí đi lại (VNĐ)")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="1500000"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthlyExpenses.foodAndUtilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("foodAndUtilities", "Ăn uống & Điện nước (VNĐ)")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="7000000"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthlyExpenses.other"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("other", "Chi phí khác (VNĐ)")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="2000000"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Total Expenses Summary */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{t("totalMonthlyExpenses", "Tổng chi phí hàng tháng")}</span>
                        <span className="text-lg font-semibold">
                          {totalMonthlyExpenses.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Assets Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t("assets", "Tài sản")}
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="assets.hasRealEstate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              {t("hasRealEstate", "Có bất động sản")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("assets.hasRealEstate") && (
                      <FormField
                        control={form.control}
                        name="assets.realEstateDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("realEstateDetails", "Chi tiết bất động sản")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhà ở quận Cầu Giấy, Hà Nội, 120m²"
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="assets.hasVehicle"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              {t("hasVehicle", "Có phương tiện giao thông")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("assets.hasVehicle") && (
                      <FormField
                        control={form.control}
                        name="assets.vehicleDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("vehicleDetails", "Chi tiết phương tiện")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ô tô Toyota Camry 2022"
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="assets.otherAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("otherAssets", "Tài sản khác")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Vàng bạc, cổ phiếu, trái phiếu..."
                              disabled={readOnly || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Financial Summary and Eligibility Check */}
                {(loanAmount || debtToIncomeRatio > 0) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t("financialSummary", "Tóm tắt tài chính")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className={cn(
                        "border-2",
                        debtToIncomeRatio > 50 ? "border-red-200 bg-red-50" :
                        debtToIncomeRatio > 35 ? "border-yellow-200 bg-yellow-50" :
                        "border-green-200 bg-green-50"
                      )}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t("debtToIncomeRatio", "Tỷ lệ nợ/thu nhập")}</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tỷ lệ thanh toán nợ hàng tháng so với thu nhập</p>
                                  <p className="text-xs mt-1">&lt;35%: Tốt | 35-50%: Trung bình | &gt;50%: Cao</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Badge variant={debtToIncomeRatio > 50 ? "destructive" : debtToIncomeRatio > 35 ? "default" : "default"}>
                              {debtToIncomeRatio}%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {loanAmount && (
                        <Card className="border-2 border-blue-200 bg-blue-50">
                          <CardContent className="pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={checkEligibility}
                              disabled={isCheckingEligibility || !form.formState.isValid}
                              className="w-full"
                            >
                              {isCheckingEligibility ? (
                                <span className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  {t("checking", "Đang kiểm tra...")}
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Calculator className="h-4 w-4" />
                                  {t("checkEligibility", "Kiểm tra điều kiện vay")}
                                </span>
                              )}
                            </Button>

                            {eligibilityResult && (
                              <div className="mt-4 p-3 rounded-lg bg-white border">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className={cn(
                                    "h-4 w-4",
                                    eligibilityResult.eligible ? "text-green-600" : "text-red-600"
                                  )} />
                                  <span className="font-medium">
                                    {eligibilityResult.eligible ? "Đủ điều kiện" : "Chưa đủ điều kiện"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {eligibilityResult.message}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {!readOnly && (
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={isLoading || !form.formState.isValid}
                      className="min-w-[120px]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {t("saving", "Đang lưu...")}
                        </span>
                      ) : (
                        t("continue", "Tiếp tục")
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Thông tin thu nhập</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Cung cấp thông tin chính xác để tăng khả năng duyệt vay.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Tài khoản ngân hàng</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Cần thiết để giải ngân khoản vay nếu được duyệt.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Tính toán khả năng vay</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Dựa trên thu nhập và các khoản vay hiện tại.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LoanFinancialInfo;