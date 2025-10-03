"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Gift,
  Bell,
} from "lucide-react";

export interface NewsletterFormProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  variant?: "default" | "inline" | "card" | "minimal" | "floating";
  size?: "sm" | "md" | "lg";
  className?: string;
  onSubmit?: (
    email: string,
    preferences?: NewsletterPreferences,
  ) => Promise<void> | void;
  showPrivacyConsent?: boolean;
  showPreferences?: boolean;
  privacyText?: string;
  successMessage?: string;
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  benefits?: string[];
  theme?: "light" | "dark" | "primary";
}

export interface NewsletterPreferences {
  dailyNews?: boolean;
  weeklyTips?: boolean;
  promotions?: boolean;
  productUpdates?: boolean;
}

export function NewsletterForm({
  title = "Đăng ký nhận tin",
  description = "Nhận thông tin mới nhất về sản phẩm và ưu đãi",
  placeholder = "Nhập email của bạn...",
  buttonText = "Đăng ký",
  variant = "default",
  size = "md",
  className,
  onSubmit,
  showPrivacyConsent = true,
  showPreferences = false,
  privacyText = "Tôi đồng ý nhận email marketing và chấp nhận điều khoản sử dụng",
  successMessage = "Đăng ký thành công! Kiểm tra email để xác nhận.",
  errorMessage = "Có lỗi xảy ra. Vui lòng thử lại sau.",
  disabled = false,
  loading = false,
  icon,
  benefits = [],
  theme = "light",
}: NewsletterFormProps) {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<
    "idle" | "success" | "error"
  >("idle");
  const [privacyConsent, setPrivacyConsent] = React.useState(false);
  const [preferences, setPreferences] = React.useState<NewsletterPreferences>({
    dailyNews: true,
    weeklyTips: true,
    promotions: false,
    productUpdates: true,
  });

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit =
    email &&
    isValidEmail(email) &&
    (!showPrivacyConsent || privacyConsent) &&
    !disabled &&
    !isSubmitting &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await onSubmit?.(email, showPreferences ? preferences : undefined);
      setSubmitStatus("success");
      setEmail("");
      setPrivacyConsent(false);
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (
    key: keyof NewsletterPreferences,
    checked: boolean,
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: checked }));
  };

  const variantStyles = {
    default: {
      container: "space-y-4",
      form: "space-y-4",
      inputGroup: "flex flex-col sm:flex-row gap-2",
      input: "flex-1",
      button: "sm:w-auto w-full",
    },
    inline: {
      container: "space-y-3",
      form: "space-y-3",
      inputGroup: "flex gap-2",
      input: "flex-1",
      button: "shrink-0",
    },
    card: {
      container: "",
      form: "space-y-4",
      inputGroup: "flex flex-col gap-3",
      input: "w-full",
      button: "w-full",
    },
    minimal: {
      container: "space-y-2",
      form: "space-y-2",
      inputGroup: "flex gap-2",
      input: "flex-1",
      button: "shrink-0",
    },
    floating: {
      container: "space-y-3",
      form: "space-y-3",
      inputGroup: "flex gap-2",
      input: "flex-1",
      button: "shrink-0",
    },
  };

  const sizeStyles = {
    sm: {
      title: "text-base font-semibold",
      description: "text-sm",
      input: "h-8 text-sm",
      button: "h-8 px-3 text-sm",
      label: "text-sm",
    },
    md: {
      title: "text-lg font-semibold",
      description: "text-sm",
      input: "h-10",
      button: "h-10 px-4",
      label: "text-sm",
    },
    lg: {
      title: "text-xl font-bold",
      description: "text-base",
      input: "h-12 text-lg",
      button: "h-12 px-6 text-lg",
      label: "text-base",
    },
  };

  const themeStyles = {
    light: {
      container: "bg-background text-foreground",
      title: "text-foreground",
      description: "text-muted-foreground",
    },
    dark: {
      container: "bg-gray-900 text-white",
      title: "text-white",
      description: "text-gray-300",
    },
    primary: {
      container: "bg-primary text-primary-foreground",
      title: "text-primary-foreground",
      description: "text-primary-foreground/80",
    },
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const themes = themeStyles[theme];

  const renderIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case "floating":
        return <Bell className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const renderBenefits = () => {
    if (!benefits.length) return null;

    return (
      <div className="space-y-2">
        <h4 className={cn("font-medium", sizes.label)}>Bạn sẽ nhận được:</h4>
        <ul className="space-y-1">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-sm",
                themes.description,
              )}
            >
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderPreferences = () => {
    if (!showPreferences) return null;

    const preferenceOptions = [
      {
        key: "dailyNews" as const,
        label: "Tin tức hàng ngày",
        icon: <Mail className="w-4 h-4" />,
      },
      {
        key: "weeklyTips" as const,
        label: "Mẹo tài chính hàng tuần",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      {
        key: "promotions" as const,
        label: "Ưu đãi và khuyến mãi",
        icon: <Gift className="w-4 h-4" />,
      },
      {
        key: "productUpdates" as const,
        label: "Cập nhật sản phẩm",
        icon: <Bell className="w-4 h-4" />,
      },
    ];

    return (
      <div className="space-y-3">
        <Label className={cn("font-medium", sizes.label)}>
          Tùy chọn nhận tin:
        </Label>
        <div className="space-y-2">
          {preferenceOptions.map((option) => (
            <div key={option.key} className="flex items-center space-x-2">
              <Checkbox
                id={option.key}
                checked={preferences[option.key]}
                onCheckedChange={(checked) =>
                  handlePreferenceChange(option.key, checked as boolean)
                }
              />
              <Label
                htmlFor={option.key}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  sizes.label,
                )}
              >
                {option.icon}
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Input Group */}
      <div className={styles.inputGroup}>
        <div className={styles.input}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isSubmitting || loading}
            className={cn(
              sizes.input,
              theme === "dark" &&
                "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400",
              theme === "primary" &&
                "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60",
            )}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            styles.button,
            sizes.button,
            theme === "dark" && "bg-white text-gray-900 hover:bg-gray-100",
            theme === "primary" &&
              "bg-primary-foreground text-primary hover:bg-primary-foreground/90",
          )}
        >
          {isSubmitting || loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {buttonText}
        </Button>
      </div>

      {/* Preferences */}
      {renderPreferences()}

      {/* Privacy Consent */}
      {showPrivacyConsent && (
        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy-consent"
            checked={privacyConsent}
            onCheckedChange={setPrivacyConsent}
            className="mt-0.5"
          />
          <Label
            htmlFor="privacy-consent"
            className={cn(
              "cursor-pointer leading-normal",
              sizes.label,
              themes.description,
            )}
          >
            {privacyText}
          </Label>
        </div>
      )}

      {/* Status Messages */}
      {submitStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </form>
  );

  const content = (
    <>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3
              className={cn(
                "flex items-center gap-2",
                sizes.title,
                themes.title,
              )}
            >
              {renderIcon()}
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(sizes.description, themes.description)}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Benefits */}
      {renderBenefits()}

      {/* Form */}
      {renderForm()}
    </>
  );

  if (variant === "card") {
    return (
      <Card className={cn(className, themes.container)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", sizes.title)}>
            {renderIcon()}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={sizes.description}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {renderBenefits()}
          {renderForm()}
        </CardContent>
      </Card>
    );
  }

  if (variant === "floating") {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg border z-50",
          themes.container,
          className,
        )}
      >
        <div className={styles.container}>{content}</div>
      </div>
    );
  }

  return (
    <div className={cn(styles.container, themes.container, className)}>
      {content}
    </div>
  );
}
