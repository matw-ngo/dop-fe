"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplyLoanForm from "@/components/loan-application/ApplyLoanForm";
import { useThemeUtils } from "@/components/renderer/theme";

function DemoContent() {
  const { theme } = useThemeUtils();
  console.log("theme", theme);
  const isCorporateTheme = theme.name === "corporate";

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        isCorporateTheme
          ? "bg-background"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <Card
          className={`${isCorporateTheme ? "shadow-sm border" : "shadow-xl"}`}
        >
          <CardHeader
            className={`text-white ${
              isCorporateTheme
                ? "bg-primary"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
          >
            <CardTitle className="text-2xl font-bold text-center">
              Đơn Đăng Ký Vay Tiền
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ApplyLoanForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingFallback() {
  const { theme } = useThemeUtils();
  const isCorporateTheme = theme.name === "corporate";

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isCorporateTheme
          ? "bg-background"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="text-center">
        <div
          className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent ${
            isCorporateTheme ? "border-primary" : "border-blue-600"
          }`}
        ></div>
        <p
          className={`mt-4 ${
            isCorporateTheme ? "text-muted-foreground" : "text-gray-600"
          }`}
        >
          Đang tải trang demo...
        </p>
      </div>
    </div>
  );
}

export default function DemoApplyLoanPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DemoContent />
    </Suspense>
  );
}
