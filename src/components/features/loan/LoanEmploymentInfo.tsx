// Loan Employment Information Component
// Vietnamese-specific employment information form for loan applications

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Briefcase,
  Building2,
  Users,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  MapPin,
  FileText,
  GraduationCap,
  Clock,
  TrendingUp,
  AlertCircle,
  Info,
  Building,
  User,
  Globe
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { loanApi } from "@/lib/api/endpoints/loans";
import { useLoanApplicationStore } from "@/store/use-loan-store";
import type { EmploymentInfoData, VietnameseAddress } from "@/types/forms/loan-form";

/**
 * Vietnamese validation schemas for employment information
 */
const employmentInfoSchema = z.object({
  employmentType: z.enum(["formal", "informal", "self_employed", "retired", "unemployed", "student"], {
    required_error: "Vui lòng chọn loại hình việc làm",
  }),
  employmentStatus: z.enum(["full_time", "part_time", "contract", "freelance", "temporary"], {
    required_error: "Vui lòng chọn tình trạng việc làm",
  }),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  workDuration: z.object({
    years: z.number().min(0, "Số năm không âm").max(50, "Số năm không quá 50"),
    months: z.number().min(0, "Số tháng không âm").max(11, "Số tháng không quá 11"),
    totalYears: z.number().min(0, "Tổng số năm không âm").max(60, "Tổng số năm không quá 60"),
  }),
  workContact: z.object({
    phoneNumber: z.string().optional(),
    email: z.string().email("Email không hợp lệ").optional(),
    website: z.string().url("Website không hợp lệ").optional(),
  }),
  workAddress: z.object({
    street: z.string().optional(),
    provinceCode: z.string().optional(),
    districtCode: z.string().optional(),
    wardCode: z.string().optional(),
    provinceName: z.string().optional(),
    districtName: z.string().optional(),
    wardName: z.string().optional(),
  }).optional(),
  incomeVerification: z.object({
    method: z.enum(["payslip", "bank_statement", "tax_return", "certificate", "other"], {
      required_error: "Vui lòng chọn phương thức xác minh thu nhập",
    }),
    canProvideDocuments: z.boolean(),
    notes: z.string().optional(),
  }),
  businessInfo: z.object({
    businessName: z.string().optional(),
    registrationNumber: z.string().optional(),
    businessType: z.string().optional(),
    yearsInOperation: z.number().min(0, "Số năm hoạt động không âm").max(50, "Số năm hoạt động không quá 50").optional(),
    annualRevenue: z.number().min(0, "Doanh thu không âm").optional(),
    employeeCount: z.number().min(0, "Số nhân viên không âm").max(10000, "Số nhân viên không quá 10000").optional(),
  }).optional(),
}).refine(
  (data) => {
    // If employed, company name is required
    if (["formal", "informal"].includes(data.employmentType) ||
        ["full_time", "part_time", "contract"].includes(data.employmentStatus)) {
      return data.companyName && data.companyName.trim().length > 0;
    }
    return true;
  },
  {
    message: "Vui lòng nhập tên công ty/cơ quan",
    path: ["companyName"],
  }
).refine(
  (data) => {
    // If self-employed, business info is required
    if (data.employmentType === "self_employed") {
      return data.businessInfo?.businessName && data.businessInfo.businessName.trim().length > 0;
    }
    return true;
  },
  {
    message: "Vui lòng cung cấp thông tin kinh doanh",
    path: ["businessInfo.businessName"],
  }
);

type EmploymentInfoFormData = z.infer<typeof employmentInfoSchema>;

/**
 * Vietnamese employment types and options
 */
const EMPLOYMENT_TYPES = [
  { value: "formal", label: "Ngành nghề chính thức", icon: Building },
  { value: "informal", label: "Ngành nghề không chính thức", icon: Users },
  { value: "self_employed", label: "Tự kinh doanh", icon: Briefcase },
  { value: "retired", label: "Nghỉ hưu", icon: Clock },
  { value: "unemployed", label: "Không có việc làm", icon: AlertCircle },
  { value: "student", label: "Sinh viên", icon: GraduationCap },
];

const EMPLOYMENT_STATUS = [
  { value: "full_time", label: "Toàn thời gian" },
  { value: "part_time", label: "Bán thời gian" },
  { value: "contract", label: "Hợp đồng" },
  { value: "freelance", label: "Tự do" },
  { value: "temporary", label: "Tạm thời" },
];

