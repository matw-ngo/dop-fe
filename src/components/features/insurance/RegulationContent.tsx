"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Gavel,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Regulation data structure
const regulationsData = {
  basic: {
    title: "Quy định cơ bản",
    description: "Các quy định pháp luật cơ bản về bảo hiểm",
    icon: BookOpen,
    items: [
      {
        id: "luat-kd-bh-2022",
        title: "Luật Kinh doanh bảo hiểm 2022",
        summary:
          "Luật sửa đổi, bổ sung một số điều của Luật Kinh doanh bảo hiểm số 08/2022/QH15",
        issuedDate: "16/06/2022",
        effectiveDate: "01/01/2023",
        authority: "Quốc hội",
        type: "Luật",
        status: "hiệu lực",
        content: {
          highlights: [
            "Bổ sung quy định về bảo hiểm trong lĩnh vực nông nghiệp công nghệ cao",
            "Quy định về bảo hiểm sức khỏe theo yêu cầu",
            "Quy định về quỹ dự phòng phòng chống rủi ro",
            "Chế tài xử phạt vi phạm trong kinh doanh bảo hiểm",
          ],
          keyPoints: [
            "Mở rộng đối tượng được tham gia bảo hiểm",
            "Bảo vệ quyền lợi người tham gia bảo hiểm",
            "Tăng cường quản lý nhà nước về bảo hiểm",
          ],
        },
        documents: [
          { name: "Văn bản gốc", type: "PDF", url: "#" },
          { name: "Tổng hợp nội dung", type: "DOC", url: "#" },
        ],
      },
      {
        id: "nghi-dinh-46-2023",
        title: "Nghị định 46/2023/NĐ-CP",
        summary: "Quy định chi tiết một số điều của Luật Kinh doanh bảo hiểm",
        issuedDate: "01/07/2023",
        effectiveDate: "01/09/2023",
        authority: "Chính phủ",
        type: "Nghị định",
        status: "hiệu lực",
        content: {
          highlights: [
            "Quy định về điều kiện kinh doanh bảo hiểm",
            "Quy trình giải quyết khiếu nại bồi thường",
            "Quy định về quản lý rủi ro doanh nghiệp bảo hiểm",
            "Trách nhiệm của doanh nghiệp bảo hiểm",
          ],
          keyPoints: [
            "Tăng cường bảo vệ người tiêu dùng",
            "Minh bạch trong hoạt động kinh doanh",
            "Quy định về sản phẩm bảo hiểm mới",
          ],
        },
        documents: [{ name: "Nghị định 46/2023/NĐ-CP", type: "PDF", url: "#" }],
      },
    ],
  },
  compulsory: {
    title: "Bảo hiểm bắt buộc",
    description: "Quy định về các loại bảo hiểm bắt buộc tại Việt Nam",
    icon: Shield,
    items: [
      {
        id: "thong-tu-04-2021",
        title: "Thông tư 04/2021/TT-BTC",
        summary:
          "Quy định về mức phí, mức trách nhiệm bảo hiểm bắt buộc TNDS xe cơ giới",
        issuedDate: "15/03/2021",
        effectiveDate: "01/06/2021",
        authority: "Bộ Tài chính",
        type: "Thông tư",
        status: "hiệu lực",
        content: {
          highlights: [
            "Mức phí bảo hiểm bắt buộc TNDS",
            "Mức trách nhiệm bồi thường tối thiểu",
            "Quy định về hợp đồng bảo hiểm",
            "Thủ tục bồi thường",
          ],
          feeTable: {
            cars: [
              { type: "Ô tô con đến 9 chỗ", fee: "437.000 VNĐ/năm" },
              { type: "Ô tô con từ 10-16 chỗ", fee: "794.000 VNĐ/năm" },
              { type: "Ô tô con từ 17-29 chỗ", fee: "1.449.000 VNĐ/năm" },
              { type: "Ô tô con trên 29 chỗ", fee: "2.248.000 VNĐ/năm" },
            ],
            motorcycles: [
              { type: "Xe máy dưới 100cm³", fee: "66.000 VNĐ/năm" },
              { type: "Xe máy từ 100cm³ trở lên", fee: "66.000 VNĐ/năm" },
              { type: "Xe mô tô ba bánh", fee: "290.000 VNĐ/năm" },
            ],
          },
        },
        documents: [
          { name: "Thông tư 04/2021/TT-BTC", type: "PDF", url: "#" },
          { name: "Biểu phí chi tiết", type: "XLS", url: "#" },
        ],
      },
      {
        id: "nghi-dinh-03-2021",
        title: "Nghị định 03/2021/NĐ-CP",
        summary: "Quy định chi tiết một số nội dung về kinh doanh bảo hiểm",
        issuedDate: "01/02/2021",
        effectiveDate: "15/03/2021",
        authority: "Chính phủ",
        type: "Nghị định",
        status: "hiệu lực",
        content: {
          highlights: [
            "Quy định về bảo hiểm bắt buộc TNDS",
            "Điều kiện kinh doanh bảo hiểm",
            "Quyền và nghĩa vụ của bên mua bảo hiểm",
            "Trách nhiệm của doanh nghiệp bảo hiểm",
          ],
          penalties: [
            "Không tham gia bảo hiểm bắt buộc: Phạt tiền từ 400.000 - 600.000 VNĐ",
            "Không mang theo Giấy chứng nhận bảo hiểm: Phạt tiền 100.000 - 200.000 VNĐ",
            "Không xuất trình Giấy chứng nhận bảo hiểm: Phạt tiền 80.000 - 120.000 VNĐ",
          ],
        },
        documents: [{ name: "Nghị định 03/2021/NĐ-CP", type: "PDF", url: "#" }],
      },
    ],
  },
  compensation: {
    title: "Quy định bồi thường",
    description: "Quy trình và mức bồi thường các loại bảo hiểm",
    icon: Gavel,
    items: [
      {
        id: "quy-trinh-boi-thuong",
        title: "Quy trình bồi thường bảo hiểm xe cơ giới",
        summary:
          "Thủ tục và quy trình giải quyết bồi thường khi xảy ra tai nạn",
        issuedDate: "01/01/2023",
        effectiveDate: "hiệu lực",
        authority: "Hiệp hội Bảo hiểm Việt Nam",
        type: "Hướng dẫn",
        status: "hiệu lực",
        content: {
          process: [
            {
              step: 1,
              title: "Báo cáo tai nạn",
              description:
                "Thông báo ngay cho công ty bảo hiểm và cơ quan chức năng",
              timeframe: "Trong vòng 24 giờ",
              documents: ["Giấy báo cáo tai nạn", "Biên bản hiện trường"],
            },
            {
              step: 2,
              title: "Hoàn thiện hồ sơ",
              description: "Chuẩn bị đầy đủ giấy tờ cần thiết",
              timeframe: "Trong vòng 5 ngày",
              documents: [
                "Giấy chứng nhận bảo hiểm",
                "Giấy đăng ký xe",
                "Giấy phép lái xe",
              ],
            },
            {
              step: 3,
              title: "Giám định tổn thất",
              description: "Đối chiếu và xác định mức độ thiệt hại",
              timeframe: "Trong vòng 7 ngày",
              documents: ["Hình ảnh hiện trường", "Hóa đơn sửa chữa dự kiến"],
            },
            {
              step: 4,
              title: "Phê duyệt bồi thường",
              description: "Công ty bảo hiểm xem xét và ra quyết định",
              timeframe: "Trong vòng 15 ngày",
              documents: ["Quyết định bồi thường", "Hợp đồng thỏa thuận"],
            },
            {
              step: 5,
              title: "Chi trả bồi thường",
              description: "Thực hiện thanh toán số tiền bồi thường",
              timeframe: "Trong vòng 3 ngày sau phê duyệt",
              documents: ["Phiếu chi", "Biên bản bàn giao"],
            },
          ],
          compensationLimits: {
            personal: "100.000.000 VNĐ/vụ tai nạn/1 người",
            property: "50.000.000 VNĐ/vụ tai nạn về tài sản",
            thirdParty: "Không giới hạn số vụ tai nạn trong năm",
          },
        },
        documents: [
          { name: "Biểu mẫu báo cáo tai nạn", type: "DOC", url: "#" },
          { name: "Quy trình chi tiết", type: "PDF", url: "#" },
        ],
      },
    ],
  },
  sanctions: {
    title: "Chế tài xử phạt",
    description: "Các quy định về xử phạt vi phạm trong lĩnh vực bảo hiểm",
    icon: AlertTriangle,
    items: [
      {
        id: "nghi-dinh-100-2021",
        title: "Nghị định 100/2021/NĐ-CP",
        summary:
          "Quy định xử phạt vi phạm hành chính trong lĩnh vực giao thông đường bộ và đường sắt",
        issuedDate: "01/09/2021",
        effectiveDate: "15/10/2021",
        authority: "Chính phủ",
        type: "Nghị định",
        status: "hiệu lực",
        content: {
          violations: [
            {
              description:
                "Người điều khiển xe không có giấy chứng nhận bảo hiểm TNDS bắt buộc xe cơ giới",
              penalty: "Phạt tiền từ 400.000 VNĐ đến 600.000 VNĐ",
              additional:
                "Tịch thu phương tiện trong 7 ngày nếu không có bảo hiểm",
            },
            {
              description: "Không mang theo giấy chứng nhận bảo hiểm",
              penalty: "Phạt tiền từ 100.000 VNĐ đến 200.000 VNĐ",
              additional: "",
            },
            {
              description: "Không xuất trình được giấy chứng nhận bảo hiểm",
              penalty: "Phạt tiền từ 80.000 VNĐ đến 120.000 VNĐ",
              additional: "",
            },
            {
              description:
                "Doanh nghiệp bảo hiểm vi phạm quy định về kinh doanh",
              penalty: "Phạt tiền từ 10.000.000 VNĐ đến 50.000.000 VNĐ",
              additional: "Có thể bị đình chỉ hoạt động",
            },
          ],
        },
        documents: [
          { name: "Nghị định 100/2021/NĐ-CP", type: "PDF", url: "#" },
        ],
      },
    ],
  },
};

