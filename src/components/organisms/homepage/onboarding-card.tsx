"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Rocket, Check, Star } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLocalizedPath } from "@/lib/client-utils";

const onboardingCardVariants = cva(
  "overflow-hidden transition-all duration-500 ease-out relative group",
  {
    variants: {
      variant: {
        default: "border-border hover:shadow-lg",
        creative:
          "transform hover:scale-[1.02] hover:shadow-2xl text-white dark:text-gray-900 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/20 before:to-pink-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        elegant:
          "border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700",
        gradient:
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] animate-gradient",
        glassmorphism:
          "backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border border-white/20 shadow-2xl hover:bg-white/40 dark:hover:bg-gray-900/40",
      },
      size: {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
        full: "w-full",
      },
      display: {
        compact: "text-center",
        detail: "text-left",
        minimal: "text-center",
        hero: "text-center",
        split: "text-left",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "lg",
      display: "hero",
    },
  },
);

export interface OnboardingCardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof onboardingCardVariants> {
  backgroundImage?: string;
  showParticles?: boolean;
  features?: string[];
}

export default function OnboardingCard({
  variant = "creative",
  size = "lg",
  display = "hero",
  backgroundImage,
  showParticles = true,
  features = [],
  className,
}: OnboardingCardProps) {
  const t = useTranslations("components.onboardingCard");
  const getLocalizedPath = useLocalizedPath();

  const cardStyle =
    (variant === "creative" || variant === "glassmorphism") && backgroundImage
      ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {};

  const icons = [Sparkles, Zap, Rocket];
  const IconComponent = icons[Math.floor(Math.random() * icons.length)];

  const isCompact = display === "compact";
  const isMinimal = display === "minimal";
  const isDetail = display === "detail";
  const isSplit = display === "split";
  const isHero = display === "hero";

  return (
    <section className="container mx-auto py-12 sm:py-24 px-4">
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <Card
        className={cn(
          onboardingCardVariants({ variant, size, display }),
          "mx-auto",
          className,
        )}
        style={cardStyle}
      >
        {/* Decorative elements */}
        {showParticles && !isMinimal && !isCompact && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white/50 rounded-full animate-pulse" />
            <div className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-75" />
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-150" />
            <div className="absolute bottom-10 right-10 w-3 h-3 bg-white/50 rounded-full animate-pulse delay-300" />
          </div>
        )}

        <div
          className={cn("relative z-10", {
            "bg-black/50 backdrop-blur-sm":
              (variant === "creative" || variant === "glassmorphism") &&
              backgroundImage,
            "p-4 sm:p-6": isCompact,
            "p-6 sm:p-8": isMinimal,
            "p-8 sm:p-12": isHero,
            "p-8 sm:p-10": isDetail || isSplit,
          })}
        >
          {/* Split Layout */}
          {isSplit ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8" />
                </div>

                <CardHeader className="p-0 space-y-4">
                  <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {t("title")}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg">
                    {t("description")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <Link href={getLocalizedPath("/user-onboarding")} passHref>
                    <Button size="lg" className="group/button w-full sm:w-auto">
                      {t("buttonText")}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover/button:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Key Features</h3>
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <CardHeader
                className={cn("space-y-4", {
                  "space-y-2": isCompact,
                  "space-y-3": isMinimal,
                })}
              >
                {/* Icon - Hide in minimal and compact */}
                {!isMinimal && !isCompact && (
                  <div
                    className={cn(
                      "mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float group-hover:scale-110 transition-transform duration-300",
                      {
                        "w-12 h-12": isCompact,
                        "w-16 h-16": !isCompact,
                      },
                    )}
                  >
                    <IconComponent
                      className={cn({
                        "w-6 h-6": isCompact,
                        "w-8 h-8": !isCompact,
                      })}
                    />
                  </div>
                )}

                <CardTitle
                  className={cn("font-bold tracking-tight", {
                    "text-xl sm:text-2xl": isCompact,
                    "text-2xl sm:text-3xl": isMinimal,
                    "text-3xl sm:text-4xl": isDetail,
                    "text-4xl sm:text-5xl": isHero,
                    "bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200":
                      variant === "gradient" && isHero,
                  })}
                >
                  {t("title")}
                </CardTitle>

                {/* Description - Hide in minimal */}
                {!isMinimal && (
                  <CardDescription
                    className={cn("max-w-2xl", {
                      "text-sm": isCompact,
                      "text-base sm:text-lg": isDetail,
                      "text-base sm:text-lg mx-auto": isHero,
                      "text-gray-300 dark:text-gray-600":
                        variant === "creative",
                      "text-white/90 text-xl": variant === "gradient" && isHero,
                      "text-gray-700 dark:text-gray-300":
                        variant === "glassmorphism",
                    })}
                  >
                    {t("description")}
                  </CardDescription>
                )}
              </CardHeader>

              {/* Features list for detail view */}
              {isDetail && (
                <div className="px-6 pb-4">
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CardContent
                className={cn({
                  "pt-4": isCompact,
                  "pt-2": isMinimal,
                  "pt-6": isDetail || isHero,
                })}
              >
                <Link href={getLocalizedPath("/user-onboarding")} passHref>
                  <Button
                    size={isCompact ? "default" : "lg"}
                    variant={variant === "creative" ? "secondary" : "default"}
                    className={cn(
                      "group/button relative overflow-hidden transition-all duration-300",
                      {
                        "w-full": isCompact || isMinimal,
                        "bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-xl font-semibold px-8 py-6 text-lg":
                          variant === "gradient" && (isHero || isDetail),
                        "bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white px-8 py-6 text-lg":
                          variant === "glassmorphism" && (isHero || isDetail),
                      },
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t("buttonText")}
                      <ArrowRight
                        className={cn(
                          "group-hover/button:translate-x-1 transition-transform duration-300",
                          {
                            "h-4 w-4": isCompact,
                            "h-5 w-5": !isCompact,
                          },
                        )}
                      />
                    </span>

                    {/* Button shine effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000" />
                  </Button>
                </Link>

                {/* Additional info badges - Only in hero mode */}
                {isHero && !isMinimal && (
                  <div className="mt-6 flex items-center justify-center gap-4 text-sm opacity-80 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Quick Setup
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Easy to Use
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Free Trial
                    </span>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </div>

        {/* Animated border glow */}
        {variant === "gradient" && isHero && (
          <div className="absolute inset-0 rounded-lg opacity-50 blur-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 -z-10 group-hover:opacity-75 transition-opacity duration-500" />
        )}
      </Card>
    </section>
  );
}