const INCOME_VERIFICATION_METHODS = [
  { value: "payslip", label: "Phiếu lương" },
  { value: "bank_statement", label: "Sao kê ngân hàng" },
  { value: "tax_return", label: "Tờ khai thuế" },
  { value: "certificate", label: "Giấy xác nhận thu nhập" },
  { value: "other", label: "Khác" },
];

const INDUSTRIES = [
  "Công nghệ thông tin",
  "Tài chính - Ngân hàng",
  "Sản xuất - Công nghiệp",
  "Thương mại - Dịch vụ",
  "Giáo dục",
  "Y tế - Chăm sóc sức khỏe",
  "Xây dựng - Bất động sản",
  "Nông nghiệp - Lâm nghiệp",
  "Vận tải - Logistics",
  "Du lịch - Khách sạn",
  "Truyền thông - Marketing",
  "Luật pháp - Pháp lý",
  "Quản lý - Hành chính",
  "Kinh doanh - Bán hàng",
  "Khác",
];

/**
 * Loan Employment Information Component Props
 */
interface LoanEmploymentInfoProps {
  /** Initial form data */
  initialData?: Partial<EmploymentInfoData>;
  /** Form submission handler */
  onSubmit: (data: EmploymentInfoData) => void | Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Read-only mode */
  readOnly?: boolean;
}

/**
 * LoanEmploymentInfo Component
 */
