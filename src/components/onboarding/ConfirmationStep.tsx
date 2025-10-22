"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

interface ConfirmationStepProps {
  formData: Record<string, any>;
}

export function ConfirmationStep({ formData }: ConfirmationStepProps) {
  console.log("\n".repeat(3));
  console.log("[CONFIRMATION] ekycInfo", formData);
  console.log("\n".repeat(3));
  const basicInfo = formData["basic-Ifo"] || {};
  const ekycInfo = formData["ekycVerification"] || {};

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
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return labels[value] || value;
  };

  const getCityLabel = (value: string) => {
    const labels: Record<string, string> = {
      hanoi: "Hà Nội",
      hcm: "TP. Hồ Chí Minh",
      danang: "Đà Nẵng",
      haiphong: "Hải Phòng",
      cantho: "Cần Thơ",
    };
    return labels[value] || value;
  };

  const getOccupationLabel = (value: string) => {
    const labels: Record<string, string> = {
      employee: "Nhân viên văn phòng",
      business: "Kinh doanh",
      freelancer: "Tự do",
      student: "Sinh viên",
      other: "Khác",
    };
    return labels[value] || value;
  };

  const getIncomeLabel = (value: string) => {
    const labels: Record<string, string> = {
      under5: "Dưới 5 triệu",
      "5to10": "5 - 10 triệu",
      "10to20": "10 - 20 triệu",
      "20to50": "20 - 50 triệu",
      above50: "Trên 50 triệu",
    };
    return labels[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Xác nhận thông tin
        </h2>
        <p className="text-gray-600">
          Vui lòng kiểm tra lại thông tin trước khi hoàn tất đăng ký
        </p>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-500">
                Họ và tên
              </label>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {basicInfo.fullName || "N/A"}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="mt-1 text-base text-gray-900">
                {basicInfo.email || "N/A"}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Số điện thoại
              </label>
              <p className="mt-1 text-base text-gray-900">
                {basicInfo.phone || "N/A"}
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Ngày sinh
              </label>
              <p className="mt-1 text-base text-gray-900">
                {formatDate(basicInfo.dateOfBirth)}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-medium text-gray-500">
                Giới tính
              </label>
              <p className="mt-1 text-base text-gray-900">
                {getGenderLabel(basicInfo.gender)}
              </p>
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Tỉnh/Thành phố
              </label>
              <p className="mt-1 text-base text-gray-900">
                {getCityLabel(basicInfo.city)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-500">
              Địa chỉ hiện tại
            </label>
            <p className="mt-1 text-base text-gray-900">
              {basicInfo.address || "N/A"}
            </p>
          </div>

          <Separator />

          {/* Occupation & Income */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                Nghề nghiệp
              </label>
              <p className="mt-1 text-base text-gray-900">
                {getOccupationLabel(basicInfo.occupation)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Thu nhập hàng tháng
              </label>
              <p className="mt-1 text-base text-gray-900">
                {getIncomeLabel(basicInfo.monthlyIncome)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* eKYC Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Xác thực danh tính
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ekycInfo.ekycVerification?.completed ? (
            <div className="flex items-center gap-3">
              <Badge className="text-sm py-1.5 px-3 bg-green-100 text-green-800 hover:bg-green-100">
                ✓ Đã xác thực
              </Badge>
              {ekycInfo.ekycVerification.sessionId && (
                <div className="text-sm text-gray-600">
                  Session ID:{" "}
                  <span className="font-mono text-xs">
                    {ekycInfo.ekycVerification.sessionId}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <Badge variant="destructive" className="text-sm py-1.5 px-3">
              ✗ Chưa xác thực
            </Badge>
          )}

          {ekycInfo.ekycVerification?.timestamp && (
            <p className="mt-2 text-sm text-gray-500">
              Xác thực lúc:{" "}
              {new Date(ekycInfo.ekycVerification.timestamp).toLocaleString(
                "vi-VN",
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
      </div>

      {/* Action Notice */}
      <div className="text-center text-sm text-gray-600 pt-4">
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
      </div>
    </div>
  );
}
