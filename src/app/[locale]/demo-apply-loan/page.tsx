"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplyLoanForm from "@/components/loan-application/ApplyLoanForm";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

function DemoContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏦 Demo Form Đăng Ký Vay Tiền
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Đây là trang demo để hiển thị component ApplyLoanForm. Form này
              cho phép người dùng nhập thông tin khoản vay và số điện thoại để
              nhận OTP.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold text-center">
              Đơn Đăng Ký Vay Tiền
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ApplyLoanForm />
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Số tiền linh hoạt
                </h3>
                <p className="text-sm text-gray-600">
                  Chọn số tiền vay từ 5 đến 90 triệu VNĐ
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Kỳ hạn đa dạng
                </h3>
                <p className="text-sm text-gray-600">
                  Lựa chọn kỳ hạn trả góp từ 3 đến 36 tháng
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Bảo mật OTP
                </h3>
                <p className="text-sm text-gray-600">
                  Xác thực danh tính qua mã OTP gửi đến điện thoại
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-yellow-900 mb-3">
              📝 Hướng dẫn sử dụng demo:
            </h3>
            <ol className="space-y-2 text-sm text-yellow-800">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>
                  Sử dụng slider để chọn số tiền vay mong muốn (5-90 triệu VNĐ)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Chọn kỳ hạn vay (3-36 tháng)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Chọn mục đích vay từ danh sách có sẵn</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>Đồng ý với điều khoản sử dụng</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">5.</span>
                <span>
                  Nhập số điện thoại (chỉ hỗ trợ các nhà mạng Việt Nam)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">6.</span>
                <span>Nhận và nhập mã OTP để xác thực</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DemoApplyLoanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải trang demo...</p>
          </div>
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}
