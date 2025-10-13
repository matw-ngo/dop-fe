"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Phone, Clock, Home } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [applicationData, setApplicationData] = useState<any>(null);

  useEffect(() => {
    // Get data from URL params or localStorage
    const appId = searchParams?.get("appId");
    const email = searchParams?.get("email");

    if (appId && email) {
      setApplicationData({
        applicationId: appId,
        email: email,
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🎉 Đăng ký thành công!
          </h1>
          <p className="text-xl text-gray-600">
            Hồ sơ của bạn đã được gửi thành công
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {applicationData?.applicationId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mã hồ sơ của bạn</p>
                <p className="text-2xl font-bold text-blue-700 font-mono">
                  {applicationData.applicationId}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Vui lòng lưu mã này để tra cứu trạng thái hồ sơ
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Thời gian xử lý
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Chúng tôi sẽ xem xét hồ sơ của bạn trong vòng{" "}
                    <strong>24-48 giờ</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Thông báo qua Email
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Bạn sẽ nhận được email xác nhận và cập nhật trạng thái tại{" "}
                    <span className="font-medium text-blue-600">
                      {applicationData?.email || "email của bạn"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Thông báo qua SMS
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Chúng tôi cũng sẽ gửi SMS thông báo kết quả xét duyệt
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Các bước tiếp theo
            </h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
                  1
                </span>
                <span>Kiểm tra email để xác nhận đăng ký</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
                  2
                </span>
                <span>Chờ đội ngũ của chúng tôi xem xét hồ sơ (24-48 giờ)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
                  3
                </span>
                <span>Nhận thông báo kết quả qua email và SMS</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
                  4
                </span>
                <span>
                  Nếu được chấp thuận, bạn có thể bắt đầu vay tiền ngay
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Vui lòng kiểm tra cả hộp thư spam/junk</li>
                <li>• Giữ điện thoại luôn bật để nhận thông báo</li>
                <li>• Không cần nộp thêm giấy tờ trừ khi được yêu cầu</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button variant="default" className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Link href="/check-status" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Kiểm tra trạng thái hồ sơ
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">Cần hỗ trợ?</p>
          <p>
            Email:{" "}
            <a
              href="mailto:support@lending.com"
              className="text-blue-600 hover:underline"
            >
              support@lending.com
            </a>{" "}
            | Hotline:{" "}
            <a href="tel:1900xxxx" className="text-blue-600 hover:underline">
              1900 xxxx
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
