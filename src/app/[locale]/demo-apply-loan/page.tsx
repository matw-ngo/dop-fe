"use client";

import { Suspense } from "react";
import { ApplyLoanForm } from "@/components/loan-application/ApplyLoanForm";
import {
  FormThemeProvider,
  legacyLoanTheme,
  useFormTheme,
} from "@/components/form-generation/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DemoContent() {
  const { theme } = useFormTheme();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader
            className="text-white"
            style={{ backgroundColor: theme.colors.primary }}
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent border-[#017848]"></div>
        <p className="mt-4 text-gray-600">Đang tải trang demo...</p>
      </div>
    </div>
  );
}

export default function DemoApplyLoanPage() {
  return (
    <FormThemeProvider theme={legacyLoanTheme}>
      <Suspense fallback={<LoadingFallback />}>
        <DemoContent />
      </Suspense>
    </FormThemeProvider>
  );
}
