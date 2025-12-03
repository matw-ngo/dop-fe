// Loan Personal Information Component
// Vietnamese-specific personal information form for loan applications

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "@/lib/utils/debounce";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, MapPin, Phone, Mail, IdCard, Home, Users } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { loanApi } from "@/lib/api/endpoints/loans";
import { useLoanApplicationStore } from "@/store/use-loan-store";
import { createAccessibleFieldProps, formAccessibility, keyboardNavigation } from "@/lib/utils/accessibility";
import type { PersonalInfoData, VietnameseAddress } from "@/types/forms/loan-form";

/**
 * Vietnamese validation schemas
 */
const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không quá 100 ký tự")
    .regex(
      /^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]+$/,
      "Họ và tên chỉ được chứa chữ cái và khoảng trắng"
    ),
  dateOfBirth: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      return actualAge >= 18 && actualAge <= 65;
    }, "Độ tuổi phải từ 18 đến 65 tuổi"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  nationalId: z
    .string()
    .length(12, "Số CCCD phải có đúng 12 số")
    .regex(/^[0-9]+$/, "CCCD chỉ được chứa số"),
  nationalIdIssueDate: z
    .string()
    .min(1, "Vui lòng chọn ngày cấp"),
  nationalIdIssuePlace: z
    .string()
    .min(1, "Vui lòng nhập nơi cấp")
    .max(100, "Nơi cấp không quá 100 ký tự"),
  phoneNumber: z
    .string()
    .regex(/^(03[2-9]|05[6-9]|07[0-9]|08[1-9]|09[0-9])[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không quá 100 ký tự"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"], {
    required_error: "Vui lòng chọn tình trạng hôn nhân",
  }),
  dependentsCount: z
    .number()
    .min(0, "Số người phụ thuộc không âm")
    .max(20, "Số người phụ thuộc không quá 20"),
  educationLevel: z.enum(["high_school", "college", "university", "postgraduate", "other"], {
    required_error: "Vui lòng chọn trình độ học vấn",
  }),
  residenceStatus: z.enum(["owner", "renter", "family", "other"], {
    required_error: "Vui lòng chọn tình trạng nhà ở",
  }),
  currentAddress: z.object({
    street: z.string().min(1, "Vui lòng nhập địa chỉ").max(200, "Địa chỉ không quá 200 ký tự"),
    provinceCode: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    districtCode: z.string().min(1, "Vui lòng chọn quận/huyện"),
    wardCode: z.string().min(1, "Vui lòng chọn phường/xã"),
    provinceName: z.string(),
    districtName: z.string(),
    wardName: z.string(),
  }),
  sameAsCurrentAddress: z.boolean(),
  permanentAddress: z.object({
    street: z.string().optional(),
    provinceCode: z.string().optional(),
    districtCode: z.string().optional(),
    wardCode: z.string().optional(),
    provinceName: z.string().optional(),
    districtName: z.string().optional(),
    wardName: z.string().optional(),
  }).optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

/**
 * Loan Personal Information Component Props
 */
interface LoanPersonalInfoProps {
  /** Initial form data */
  initialData?: Partial<PersonalInfoData>;
  /** Form submission handler */
  onSubmit: (data: PersonalInfoData) => void | Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Read-only mode */
  readOnly?: boolean;
}

/**
 * LoanPersonalInfo Component
 */
