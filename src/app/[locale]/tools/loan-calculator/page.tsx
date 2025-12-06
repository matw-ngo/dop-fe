/**
 * Loan Calculator Page
 *
 * Page for calculating loan payments, interest, and amortization schedule
 */

import { LoanCalculator } from "@/components/tools";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tính toán khoản vay | Công cụ tính toán vay vốn",
  description:
    "Công cụ tính toán khoản vay miễn phí và dễ sử dụng. Tính toán các khoản thanh toán hàng tháng, tổng lãi suất và lịch trình trả nợ cho khoản vay của bạn.",
  keywords: [
    "tính toán khoản vay",
    "tính khoản vay",
    "lịch trả nợ",
    "lãi suất vay",
  ],
};

export default function LoanCalculatorPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/vi">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/vi/tools">Công cụ tài chính</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tính toán khoản vay</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Tính Toán Khoản Vay
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Công cụ tính toán khoản vay miễn phí và dễ sử dụng. Tính toán các
          khoản thanh toán hàng tháng, tổng lãi suất và lịch trình trả nợ cho
          khoản vay của bạn.
        </p>
      </div>

      {/* Calculator Component */}
      <LoanCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lưu ý quan trọng</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Lãi suất có thể thay đổi tùy thuộc vào chính sách của ngân hàng
            </li>
            <li>
              • Lãi suất hiển thị là lãi suất danh nghĩa, lãi suất thực tế có
              thể khác
            </li>
            <li>
              • Khoản thanh toán chỉ bao gồm gốc và lãi, không bao gồm các loại
              phí khác
            </li>
            <li>
              • Các loại khoản vay khác nhau có thể có lãi suất và điều kiện
              khác nhau
            </li>
            <li>• Nên kiểm tra kỹ các điều khoản và điều kiện trước khi vay</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Các loại vay phổ biến</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Vay mua nhà:</strong> Lãi suất thấp, kỳ hạn dài, thế
              chấp bất động sản
            </li>
            <li>
              • <strong>Vay mua xe:</strong> Lãi suất trung bình, kỳ hạn 5-8
              năm, thế chấp xe
            </li>
            <li>
              • <strong>Vay tiêu dùng:</strong> Lãi suất cao hơn, không cần thế
              chấp, thủ tục nhanh
            </li>
            <li>
              • <strong>Vay kinh doanh:</strong> Lãi suất tùy thuộc vào phương
              án kinh doanh, cần bảo lãnh
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