export default function RegulationContent() {
  const t = useTranslations("insurance");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "basic",
    "compulsory",
  ]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleDownload = (documentName: string) => {
    toast.success(
      t("regulations.download.started", { document: documentName }),
    );
  };

  const filteredRegulations = Object.entries(regulationsData)
    .map(([key, category]) => {
      const filteredItems = category.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      return { ...category, key, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gavel className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("regulations.title")}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {t("regulations.description")}
          </p>
        </div>
      </div>

      {/* Search and Info */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("regulations.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("regulations.importantNotice")}</AlertTitle>
          <AlertDescription>
            {t("regulations.importantNoticeDesc")}
          </AlertDescription>
        </Alert>
      </div>

      {/* Regulation Categories */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {filteredRegulations.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(category.key);

          return (
            <Card key={category.key}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.key)}
              >
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-xl">
                            {category.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {category.items.map((item) => {
                      const isItemExpanded = expandedItems.includes(item.id);
                      const statusColor =
                        item.status === "hiệu lực"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800";

                      return (
                        <div key={item.id} className="border rounded-lg">
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleItem(item.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {item.title}
                                  </h3>
                                  <Badge className={statusColor}>
                                    {item.status}
                                  </Badge>
                                  <Badge variant="outline">{item.type}</Badge>
                                </div>
                                <p className="text-gray-600">{item.summary}</p>
                              </div>
                              {isItemExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {item.authority}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Ban hành: {item.issuedDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Hiệu lực: {item.effectiveDate}
                              </div>
                            </div>
                          </div>

                          <CollapsibleContent>
                            <div className="px-4 pb-4">
                              {/* Content sections based on regulation type */}
                              {item.content.highlights && (
                                <div className="mb-6">
                                  <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    {t("regulations.highlights")}
                                  </h4>
                                  <ul className="space-y-2">
                                    {item.content.highlights.map(
                                      (highlight: string, index: number) => (
                                        <li
                                          key={index}
                                          className="flex items-start gap-3"
                                        >
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                          <span className="text-sm text-gray-700">
                                            {highlight}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {item.content.feeTable && (
                                <div className="mb-6">
                                  <h4 className="font-semibold text-base mb-3">
                                    {t("regulations.feeTable")}
                                  </h4>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">
                                        Ô tô
                                      </h5>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-[60%]">
                                              Loại xe
                                            </TableHead>
                                            <TableHead>Phí</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.content.feeTable.cars.map(
                                            (fee: any, index: number) => (
                                              <TableRow key={index}>
                                                <TableCell className="text-sm">
                                                  {fee.type}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">
                                                  {fee.fee}
                                                </TableCell>
                                              </TableRow>
                                            ),
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">
                                        Xe máy
                                      </h5>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-[60%]">
                                              Loại xe
                                            </TableHead>
                                            <TableHead>Phí</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.content.feeTable.motorcycles.map(
                                            (fee: any, index: number) => (
                                              <TableRow key={index}>
                                                <TableCell className="text-sm">
                                                  {fee.type}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">
                                                  {fee.fee}
                                                </TableCell>
                                              </TableRow>
                                            ),
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.content.process && (
                                <div className="mb-6">
                                  <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {t("regulations.process")}
                                  </h4>
                                  <div className="space-y-4">
                                    {item.content.process.map(
                                      (step: any, index: number) => (
                                        <div key={index} className="flex gap-4">
                                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                            {step.step}
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-medium text-gray-900">
                                              {step.title}
                                            </h5>
                                            <p className="text-sm text-gray-600 mt-1">
                                              {step.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                              <span>⏱️ {step.timeframe}</span>
                                              {step.documents && (
                                                <span>
                                                  📄 {step.documents.join(", ")}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {item.content.violations && (
                                <div className="mb-6">
                                  <h4 className="font-semibold text-base mb-3">
                                    {t("regulations.violations")}
                                  </h4>
                                  <div className="space-y-3">
                                    {item.content.violations.map(
                                      (violation: any, index: number) => (
                                        <div
                                          key={index}
                                          className="border rounded-lg p-3"
                                        >
                                          <p className="text-sm font-medium text-gray-900 mb-1">
                                            {violation.description}
                                          </p>
                                          <p className="text-sm text-red-600 font-medium">
                                            {violation.penalty}
                                          </p>
                                          {violation.additional && (
                                            <p className="text-xs text-gray-600 mt-1">
                                              {violation.additional}
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              {item.documents && item.documents.length > 0 && (
                                <div className="mt-6 pt-4 border-t">
                                  <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    {t("regulations.documents")}
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {item.documents.map(
                                      (doc: any, index: number) => (
                                        <Button
                                          key={index}
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center gap-2"
                                          onClick={() =>
                                            handleDownload(doc.name)
                                          }
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {doc.name}
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {doc.type}
                                          </Badge>
                                        </Button>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {filteredRegulations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("regulations.noResults")}
            </h3>
            <p className="text-gray-600">{t("regulations.noResultsDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
