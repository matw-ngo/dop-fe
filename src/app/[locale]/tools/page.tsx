"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  PiggyBank,
  Sparkles,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  BarChart3,
  CalculatorIcon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function ToolsPage() {
  const t = useTranslations("pages.tools");
  const locale = useLocale();

  const tools = [
    {
      id: "loan-calculator",
      title: t("list.loanCalculator.title"),
      description: t("list.loanCalculator.description"),
      icon: Calculator,
      category: "Banking",
      badge: "Popular",
      gradient: "from-blue-500 to-cyan-500",
      features: ["Monthly payments", "Interest rates", "Repayment schedule"],
      href: `/${locale}/tools/loan-calculator`,
    },
    {
      id: "savings-calculator",
      title: t("list.savingsCalculator.title"),
      description: t("list.savingsCalculator.description"),
      icon: TrendingUp,
      category: "Investment",
      badge: "New",
      gradient: "from-emerald-500 to-teal-500",
      features: ["Compare rates", "Future value", "Growth projection"],
      href: `/${locale}/tools/savings-calculator`,
    },
    {
      id: "salary-converter",
      title: t("list.salaryConverter.title"),
      description: t("list.salaryConverter.description"),
      icon: DollarSign,
      category: "Tax & Finance",
      badge: "Essential",
      gradient: "from-violet-500 to-purple-500",
      features: ["Gross to Net", "Tax calculation", "Insurance deduction"],
      href: `/${locale}/tools/salary-converter`,
    },
  ];

  const comingSoon = [
    {
      id: "roi-calculator",
      title: t("list.roiCalculator.title"),
      description: t("list.roiCalculator.description"),
      icon: PiggyBank,
      category: "Investment",
      gradient: "from-orange-500 to-amber-500",
      features: ["ROI analysis", "Investment comparison", "Profit projection"],
    },
    {
      id: "tax-calculator",
      title: t("list.taxCalculator.title"),
      description: t("list.taxCalculator.description"),
      icon: FileText,
      category: "Tax & Finance",
      gradient: "from-rose-500 to-pink-500",
      features: ["VAT calculator", "Income tax", "Corporate tax"],
    },
  ];

  const features = [
    {
      icon: Shield,
      title: t("features.accurate.title"),
      description: t("features.accurate.description"),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: BarChart3,
      title: t("features.realtime.title"),
      description: t("features.realtime.description"),
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: Sparkles,
      title: t("features.free.title"),
      description: t("features.free.description"),
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-200/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm border-b border-gray-200/60" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href={`/${locale}`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium">{t("backToHome")}</span>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/60 hover:border-blue-200/60 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <CalculatorIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  3+
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tools Available
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/60 hover:border-emerald-200/60 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  100%
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Accurate Results
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/60 hover:border-violet-200/60 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  24/7
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Always Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Tools */}
        <div className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("availableTools")}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4" />
              <span>Powered by real-time data</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {tools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.id} href={tool.href}>
                  <div
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/60 hover:border-blue-200/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer overflow-hidden"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "slideUp 0.5s ease-out forwards",
                      opacity: 0,
                    }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        {tool.badge}
                      </span>
                    </div>

                    <div className="relative">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>

                      {/* Category */}
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {tool.category}
                      </p>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-200">
                        <span>Use Tool</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("comingSoon")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {comingSoon.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/40 opacity-75 hover:opacity-100 transition-all duration-300 overflow-hidden"
                  style={{
                    animationDelay: `${(index + 3) * 100}ms`,
                    animation: "slideUp 0.5s ease-out forwards",
                    opacity: 0,
                  }}
                >
                  {/* Coming Soon Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 to-gray-100/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                        <Zap className="w-4 h-4" />
                        {t("comingSoonBadge")}
                      </span>
                    </div>
                  </div>

                  <div className="opacity-50">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-6`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Category */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {tool.category}
                    </p>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {tool.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-gray-200/60 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50/50" />

          <div className="relative">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {t("whyChooseUs")}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional financial tools designed for accuracy, reliability,
                and ease of use
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="text-center group"
                    style={{
                      animationDelay: `${(index + 5) * 100}ms`,
                      animation: "slideUp 0.5s ease-out forwards",
                      opacity: 0,
                    }}
                  >
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.color}`}
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
