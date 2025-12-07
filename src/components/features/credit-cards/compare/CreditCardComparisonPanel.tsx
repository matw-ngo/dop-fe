"use client";

import type React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useCreditCardsStore,
  useCreditCardComparison,
} from "@/store/use-credit-cards-store";
import { useShallow } from "zustand/shallow";
import type { CreditCard } from "@/types/credit-card";
import {
  CreditCard as CreditCardIcon,
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
  ChevronDown,
  TrendingUp,
  Star,
  Percent,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/ui/use-toast";

interface CreditCardComparisonPanelProps {
  cards?: CreditCard[];
  onAdd?: () => void;
  onRemove?: (cardId: string) => void;
  onClear?: () => void;
  onShare?: () => void;
  onExport?: (format: "csv" | "pdf" | "clipboard" | "print") => void;
  maxCards?: number;
  isSticky?: boolean;
  className?: string;
  isLoading?: boolean;
}

export const CreditCardComparisonPanel: React.FC<
  CreditCardComparisonPanelProps
> = ({
  cards,
  onAdd,
  onRemove,
  onClear,
  onShare,
  onExport,
  maxCards = 3,
  isSticky = false,
  className,
  isLoading = false,
}) => {
  const t = useTranslations("features.credit-cards.comparison");
  const { toast } = useToast();

  // Get comparison data from hook
  const { comparisonCards, canAddMore } = useCreditCardComparison();

  // Get store actions
  const { removeFromComparison: storeRemove, clearComparison: storeClear } =
    useCreditCardsStore(
      useShallow((state) => ({
        removeFromComparison: state.removeFromComparison,
        clearComparison: state.clearComparison,
      })),
    );

  // Use props if provided, otherwise use store/hook
  const displayCards = cards || comparisonCards;
  const handleRemove = onRemove || storeRemove;
  const handleClear = onClear || storeClear;
  const maxComparison = maxCards || 4; // Default max 4 cards

  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );

  // Handle keyboard navigation for dropdowns
  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      // Close dropdown by blurring the trigger
      (e.target as HTMLElement).blur();
    }
  };

  // Calculate progress
  const progressPercentage = (displayCards.length / maxComparison) * 100;
  const canAddMoreLocal = displayCards.length < maxComparison;
  const isFull = displayCards.length >= maxComparison;

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
    const cardIds = comparisonCards.map((c) => c.id).join(",");
    url.searchParams.set("compare", cardIds);
    return url.toString();
  };

  // Handle copy with visual feedback
  const handleCopyWithFeedback = async (
    text: string,
    key: string,
    successMessage: string,
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      toast({
        title: t("success"),
        description: successMessage,
      });
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: t("error"),
        description: t("copyFailed"),
        variant: "destructive",
      });
    }
  };

  // CSV Export functionality
  const handleCSVExport = async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport("csv");
        return;
      }

      const headers = [
        t("csvHeaders.cardName"),
        t("csvHeaders.issuingBank"),
        t("csvHeaders.cardType"),
        t("csvHeaders.annualFee"),
        t("csvHeaders.annualFeeType"),
        t("csvHeaders.interestRate"),
        t("csvHeaders.interestRateType"),
        t("csvHeaders.minCreditLimit"),
        t("csvHeaders.maxCreditLimit"),
        t("csvHeaders.minIncome"),
        t("csvHeaders.minAge"),
        t("csvHeaders.rewardsProgramType"),
        t("csvHeaders.rewardsRate"),
        t("csvHeaders.welcomeOffer"),
        t("csvHeaders.cashAdvanceFee"),
        t("csvHeaders.foreignTransactionFee"),
        t("csvHeaders.latePaymentFee"),
        t("csvHeaders.rating"),
        t("csvHeaders.reviewCount"),
        t("csvHeaders.insuranceFeatures"),
        t("csvHeaders.digitalFeatures"),
        t("csvHeaders.applyLink"),
      ];

      const csvContent = [
        headers.join(","),
        ...comparisonCards.map((card) =>
          [
            `"${card.name}"`,
            `"${card.issuer}"`,
            `"${t(`categories.${card.category}`) || card.category}"`,
            card.annualFee,
            `"${t(`feeTypes.${card.annualFeeType}`) || card.annualFeeType}"`,
            card.interestRate,
            `"${t(`interestTypes.${card.interestRateType}`) || card.interestRateType}"`,
            card.creditLimitMin,
            card.creditLimitMax,
            card.incomeRequiredMin,
            card.ageRequiredMin,
            card.rewardsProgram?.type || t("notAvailable"),
            card.rewardsProgram?.earnRate || 0,
            `"${card.welcomeOffer || t("notAvailable")}"`,
            card.withdrawalFee,
            card.foreignExchangeFee,
            card.latePaymentFee,
            card.rating,
            card.reviewCount,
            card.insurance ? t("yes") : t("no"),
            card.digitalFeatures ? t("yes") : t("no"),
            `"${card.applyLink}"`,
          ].join(","),
        ),
      ].join("\n");

      // Add BOM for proper UTF-8 handling in Excel
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const fileName = `${t("csvFilename")}-${new Date().toISOString().split("T")[0]}.csv`;
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t("exportSuccess"),
        description: `${t("exportFileDownloaded")}: ${fileName}`,
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("csvExportFailed"),
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
        onExport("pdf");
        return;
      }

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error(t("printWindowError"));
      }

      const cardTable = comparisonCards
        .map(
          (card) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${card.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${card.issuer}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(card.annualFee)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${card.interestRate}%</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(card.creditLimitMax)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${card.rating}/5</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${card.rewardsProgram?.type || "N/A"}</td>
        </tr>
      `,
        )
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${t("pdfTitle")}</title>
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
          <h1>${t("pdfTitle")}</h1>
          <p>${t("exportDate")}: ${new Date().toLocaleDateString("vi-VN")}</p>
          <p>${t("totalCards")}: ${comparisonCards.length}</p>

          <table>
            <thead>
              <tr>
                <th>${t("pdfHeaders.cardName")}</th>
                <th>${t("pdfHeaders.bank")}</th>
                <th>${t("pdfHeaders.annualFee")}</th>
                <th>${t("pdfHeaders.interestRate")}</th>
                <th>${t("pdfHeaders.maxCreditLimit")}</th>
                <th>${t("pdfHeaders.rating")}</th>
                <th>${t("pdfHeaders.rewardsProgram")}</th>
              </tr>
            </thead>
            <tbody>
              ${cardTable}
            </tbody>
          </table>

          <div class="metadata">
            <p>${t("source")}: ${window.location.href}</p>
            <p>${t("autoGeneratedBy")}</p>
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
        title: t("preparePDF"),
        description: t("pdfSaveInstructions"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("pdfExportFailed"),
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
        onExport("clipboard");
        return;
      }

      const text = comparisonCards
        .map(
          (card) =>
            `${card.name} - ${card.issuer}\n` +
            `  ${t("annualFee")}: ${formatCurrency(card.annualFee)}\n` +
            `  ${t("interestRate")}: ${card.interestRate}%\n` +
            `  ${t("creditLimit")}: ${formatCurrency(card.creditLimitMin)} - ${formatCurrency(card.creditLimitMax)}\n` +
            `  ${t("minIncome")}: ${formatCurrency(card.incomeRequiredMin)}\n` +
            `  ${t("rating")}: ${card.rating}/5 (${card.reviewCount} ${t("reviews")})\n` +
            `  ${t("rewardsProgram")}: ${card.rewardsProgram ? `${card.rewardsProgram.type} (${card.rewardsProgram.earnRate}/1000 VND)` : t("notAvailable")}\n` +
            `  ${t("welcomeOffer")}: ${card.welcomeOffer || t("notAvailable")}\n`,
        )
        .join("\n");

      const fullText = `${t("clipboardTitle")}\n${"=".repeat(40)}\n\n${text}\n${"=".repeat(40)}\n${t("source")}: ${window.location.href}\n${t("date")}: ${new Date().toLocaleDateString("vi-VN")}`;

      await handleCopyWithFeedback(
        fullText,
        "clipboard",
        "Đã sao chép thông tin so sánh!",
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Print-friendly view
  const handlePrint = () => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport("print");
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
        title: t("shareTitle"),
        text: t("shareText", { count: comparisonCards.length }),
        url: generateShareableUrl(),
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: t("shareSuccess"),
          description: t("shareSuccessDesc"),
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: t("error"),
          description: t("shareFailed"),
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
    await handleCopyWithFeedback(
      shareableUrl,
      "link",
      "Đã sao chép liên kết so sánh!",
    );
  };

  // Social media sharing
  const handleSocialShare = (platform: "facebook" | "twitter" | "linkedin") => {
    const url = generateShareableUrl();
    const text = t("shareText", { count: comparisonCards.length });

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {t("loadingComparison")}
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
        <Card
          className={cn(
            "w-full transition-all duration-200",
            isSticky && "sticky top-4 z-10",
            className,
          )}
        >
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print-break-inside-avoid">
              <div className="flex items-center space-x-2">
                <CreditCardIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {t("comparisonPanel")}
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {comparisonCards.length}/{maxComparison}
                </Badge>
              </div>
              {comparisonCards.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-destructive no-print"
                  aria-label={t("clearAllAriaLabel")}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("clearAll")}
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("comparisonProgress")}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {canAddMore
                  ? t("canAddMore", {
                      remaining: maxComparison - comparisonCards.length,
                    }) ||
                    `Bạn có thể thêm ${maxComparison - comparisonCards.length} thẻ nữa`
                  : t("maxCardsReached")}
              </p>
            </div>

            {/* Card List */}
            {comparisonCards.length > 0 && (
              <div className="space-y-3">
                <div className="grid gap-3">
                  {comparisonCards.map((card, index) => (
                    <div
                      key={card.id}
                      className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCardIcon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {card.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {card.issuer}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-semibold">
                              {formatCurrency(card.annualFee)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Percent className="w-3 h-3" />
                            <span className="font-semibold">
                              {card.interestRate}%
                            </span>
                          </div>
                          {card.rewardsProgram && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-semibold">
                                {card.rewardsProgram.earnRate}/1000
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(card.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            aria-label={t("removeCardAriaLabel", {
                              cardName: card.name,
                            })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("removeCard")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 no-print">
                  {canAddMore && (
                    <Button
                      onClick={onAdd || (() => {})}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addCard")}
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
                        aria-label={t("shareOptions")}
                        onKeyDown={handleDropdownKeyDown}
                      >
                        {isSharing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4 mr-2" />
                        )}
                        {t("shareComparison")}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t("shareViaSystem")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyLink}>
                        <Link className="h-4 w-4 mr-2" />
                        {copiedStates.link ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            {t("copied")}
                          </>
                        ) : (
                          t("copyLink")
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSocialShare("facebook")}
                      >
                        <div className="h-4 w-4 mr-2 bg-blue-600 rounded" />
                        {t("facebook")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSocialShare("twitter")}
                      >
                        <div className="h-4 w-4 mr-2 bg-sky-500 rounded" />
                        {t("twitter")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSocialShare("linkedin")}
                      >
                        <div className="h-4 w-4 mr-2 bg-blue-700 rounded" />
                        {t("linkedin")}
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
                        aria-label={t("exportOptions")}
                        onKeyDown={handleDropdownKeyDown}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {t("exportComparison")}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleCSVExport}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t("exportCSV")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePDFExport}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t("exportPDF")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyToClipboard}>
                        {copiedStates.clipboard ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            {t("copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            {t("copyToClipboard")}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        {t("printVersion")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Empty State */}
            {comparisonCards.length === 0 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">
                    {t("noCardsInComparison")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("addCardsToCompare") ||
                      "Thêm thẻ tín dụng để bắt đầu so sánh và tìm thấy lựa chọn tốt nhất"}
                  </p>
                </div>
                <Button onClick={onAdd || (() => {})} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("selectCards")}
                </Button>
              </div>
            )}

            {/* Comparison Limit Notice */}
            {isFull && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>{t("comparisonLimit")}:</strong>{" "}
                  {t("comparisonLimitMessage", {
                    max: maxComparison,
                  }) ||
                    `Bạn chỉ có thể so sánh tối đa ${maxComparison} thẻ tại một thời điểm`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>
    </>
  );
};

export default CreditCardComparisonPanel;
