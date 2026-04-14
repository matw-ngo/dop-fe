"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoanSearchingScreenEnhancedProps {
  message?: string;
  className?: string;
  showProgress?: boolean;
  estimatedTime?: number; // in seconds
}

/**
 * Enhanced Loan Searching Screen with animations and progress
 */
export function LoanSearchingScreenEnhanced({
  message,
  className,
  showProgress = false,
  estimatedTime = 10,
}: LoanSearchingScreenEnhancedProps) {
  const t = useTranslations("pages.form.finding_loan");
  const { theme } = useFormTheme();
  const [progress, setProgress] = useState(0);

  const displayMessage = message || t("message");

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (100 / estimatedTime) * 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showProgress, estimatedTime]);

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center px-4 py-8",
        className,
      )}
    >
      <div className="w-full max-w-md mx-auto">
        <motion.div
          className="flex flex-col items-center gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Spinner Container */}
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Spinner
              className="h-24 w-24"
              style={{
                color: theme.colors.primary,
              }}
            />
          </motion.div>

          {/* Message with fade-in animation */}
          <motion.div
            className="space-y-4 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p
              className="text-base leading-relaxed"
              style={{
                color: theme.colors.textPrimary || "#1f2937",
              }}
            >
              {displayMessage}
            </p>

            {/* Progress Bar */}
            {showProgress && (
              <div className="w-full">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.border,
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: theme.colors.primary,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p
                  className="text-xs mt-2"
                  style={{
                    color: theme.colors.textSecondary || "#6b7280",
                  }}
                >
                  {Math.round(progress)}%
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
