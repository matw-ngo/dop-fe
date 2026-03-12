"use client";

/**
 * Example usage of LoanSearchingScreen components
 *
 * This file demonstrates different ways to use the loan searching screens
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoanSearchingScreen, LoanSearchingScreenEnhanced } from "./index";

// Example 1: Basic usage
export function BasicExample() {
  return <LoanSearchingScreen />;
}

// Example 2: With custom message
export function CustomMessageExample() {
  return (
    <LoanSearchingScreen message="Đang xử lý yêu cầu vay của bạn, vui lòng đợi trong giây lát..." />
  );
}

// Example 3: Enhanced with progress
export function EnhancedExample() {
  return <LoanSearchingScreenEnhanced showProgress={true} estimatedTime={15} />;
}

// Example 4: With navigation after search
export function WithNavigationExample() {
  const router = useRouter();

  useEffect(() => {
    // Simulate loan search API call
    const searchTimer = setTimeout(() => {
      // Navigate to results page after search completes
      router.push("/loan-results");
    }, 5000);

    return () => clearTimeout(searchTimer);
  }, [router]);

  return <LoanSearchingScreen />;
}

// Example 5: With state management
export function WithStateExample() {
  const [isSearching, setIsSearching] = useState(true);
  const [searchComplete, setSearchComplete] = useState(false);

  useEffect(() => {
    // Simulate search process
    const timer = setTimeout(() => {
      setIsSearching(false);
      setSearchComplete(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (isSearching) {
    return (
      <LoanSearchingScreenEnhanced showProgress={true} estimatedTime={8} />
    );
  }

  if (searchComplete) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Tìm kiếm hoàn tất!</h2>
        <p>Chúng tôi đã tìm thấy 5 khoản vay phù hợp với bạn.</p>
      </div>
    );
  }

  return null;
}

// Example 6: Full loan application flow
export function FullFlowExample() {
  const [step, setStep] = useState<"form" | "searching" | "results">("form");
  const router = useRouter();

  const handleSubmit = () => {
    setStep("searching");

    // Simulate API call
    setTimeout(() => {
      setStep("results");
      router.push("/loan-results");
    }, 10000);
  };

  if (step === "searching") {
    return (
      <LoanSearchingScreenEnhanced
        showProgress={true}
        estimatedTime={10}
        message="Đang phân tích hồ sơ và tìm kiếm các khoản vay phù hợp nhất cho bạn..."
      />
    );
  }

  if (step === "form") {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Đăng ký vay</h2>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Gửi đơn
        </button>
      </div>
    );
  }

  return null;
}

// Example 7: With custom styling
export function CustomStylingExample() {
  return (
    <LoanSearchingScreenEnhanced
      showProgress={true}
      estimatedTime={12}
      className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      message="Hệ thống AI đang phân tích hồ sơ của bạn để tìm ra các khoản vay tốt nhất..."
    />
  );
}

// Example 8: Responsive example
export function ResponsiveExample() {
  return (
    <div className="min-h-screen">
      {/* Mobile: Simple version */}
      <div className="md:hidden">
        <LoanSearchingScreen />
      </div>

      {/* Desktop: Enhanced version */}
      <div className="hidden md:block">
        <LoanSearchingScreenEnhanced showProgress={true} estimatedTime={10} />
      </div>
    </div>
  );
}
