/**
 * Net to Gross Calculator Page
 *
 * Page for calculating gross salary from desired net salary in Vietnam
 */

import { NetToGrossCalculator } from "@/components/tools";
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
  title: "Tính lương Net sang Gross | Công cụ tính lương",
  description:
    "Công cụ tính lương từ Net sang Gross chính xác. Xác định mức lương Gross cần đề nghị để đạt được mức lương Net mong muốn sau khi đã trừ các khoản thuế và bảo hiểm.",
  keywords: [
    "tính lương net gross",
    "tính lương đề nghị",
    "tính thuế TNCN ngược",
    "lương gross cần đạt",
  ],
};

export default function NetToGrossCalculatorPage() {
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
            <BreadcrumbPage>Tính lương Net sang Gross</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Tính Lương Net sang Gross
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Công cụ tính lương từ Net sang Gross chính xác. Xác định mức lương
          Gross cần đề nghị để đạt được mức lương Net mong muốn sau khi đã trừ
          các khoản thuế và bảo hiểm.
        </p>
      </div>

      {/* Calculator Component */}
      <NetToGrossCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Hướng dẫn sử dụng</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Nhập mức lương Net mong muốn (số tiền thực nhận)</li>
            <li>• Nhập số người phụ thuộc (nếu có)</li>
            <li>• Chọn khu vực (mức lương tối đa để đóng BHXH)</li>
            <li>• Công cụ sẽ tự động tính mức lương Gross cần đề nghị</li>
            <li>• Kiểm tra chi tiết các khoản trừ để hiểu rõ cấu trúc lương</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lưu ý khi đàm phán lương</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Luôn rõ ràng về lương Gross hay Net khi đàm phán</li>
            <li>• Lương Gross cao hơn 20-30% so với lương Net</li>
            <li>• Cân nhắc các khoản phụ cấp và thưởng khi đàm phán</li>
            <li>
              • Kiểm tra chính sách BHXH của công ty (đủ tối đa hay không)
            </li>
            <li>• Yêu cầu bảng tính lương chi tiết khi nhận offer</li>
          </ul>
        </div>
      </div>

      {/* Example Calculations */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Ví dụ tham khảo</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Lương Net mong muốn
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Lương Gross cần đề nghị
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Tổng các khoản trừ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">10 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  ~12.8 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">~2.8 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  Chưa có người phụ thuộc
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">15 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  ~19.5 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">~4.5 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  Chưa có người phụ thuộc
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">20 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  ~26.5 triệu
                </td>
                <td className="border border-gray-300 px-4 py-2">~6.5 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  Chưa có người phụ thuộc
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">30 triệu</td>
                <td className="border border-gray-300 px-4 py-2">~41 triệu</td>
                <td className="border border-gray-300 px-4 py-2">~11 triệu</td>
                <td className="border border-gray-300 px-4 py-2">
                  Bắt đầu áp dụng thuế suất cao hơn
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          * Số liệu trên chỉ mang tính chất tham khảo, con số thực tế có thể
          thay đổi tùy thuộc vào các yếu tố cụ thể.
        </p>
      </div>

      {/* Tips Section */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          Mẹo khi sử dụng công cụ
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • 💡 Sử dụng công cụ này khi bạn nhận được offer lương Net và muốn
            biết Gross tương ứng
          </li>
          <li>
            • 💡 Khi đàm phán lương, hãy đề nghị mức lương Gross để tránh nhầm
            lẫn
          </li>
          <li>
            • 💡 Đừng quên tính toán các khoản thưởng và phụ cấp khi đàm phán
            tổng thu nhập
          </li>
          <li>
            • 💡 Kiểm tra xem công ty có đóng BHXH trên toàn bộ lương hay không
          </li>
          <li>
            • 💡 Một số công ty có chính sách lương "flexible" với nhiều khoản
            phụ cấp khác nhau
          </li>
        </ul>
      </div>
    </div>
  );
}
