/**
 * Contact Information Form Component
 */

"use client";

import { Building, Clock, Globe, Home, MapPin } from "lucide-react";
import type React from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactInformationFormProps {
  form: any;
  language: "vi" | "en";
}

const PROVINCES = [
  "01",
  "79",
  "30",
  "48",
  "92", // Major cities
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10", // Add all Vietnamese provinces
];

const ContactInformationForm: React.FC<ContactInformationFormProps> = ({
  form,
  language,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const translations = {
    vi: {
      currentAddress: "Địa chỉ hiện tại",
      permanentAddress: "Địa chỉ thường trú",
      province: "Tỉnh/Thành phố",
      district: "Quận/Huyện",
      ward: "Phường/Xã",
      street: "Số nhà, tên đường",
      contactPreferences: "Thông tin liên hệ",
      preferredMethod: "Phương thức liên hệ ưu tiên",
      phone: "Điện thoại",
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      contactTime: "Thời gian liên hệ",
      morning: "Buổi sáng",
      afternoon: "Buổi chiều",
      evening: "Buổi tối",
      timezone: "Múi giờ",
      sameAsPermanent: "Giống địa chỉ thường trú",
    },
    en: {
      currentAddress: "Current Address",
      permanentAddress: "Permanent Address",
      province: "Province/City",
      district: "District",
      ward: "Ward",
      street: "Street Address",
      contactPreferences: "Contact Preferences",
      preferredMethod: "Preferred Contact Method",
      phone: "Phone",
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      contactTime: "Preferred Contact Time",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      timezone: "Timezone",
      sameAsPermanent: "Same as permanent address",
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      {/* Current Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>{t.currentAddress}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.province} *</Label>
            <Select
              onValueChange={(value) =>
                setValue("currentAddress.provinceCode", value)
              }
            >
              <SelectTrigger
                className={
                  (errors.currentAddress as any)?.provinceCode
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder={t.province} />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(errors.currentAddress as any)?.provinceCode && (
              <p className="text-sm text-red-600">
                {(errors.currentAddress as any).provinceCode.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.district} *</Label>
            <Select
              onValueChange={(value) =>
                setValue("currentAddress.districtCode", value)
              }
            >
              <SelectTrigger
                className={
                  (errors.currentAddress as any)?.districtCode
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder={t.district} />
              </SelectTrigger>
              <SelectContent>
                {/* District options based on province */}
                <SelectItem value="001">Quận 1</SelectItem>
                <SelectItem value="002">Quận 2</SelectItem>
              </SelectContent>
            </Select>
            {(errors.currentAddress as any)?.districtCode && (
              <p className="text-sm text-red-600">
                {(errors.currentAddress as any).districtCode.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.ward} *</Label>
            <Select
              onValueChange={(value) =>
                setValue("currentAddress.wardCode", value)
              }
            >
              <SelectTrigger
                className={
                  (errors.currentAddress as any)?.wardCode
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder={t.ward} />
              </SelectTrigger>
              <SelectContent>
                {/* Ward options based on district */}
                <SelectItem value="0001">Phường 1</SelectItem>
                <SelectItem value="0002">Phường 2</SelectItem>
              </SelectContent>
            </Select>
            {(errors.currentAddress as any)?.wardCode && (
              <p className="text-sm text-red-600">
                {(errors.currentAddress as any).wardCode.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.street} *</Label>
            <Input
              type="text"
              placeholder="123 Nguyễn Huệ"
              {...register("currentAddress.street")}
              className={
                (errors.currentAddress as any)?.street ? "border-red-500" : ""
              }
            />
            {(errors.currentAddress as any)?.street && (
              <p className="text-sm text-red-600">
                {(errors.currentAddress as any).street.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Home className="w-5 h-5" />
          <span>{t.permanentAddress}</span>
        </h3>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="sameAsPermanent"
            onCheckedChange={(checked) => {
              if (checked) {
                const current = watch("currentAddress");
                setValue("permanentAddress", current);
              }
            }}
          />
          <Label htmlFor="sameAsPermanent">{t.sameAsPermanent}</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.province}</Label>
            <Select
              onValueChange={(value) =>
                setValue("permanentAddress.provinceCode", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t.province} />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Similar fields for permanent address */}
        </div>
      </div>

      {/* Contact Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>{t.contactPreferences}</span>
        </h3>

        <div className="space-y-2">
          <Label>{t.preferredMethod} *</Label>
          <RadioGroup
            defaultValue="phone"
            onValueChange={(value) =>
              setValue("contactPreferences.preferredContactMethod", value)
            }
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phone" id="contact-phone" />
              <Label htmlFor="contact-phone">{t.phone}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="contact-email" />
              <Label htmlFor="contact-email">{t.email}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="contact-sms" />
              <Label htmlFor="contact-sms">{t.sms}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="contact-whatsapp" />
              <Label htmlFor="contact-whatsapp">{t.whatsapp}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.contactTime}</Label>
            <Select
              onValueChange={(value) =>
                setValue("contactPreferences.contactTime", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t.contactTime} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t.morning}</SelectItem>
                <SelectItem value="afternoon">{t.afternoon}</SelectItem>
                <SelectItem value="evening">{t.evening}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.timezone}</Label>
            <Select
              defaultValue="Asia/Ho_Chi_Minh"
              onValueChange={(value) =>
                setValue("contactPreferences.timezone", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Ho_Chi_Minh">
                  Asia/Ho_Chi_Minh (UTC+7)
                </SelectItem>
                <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformationForm;