export const LoanEmploymentInfo: React.FC<LoanEmploymentInfoProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  className,
  readOnly = false,
}) => {
  const t = useTranslations("loan.employmentInfo");
  const [provinces, setProvinces] = useState<VietnameseAddress["province"][]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<any[]>([]);
  const [showCompanyInfo, setShowCompanyInfo] = useState(true);
  const [showBusinessInfo, setShowBusinessInfo] = useState(false);
  const [showWorkAddress, setShowWorkAddress] = useState(false);
  const [startDate, setStartDate] = useState<Date>();

  const { updateEmploymentInfo } = useLoanApplicationStore();

  const form = useForm<EmploymentInfoFormData>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      employmentType: "formal",
      employmentStatus: "full_time",
      companyName: "",
      jobTitle: "",
      industry: "",
      workDuration: {
        years: 0,
        months: 0,
        totalYears: 0,
      },
      workContact: {
        phoneNumber: "",
        email: "",
        website: "",
      },
      workAddress: {
        street: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
        provinceName: "",
        districtName: "",
        wardName: "",
      },
      incomeVerification: {
        method: "payslip",
        canProvideDocuments: false,
        notes: "",
      },
      businessInfo: {
        businessName: "",
        registrationNumber: "",
        businessType: "",
        yearsInOperation: 0,
        annualRevenue: undefined,
        employeeCount: 0,
      },
      ...initialData,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Load provinces and employment types on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [provincesData, employmentTypesData] = await Promise.all([
          loanApi.getProvinces(),
          loanApi.getEmploymentTypes(),
        ]);
        setProvinces(provincesData || []);
        setEmploymentTypes(employmentTypesData || EMPLOYMENT_TYPES);
      } catch (error) {
        console.error("Failed to load employment data:", error);
        // Use fallback data
        setEmploymentTypes(EMPLOYMENT_TYPES);
      }
    };
    loadData();
  }, []);

  // Watch employment type to show/hide relevant sections
  const watchedEmploymentType = form.watch("employmentType");
  const watchedEmploymentStatus = form.watch("employmentStatus");

  useEffect(() => {
    const isEmployed = ["formal", "informal"].includes(watchedEmploymentType) ||
                       ["full_time", "part_time", "contract"].includes(watchedEmploymentStatus);
    const isSelfEmployed = watchedEmploymentType === "self_employed";

    setShowCompanyInfo(isEmployed);
    setShowBusinessInfo(isSelfEmployed);

    // Reset irrelevant fields
    if (!isEmployed) {
      form.setValue("companyName", "");
      form.setValue("jobTitle", "");
      form.setValue("industry", "");
    }

    if (!isSelfEmployed) {
      form.setValue("businessInfo", {
        businessName: "",
        registrationNumber: "",
        businessType: "",
        yearsInOperation: 0,
        annualRevenue: undefined,
        employeeCount: 0,
      });
    }
  }, [watchedEmploymentType, watchedEmploymentStatus, form]);

  // Calculate work duration based on start date
  const calculateWorkDuration = (startDate: Date) => {
    const now = new Date();
    const years = now.getFullYear() - startDate.getFullYear();
    const months = now.getMonth() - startDate.getMonth();

    const totalMonths = years * 12 + months;
    const calculatedYears = Math.floor(totalMonths / 12);
    const calculatedMonths = totalMonths % 12;

    form.setValue("workDuration.years", calculatedYears);
    form.setValue("workDuration.months", calculatedMonths);
    form.setValue("workDuration.totalYears", totalMonths / 12);
  };

  // Load districts when province changes
  const handleProvinceChange = async (provinceCode: string) => {
    try {
      const data = await loanApi.getDistricts(provinceCode);
      setDistricts(data || []);
      form.setValue("workAddress.districtCode", "");
      form.setValue("workAddress.wardCode", "");
      form.setValue("workAddress.provinceName", provinces.find(p => p.code === provinceCode)?.name || "");
    } catch (error) {
      console.error("Failed to load districts:", error);
    }
  };

  // Load wards when district changes
  const handleDistrictChange = async (districtCode: string) => {
    try {
      const data = await loanApi.getWards(districtCode);
      setWards(data || []);
      form.setValue("workAddress.wardCode", "");
      form.setValue("workAddress.districtName", districts.find(d => d.code === districtCode)?.name || "");
    } catch (error) {
      console.error("Failed to load wards:", error);
    }
  };

  // Form submission handler
  const handleSubmit = async (data: EmploymentInfoFormData) => {
    try {
      // Add computed fields if needed
      const enhancedData: EmploymentInfoData = {
        ...data,
        // Filter out empty workAddress if not provided
        workAddress: data.workAddress?.street ? data.workAddress : undefined,
        // Filter out businessInfo if not self-employed
        businessInfo: data.employmentType === "self_employed" ? data.businessInfo : undefined,
      };

      // Update store
      updateEmploymentInfo(enhancedData);

      // Call onSubmit prop
      await onSubmit(enhancedData);
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    }
  };

  // Calculate total work experience
  const totalWorkExperience = React.useMemo(() => {
    const { years, months } = form.getValues("workDuration");
    return years + months / 12;
  }, [form.watch("workDuration")]);

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t("title", "Thông tin việc làm")}
            </CardTitle>
            <CardDescription>
              {t("description", "Vui lòng cung cấp thông tin chi tiết về công việc và kinh nghiệm làm việc của bạn")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Employment Type Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t("employmentType", "Loại hình việc làm")}
                  </h3>

                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            disabled={readOnly || isLoading}
                          >
                            {EMPLOYMENT_TYPES.map((type) => {
                              const Icon = type.icon;
                              return (
                                <div key={type.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={type.value} id={type.value} />
                                  <FormLabel htmlFor={type.value} className="font-normal flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {type.label}
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
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("employmentStatus", "Tình trạng việc làm")} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tình trạng việc làm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EMPLOYMENT_STATUS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Company Information Section */}
                {showCompanyInfo && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {t("companyInfo", "Thông tin công ty/cơ quan")}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("companyName", "Tên công ty/cơ quan")} *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Công ty TNHH ABC"
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="jobTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("jobTitle", "Chức vụ")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhân viên kinh doanh"
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("industry", "Ngành nghề")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn ngành nghề" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INDUSTRIES.map((industry) => (
                                    <SelectItem key={industry} value={industry}>
                                      {industry}
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
                          name="workDuration.totalYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {t("totalWorkExperience", "Tổng kinh nghiệm làm việc (năm)")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="60"
                                  placeholder="5.5"
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Business Information Section */}
                {showBusinessInfo && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {t("businessInfo", "Thông tin kinh doanh")}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessInfo.businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("businessName", "Tên doanh nghiệp")} *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Cửa hàng thời trang ABC"
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessInfo.registrationNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("registrationNumber", "Mã số đăng ký kinh doanh")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="0123456789"
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessInfo.businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("businessType", "Loại hình kinh doanh")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Bán lẻ - thời trang"
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessInfo.yearsInOperation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("yearsInOperation", "Số năm hoạt động")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="3"
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
                          name="businessInfo.annualRevenue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("annualRevenue", "Doanh thu năm trước (VNĐ)")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  placeholder="1200000000"
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
                          name="businessInfo.employeeCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("employeeCount", "Số nhân viên")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  max="10000"
                                  placeholder="5"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Work Duration Section */}
                {showCompanyInfo && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t("workDuration", "Thời gian làm việc tại công ty hiện tại")}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="workDuration.years"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("years", "Số năm")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  max="50"
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
                          name="workDuration.months"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("months", "Số tháng")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  max="11"
                                  placeholder="6"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  disabled={readOnly || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Tổng thời gian làm việc</span>
                            <Badge variant="secondary">
                              {Math.floor(totalWorkExperience)} năm {Math.round((totalWorkExperience % 1) * 12)} tháng
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                <Separator />

                {/* Work Contact Section */}
                {(showCompanyInfo || showBusinessInfo) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t("workContact", "Thông tin liên hệ công việc")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="workContact.phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {t("workPhoneNumber", "Số điện thoại công việc")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="(028) 3827 1234"
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workContact.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {t("workEmail", "Email công việc")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="nguyenvan@company.com"
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workContact.website"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {t("companyWebsite", "Website công ty")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://company.com"
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="workContact.phoneNumber"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowWorkAddress(!showWorkAddress)}
                              className="w-full md:w-auto"
                              disabled={readOnly || isLoading}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              {showWorkAddress ? "Ẩn địa chỉ làm việc" : "Thêm địa chỉ làm việc"}
                            </Button>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Work Address Section */}
                {showWorkAddress && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t("workAddress", "Địa chỉ làm việc")}
                      </h3>

                      <FormField
                        control={form.control}
                        name="workAddress.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("street", "Địa chỉ cụ thể")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Tầng 5, Tòa nhà ABC, 123 Nguyễn Trãi"
                                disabled={readOnly || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="workAddress.provinceCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("province", "Tỉnh/Thành phố")}</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleProvinceChange(value);
                                }}
                                defaultValue={field.value}
                                disabled={readOnly || isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn tỉnh/thành" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {provinces.map((province) => (
                                    <SelectItem key={province.code} value={province.code}>
                                      {province.nameWithType}
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
                          name="workAddress.districtCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("district", "Quận/Huyện")}</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleDistrictChange(value);
                                }}
                                defaultValue={field.value}
                                disabled={readOnly || isLoading || !form.watch("workAddress.provinceCode")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn quận/huyện" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {districts.map((district) => (
                                    <SelectItem key={district.code} value={district.code}>
                                      {district.nameWithType}
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
                          name="workAddress.wardCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("ward", "Phường/Xã")}</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue("workAddress.wardName", wards.find(w => w.code === value)?.name || "");
                                }}
                                defaultValue={field.value}
                                disabled={readOnly || isLoading || !form.watch("workAddress.districtCode")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn phường/xã" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {wards.map((ward) => (
                                    <SelectItem key={ward.code} value={ward.code}>
                                      {ward.nameWithType}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Income Verification Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("incomeVerification", "Xác minh thu nhập")}
                  </h3>

                  <FormField
                    control={form.control}
                    name="incomeVerification.method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("verificationMethod", "Phương thức xác minh")} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phương thức xác minh" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INCOME_VERIFICATION_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
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
                    name="incomeVerification.canProvideDocuments"
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
                            {t("canProvideDocuments", "Có thể cung cấp giấy tờ xác minh thu nhập")}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incomeVerification.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("verificationNotes", "Ghi chú về xác minh thu nhập")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ví dụ: Có thể cung cấp phiếu lương 6 tháng gần nhất"
                            disabled={readOnly || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                  <h4 className="font-medium text-blue-900">Thông tin việc làm</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Cung cấp thông tin chính xác để chúng tôi đánh giá khả năng tài chính của bạn.
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
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Kinh nghiệm làm việc</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Thời gian làm việc càng dài, khả năng được duyệt vay càng cao.
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
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Xác minh thu nhập</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Cung cấp giấy tờ để chứng minh thu nhập và tăng khả năng được duyệt.
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

export default LoanEmploymentInfo;