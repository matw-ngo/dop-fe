"use client";

import { Suspense } from "react";
import {
  FormThemeProvider,
  legacyLoanTheme,
} from "@/components/form-generation/themes";

import { DigitalLendingProduct } from "@/components/loan-application/DigitalLendingProduct";
import { ProductTabs } from "@/components/loan-application/ProductTabs";
import {
  SearchMoneySvg,
  CardsSvg,
  CarInsurSvg,
  StudentLoanSvg,
} from "@/components/loan-application/icons";

const TAB_LIST = [
  {
    id: "lending",
    displayName: "Vay tiêu dùng",
    component: <DigitalLendingProduct />,
    disabled: false,
    icon: <SearchMoneySvg color="#017848" />,
    activeIcon: <SearchMoneySvg color="#fff" />,
  },
  {
    id: "credit-card",
    displayName: "Thẻ tín dụng",
    component: (
      <div className="text-center py-16 text-gray-500">Coming soon</div>
    ),
    disabled: false,
    icon: <CardsSvg color="#017848" />,
    activeIcon: <CardsSvg color="#fff" />,
  },
  {
    id: "insurance",
    displayName: "Bảo hiểm",
    component: (
      <div className="text-center py-16 text-gray-500">Coming soon</div>
    ),
    disabled: false,
    icon: <CarInsurSvg color="#017848" />,
    activeIcon: <CarInsurSvg color="#fff" />,
  },
  {
    id: "mortgage",
    displayName: "Chứng khoán",
    component: (
      <div className="text-center py-16 text-gray-500">Coming soon</div>
    ),
    disabled: true,
    icon: <StudentLoanSvg color="#017848" />,
    activeIcon: <StudentLoanSvg color="#fff" />,
  },
];

function DemoContent() {
  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-indigo-100/50">
      <div className="container mx-auto max-w-7xl">
        <ProductTabs tabList={TAB_LIST} activeTab={0} />
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
