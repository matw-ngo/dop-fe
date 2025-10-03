"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/molecules/newsletter-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Shield,
  Award,
  Clock,
  ArrowUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: React.ReactNode;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
}

export interface FooterProps {
  logo?: {
    src?: string;
    alt?: string;
    text?: string;
    width?: number;
    height?: number;
  };
  description?: string;
  columns: FooterColumn[];
  socialLinks?: SocialLink[];
  contactInfo?: ContactInfo;
  newsletterConfig?: {
    show?: boolean;
    title?: string;
    description?: string;
    placeholder?: string;
  };
  bottomText?: {
    copyright?: string;
    links?: FooterLink[];
  };
  variant?: "default" | "minimal" | "detailed" | "newsletter-focus";
  size?: "sm" | "md" | "lg";
  className?: string;
  showBackToTop?: boolean;
  certifications?: Array<{
    name: string;
    icon?: React.ReactNode;
    description?: string;
  }>;
  background?: "default" | "dark" | "gradient";
}

export function Footer({
  logo = {
    text: "LoanApp",
    width: 120,
    height: 40,
  },
  description = "Nền tảng cho vay trực tuyến uy tín hàng đầu Việt Nam, cung cấp giải pháp tài chính nhanh chóng và an toàn.",
  columns,
  socialLinks = [],
  contactInfo,
  newsletterConfig = { show: true },
  bottomText,
  variant = "default",
  size = "md",
  className,
  showBackToTop = true,
  certifications = [],
  background = "default",
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const variantStyles = {
    default: {
      container: "pt-16 pb-8",
      mainSection: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12",
      brandSection: "lg:col-span-1",
      linksSection: "lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8",
    },
    minimal: {
      container: "pt-12 pb-6",
      mainSection: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-8",
      brandSection: "md:col-span-1",
      linksSection: "md:col-span-2 grid grid-cols-2 gap-8",
    },
    detailed: {
      container: "pt-20 pb-10",
      mainSection: "grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16",
      brandSection: "lg:col-span-2",
      linksSection: "lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8",
    },
    "newsletter-focus": {
      container: "pt-16 pb-8",
      mainSection: "space-y-12 mb-12",
      brandSection: "",
      linksSection: "grid grid-cols-1 md:grid-cols-4 gap-8",
    },
  };

  const sizeStyles = {
    sm: {
      title: "text-base font-semibold",
      text: "text-sm",
      container: "max-w-4xl",
    },
    md: {
      title: "text-lg font-semibold",
      text: "text-sm",
      container: "max-w-6xl",
    },
    lg: {
      title: "text-xl font-bold",
      text: "text-base",
      container: "max-w-7xl",
    },
  };

  const backgroundStyles = {
    default: "bg-background border-t",
    dark: "bg-gray-900 text-white",
    gradient:
      "bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-t",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const bgStyle = backgroundStyles[background];

  const renderLogo = () => (
    <div className="flex items-center space-x-2 mb-4">
      {logo.src ? (
        <Image
          src={logo.src}
          alt={logo.alt || "Logo"}
          width={logo.width}
          height={logo.height}
          className="object-contain"
        />
      ) : (
        <div className={cn("font-bold text-primary", sizes.title)}>
          {logo.text}
        </div>
      )}
    </div>
  );

  const renderBrandSection = () => (
    <div className={styles.brandSection}>
      {renderLogo()}

      {description && (
        <p
          className={cn(
            "text-muted-foreground mb-6 leading-relaxed",
            sizes.text,
          )}
        >
          {description}
        </p>
      )}

      {/* Contact Info */}
      {contactInfo && (
        <div className="space-y-3 mb-6">
          {contactInfo.phone && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span className={sizes.text}>{contactInfo.phone}</span>
            </div>
          )}
          {contactInfo.email && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className={sizes.text}>{contactInfo.email}</span>
            </div>
          )}
          {contactInfo.address && (
            <div className="flex items-start space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span className={sizes.text}>{contactInfo.address}</span>
            </div>
          )}
          {contactInfo.workingHours && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className={sizes.text}>{contactInfo.workingHours}</span>
            </div>
          )}
        </div>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className={cn("font-medium", sizes.title)}>Theo dõi chúng tôi</h4>
          <div className="flex space-x-3">
            {socialLinks.map((social, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0"
                asChild
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                >
                  {social.icon}
                </a>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderColumns = () => (
    <div className={styles.linksSection}>
      {columns.map((column, index) => (
        <div key={index}>
          <h4 className={cn("font-semibold mb-4", sizes.title)}>
            {column.title}
          </h4>
          <ul className="space-y-2">
            {column.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2",
                    sizes.text,
                  )}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                >
                  {link.title}
                  {link.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {link.badge}
                    </Badge>
                  )}
                  {link.external && <Globe className="w-3 h-3" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderNewsletter = () => {
    if (!newsletterConfig.show) return null;

    return (
      <div className="bg-primary/5 rounded-lg p-6 mb-12">
        <NewsletterForm
          title={newsletterConfig.title || "Đăng ký nhận tin"}
          description={
            newsletterConfig.description ||
            "Nhận thông tin mới nhất về sản phẩm và ưu đãi"
          }
          placeholder={newsletterConfig.placeholder}
          variant="card"
          theme={background === "dark" ? "dark" : "light"}
          size={size}
          showPrivacyConsent={false}
          onSubmit={async (email) => {
            console.log("Newsletter signup:", email);
          }}
        />
      </div>
    );
  };

  const renderCertifications = () => {
    if (!certifications.length) return null;

    return (
      <div className="space-y-4 mb-8">
        <h4 className={cn("font-semibold", sizes.title)}>
          Chứng nhận & Bảo mật
        </h4>
        <div className="flex flex-wrap gap-4">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-muted-foreground"
            >
              {cert.icon}
              <span className={sizes.text}>{cert.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBottomSection = () => (
    <div className="border-t pt-8">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className={cn("text-muted-foreground", sizes.text)}>
          {bottomText?.copyright ||
            "© 2024 LoanApp. Tất cả các quyền được bảo lưu."}
        </div>

        {bottomText?.links && (
          <div className="flex space-x-6">
            {bottomText.links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  sizes.text,
                )}
              >
                {link.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBackToTop = () => {
    if (!showBackToTop) return null;

    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </Button>
    );
  };

  return (
    <>
      <footer className={cn(bgStyle, className)}>
        <div
          className={cn(
            "container mx-auto px-4",
            styles.container,
            sizes.container,
          )}
        >
          {variant === "newsletter-focus" ? (
            <div className={styles.mainSection}>
              {renderNewsletter()}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {renderBrandSection()}
                {renderColumns()}
              </div>
            </div>
          ) : (
            <div className={styles.mainSection}>
              {renderBrandSection()}
              {renderColumns()}
            </div>
          )}

          {variant !== "newsletter-focus" && renderNewsletter()}
          {renderCertifications()}
          {renderBottomSection()}
        </div>
      </footer>

      {renderBackToTop()}
    </>
  );
}
