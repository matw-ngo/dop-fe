/**
 * Lead Qualification Form Component
 * Basic personal information collection
 */

"use client";

import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LeadQualificationFormProps {
  form: any;
  language: "vi" | "en";
}

const LeadQualificationForm: React.FC<LeadQualificationFormProps> = ({
  form,
  language,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext();

  const dateOfBirth = watch("dateOfBirth");

  const locales = {
    vi: vi,
    en: enUS,
  };

  const translations = {
    vi: {
      fullName: "Họ và tên đầy đủ",
      fullNamePlaceholder: "Nhập họ và tên của bạn",
      dateOfBirth: "Ngày sinh",
      selectDate: "Chọn ngày",
      gender: "Giới tính",
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      nationalId: "Số CMND/CCCD",
      nationalIdPlaceholder: "Nhập 9 hoặc 12 số",
      phoneNumber: "Số điện thoại",
      phoneNumberPlaceholder: "Nhập số điện thoại",
      email: "Email",
      emailPlaceholder: "email@example.com",
      emailOptional: "(không bắt buộc)",
    },
    en: {
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      dateOfBirth: "Date of Birth",
      selectDate: "Select date",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      nationalId: "ID Card/Passport",
      nationalIdPlaceholder: "Enter 9 or 12 digits",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "Enter phone number",
      email: "Email",
      emailPlaceholder: "email@example.com",
      emailOptional: "(optional)",
    },
  };

  const t = translations[language];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue("dateOfBirth", format(date, "yyyy-MM-dd"));
      trigger("dateOfBirth");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-sm font-medium text-gray-700"
          >
            {t.fullName} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder={t.fullNamePlaceholder}
            {...register("fullName")}
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">
              {errors.fullName.message as string}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {t.dateOfBirth} <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !dateOfBirth ? "text-muted-foreground" : ""
                } ${errors.dateOfBirth ? "border-red-500" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? (
                  format(new Date(dateOfBirth), "PPP", {
                    locale: locales[language],
                  })
                ) : (
                  <span>{t.selectDate}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                locale={locales[language]}
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">
              {errors.dateOfBirth.message as string}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {t.gender} <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            defaultValue="male"
            onValueChange={(value) => setValue("gender", value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">{t.male}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">{t.female}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">{t.other}</Label>
            </div>
          </RadioGroup>
          {errors.gender && (
            <p className="text-sm text-red-600">
              {errors.gender.message as string}
            </p>
          )}
        </div>

        {/* National ID */}
        <div className="space-y-2">
          <Label
            htmlFor="nationalId"
            className="text-sm font-medium text-gray-700"
          >
            {t.nationalId} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nationalId"
            type="text"
            placeholder={t.nationalIdPlaceholder}
            {...register("nationalId")}
            className={errors.nationalId ? "border-red-500" : ""}
          />
          {errors.nationalId && (
            <p className="text-sm text-red-600">
              {errors.nationalId.message as string}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700"
          >
            {t.phoneNumber} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder={t.phoneNumberPlaceholder}
            {...register("phoneNumber")}
            className={errors.phoneNumber ? "border-red-500" : ""}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600">
              {errors.phoneNumber.message as string}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t.email} <span className="text-gray-500">{t.emailOptional}</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="text-white text-xs">i</i>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">
              {language === "vi"
                ? "Thông tin quan trọng"
                : "Important Information"}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {language === "vi"
                ? "Thông tin cá nhân của bạn sẽ được bảo mật theo Thông tư 13/2023/NĐ-CP. Chúng tôi chỉ sử dụng thông tin này cho mục đích xử lý yêu cầu vay vốn."
                : "Your personal information will be protected according to Decree 13/2023/ND-CP. We only use this information for loan application processing purposes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadQualificationForm;
