"use client";

import type React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Shield,
  X,
  Plus,
  Share2,
  Download,
  BarChart3,
  Loader2,
  Copy,
  FileText,
  Printer,
  Link,
  Check,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InsuranceProduct } from "@/types/insurance";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/ui/use-toast";

interface ComparisonPanelProps {
  products: InsuranceProduct[];
  onAdd: () => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onShare?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'clipboard' | 'print') => void;
  maxProducts?: number;
  isSticky?: boolean;
  className?: string;
  isLoading?: boolean;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  products,
  onAdd,
  onRemove,
  onClear,
  onShare,
  onExport,
  maxProducts = 3,
  isSticky = false,
  className,
  isLoading = false,
}) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  // Calculate progress
  const progressPercentage = (products.length / maxProducts) * 100;
  const canAddMore = products.length < maxProducts;
  const isFull = products.length >= maxProducts;

  // Format currency
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Generate shareable URL with comparison data
  const generateShareableUrl = () => {
    const url = new URL(window.location.href);
    const productIds = products.map(p => p.id).join(',');
    url.searchParams.set('compare', productIds);
    return url.toString();
  };

  // Handle copy with visual feedback
  const handleCopyWithFeedback = async (text: string, key: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      toast({
        title: "Thành công!",
        description: successMessage,
      });
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: "Lỗi!",
        description: "Không thể sao chép. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // CSV Export functionality
  const handleCSVExport = async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport('csv');
        return;
      }

      const headers = [
        "Tên sản phẩm",
        "Nhà cung cấp",
        "Loại bảo hiểm",
        "Phí bảo hiểm (VND)",
        "Phí gốc (VND)",
        "Thuế (VND)",
        "Thời hạn bảo hiểm",
        "Quyền lợi tai nạn cá nhân",
        "Quyền lợi thiệt hại tài sản",
        "Quyền lợi chi phí y tế",
        "Quyền lợi trách nhiệm bên thứ ba",
        "Quyền lợi tử vong",
        "Quyền lợi tàn tật",
        "Quyền lợi nội trú",
        "Quyền lợi phẫu thuật",
        "Quyền lợi bệnh hiểm nghèo",
        "Quyền lợi mất thu nhập",
        "Đánh giá",
        "Số lượt đánh giá",
        "Tỷ lệ duyệt yêu cầu (%)",
        "Thời gian xử lý trung bình (ngày)",
        "Hỗ trợ đường bộ",
        "Hỗ trợ y tế 24/7",
        "Hỗ trợ pháp lý",
        "Bảo hiểm toàn cầu",
        "Liên kết đăng ký",
      ];

      const csvContent = [
        headers.join(","),
        ...products.map((product) => [
          `"${product.name}"`,
          `"${product.issuer}"`,
          `"${t(`pages.insurance.categories.${product.category}`) || product.category}"`,
          product.pricing.totalPremium,
          product.pricing.basePremium,
          product.pricing.taxAmount,
          product.pricing.coveragePeriod,
          product.coverage.personalAccident.disabled ? "0" : product.coverage.personalAccident.limit,
          product.coverage.propertyDamage.disabled ? "0" : product.coverage.propertyDamage.limit,
          product.coverage.medicalExpenses.disabled ? "0" : product.coverage.medicalExpenses.limit,
          product.coverage.thirdPartyLiability.disabled ? "0" : product.coverage.thirdPartyLiability.limit,
          product.coverage.death.disabled ? "0" : product.coverage.death.limit,
          product.coverage.disability.disabled ? "0" : product.coverage.disability.limit,
          product.coverage.hospitalization.disabled ? "0" : product.coverage.hospitalization.limit,
          product.coverage.surgery.disabled ? "0" : product.coverage.surgery.limit,
          product.coverage.criticalIllness.disabled ? "0" : product.coverage.criticalIllness.limit,
          product.coverage.lossOfIncome.disabled ? "0" : product.coverage.lossOfIncome.limit,
          product.rating,
          product.reviewCount,
          product.claims.approvalRate,
          product.claims.averageClaimTime,
          product.additionalServices?.roadsideAssistance ? "Có" : "Không",
          product.additionalServices?.medicalHotline ? "Có" : "Không",
          product.additionalServices?.legalSupport ? "Có" : "Không",
          product.additionalServices?.worldwideCoverage ? "Có" : "Không",
          `"${product.applyLink}"`,
        ].join(",")),
      ].join("\n");

      // Add BOM for proper UTF-8 handling in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const fileName = `so-sanh-bao-hiem-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Xuất file thành công!",
        description: `Đã tải xuống file ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể xuất file CSV. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // PDF Export (using browser print)
  const handlePDFExport = () => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport('pdf');
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error("Không thể mở cửa sổ in");
      }

      const productTable = products.map(product => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${product.issuer}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${t(`pages.insurance.categories.${product.category}`) || product.category}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(product.pricing.totalPremium)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${product.rating}/5</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${product.claims.approvalRate}%</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>So Sánh Sản Phẩm Bảo Hiểm</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; text-align: left; }
            td { border: 1px solid #ddd; padding: 8px; }
            .metadata { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>So Sánh Sản Phẩm Bảo Hiểm</h1>
          <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
          <p>Số lượng sản phẩm: ${products.length}</p>

          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Nhà cung cấp</th>
                <th>Loại bảo hiểm</th>
                <th>Phí bảo hiểm</th>
                <th>Đánh giá</th>
                <th>Tỷ lệ duyệt</th>
              </tr>
            </thead>
            <tbody>
              ${productTable}
            </tbody>
          </table>

          <div class="metadata">
            <p>Nguồn: ${window.location.href}</p>
            <p>File được tạo tự động bởi Hệ thống so sánh bảo hiểm</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast({
        title: "Chuẩn bị in PDF",
        description: "Vui lòng chọn 'Lưu dưới dạng PDF' trong hộp thoại in",
      });
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể tạo PDF. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport('clipboard');
        return;
      }

      const text = products.map(product =>
        `${product.name} - ${product.issuer}\n` +
        `  Phí bảo hiểm: ${formatCurrency(product.pricing.totalPremium)}\n` +
        `  Đánh giá: ${product.rating}/5 (${product.reviewCount} đánh giá)\n` +
        `  Quyền lợi chính: ${Object.entries(product.coverage)
          .filter(([_, c]: [string, { disabled: boolean; limit: number }]) => !c.disabled && c.limit > 0)
          .map(([key, c]: [string, { disabled: boolean; limit: number }]) => `${formatCurrency(c.limit)}`)
          .join(', ')}\n`
      ).join('\n');

      const fullText = `SO SÁNH SẢN PHẨM BẢO HIỂM\n${'='.repeat(40)}\n\n${text}\n${'='.repeat(40)}\nNguồn: ${window.location.href}\nNgày: ${new Date().toLocaleDateString('vi-VN')}`;

      await handleCopyWithFeedback(fullText, 'clipboard', 'Đã sao chép thông tin so sánh!');
    } finally {
      setIsExporting(false);
    }
  };

  // Print-friendly view
  const handlePrint = () => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport('print');
        return;
      }
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (onShare) {
        onShare();
        return;
      }

      const shareData = {
        title: "So sánh sản phẩm bảo hiểm",
        text: `Đang so sánh ${products.length} sản phẩm bảo hiểm`,
        url: generateShareableUrl(),
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Chia sẻ thành công!",
          description: "Đã chia sẻ kết quả so sánh",
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Lỗi!",
          description: "Không thể chia sẻ. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Copy comparison link
  const handleCopyLink = async () => {
    const shareableUrl = generateShareableUrl();
    await handleCopyWithFeedback(shareableUrl, 'link', 'Đã sao chép liên kết so sánh!');
  };

  // Social media sharing
  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const url = generateShareableUrl();
    const text = `Đang so sánh ${products.length} sản phẩm bảo hiểm`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {t("pages.insurance.loadingComparison")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 1in;
            size: A4;
          }
          .no-print {
            display: none !important;
          }
          .print-break-before {
            page-break-before: always;
          }
          .print-break-after {
            page-break-after: always;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
      <TooltipProvider>
        <Card className={cn(
          "w-full transition-all duration-200",
          isSticky && "sticky top-4 z-10",
          className
        )}>
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print-break-inside-avoid">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {t("pages.insurance.comparisonPanel")}
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {products.length}/{maxProducts}
                </Badge>
              </div>
              {products.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="text-muted-foreground hover:text-destructive no-print"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("pages.insurance.clearAll")}
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {t("pages.insurance.comparisonProgress")}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {canAddMore
                  ? t("pages.insurance.canAddMore", {
                    remaining: maxProducts - products.length
                  }) || `Bạn có thể thêm ${maxProducts - products.length} sản phẩm nữa`
                  : t("pages.insurance.maxProductsReached")
                }
              </p>
            </div>

            {/* Product List */}
            {products.length > 0 && (
              <div className="space-y-3">
                <div className="grid gap-3">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.issuer}
                        </p>
                        <p className="text-xs font-semibold text-primary">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(product.pricing.totalPremium)}
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(product.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("pages.insurance.removeProduct")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 no-print">
                  {canAddMore && (
                    <Button
                      onClick={onAdd}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("pages.insurance.addProduct")}
                    </Button>
                  )}

                  {/* Share Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isSharing}
                      >
                        {isSharing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4 mr-2" />
                        )}
                        {t("pages.insurance.shareComparison")}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Chia sẻ qua hệ thống
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyLink}>
                        <Link className="h-4 w-4 mr-2" />
                        {copiedStates.link ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Đã sao chép!
                          </>
                        ) : (
                          "Sao chép liên kết"
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                        <div className="h-4 w-4 mr-2 bg-blue-600 rounded" />
                        Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                        <div className="h-4 w-4 mr-2 bg-sky-500 rounded" />
                        Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                        <div className="h-4 w-4 mr-2 bg-blue-700 rounded" />
                        LinkedIn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Export Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {t("pages.insurance.exportComparison")}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleCSVExport}>
                        <FileText className="h-4 w-4 mr-2" />
                        Xuất file CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePDFExport}>
                        <FileText className="h-4 w-4 mr-2" />
                        Xuất file PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyToClipboard}>
                        {copiedStates.clipboard ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Đã sao chép!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Sao chép vào clipboard
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        In phiên bản rút gọn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">
                    {t("pages.insurance.noProductsInComparison")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("pages.insurance.addProductsToCompare") ||
                      "Thêm sản phẩm để bắt đầu so sánh và tìm thấy lựa chọn tốt nhất"}
                  </p>
                </div>
                <Button onClick={onAdd} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("pages.insurance.selectProducts")}
                </Button>
              </div>
            )}

            {/* Comparison Limit Notice */}
            {isFull && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>{t("pages.insurance.comparisonLimit")}:</strong>{" "}
                  {t("pages.insurance.comparisonLimitMessage", { max: maxProducts }) ||
                    `Bạn chỉ có thể so sánh tối đa ${maxProducts} sản phẩm tại một thời điểm`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>
    </>
  );
};

export default ComparisonPanel;