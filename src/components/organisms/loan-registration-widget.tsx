"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TabGroup } from "@/components/molecules/tab-group";
import { BenefitItem } from "@/components/molecules/benefit-item";
import { LoanCalculator } from "@/components/molecules/loan-calculator-slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Clock,
  Smartphone,
  CreditCard,
  Users,
  CheckCircle,
  TrendingUp,
  Calculator,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react";

export interface LoanType {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  minAmount: number;
  maxAmount: number;
  minDuration: number;
  maxDuration: number;
  interestRate: {
    min: number;
    max: number;
  };
  features: string[];
  benefits: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
}

export interface LoanRegistrationWidgetProps {
  title?: string;
  description?: string;
  loanTypes: LoanType[];
  defaultLoanType?: string;
  className?: string;
  onSubmit?: (data: LoanApplicationData) => Promise<void> | void;
  showBenefits?: boolean;
  showProgress?: boolean;
  variant?: "default" | "compact" | "detailed";
  size?: "sm" | "md" | "lg";
}

export interface LoanApplicationData {
  loanType: string;
  amount: number;
  duration: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function LoanRegistrationWidget({
  title = "Đăng ký khoản vay",
  description = "Chọn loại hình vay phù hợp với nhu cầu của bạn",
  loanTypes,
  defaultLoanType,
  className,
  onSubmit,
  showBenefits = true,
  showProgress = true,
  variant = "default",
  size = "md",
}: LoanRegistrationWidgetProps) {
  const [activeLoanType, setActiveLoanType] = React.useState(
    defaultLoanType || loanTypes[0]?.id,
  );
  const [amount, setAmount] = React.useState(50_000_000);
  const [duration, setDuration] = React.useState(24);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [step, setStep] = React.useState(1);

  const currentLoanType = loanTypes.find((type) => type.id === activeLoanType);

  // Calculate loan details
  const interestRate = currentLoanType?.interestRate.min || 8.5;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
    (Math.pow(1 + monthlyRate, duration) - 1);
  const totalPayment = monthlyPayment * duration;
  const totalInterest = totalPayment - amount;

  const handleSubmit = async () => {
    if (!currentLoanType) return;

    setIsSubmitting(true);

    const applicationData: LoanApplicationData = {
      loanType: activeLoanType,
      amount,
      duration,
      monthlyPayment,
      totalPayment,
      totalInterest,
    };

    try {
      await onSubmit?.(applicationData);
      setStep(3); // Success step
    } catch (error) {
      console.error("Loan application failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

  const variantStyles = {
    default: {
      container: "space-y-6",
      header: "text-center space-y-3",
      content: "space-y-6",
    },
    compact: {
      container: "space-y-4",
      header: "space-y-2",
      content: "space-y-4",
    },
    detailed: {
      container: "space-y-8",
      header: "text-center space-y-4",
      content: "space-y-8",
    },
  };

  const sizeStyles = {
    sm: {
      title: "text-xl font-bold",
      description: "text-sm",
      container: "max-w-2xl",
    },
    md: {
      title: "text-2xl font-bold",
      description: "text-base",
      container: "max-w-4xl",
    },
    lg: {
      title: "text-3xl font-bold",
      description: "text-lg",
      container: "max-w-6xl",
    },
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  // Convert loan types to tab items
  const tabItems = loanTypes.map((type) => ({
    id: type.id,
    label: type.name,
    badge: type.badge,
    content: (
      <div className="space-y-6">
        {/* Loan Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {type.icon}
              {type.name}
              {type.badge && <Badge variant="secondary">{type.badge}</Badge>}
            </CardTitle>
            <CardDescription>{type.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {type.interestRate.min}%
                </p>
                <p className="text-sm text-muted-foreground">Lãi suất từ</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {(type.maxAmount / 1_000_000).toFixed(0)}M
                </p>
                <p className="text-sm text-muted-foreground">Hạn mức tối đa</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {type.maxDuration}
                </p>
                <p className="text-sm text-muted-foreground">Tháng tối đa</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">24h</p>
                <p className="text-sm text-muted-foreground">Thời gian duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        {showBenefits && type.benefits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lợi ích nổi bật</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {type.benefits.map((benefit, index) => (
                  <BenefitItem
                    key={index}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    variant="minimal"
                    size="sm"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Tính toán khoản vay
            </CardTitle>
            <CardDescription>
              Điều chỉnh số tiền và thời hạn để xem kết quả tính toán
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanCalculator
              amount={amount}
              duration={duration}
              interestRate={interestRate}
              onAmountChange={setAmount}
              onDurationChange={setDuration}
              amountRange={{
                min: type.minAmount,
                max: type.maxAmount,
              }}
              durationRange={{
                min: type.minDuration,
                max: type.maxDuration,
              }}
              showResults={true}
            />
          </CardContent>
        </Card>

        {/* Features List */}
        {type.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tính năng đặc biệt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {type.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    ),
  }));

  if (step === 3) {
    return (
      <div
        className={cn(styles.container, sizes.container, "mx-auto", className)}
      >
        <Card className="text-center p-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Đăng ký thành công!</h3>
              <p className="text-muted-foreground">
                Chúng tôi đã nhận được thông tin đăng ký của bạn. Nhân viên tư
                vấn sẽ liên hệ trong vòng 24 giờ.
              </p>
            </div>
            <div className="pt-4">
              <Button onClick={() => setStep(1)} variant="outline">
                Đăng ký khoản vay khác
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(styles.container, sizes.container, "mx-auto", className)}
    >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={sizes.title}>{title}</h2>
        <p className={cn("text-muted-foreground", sizes.description)}>
          {description}
        </p>

        {/* Progress */}
        {showProgress && (
          <div className="max-w-md mx-auto space-y-2">
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Chọn sản phẩm</span>
              <span>Tính toán</span>
              <span>Đăng ký</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Tab Navigation */}
        <TabGroup
          items={tabItems}
          value={activeLoanType}
          onValueChange={setActiveLoanType}
          variant="pills"
          size={size}
        />

        {/* Action Area */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Summary */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">
                  Tóm tắt khoản vay {currentLoanType?.name}
                </h3>
                <p className="text-muted-foreground">
                  Kiểm tra thông tin trước khi đăng ký
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Số tiền vay</p>
                  <p className="text-lg font-bold text-primary">
                    {amount.toLocaleString("vi-VN")} VND
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Thời hạn</p>
                  <p className="text-lg font-bold text-primary">
                    {duration} tháng
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Trả hàng tháng
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {Math.round(monthlyPayment).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </div>

              {/* Important Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Lãi suất cuối cùng sẽ được xác định sau khi thẩm định hồ sơ.
                  Số liệu trên chỉ mang tính chất tham khảo.
                </AlertDescription>
              </Alert>

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    ĐĂNG KÝ VAY NGAY
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
