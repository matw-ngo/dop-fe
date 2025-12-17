import { Calculator, Check, FileText, Send, Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InsuranceQuoteData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  occupation: string;
  sumInsured: string;
  coveragePeriod: string;
}

export interface GeneratedQuote {
  id: string;
  product: string;
  category: string;
  premium: number;
  coverage: number;
  period: string;
  validUntil: string;
  customerData: InsuranceQuoteData;
}

interface InsuranceQuotationProps {
  productSlug: string;
  category: string;
  onQuoteGenerated: (quote: GeneratedQuote) => void;
  onPurchase: (quote: GeneratedQuote) => void;
}

export const InsuranceQuotation: React.FC<InsuranceQuotationProps> = ({
  productSlug,
  category,
  onQuoteGenerated,
  onPurchase,
}) => {
  const [formData, setFormData] = useState<InsuranceQuoteData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    occupation: "",
    sumInsured: "",
    coveragePeriod: "1",
  });

  const [showQuote, setShowQuote] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(
    null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate mock quote
    const quote: GeneratedQuote = {
      id: `quote-${Date.now()}`,
      product: productSlug,
      category,
      premium: Math.floor(Math.random() * 5000000) + 1000000,
      coverage: parseInt(formData.sumInsured) || 100000000,
      period: formData.coveragePeriod,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customerData: formData,
    };

    setGeneratedQuote(quote);
    setShowQuote(true);
    onQuoteGenerated(quote);
  };

  const handlePurchase = () => {
    if (generatedQuote) {
      onPurchase(generatedQuote);
    }
  };

  if (showQuote && generatedQuote) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Báo giá đã được tạo!
            </h2>
            <p className="text-gray-600">
              Đây là báo giá tùy chỉnh cho yêu cầu của bạn
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Chi tiết báo giá</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền bảo hiểm:</span>
                <span className="font-medium">
                  {generatedQuote.coverage.toLocaleString("vi-VN")} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí bảo hiểm:</span>
                <span className="font-medium text-green-600">
                  {generatedQuote.premium.toLocaleString("vi-VN")} VND/năm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời hạn bảo hiểm:</span>
                <span className="font-medium">{generatedQuote.period} năm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hiệu lực đến:</span>
                <span className="font-medium">
                  {new Date(generatedQuote.validUntil).toLocaleDateString(
                    "vi-VN",
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1" size="lg" onClick={handlePurchase}>
              <Send className="w-4 h-4 mr-2" />
              Mua bảo hiểm
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowQuote(false);
                setGeneratedQuote(null);
              }}
            >
              Tạo báo giá mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Yêu cầu báo giá bảo hiểm
          </h2>
          <p className="text-gray-600">
            Điền thông tin để nhận báo giá chi tiết
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Giới tính *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="occupation">Nghề nghiệp *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Insurance Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin bảo hiểm</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sumInsured">Số tiền bảo hiểm (VND) *</Label>
                <Input
                  id="sumInsured"
                  type="number"
                  placeholder="100000000"
                  value={formData.sumInsured}
                  onChange={(e) =>
                    setFormData({ ...formData, sumInsured: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="coveragePeriod">Thời hạn bảo hiểm *</Label>
                <Select
                  value={formData.coveragePeriod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, coveragePeriod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 năm</SelectItem>
                    <SelectItem value="5">5 năm</SelectItem>
                    <SelectItem value="10">10 năm</SelectItem>
                    <SelectItem value="20">20 năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <FileText className="w-4 h-4 mr-2" />
            Nhận báo giá ngay
          </Button>
        </form>
      </div>
    </div>
  );
};

export default InsuranceQuotation;
