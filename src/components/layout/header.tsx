"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Logo } from "@/components/icons/home";
import type { NavbarConfig } from "@/configs/navbar-config";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { useLocalizedPath } from "@/lib/client-utils";
import { cn } from "@/lib/utils";

/**
 * Header Component (NavBar)
 *
 * Refactored for multi-tenancy and i18n.
 */

interface NavItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: { label: string; href: string; external?: boolean }[];
}

interface HeaderProps {
  company?: string;
  configOverride?: NavbarConfig;
}

export function Header({ configOverride }: HeaderProps) {
  const t = useTranslations("components.layout.header.nav");
  const tenant = useTenant();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const getLocalizedPath = useLocalizedPath();

  const primaryColor = tenant.theme.colors.primary;
  const textColor = "#073126"; // $text-600 from old code

  // Hide header on loan flow pages
  const hideHeader = ["/loan-info", "/tim-kiem-vay", "/ket-qua-vay"].some(
    (path) => pathname?.includes(path),
  );

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, []);

  const navItems: NavItem[] = [
    {
      label: t("about.label", { companyName: tenant.name }),
      children: [
        {
          label: t("about.introduction"),
          href: getLocalizedPath("/gioi-thieu"),
        },
        { label: t("about.contact"), href: getLocalizedPath("/lien-he") },
      ],
    },
    {
      label: t("products.label"),
      children: [
        {
          label: t("products.lending"),
          href: getLocalizedPath("/vay-tieu-dung"),
        },
        {
          label: t("products.creditCard"),
          href: getLocalizedPath("/the-tin-dung"),
        },
        { label: t("products.insurance"), href: getLocalizedPath("/bao-hiem") },
      ],
    },
    {
      label: t("tools.label"),
      children: [
        {
          label: t("tools.loanCalculator"),
          href: getLocalizedPath("/cong-cu/tinh-toan-khoan-vay"),
        },
        {
          label: t("tools.savingsCalculator"),
          href: getLocalizedPath("/cong-cu/tinh-lai-tien-gui"),
        },
        {
          label: t("tools.salaryGrossToNet"),
          href: getLocalizedPath("/cong-cu/tinh-luong-gross-net"),
        },
        {
          label: t("tools.salaryNetToGross"),
          href: getLocalizedPath("/cong-cu/tinh-luong-net-gross"),
        },
      ],
    },
    { label: t("support"), href: getLocalizedPath("/lien-he") },
    { label: t("blog"), href: "https://blog.finzone.vn", external: true },
  ];

  if (hideHeader) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 bg-white transition-colors"
      style={{
        boxShadow: "0 4px 40px 0 #0047330d",
        backgroundColor: isMobileMenuOpen ? primaryColor : "white",
      }}
    >
      <nav
        className="max-w-full mx-auto"
        style={{ fontSize: "16px", fontWeight: 400, lineHeight: "24px" }}
      >
        <div className="flex items-center justify-center relative h-[60px] md:h-[72px] px-4 md:px-4 md:py-0 py-3">
          {/* Logo */}
          <Link href="/" className="absolute left-4 md:left-12">
            <Logo
              currentColor={isMobileMenuOpen ? "white" : primaryColor}
              width={124}
              height={40}
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden absolute right-4 p-2 transition-transform duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6" style={{ color: primaryColor }} />
            )}
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex lg:md:space-x-8 md:space-x-2">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                {item.children ? (
                  <div
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="relative"
                  >
                    <button
                      className="lg:px-3 md:px-2 font-medium text-base transition-colors flex items-center gap-1 group/btn"
                      style={{
                        color: textColor,
                        paddingTop: "26px",
                        paddingBottom: "26px",
                        fontWeight: 500,
                        lineHeight: "24px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = primaryColor)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = textColor)
                      }
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200 ml-1",
                          openDropdown === item.label ? "rotate-180" : "",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 bg-white border overflow-hidden z-50"
                          style={{
                            width: "210px",
                            borderRadius: "4px",
                            borderColor: "#3F435029",
                            boxShadow: "0px 8px 24px 0px #0000001F",
                          }}
                        >
                          <ul className="py-1">
                            {item.children.map((child, childIndex) => (
                              <li key={childIndex}>
                                <Link
                                  href={child.href}
                                  className="block text-base transition-colors"
                                  style={{
                                    color: textColor,
                                    padding: "12px 16px",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = primaryColor)
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = textColor)
                                  }
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    target={item.external ? "_blank" : undefined}
                    className="lg:px-3 md:px-2 font-medium text-base transition-colors inline-block"
                    style={{
                      color: textColor,
                      paddingTop: "26px",
                      paddingBottom: "26px",
                      fontWeight: 500,
                      lineHeight: "24px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = primaryColor)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = textColor)
                    }
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-white overflow-hidden"
              style={{ padding: "0 20px" }}
            >
              <ul>
                {navItems.map((item, index) => (
                  <li
                    key={index}
                    className="border-t border-b"
                    style={{ borderColor: "#E6E8EE" }}
                  >
                    {item.children ? (
                      <div>
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === item.label ? null : item.label,
                            )
                          }
                          className="flex items-center justify-between w-full font-medium"
                          style={{
                            color: textColor,
                            padding: "16px 0",
                            fontWeight: openDropdown === item.label ? 700 : 400,
                          }}
                        >
                          <div className="flex items-center gap-6">
                            <div style={{ width: "24px", height: "24px" }} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              openDropdown === item.label ? "rotate-180" : "",
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {openDropdown === item.label && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                              style={{ marginLeft: "48px" }}
                            >
                              {item.children.map((child, childIndex) => (
                                <li
                                  key={childIndex}
                                  style={{
                                    marginTop: "16px",
                                    marginBottom:
                                      childIndex === item.children!.length - 1
                                        ? "16px"
                                        : "0",
                                  }}
                                >
                                  <Link
                                    href={child.href}
                                    className="text-base block transition-colors"
                                    style={{
                                      color: textColor,
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color =
                                        primaryColor)
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = textColor)
                                    }
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href!}
                        target={item.external ? "_blank" : undefined}
                        className="flex items-center font-medium"
                        style={{
                          color: textColor,
                          padding: "16px 0",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "24px",
                          }}
                        />
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Header;
