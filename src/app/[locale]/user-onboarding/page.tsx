"use client";

import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import { multiStepForm } from "@/lib/multi-step-form-builder";
import {
  createInputField,
  createSelectField,
  createDatePickerField,
  createEkycField,
  createConfirmationField,
} from "@/lib/field-builder";
import { User, Shield, CheckCircle, RotateCw } from "lucide-react";
import { useOnboardingFormStore } from "@/store/use-onboarding-form-store";
import { Button } from "@/components/ui/button";

// Build the user onboarding form
const userOnboardingForm = multiStepForm()
  // Step 1: Basic Information
  // .addStep(
  //   "basic-info",
  //   "Thông tin cơ bản",
  //   [
  //     createInputField("fullName", {
  //       label: "Họ và tên",
  //       placeholder: "Nguyễn Văn A",
  //       validations: [
  //         { type: "required", messageKey: "form.error.required" },
  //         { type: "minLength", value: 3, messageKey: "form.error.minLength" },
  //       ],
  //     }),

  //     createInputField("email", {
  //       type: "email",
  //       label: "Email",
  //       placeholder: "example@email.com",
  //       validations: [
  //         { type: "required", messageKey: "form.error.required" },
  //         { type: "email", messageKey: "form.error.email.invalid" },
  //       ],
  //     }),

  //     createInputField("phone", {
  //       type: "tel",
  //       label: "Số điện thoại",
  //       placeholder: "0912345678",
  //       validations: [
  //         { type: "required", messageKey: "form.error.required" },
  //         {
  //           type: "regex",
  //           value: "^[0-9]{10}$",
  //           messageKey: "form.error.phone.invalid",
  //         },
  //       ],
  //     }),

  //     createDatePickerField("dateOfBirth", {
  //       label: "Ngày sinh",
  //       placeholder: "Chọn ngày sinh",
  //       validations: [{ type: "required", messageKey: "form.error.required" }],
  //     }),

  //     createSelectField("gender", {
  //       label: "Giới tính",
  //       placeholder: "Chọn giới tính",
  //       options: [
  //         { value: "male", label: "Nam" },
  //         { value: "female", label: "Nữ" },
  //         { value: "other", label: "Khác" },
  //       ],
  //       validations: [{ type: "required", messageKey: "form.error.required" }],
  //     }),

  //     createInputField("address", {
  //       label: "Địa chỉ hiện tại",
  //       placeholder: "Số nhà, đường, quận/huyện, thành phố",
  //       validations: [
  //         { type: "required", messageKey: "form.error.required" },
  //         { type: "minLength", value: 10, messageKey: "form.error.minLength" },
  //       ],
  //     }),

  //     createSelectField("city", {
  //       label: "Tỉnh/Thành phố",
  //       placeholder: "Chọn tỉnh/thành phố",
  //       options: [
  //         { value: "hanoi", label: "Hà Nội" },
  //         { value: "hcm", label: "TP. Hồ Chí Minh" },
  //         { value: "danang", label: "Đà Nẵng" },
  //         { value: "haiphong", label: "Hải Phòng" },
  //         { value: "cantho", label: "Cần Thơ" },
  //       ],
  //       validations: [{ type: "required", messageKey: "form.error.required" }],
  //     }),

  //     createSelectField("occupation", {
  //       label: "Nghề nghiệp",
  //       placeholder: "Chọn nghề nghiệp",
  //       options: [
  //         { value: "employee", label: "Nhân viên văn phòng" },
  //         { value: "business", label: "Kinh doanh" },
  //         { value: "freelancer", label: "Tự do" },
  //         { value: "student", label: "Sinh viên" },
  //         { value: "other", label: "Khác" },
  //       ],
  //       validations: [{ type: "required", messageKey: "form.error.required" }],
  //     }),

  //     createSelectField("monthlyIncome", {
  //       label: "Thu nhập hàng tháng",
  //       placeholder: "Chọn mức thu nhập",
  //       options: [
  //         { value: "under5", label: "Dưới 5 triệu" },
  //         { value: "5to10", label: "5 - 10 triệu" },
  //         { value: "10to20", label: "10 - 20 triệu" },
  //         { value: "20to50", label: "20 - 50 triệu" },
  //         { value: "above50", label: "Trên 50 triệu" },
  //       ],
  //       validations: [{ type: "required", messageKey: "form.error.required" }],
  //     }),
  //   ],
  //   {
  //     description: "Vui lòng cung cấp thông tin cá nhân của bạn",
  //     icon: <User className="h-5 w-5" />,
  //   },
  // )

  // Step 2: eKYC Verification
  .addStep(
    "ekyc-verification",
    "Xác thực danh tính",
    [
      createEkycField("ekycVerification", {
        label: "Xác thực danh tính eKYC",
        description:
          "Sử dụng CMND/CCCD và khuôn mặt để xác thực danh tính nhanh chóng",
        flowType: "DOCUMENT_TO_FACE",
        language: "vi",
        // TODO: Couldnt be used yet, still under development
        // mode: "modal",  // Khuyến nghị: dùng modal thay vì inline
        mode: "inline",
        buttonText: "Bắt đầu xác thực", // Custom button text
        showDetailedSummary: true, // Hiển thị thông tin chi tiết sau khi thành công
        validations: [{ type: "required", messageKey: "form.error.required" }],
        height: 600,
      }),
    ],
    {
      description: "Xác minh danh tính của bạn qua eKYC",
      icon: <Shield className="h-5 w-5" />,
    },
  )

  // Step 3: Review & Confirmation
  .addStep(
    "confirmation",
    "Xác nhận thông tin",
    [
      // Confirmation component reads all form data from context
      createConfirmationField("review"),
    ],
    {
      description: "Xem lại và xác nhận thông tin",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  )

  // Enable data persistence with localStorage
  .persistData(true, "user-onboarding-data")

  // Allow users to go back to previous steps
  .allowBackNavigation(true)

  // Set progress indicator style
  .setProgressStyle("steps")

  // Callback when each step is completed
  .onStepComplete(async (stepId, stepData) => {
    console.log(`✅ Step "${stepId}" completed:`, stepData);

    // You can save data to backend here
    // Example:
    // try {
    //   await fetch('/api/onboarding/save-step', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ stepId, data: stepData }),
    //   });
    // } catch (error) {
    //   console.error('Failed to save step:', error);
    //   throw error; // This will prevent moving to next step
    // }
  })

  // Callback when user navigates between steps
  .onStepChange((fromStep, toStep) => {
    console.log(`📍 Navigating from "${fromStep}" to "${toStep}"`);

    // Analytics tracking
    // gtag('event', 'step_change', {
    //   from: fromStep,
    //   to: toStep,
    //   category: 'user_onboarding',
    // });
  })

  // Callback when entire form is completed
  .onComplete(async (allData) => {
    console.log("🎉 Onboarding completed! All data:", allData);

    // Final submission to backend
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allData),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      const result = await response.json();
      console.log("✅ Onboarding saved:", result);

      // Clear localStorage after successful submission
      localStorage.removeItem("user-onboarding-data");

      // Redirect to success page with application data
      const appId = result.data?.applicationId || "N/A";
      const email = result.data?.email || allData["basic-info"]?.email || "";

      window.location.href = `/onboarding-success?appId=${appId}&email=${encodeURIComponent(email)}`;
    } catch (error) {
      console.error("❌ Failed to complete onboarding:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
      throw error;
    }
  })

  .build();

export default function UserOnboardingPage() {
  const resetForm = useOnboardingFormStore((state) => state.resetForm);

  const handleReset = () => {
    // Clear data from both persistence layers
    localStorage.removeItem("user-onboarding-data");
    resetForm();
    // Reload the page to ensure a clean state for all components
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Đăng ký tài khoản vay
          </h1>
          <p className="text-lg text-gray-600">
            Hoàn tất các bước sau để bắt đầu sử dụng dịch vụ của chúng tôi
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="absolute top-0 right-0"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Làm lại từ đầu
          </Button>
        </div>

        {/* Multi-Step Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <MultiStepFormRenderer config={userOnboardingForm} />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {/* 🔒 Thông tin của bạn được bảo mật tuyệt đối theo{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              chính sách bảo mật
            </a> */}
          </p>
        </div>
      </div>
    </div>
  );
}
