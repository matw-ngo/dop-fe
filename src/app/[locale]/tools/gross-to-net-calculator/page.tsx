/**
 * Gross to Net Calculator Page
 *
 * Page for calculating net salary from gross salary in Vietnam
 */

import { GrossToNetCalculator } from "@/components/tools";
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
  title: "Tính lương Gross sang Net | Công cụ tính lương",
  description:
    "Công cụ tính lương từ Gross sang Net chính xác theo quy định pháp luật Việt Nam. Tính toán thuế thu nhập cá nhân, bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp.",
  keywords: [
    "tính lương gross net",
    "tính thuế TNCN",
    "tính lương thực nhận",
    "bảo hiểm xã hội",
  ],
};

export default function GrossToNetCalculatorPage() {
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
            <BreadcrumbPage>Tính lương Gross sang Net</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Tính Lương Gross sang Net
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Công cụ tính lương từ Gross sang Net chính xác theo quy định pháp luật
          Việt Nam. Tính toán thuế thu nhập cá nhân, bảo hiểm xã hội, bảo hiểm y
          tế, bảo hiểm thất nghiệp.
        </p>
      </div>

      {/* Calculator Component */}
      <GrossToNetCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Giải thích các khoản trích</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>BHXH (8%):</strong> Bảo hiểm xã hội, tính trên mức lương
              tối đa 20倍地区平均工资
            </li>
            <li>
              • <strong>BHYT (1.5%):</strong> Bảo hiểm y tế, tính trên toàn bộ
              lương
            </li>
            <li>
              • <strong>BHTN (1%):</strong> Bảo hiểm thất nghiệp, tính trên mức
              lương tối đa 20倍地区平均工资
            </li>
            <li>
              • <strong>TNCN:</strong> Thuế thu nhập cá nhân, áp dụng biểu thuế
              lũy tiến
            </li>
            <li>
              • <strong>Giảm trừ gia cảnh:</strong> 11 triệu/người (bản thân) +
              4.4 triệu/người phụ thuộc
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lưu ý quan trọng</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Lương Gross là tổng thu nhập trước khi trừ các khoản bảo hiểm và
              thuế
            </li>
            <li>
              • Lương Net là số tiền thực nhận sau khi đã trừ tất cả các khoản
              bắt buộc
            </li>
            <li>• Mức lương đóng bảo hiểm xã hội có giới hạn tối đa</li>
            <li>• Biểu thuế TNCN áp dụng theo bậc thuế lũy tiến từng phần</li>
            <li>• Công cụ tính toán đã cập nhật theo quy định mới nhất</li>
          </ul>
        </div>
      </div>

      {/* Tax Rates Table */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          Biểu thuế thu nhập cá nhân (áp dụng từ 2020)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Bậc
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Thu nhập chịu thuế/tháng
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Thuế suất
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">
                  Đến 5 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">5%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">
                  Trên 5 đến 10 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">10%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">3</td>
                <td className="border border-gray-300 px-4 py-2">
                  Trên 10 đến 18 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">15%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">4</td>
                <td className="border border-gray-300 px-4 py-2">
                  Trên 18 đến 32 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">20%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">5</td>
                <td className="border border-gray-300 px-4 py-2">
                  Trên 32 đến 52 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">25%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">6</td>
                <td className="border border-gray-300 px-4 py-2">
                  Trên 52 đến 80 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">30%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">7</td>
                <td className="border border-gray-300 px-4 py-2">
                  Trên 80 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">35%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
