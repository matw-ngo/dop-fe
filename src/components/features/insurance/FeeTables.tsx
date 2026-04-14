"use client";

import {
  Bike,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Info,
  Search,
  Shield,
  Tractor,
  Truck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Fee data for compulsory insurance
const compulsoryFees = {
  cars: [
    {
      vehicleType: "Ô tô con đến 9 chỗ",
      baseFee: 437000,
      unit: "xe/năm",
      description: "Kể cả xe ô tô chở người kéo rơ-moóc",
      note: "",
    },
    {
      vehicleType: "Ô tô con từ 10-16 chỗ",
      baseFee: 794000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Ô tô con từ 17-29 chỗ",
      baseFee: 1449000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Ô tô con trên 29 chỗ",
      baseFee: 2248000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
  ],
  trucks: [
    {
      vehicleType: "Xe tải dưới 2 tấn",
      baseFee: 1006000,
      unit: "xe/năm",
      description: "Kể cả xe ô tô kỹ thuật kéo rơ-moóc",
      note: "",
    },
    {
      vehicleType: "Xe tải từ 2-3.5 tấn",
      baseFee: 1249000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Xe tải từ 3.5-7.5 tấn",
      baseFee: 1567000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Xe tải từ 7.5-12 tấn",
      baseFee: 1885000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Xe tải trên 12 tấn",
      baseFee: 2203000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
  ],
  motorcycles: [
    {
      vehicleType: "Xe mô tô hai bánh, xe gắn máy",
      baseFee: 66000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Xe mô tô ba bánh",
      baseFee: 290000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
  ],
  specialized: [
    {
      vehicleType: "Máy kéo",
      baseFee: 358000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
    {
      vehicleType: "Xe chuyên dùng",
      baseFee: 1249000,
      unit: "xe/năm",
      description: "",
      note: "",
    },
  ],
};

// Fee data for voluntary insurance
const voluntaryFees = {
  material: [
    {
      coverage: "Thiệt hại vật chất xe",
      coverageMin: 50000000,
      coverageMax: 1000000000,
      rate: "1.2% - 2.0%",
      basePremium: "Tối thiểu 1.500.000 VNĐ/năm",
      description: "Phí tùy thuộc vào giá trị xe, loại xe, mục đích sử dụng",
    },
    {
      coverage: "Thiệt hại vật chất xe (hàng hóa)",
      coverageMin: 100000000,
      coverageMax: 5000000000,
      rate: "1.0% - 1.8%",
      basePremium: "Tối thiểu 3.000.000 VNĐ/năm",
      description: "Đối với xe vận chuyển hàng hóa",
    },
  ],
  personal: [
    {
      coverage: "Tai nạn người trên xe",
      coverageMin: 10000000,
      coverageMax: 100000000,
      rate: "0.1% - 0.3%",
      basePremium: "Từ 200.000 VNĐ/năm",
      description: "Chế độ bồi thường cho lái xe và hành khách",
    },
    {
      coverage: "Bảo hiểm tài xế",
      coverageMin: 50000000,
      coverageMax: 300000000,
      rate: "0.2% - 0.5%",
      basePremium: "Từ 300.000 VNĐ/năm",
      description: "Chế độ đặc biệt cho lái xe",
    },
  ],
  thirdParty: [
    {
      coverage: "Trách nhiệm dân sự thứ ba",
      coverageMin: 100000000,
      coverageMax: 3000000000,
      rate: "0.5% - 1.0%",
      basePremium: "Từ 1.000.000 VNĐ/năm",
      description:
        "Bồi thường thiệt hại cho bên thứ three ngoài phạm vi bắt buộc",
    },
  ],
};

// Regulation information
const regulations = [
  {
    title: "Thông tư 04/2021/TT-BTC",
    issuedDate: "15/03/2021",
    effectiveDate: "01/06/2021",
    description:
      "Quy định về mức phí, mức thưởng, phí dịch vụ, thẩm quyền, thẩm định và ký hợp đồng bảo hiểm",
    authority: "Bộ Tài chính",
  },
  {
    title: "Nghị định 03/2021/NĐ-CP",
    issuedDate: "01/02/2021",
    effectiveDate: "15/03/2021",
    description: "Quy định chi tiết một số nội dung về kinh doanh bảo hiểm",
    authority: "Chính phủ",
  },
  {
    title: "Luật Kinh doanh bảo hiểm 2022",
    issuedDate: "16/06/2022",
    effectiveDate: "01/01/2023",
    description:
      "Luật sửa đổi, bổ sung một số điều của Luật Kinh doanh bảo hiểm",
    authority: "Quốc hội",
  },
];

export default function FeeTables() {
  const t = useTranslations("features.insurance.main");
  const [searchQuery, setSearchQuery] = useState("");
  const [_selectedCategory, _setSelectedCategory] = useState("all");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "compulsory",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleExport = (format: string) => {
    toast.success(t("feeTables.export.success", { format }));
  };

  const filteredCompulsoryFees = {
    cars: compulsoryFees.cars.filter((fee) =>
      fee.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    trucks: compulsoryFees.trucks.filter((fee) =>
      fee.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    motorcycles: compulsoryFees.motorcycles.filter((fee) =>
      fee.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    specialized: compulsoryFees.specialized.filter((fee) =>
      fee.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("feeTables.title")}
            </h1>
          </div>
          <p className="text-lg text-gray-600">{t("feeTables.description")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("feeTables.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t("feeTables.exportPDF")}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Compulsory Insurance Fees */}
        <Card>
          <Collapsible
            open={expandedSections.includes("compulsory")}
            onOpenChange={() => toggleSection("compulsory")}
          >
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle>{t("feeTables.compulsory.title")}</CardTitle>
                      <CardDescription>
                        {t("feeTables.compulsory.description")}
                      </CardDescription>
                    </div>
                  </div>
                  {expandedSections.includes("compulsory") ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Cars */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    {t("feeTables.compulsory.cars")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("feeTables.table.vehicleType")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.baseFee")}</TableHead>
                        <TableHead>{t("feeTables.table.unit")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompulsoryFees.cars.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.vehicleType}
                          </TableCell>
                          <TableCell>
                            {fee.baseFee.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.unit}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Trucks */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t("feeTables.compulsory.trucks")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("feeTables.table.vehicleType")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.baseFee")}</TableHead>
                        <TableHead>{t("feeTables.table.unit")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompulsoryFees.trucks.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.vehicleType}
                          </TableCell>
                          <TableCell>
                            {fee.baseFee.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.unit}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Motorcycles */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Bike className="h-5 w-5" />
                    {t("feeTables.compulsory.motorcycles")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("feeTables.table.vehicleType")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.baseFee")}</TableHead>
                        <TableHead>{t("feeTables.table.unit")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompulsoryFees.motorcycles.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.vehicleType}
                          </TableCell>
                          <TableCell>
                            {fee.baseFee.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.unit}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Specialized Vehicles */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Tractor className="h-5 w-5" />
                    {t("feeTables.compulsory.specialized")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("feeTables.table.vehicleType")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.baseFee")}</TableHead>
                        <TableHead>{t("feeTables.table.unit")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompulsoryFees.specialized.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.vehicleType}
                          </TableCell>
                          <TableCell>
                            {fee.baseFee.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.unit}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Note */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">
                        {t("feeTables.compulsory.noteTitle")}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t("feeTables.compulsory.note1")}</li>
                        <li>{t("feeTables.compulsory.note2")}</li>
                        <li>{t("feeTables.compulsory.note3")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Voluntary Insurance Fees */}
        <Card>
          <Collapsible
            open={expandedSections.includes("voluntary")}
            onOpenChange={() => toggleSection("voluntary")}
          >
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>{t("feeTables.voluntary.title")}</CardTitle>
                      <CardDescription>
                        {t("feeTables.voluntary.description")}
                      </CardDescription>
                    </div>
                  </div>
                  {expandedSections.includes("voluntary") ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Material Damage */}
                <div>
                  <h4 className="font-semibold text-lg mb-4">
                    {t("feeTables.voluntary.material")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("feeTables.table.coverage")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.coverageLimit")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.rate")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.basePremium")}
                        </TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voluntaryFees.material.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.coverage}
                          </TableCell>
                          <TableCell>
                            {fee.coverageMin.toLocaleString()} -{" "}
                            {fee.coverageMax.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.rate}</TableCell>
                          <TableCell>{fee.basePremium}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Personal Accident */}
                <div>
                  <h4 className="font-semibold text-lg mb-4">
                    {t("feeTables.voluntary.personal")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("feeTables.table.coverage")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.coverageLimit")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.rate")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.basePremium")}
                        </TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voluntaryFees.personal.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.coverage}
                          </TableCell>
                          <TableCell>
                            {fee.coverageMin.toLocaleString()} -{" "}
                            {fee.coverageMax.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.rate}</TableCell>
                          <TableCell>{fee.basePremium}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Third Party Liability */}
                <div>
                  <h4 className="font-semibold text-lg mb-4">
                    {t("feeTables.voluntary.thirdParty")}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("feeTables.table.coverage")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.coverageLimit")}
                        </TableHead>
                        <TableHead>{t("feeTables.table.rate")}</TableHead>
                        <TableHead>
                          {t("feeTables.table.basePremium")}
                        </TableHead>
                        <TableHead>
                          {t("feeTables.table.description")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voluntaryFees.thirdParty.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {fee.coverage}
                          </TableCell>
                          <TableCell>
                            {fee.coverageMin.toLocaleString()} -{" "}
                            {fee.coverageMax.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell>{fee.rate}</TableCell>
                          <TableCell>{fee.basePremium}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {fee.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Note */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">
                        {t("feeTables.voluntary.noteTitle")}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t("feeTables.voluntary.note1")}</li>
                        <li>{t("feeTables.voluntary.note2")}</li>
                        <li>{t("feeTables.voluntary.note3")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Regulations */}
        <Card>
          <Collapsible
            open={expandedSections.includes("regulations")}
            onOpenChange={() => toggleSection("regulations")}
          >
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>{t("feeTables.regulations.title")}</CardTitle>
                      <CardDescription>
                        {t("feeTables.regulations.description")}
                      </CardDescription>
                    </div>
                  </div>
                  {expandedSections.includes("regulations") ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {regulations.map((reg, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg">{reg.title}</h4>
                        <Badge variant="outline">{reg.authority}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {t("feeTables.regulations.issued")}:{" "}
                          </span>
                          <span>{reg.issuedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {t("feeTables.regulations.effective")}:{" "}
                          </span>
                          <span>{reg.effectiveDate}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{reg.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
