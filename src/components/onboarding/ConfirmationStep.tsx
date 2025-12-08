"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import apiClient from "@/lib/api/client";
import { toCreateLeadRequest } from "@/mappers/onboardingMapper";
import type { components } from "@/lib/api/v1.d.ts";

type CreateLeadResponseBody = components["schemas"]["CreateLeadResponseBody"];

interface ConfirmationStepProps {
  formData: Record<string, any>;
  flowId: string;
  stepId: string;
  domain?: string;
  onSuccess?: () => void;
  isSubmitting?: boolean;
}

export function ConfirmationStep({
  formData,
  flowId,
  stepId,
  domain = "",
  onSuccess,
  isSubmitting = false,
}: ConfirmationStepProps) {
  const [submitting, setSubmitting] = useState(isSubmitting);
  const t = useTranslations("onboarding.confirm");
  const tForm = useTranslations("form");

  // Dữ liệu nằm trực tiếp trong formData, không trong nested objects
  const basicInfo = formData || {};
  const ekycInfo = formData.ekycVerification || {};

  const handleSubmit = async () => {
    if (!flowId || !stepId) {
      toast.error(t("errors.missingInfo"));
      return;
    }

    try {
      setSubmitting(true);

      const payload = toCreateLeadRequest(formData, flowId, stepId, domain);

      // Make API call to create lead
      const { data, error } = await apiClient.POST("/leads", {
        body: payload,
      });

      if (error) {
        toast.error(t("errors.submitError"));
        return;
      }

      if (data) {
        toast.success(t("success.submitSuccess"));

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      toast.error(t("errors.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("vi-VN");
  };

  // Get label for select fields
  const getGenderLabel = (value: string) => {
    const labels: Record<string, string> = {
      male: t("genderOptions.male"),
      female: t("genderOptions.female"),
      other: t("genderOptions.other"),
    };
    return labels[value] || value;
  };

  const getCityLabel = (value: string) => {
    const labels: Record<string, string> = {
      hanoi: t("cityOptions.hanoi"),
      hcm: t("cityOptions.hcm"),
      danang: t("cityOptions.danang"),
      haiphong: t("cityOptions.haiphong"),
      cantho: t("cityOptions.cantho"),
    };
    return labels[value] || value;
  };

  const getOccupationLabel = (value: string) => {
    const labels: Record<string, string> = {
      employee: t("occupationOptions.employee"),
      business: t("occupationOptions.business"),
      freelancer: t("occupationOptions.freelancer"),
      student: t("occupationOptions.student"),
      other: t("occupationOptions.other"),
    };
    return labels[value] || value;
  };

  const getIncomeLabel = (value: string) => {
    const labels: Record<string, string> = {
      under5: t("incomeOptions.under5"),
      "5to10": t("incomeOptions.5to10"),
      "10to20": t("incomeOptions.10to20"),
      "20to50": t("incomeOptions.20to50"),
      above50: t("incomeOptions.above50"),
    };
    return labels[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("personalInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {tForm("fields.fullName.label")}
              </label>
              <p className="mt-1 text-base font-semibold text-foreground">
                {basicInfo.fullName || "N/A"}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {tForm("fields.email.label")}
              </label>
              <p className="mt-1 text-base text-foreground">
                {basicInfo.email || "N/A"}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {tForm("fields.phoneNumber.label")}
              </label>
              <p className="mt-1 text-base text-foreground">
                {basicInfo.phoneNumber || "N/A"}
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {tForm("fields.dateOfBirth.label")}
              </label>
              <p className="mt-1 text-base text-foreground">
                {formatDate(basicInfo.dateOfBirth)}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {tForm("fields.gender.label")}
              </label>
              <p className="mt-1 text-base text-foreground">
                {getGenderLabel(basicInfo.gender)}
              </p>
            </div>

            {/* National ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {tForm("fields.nationalId.label")}
              </label>
              <p className="mt-1 text-base text-foreground">
                {basicInfo.nationalId || "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Purpose */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {tForm("fields.purpose.label")}
            </label>
            <p className="mt-1 text-base text-foreground">
              {basicInfo.purpose || "N/A"}
            </p>
          </div>

          <Separator />

          {/* Review */}
          {basicInfo.review && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("personalInfo.notes")}
              </label>
              <p className="mt-1 text-base text-foreground">
                {basicInfo.review}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* eKYC Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            {t("ekyc.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ekycInfo.ekycVerification?.completed ? (
            <div className="flex items-center gap-3">
              <Badge className="text-sm py-1.5 px-3 bg-primary/10 text-primary hover:bg-primary/10">
                ✓ {t("ekyc.verified")}
              </Badge>
              {ekycInfo.ekycVerification.sessionId && (
                <div className="text-sm text-muted-foreground">
                  {t("ekyc.sessionId")}:{" "}
                  <span className="font-mono text-xs">
                    {ekycInfo.ekycVerification.sessionId}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <Badge variant="destructive" className="text-sm py-1.5 px-3">
              ✗ {t("ekyc.notVerified")}
            </Badge>
          )}

          {ekycInfo.ekycVerification?.timestamp && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("ekyc.verifiedAt")}:{" "}
              {new Date(ekycInfo.ekycVerification.timestamp).toLocaleString(
                "vi-VN",
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Lưu ý quan trọng
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Thông tin của bạn sẽ được lưu trữ an toàn và bảo mật</li>
              <li>• Chúng tôi sẽ xem xét hồ sơ trong vòng 24-48 giờ</li>
              <li>• Bạn sẽ nhận được thông báo qua email và SMS</li>
            </ul>
          </div>
        </div>
      </div> */}

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 text-base font-semibold"
          size="lg"
        >
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </div>

      {/* Action Notice */}
      {/* <div className="text-center text-sm text-gray-600 pt-4">
        <p>
          Bằng cách nhấn "Hoàn tất", bạn đồng ý với{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Chính sách bảo mật
          </a>
        </p>
      </div> */}
    </div>
  );
}
