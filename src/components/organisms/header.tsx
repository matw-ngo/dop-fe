"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Building,
  Calculator,
  FileText,
  HelpCircle,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface NavItem {
  title: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavItem[];
  external?: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

export interface HeaderProps {
  logo?: {
    src?: string;
    alt?: string;
    href?: string;
    text?: string;
    width?: number;
    height?: number;
  };
  navigation: NavItem[];
  contactInfo?: ContactInfo;
  actions?: {
    login?: {
      text: string;
      href: string;
      variant?: "default" | "outline" | "ghost";
    };
    cta?: {
      text: string;
      href: string;
      variant?: "default" | "outline" | "ghost";
    };
  };
  variant?: "default" | "minimal" | "sticky" | "transparent";
  size?: "sm" | "md" | "lg";
  className?: string;
  showContactInfo?: boolean;
  showLanguageSwitch?: boolean;
  languageOptions?: { code: string; label: string; flag?: string }[];
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  onMenuClick?: (item: NavItem) => void;
}

export function Header({
  logo = {
    text: "LoanApp",
    href: "/",
    width: 120,
    height: 40,
  },
  navigation,
  contactInfo,
  actions,
  variant = "default",
  size = "md",
  className,
  showContactInfo = false,
  showLanguageSwitch = false,
  languageOptions = [
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ],
  currentLanguage = "vi",
  onLanguageChange,
  onMenuClick,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Handle scroll effect for sticky variant
  React.useEffect(() => {
    if (variant === "sticky") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [variant]);

  const variantStyles = {
    default: "bg-background border-b shadow-sm",
    minimal: "bg-transparent",
    sticky: cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-background/95 backdrop-blur-md border-b shadow-lg"
        : "bg-transparent",
    ),
    transparent: "bg-transparent absolute top-0 left-0 right-0 z-40",
  };

  const sizeStyles = {
    sm: {
      container: "h-14",
      logo: "h-8",
      nav: "text-sm",
      button: "h-8 px-3 text-sm",
    },
    md: {
      container: "h-16",
      logo: "h-10",
      nav: "text-sm",
      button: "h-9 px-4",
    },
    lg: {
      container: "h-20",
      logo: "h-12",
      nav: "text-base",
      button: "h-10 px-6",
    },
  };

  const styles = sizeStyles[size];

  const handleNavClick = (item: NavItem) => {
    onMenuClick?.(item);
    if (!item.children) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderLogo = () => (
    <Link
      href={logo.href || "/"}
      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
    >
      {logo.src ? (
        <Image
          src={logo.src}
          alt={logo.alt || "Logo"}
          width={logo.width}
          height={logo.height}
          className={cn("object-contain", styles.logo)}
        />
      ) : (
        <div className={cn("font-bold text-primary", styles.nav, "text-lg")}>
          {logo.text}
        </div>
      )}
    </Link>
  );

  const renderContactInfo = () => {
    if (!showContactInfo || !contactInfo) return null;

    return (
      <div className="hidden lg:flex items-center space-x-4 text-xs text-muted-foreground">
        {contactInfo.phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3" />
            <span>{contactInfo.phone}</span>
          </div>
        )}
        {contactInfo.email && (
          <div className="flex items-center space-x-1">
            <Mail className="w-3 h-3" />
            <span>{contactInfo.email}</span>
          </div>
        )}
        {contactInfo.address && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{contactInfo.address}</span>
          </div>
        )}
      </div>
    );
  };

  const renderLanguageSwitch = () => {
    if (!showLanguageSwitch) return null;

    const currentLang = languageOptions.find(
      (lang) => lang.code === currentLanguage,
    );

    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={cn("h-8 px-2", styles.nav)}>
              <Globe className="w-4 h-4 mr-1" />
              {currentLang?.flag} {currentLang?.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-48 p-2">
                {languageOptions.map((lang) => (
                  <NavigationMenuLink
                    key={lang.code}
                    className={cn(
                      "block px-3 py-2 rounded-md hover:bg-accent cursor-pointer",
                      currentLanguage === lang.code && "bg-accent",
                    )}
                    onClick={() => onLanguageChange?.(lang.code)}
                  >
                    {lang.flag} {lang.label}
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  const renderDesktopNavigation = () => (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navigation.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.children ? (
              <>
                <NavigationMenuTrigger className={styles.nav}>
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {item.children.map((child, childIndex) => (
                      <NavigationMenuLink
                        key={childIndex}
                        href={child.href}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => handleNavClick(child)}
                      >
                        <div className="flex items-center space-x-2">
                          {child.icon}
                          <div className="text-sm font-medium leading-none">
                            {child.title}
                            {child.badge && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {child.description && (
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {child.description}
                          </p>
                        )}
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                href={item.href}
                className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  styles.nav,
                )}
                onClick={() => handleNavClick(item)}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.title}
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  const renderMobileNavigation = () => (
    <div className="space-y-4">
      {navigation.map((item, index) => (
        <div key={index}>
          {item.children ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-medium">
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="pl-6 space-y-2">
                {item.children.map((child, childIndex) => (
                  <Link
                    key={childIndex}
                    href={child.href || "#"}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleNavClick(child)}
                  >
                    <div className="flex items-center space-x-2">
                      {child.icon}
                      <span>{child.title}</span>
                      {child.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              href={item.href || "#"}
              className="flex items-center space-x-2 py-2 font-medium hover:text-primary transition-colors"
              onClick={() => handleNavClick(item)}
            >
              {item.icon}
              <span>{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )}
        </div>
      ))}
    </div>
  );

  const renderActions = () => {
    if (!actions) return null;

    const buttonSize = size === "md" ? "default" : size;

    return (
      <div className="flex items-center space-x-3">
        {showLanguageSwitch && renderLanguageSwitch()}

        {actions.login && (
          <Button
            variant={actions.login.variant || "ghost"}
            size={buttonSize}
            className={cn("hidden sm:flex", styles.button)}
            asChild
          >
            <Link href={actions.login.href}>
              <User className="w-4 h-4 mr-2" />
              {actions.login.text}
            </Link>
          </Button>
        )}

        {actions.cta && (
          <Button
            variant={actions.cta.variant || "default"}
            size={buttonSize}
            className={styles.button}
            asChild
          >
            <Link href={actions.cta.href}>{actions.cta.text}</Link>
          </Button>
        )}
      </div>
    );
  };

  return (
    <header className={cn(variantStyles[variant], className)}>
      {/* Contact Info Bar */}
      {showContactInfo && (
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-2">
            {renderContactInfo()}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div
          className={cn("flex items-center justify-between", styles.container)}
        >
          {/* Logo */}
          {renderLogo()}

          {/* Desktop Navigation */}
          {renderDesktopNavigation()}

          {/* Actions */}
          {renderActions()}

          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex items-center justify-between mb-6">
                {renderLogo()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              {renderMobileNavigation()}

              {/* Mobile Actions */}
              {actions && (
                <div className="mt-6 pt-6 border-t space-y-3">
                  {actions.login && (
                    <Button
                      variant={actions.login.variant || "outline"}
                      className="w-full"
                      asChild
                    >
                      <Link href={actions.login.href}>
                        <User className="w-4 h-4 mr-2" />
                        {actions.login.text}
                      </Link>
                    </Button>
                  )}
                  {actions.cta && (
                    <Button
                      variant={actions.cta.variant || "default"}
                      className="w-full"
                      asChild
                    >
                      <Link href={actions.cta.href}>{actions.cta.text}</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Mobile Language Switch */}
              {showLanguageSwitch && (
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Ngôn ngữ</h4>
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        className={cn(
                          "flex items-center space-x-2 w-full p-2 rounded-md hover:bg-accent text-sm",
                          currentLanguage === lang.code && "bg-accent",
                        )}
                        onClick={() => {
                          onLanguageChange?.(lang.code);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
