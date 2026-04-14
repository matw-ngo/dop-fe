/**
 * Consent Management Form Component
 * Vietnamese compliance consent forms
 */

"use client";

import { Download, Eye, FileText, Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ConsentManagementFormProps {
  form: any;
  language: "vi" | "en";
  consentRecords: any[];
}

const ConsentManagementForm: React.FC<ConsentManagementFormProps> = ({
  form,
  language,
  consentRecords,
}) => {
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [showConsentDetails, setShowConsentDetails] = useState(false);

  const { register, setValue, watch } = useFormContext();

  const translations = {
    vi: {
      title: "Đồng ý và bảo mật",
      description: "Thông tin của bạn được bảo vệ theo pháp luật Việt Nam",
      dataProcessing: "Xử lý dữ liệu cá nhân",
      marketing: "Nhận thông tin marketing",
      partnerSharing: "Chia sẻ với đối tác tài chính",
      creditCheck: "Kiểm tra tín dụng",
      dataProcessingText:
        "Tôi đồng ý cho phép xử lý dữ liệu cá nhân của mình theo Thông tư 13/2023/NĐ-CP.",
      marketingText: "Tôi đồng ý nhận thông tin marketing và khuyến mãi.",
      partnerSharingText:
        "Tôi đồng ý chia sẻ thông tin với các đối tác tài chính liên quan.",
      creditCheckText:
        "Tôi đồng ý cho phép kiểm tra lịch sử tín dụng của mình.",
      required: "Bắt buộc",
      optional: "Tùy chọn",
      privacyPolicy: "Chính sách bảo mật",
      termsOfService: "Điều khoản dịch vụ",
      viewDetails: "Xem chi tiết",
      withdrawalRights: "Quyền rút lại đồng ý",
      consentSummary: "Tóm tắt đồng ý",
      noConsents: "Chưa có đồng ý nào được ghi nhận",
    },
    en: {
      title: "Consent and Privacy",
      description: "Your information is protected under Vietnamese law",
      dataProcessing: "Personal Data Processing",
      marketing: "Marketing Information",
      partnerSharing: "Financial Partner Sharing",
      creditCheck: "Credit Check",
      dataProcessingText:
        "I consent to the processing of my personal data according to Decree 13/2023/ND-CP.",
      marketingText:
        "I consent to receive marketing and promotional information.",
      partnerSharingText:
        "I consent to sharing my information with relevant financial partners.",
      creditCheckText: "I consent to a credit history check.",
      required: "Required",
      optional: "Optional",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      viewDetails: "View Details",
      withdrawalRights: "Right to Withdraw Consent",
      consentSummary: "Consent Summary",
      noConsents: "No consents recorded yet",
    },
  };

  const t = translations[language];

  const privacyPolicyText =
    language === "vi"
      ? `Chính sách Bảo mật Dữ liệu Cá nhân
Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo Thông tư 13/2023/NĐ-CP.
• Mục đích thu thập: Xử lý yêu cầu vay vốn
• Phạm vi sử dụng: Chỉ cho mục đích được đồng ý
• Thời gian lưu trữ: Theo quy định pháp luật
• Đối tượng chia sẻ: Đối tác tài chính đã được ủy quyền
• Quyền của bạn: Truy cập, sửa đổi, xóa dữ liệu, rút lại đồng ý`
      : `Personal Data Protection Policy
We are committed to protecting your personal information according to Decree 13/2023/ND-CP.
• Collection Purpose: Loan application processing
• Usage Scope: Only for consented purposes
• Retention Period: As required by law
• Sharing Partners: Authorized financial partners
• Your Rights: Access, modify, delete data, withdraw consent`;

  const consentTypes = [
    {
      key: "dataProcessingConsent",
      label: t.dataProcessing,
      description: t.dataProcessingText,
      required: true,
      icon: Shield,
    },
    {
      key: "marketingConsent",
      label: t.marketing,
      description: t.marketingText,
      required: false,
      icon: FileText,
    },
    {
      key: "partnerSharingConsent",
      label: t.partnerSharing,
      description: t.partnerSharingText,
      required: false,
      icon: Eye,
    },
    {
      key: "creditCheckConsent",
      label: t.creditCheck,
      description: t.creditCheckText,
      required: true,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t.title}</h3>
        <p className="text-gray-600">{t.description}</p>
      </div>

      {/* Privacy Policy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>{t.privacyPolicy}</span>
            </span>
            <Dialog open={showFullPolicy} onOpenChange={setShowFullPolicy}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {t.viewDetails}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t.privacyPolicy}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {privacyPolicyText}
                  </pre>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFullPolicy(false)}
                    >
                      Close
                    </Button>
                    <Button onClick={() => setShowFullPolicy(false)}>
                      {language === "vi" ? "Đã hiểu" : "I Understand"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {language === "vi"
                ? "Dữ liệu cá nhân của bạn sẽ được bảo mật và chỉ sử dụng cho các mục đích đã được đồng ý. Bạn có quyền rút lại đồng ý bất cứ lúc nào."
                : "Your personal data will be kept confidential and used only for consented purposes. You have the right to withdraw consent at any time."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        {consentTypes.map((consent) => {
          const Icon = consent.icon;
          return (
            <Card
              key={consent.key}
              className="border-2 hover:border-blue-200 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="pt-1">
                    <Checkbox
                      id={consent.key}
                      checked={watch(`consent.${consent.key}`)}
                      onCheckedChange={(checked) =>
                        setValue(`consent.${consent.key}`, checked)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={consent.key}
                        className="font-medium flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{consent.label}</span>
                        {consent.required && (
                          <Badge variant="destructive" className="ml-2">
                            {t.required}
                          </Badge>
                        )}
                        {!consent.required && (
                          <Badge variant="secondary" className="ml-2">
                            {t.optional}
                          </Badge>
                        )}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {consent.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legal Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {language === "vi"
            ? "Bằng việc đánh dấu vào các ô trên, bạn xác nhận đã đọc, hiểu và đồng ý với các điều khoản trên. Việc cung cấp thông tin không bắt buộc, nhưng một số đồng ý là bắt buộc để xử lý yêu cầu của bạn."
            : "By checking the boxes above, you confirm that you have read, understood, and agree to the terms. Providing information is not mandatory, but some consents are required to process your request."}
        </AlertDescription>
      </Alert>

      {/* Consent Summary */}
      {consentRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{t.consentSummary}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConsentDetails(!showConsentDetails)}
              >
                {showConsentDetails ? "Hide" : "Show"} Details
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {consentRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={record.consentGiven ? "default" : "secondary"}
                    >
                      {record.type}
                    </Badge>
                    <span className="text-sm">
                      {record.consentGiven
                        ? language === "vi"
                          ? "Đã đồng ý"
                          : "Consented"
                        : language === "vi"
                          ? "Từ chối"
                          : "Declined"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(record.consentTimestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Rights */}
      <Card>
        <CardHeader>
          <CardTitle>{t.withdrawalRights}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {language === "vi"
              ? "Bạn có quyền rút lại đồng ý bất cứ lúc nào bằng cách liên hệ với chúng tôi qua email hoặc hotline. Chúng tôi sẽ xử lý yêu cầu của bạn trong vòng 24 giờ."
              : "You have the right to withdraw consent at any time by contacting us via email or hotline. We will process your request within 24 hours."}
          </p>
          <div className="mt-4 flex space-x-2">
            <Button variant="outline" size="sm">
              {language === "vi" ? "Liên hệ hỗ trợ" : "Contact Support"}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              {language === "vi" ? "Tải về bản sao" : "Download Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentManagementForm;
