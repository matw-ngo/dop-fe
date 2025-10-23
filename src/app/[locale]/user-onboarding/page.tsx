"use client";

import { useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";
import { useOnboardingFormStore } from "@/store/use-onboarding-form-store";
import { Button } from "@/components/ui/button";
import { OnboardingForm } from "./components/onboarding-form";

export default function UserOnboardingPage() {
  const t = useTranslations("pages.userOnboardingPage");
  const resetForm = useOnboardingFormStore((state) => state.resetForm);

  const handleReset = () => {
    localStorage.removeItem("user-onboarding-data");
    resetForm();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600">{t("subtitle")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="absolute top-0 right-0"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            {t("resetButton")}
          </Button>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
