/**
 * Net to Gross Calculator Page
 *
 * Page for calculating gross salary from desired net salary in Vietnam
 */

import { Lightbulb, Target, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { ToolsPageLayout } from "@/components/features/tools/ToolsPageLayout";
import { ToolsThemeProvider } from "@/components/features/tools/ToolsThemeProvider";
import { NetToGrossCalculator } from "@/components/tools";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const t = useTranslations("pages.net-to-gross-calculator");
  const locale = useLocale();

  return (
    <ToolsThemeProvider>
      <ToolsPageLayout
        title={t("title")}
        description={t("description")}
        showHero={false}
        showControls={false}
        showFilters={false}
      >
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t("breadcrumb.home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/tools`}>
                {t("breadcrumb.tools")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("breadcrumb.current")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Calculator Component */}
        <div className="my-12">
          <NetToGrossCalculator />
        </div>

        {/* Information Sections */}
        {/* <div className="space-y-8">
          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guide">Hướng dẫn sử dụng</TabsTrigger>
              <TabsTrigger value="tips">Mẹo đàm phán</TabsTrigger>
              <TabsTrigger value="examples">Ví dụ thực tế</TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {t("guide.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                        1
                      </Badge>
                      <div>
                        <strong>{t("guide.step1.title")}</strong>
                        <p className="text-muted-foreground mt-1">
                          {t("guide.step1.description")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                        2
                      </Badge>
                      <div>
                        <strong>{t("guide.step2.title")}</strong>
                        <p className="text-muted-foreground mt-1">
                          {t("guide.step2.description")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                        3
                      </Badge>
                      <div>
                        <strong>{t("guide.step3.title")}</strong>
                        <p className="text-muted-foreground mt-1">
                          {t("guide.step3.description")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                        4
                      </Badge>
                      <div>
                        <strong>{t("guide.step4.title")}</strong>
                        <p className="text-muted-foreground mt-1">
                          {t("guide.step4.description")}
                        </p>
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    {t("tips.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">
                        {t("tips.negotiation.title")}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span>{t("tips.negotiation.tip1")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span>{t("tips.negotiation.tip2")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span>{t("tips.negotiation.tip3")}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-600">
                        {t("tips.considerations.title")}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{t("tips.considerations.point1")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{t("tips.considerations.point2")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{t("tips.considerations.point3")}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t("examples.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mức lương Net mong muốn</TableHead>
                          <TableHead>Mức lương Gross cần đề nghị</TableHead>
                          <TableHead>Tổng chi phí công ty</TableHead>
                          <TableHead>Ghi chú</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            10 triệu VNĐ
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            12.7 triệu VNĐ
                          </TableCell>
                          <TableCell>14.5 triệu VNĐ</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Mức lương phổ biến cho nhân viên 1-2 năm kinh nghiệm
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            15 triệu VNĐ
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            19.5 triệu VNĐ
                          </TableCell>
                          <TableCell>22.3 triệu VNĐ</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Trưởng nhóm/Chuyên viên
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            20 triệu VNĐ
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            26.3 triệu VNĐ
                          </TableCell>
                          <TableCell>30.1 triệu VNĐ</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Quản lý/Chuyên gia cấp cao
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            30 triệu VNĐ
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            40 triệu VNĐ
                          </TableCell>
                          <TableCell>45.8 triệu VNĐ</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Quản lý cấp cao/Giám đốc
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Lưu ý:</strong> Mức lương Gross đã bao gồm các
                      khoản bảo hiểm bắt buộc và thuế TNCN. Công ty sẽ phải trả
                      thêm các khoản bảo hiểm của người sử dụng lao động (BHXH
                      17.5%, BHYT 3%, BHTN 1%).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div> */}
      </ToolsPageLayout>
    </ToolsThemeProvider>
  );
}
