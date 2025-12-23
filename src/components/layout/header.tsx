"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/icons/home";
import { useTenant } from "@/hooks/useTenant";
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

export function Header() {
  const t = useTranslations("components.layout.header.nav");
  const tenant = useTenant();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const primaryColor = tenant.theme.colors.primary;

  // Hide header on loan flow pages
  const hideHeader = ["/loan-info", "/tim-kiem-vay", "/ket-qua-vay"].some(
    (path) => pathname?.includes(path),
  );

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      label: t("about.label", { companyName: tenant.name }),
      children: [
        { label: t("about.introduction"), href: "/gioi-thieu" },
        { label: t("about.contact"), href: "/lien-he" },
      ],
    },
    {
      label: t("products.label"),
      children: [
        { label: t("products.lending"), href: "/vay-tieu-dung" },
        { label: t("products.creditCard"), href: "/the-tin-dung" },
        { label: t("products.insurance"), href: "/bao-hiem" },
      ],
    },
    {
      label: t("tools.label"),
      children: [
        {
          label: t("tools.loanCalculator"),
          href: "/cong-cu/tinh-toan-khoan-vay",
        },
        {
          label: t("tools.savingsCalculator"),
          href: "/cong-cu/tinh-lai-tien-gui",
        },
        {
          label: t("tools.salaryGrossToNet"),
          href: "/cong-cu/tinh-luong-gross-net",
        },
        {
          label: t("tools.salaryNetToGross"),
          href: "/cong-cu/tinh-luong-net-gross",
        },
      ],
    },
    { label: t("support"), href: "/lien-he" },
    { label: t("blog"), href: "https://blog.finzone.vn", external: true },
  ];

  if (hideHeader) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 bg-white transition-colors"
      style={{
        boxShadow: "0 4px 40px 0 rgba(0, 71, 51, 0.05)",
        backgroundColor: isMobileMenuOpen ? primaryColor : "white",
      }}
    >
      <nav className="max-w-full px-4 mx-auto">
        <div className="flex items-center justify-center relative h-[60px] md:h-[72px]">
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
          <ul className="hidden md:flex md:space-x-8">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                {item.children ? (
                  <div
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="relative"
                  >
                    <button
                      className="px-3 py-6 font-medium text-sm transition-colors flex items-center gap-1 group/btn"
                      style={{ color: primaryColor }}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
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
                          className="absolute top-full left-0 bg-white rounded-lg border shadow-xl z-50 w-52 overflow-hidden"
                          style={{ borderColor: "rgba(0, 71, 51, 0.08)" }}
                        >
                          <ul className="py-2">
                            {item.children.map((child, childIndex) => (
                              <li key={childIndex}>
                                <Link
                                  href={child.href}
                                  className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                  style={{ color: primaryColor }}
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
                    className="px-3 py-6 font-medium text-sm transition-colors inline-block"
                    style={{ color: primaryColor }}
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
              className="md:hidden bg-white px-5 pb-8 overflow-hidden"
            >
              <ul>
                {navItems.map((item, index) => (
                  <li
                    key={index}
                    className="border-t border-gray-100 first:border-0"
                  >
                    {item.children ? (
                      <div>
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === item.label ? null : item.label,
                            )
                          }
                          className="flex items-center justify-between w-full py-5 font-medium"
                          style={{ color: primaryColor }}
                        >
                          <span>{item.label}</span>
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
                              className="pl-4 pb-4 space-y-4 overflow-hidden"
                            >
                              {item.children.map((child, childIndex) => (
                                <li key={childIndex}>
                                  <Link
                                    href={child.href}
                                    className="text-sm block py-1"
                                    style={{
                                      color: primaryColor,
                                      opacity: 0.8,
                                    }}
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
                        className="block py-5 font-medium"
                        style={{ color: primaryColor }}
                      >
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
