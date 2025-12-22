"use client";

import { useFormTheme } from "@/components/form-generation/themes/ThemeProvider";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function FindingLoanScreen({ onFinish }: { onFinish: () => void }) {
  const { theme } = useFormTheme();
  const [progress, setProgress] = useState(0);
  const t = useTranslations("pages.form");

  // Simulate finding process
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onFinish();
          return 100;
        }
        return prev + 2; // 50 ticks * 60ms = 3s approx
      });
    }, 60);
    return () => clearInterval(timer);
  }, [onFinish]);

  const primaryColor = theme.colors.primary;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div
        className="max-w-[540px] w-full text-center space-y-8"
        style={
          {
            // Use standard tailwind classes where possible, inline for specific sizing if needed
          }
        }
      >
        <p className="text-lg md:text-xl text-gray-700 font-medium">
          {t("finding_loan.message")}
        </p>

        <div className="flex justify-center py-8">
          {/* Custom Spinner mimicking the size of the original */}
          <div className="relative">
            <Loader2
              className="animate-spin"
              size={120}
              color={primaryColor}
              strokeWidth={1.5}
            />
            {/* Optional percentage or icon in center? Original didn't have it */}
          </div>
        </div>

        {/* Optional Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: primaryColor,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