export const LoanPersonalInfo: React.FC<LoanPersonalInfoProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  className,
  readOnly = false,
}) => {
  const t = useTranslations("loan.personalInfo");
  const [provinces, setProvinces] = useState<VietnameseAddress["province"][]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [showPermanentAddress, setShowPermanentAddress] = useState(false);

  const { updatePersonalInfo, getFieldValue } = useLoanApplicationStore();

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      gender: "male",
      nationalId: "",
      nationalIdIssueDate: "",
      nationalIdIssuePlace: "",
      phoneNumber: "",
      email: "",
      maritalStatus: "single",
      dependentsCount: 0,
      educationLevel: "high_school",
      residenceStatus: "owner",
      currentAddress: {
        street: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
        provinceName: "",
        districtName: "",
        wardName: "",
      },
      sameAsCurrentAddress: true,
      permanentAddress: {
        street: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
        provinceName: "",
        districtName: "",
        wardName: "",
      },
      ...initialData,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await loanApi.getProvinces();
        setProvinces(data || []);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  const handleProvinceChange = async (provinceCode: string, addressType: "current" | "permanent") => {
    try {
      const data = await loanApi.getDistricts(provinceCode);

      if (addressType === "current") {
        setDistricts(data || []);
        form.setValue("currentAddress.districtCode", "");
        form.setValue("currentAddress.wardCode", "");
        form.setValue("currentAddress.provinceName", provinces.find(p => p.code === provinceCode)?.name || "");
      } else {
        // For permanent address, you might want separate state
        form.setValue("permanentAddress.districtCode", "");
        form.setValue("permanentAddress.wardCode", "");
        form.setValue("permanentAddress.provinceName", provinces.find(p => p.code === provinceCode)?.name || "");
      }
    } catch (error) {
      console.error("Failed to load districts:", error);
    }
  };

  // Load wards when district changes
  const handleDistrictChange = async (districtCode: string, addressType: "current" | "permanent") => {
    try {
      const data = await loanApi.getWards(districtCode);

      if (addressType === "current") {
        setWards(data || []);
        form.setValue("currentAddress.wardCode", "");
        form.setValue("currentAddress.districtName", districts.find(d => d.code === districtCode)?.name || "");
      } else {
        form.setValue("permanentAddress.wardCode", "");
        form.setValue("permanentAddress.districtName", districts.find(d => d.code === districtCode)?.name || "");
      }
    } catch (error) {
      console.error("Failed to load wards:", error);
    }
  };

  // Handle same as current address toggle
  const handleSameAsCurrentChange = (same: boolean) => {
    setShowPermanentAddress(!same);
    if (same) {
      form.setValue("permanentAddress", undefined);
    }
  };

  // Form submission handler
  const handleSubmit = async (data: PersonalInfoFormData) => {
    try {
      const personalInfoData: PersonalInfoData = {
        ...data,
        permanentAddress: data.sameAsCurrentAddress ? undefined : data.permanentAddress,
      };

      // Update store
      updatePersonalInfo(personalInfoData);

      // Call onSubmit prop
      await onSubmit(personalInfoData);
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    }
  };

  // Debounced real-time store updates
  const watchedValues = form.watch();
  const debouncedUpdatePersonalInfo = useCallback(
    debounce((data: Partial<PersonalInfoData>) => {
      updatePersonalInfo(data);
    }, 1000), // 1 second debounce
    [updatePersonalInfo]
  );

  useEffect(() => {
    // Update store with form data in a debounced manner
    debouncedUpdatePersonalInfo(watchedValues as Partial<PersonalInfoData>);
  }, [watchedValues, debouncedUpdatePersonalInfo]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdatePersonalInfo.cancel();
    };
  }, [debouncedUpdatePersonalInfo]);

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("title", "Thông tin cá nhân")}
          </CardTitle>
          <CardDescription>
            {t("description", "Vui lòng cung cấp đầy đủ và chính xác thông tin cá nhân của bạn")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("basicInfo", "Thông tin cơ bản")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => {
                      const fieldId = 'full-name';
                      const error = form.formState.errors.fullName?.message;
                      const accessibleProps = createAccessibleFieldProps(
                        fieldId,
                        'Họ và tên',
                        error,
                        undefined,
                        true
                      );

                      return (
                        <FormItem>
                          <FormLabel htmlFor={fieldId}>{t("fullName", "Họ và tên")} *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              {...accessibleProps}
                              placeholder="Nguyễn Văn A"
                              disabled={readOnly || isLoading}
                              aria-invalid={!!error}
                            />
                          </FormControl>
                          {error && (
                            <FormMessage role="alert" aria-live="polite">
                              {error}
                            </FormMessage>
                          )}
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dateOfBirth", "Ngày sinh")} *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={readOnly || isLoading}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "dd/MM/yyyy", { locale: vi })
                                ) : (
                                  <span>DD/MM/YYYY</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("gender", "Giới tính")} *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-6"
                            disabled={readOnly || isLoading}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <FormLabel htmlFor="male" className="font-normal">
                                {t("male", "Nam")}
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <FormLabel htmlFor="female" className="font-normal">
                                {t("female", "Nữ")}
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <FormLabel htmlFor="other" className="font-normal">
                                {t("other", "Khác")}
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("maritalStatus", "Tình trạng hôn nhân")} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tình trạng hôn nhân" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Độc thân</SelectItem>
                            <SelectItem value="married">Đã kết hôn</SelectItem>
                            <SelectItem value="divorced">Ly hôn</SelectItem>
                            <SelectItem value="widowed">Góa bụa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* National ID Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  {t("nationalId", "Căn cước công dân")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("nationalId", "Số CCCD")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="001234567890"
                            maxLength={12}
                            disabled={readOnly || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationalIdIssueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("issueDate", "Ngày cấp")} *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={readOnly || isLoading}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "dd/MM/yyyy", { locale: vi })
                                ) : (
                                  <span>DD/MM/YYYY</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationalIdIssuePlace"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t("issuePlace", "Nơi cấp")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Cục Cảnh sát quản lý hành chính về trật tự xã hội"
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

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t("contactInfo", "Thông tin liên hệ")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("phoneNumber", "Số điện thoại")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="09xxxxxxxx"
                            disabled={readOnly || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email", "Email")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="email@example.com"
                            type="email"
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

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("additionalInfo", "Thông tin bổ sung")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dependentsCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dependentsCount", "Số người phụ thuộc")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="20"
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
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("educationLevel", "Trình độ học vấn")} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trình độ học vấn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high_school">Trung học phổ thông</SelectItem>
                            <SelectItem value="college">Cao đẳng</SelectItem>
                            <SelectItem value="university">Đại học</SelectItem>
                            <SelectItem value="postgraduate">Sau đại học</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residenceStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("residenceStatus", "Tình trạng nhà ở")} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly || isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tình trạng nhà ở" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="owner">Chủ sở hữu</SelectItem>
                            <SelectItem value="renter">Thuê nhà</SelectItem>
                            <SelectItem value="family">Ở cùng gia đình</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("addressInfo", "Địa chỉ")}
                </h3>

                {/* Current Address */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {t("currentAddress", "Địa chỉ hiện tại")} *
                  </h4>

                  <FormField
                    control={form.control}
                    name="currentAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("street", "Địa chỉ cụ thể")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Số 123, đường ABC, phường XYZ"
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
                      name="currentAddress.provinceCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("province", "Tỉnh/Thành phố")} *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleProvinceChange(value, "current");
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
                      name="currentAddress.districtCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("district", "Quận/Huyện")} *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleDistrictChange(value, "current");
                            }}
                            defaultValue={field.value}
                            disabled={readOnly || isLoading || !form.watch("currentAddress.provinceCode")}
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
                      name="currentAddress.wardCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ward", "Phường/Xã")} *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("currentAddress.wardName", wards.find(w => w.code === value)?.name || "");
                            }}
                            defaultValue={field.value}
                            disabled={readOnly || isLoading || !form.watch("currentAddress.districtCode")}
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

                {/* Same as Current Address */}
                <FormField
                  control={form.control}
                  name="sameAsCurrentAddress"
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
                          {t("sameAsCurrentAddress", "Địa chỉ thường trùng với địa chỉ hiện tại")}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Permanent Address (if different) */}
                {!form.watch("sameAsCurrentAddress") && (
                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {t("permanentAddress", "Địa chỉ thường trú")} *
                    </h4>

                    <FormField
                      control={form.control}
                      name="permanentAddress.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("street", "Địa chỉ cụ thể")} *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Số 456, đường DEF, phường GHI"
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
                        name="permanentAddress.provinceCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("province", "Tỉnh/Thành phố")} *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProvinceChange(value, "permanent");
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
                        name="permanentAddress.districtCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("district", "Quận/Huyện")} *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleDistrictChange(value, "permanent");
                              }}
                              defaultValue={field.value}
                              disabled={readOnly || isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn quận/huyện" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* For permanent address, you'd need separate state or API call */}
                                <SelectItem value="">Chọn quận/huyện</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permanentAddress.wardCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("ward", "Phường/Xã")} *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly || isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn phường/xã" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Chọn phường/xã</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <IdCard className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Thông tin CCCD</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Cung cấp thông tin CCCD chính xác để quá trình xác định danh tục hiện.
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
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Địa chỉ cư trú</h4>
                <p className="text-sm text-green-700 mt-1">
                  Địa chỉ chính xác giúp chúng tôi xác minh thông tin nhanh hơn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanPersonalInfo;