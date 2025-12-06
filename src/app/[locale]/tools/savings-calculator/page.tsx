/**
 * Savings Calculator Page
 *
 * Page for comparing savings interest rates across Vietnamese banks
 */

import { SavingsCalculator } from "@/components/tools";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SavingsCalculatorPage() {
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
            <BreadcrumbPage>Tính lãi tiền gửi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Tính Lãi Tiền Gửi</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          So sánh lãi suất tiền gửi tiết kiệm tại các ngân hàng Việt Nam. Tìm
          kiếm khoản tiết kiệm phù hợp với nhu cầu của bạn với lãi suất tốt
          nhất.
        </p>
      </div>

      {/* Calculator Component */}
      <SavingsCalculator />

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lưu ý quan trọng</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Lãi suất có thể thay đổi tùy thuộc chính sách của từng ngân hàng
            </li>
            <li>
              • Lãi suất hiển thị là lãi suất niêm yết, thực tế có thể khác
            </li>
            <li>• Gửi tiền online thường có lãi suất cao hơn tại quầy</li>
            <li>• Kiểm tra điều kiện rút tiền trước hạn trước khi gửi</li>
            <li>• Cân nhắc gửi tiết kiệm có kỳ hạn để có lãi suất tốt hơn</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Các loại tiết kiệm phổ biến</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Tiết kiệm không kỳ hạn:</strong> Linh hoạt rút tiền
              nhưng lãi suất thấp
            </li>
            <li>
              • <strong>Tiết kiệm có kỳ hạn:</strong> Lãi suất cao hơn, không
              thể rút trước hạn
            </li>
            <li>
              • <strong>Tiết kiệm tích lũy:</strong> Góp thêm hàng tháng với lãi
              suất ưu đãi
            </li>
            <li>
              • <strong>Tiết kiệm siêu ưu đãi:</strong> Số tiền lớn, kỳ hạn dài
              với lãi suất cao nhất
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
