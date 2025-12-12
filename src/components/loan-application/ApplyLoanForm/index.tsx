import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { trackLoanApplication } from "@/lib/tracking/events";
import { useLoanPurposes } from "@/hooks/use-loan-purposes";
import { usePhoneValidationMessages } from "@/hooks/use-phone-validation-messages";

import {
  Modal,
  SelectGroup,
  TextInput,
  Slider,
  Button,
  OtpContainer,
} from "@/components/ui";
import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";

const ApplyLoanForm = () => {
  const t = useTranslations("features.loan-application");

  // Debug: Check if translations are loaded
  if (process.env.NODE_ENV === "development") {
    // Get the raw function to test if keys exist
    const testKey = (key: string) => {
      try {
        const value = t(key);
        return value;
      } catch (e) {
        return `[KEY NOT FOUND: ${key}]`;
      }
    };

    console.log("🔍 Translation namespace:", "features.loan-application");
    console.log("🔍 Testing individual keys:", {
      title: testKey("title"),
      expectedAmountLabel: testKey("expectedAmount.label"),
      loanPeriodLabel: testKey("loanPeriod.label"),
      loanPurposeLabel: testKey("loanPurpose.label"),
      submitButton: testKey("submit.button"),
      // Test some nested keys that should exist
      errors: {
        phoneRequired: testKey("errors.phoneRequired"),
        amountRequired: testKey("errors.amountRequired"),
      },
      otp: {
        title: testKey("otp.title"),
        description: testKey("otp.description"),
      },
    });
  }
  const loanPurposes = useLoanPurposes();
  const { getTelcoList } = usePhoneValidationMessages();

  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [agreeStatus, setAgreeStatus] = useState<"0" | "1" | "">("");
  const [formId, setFormId] = useState("");

  const [userData, setUserData] = useState({
    expected_amount: 0,
    loan_period: 0,
    loan_purpose: "",
    phone_number: "",
  });

  const [userDataValidate, setUserDataValidate] = useState({
    phone_number: {
      valid: true,
      msg: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLoanStep, setCurrentLoanStep] = useState(0);

  const setUserLoanData = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setUserLoanValidate = (field: string, valid: boolean, msg: string) => {
    setUserDataValidate((prev) => ({
      ...prev,
      [field]: {
        valid,
        msg,
      },
    }));
  };

  const navigateToHomepage = () => {
    setCurrentLoanStep(0);
  };

  const onSubmitFirstStep = () => {
    const rs = validateForm();
    if (rs.valid) {
      if (agreeStatus === "1") {
        setShowPhoneModal(true);
      } else {
        toast.info(t("messages.agreeRequired"));
      }
    } else {
      toast.info(rs.msg);
    }
  };

  React.useEffect(() => {
    setFormId(crypto.randomUUID());
  }, []);

  const onSubmitFinal = () => {
    if (validatePhoneNum()) {
      console.log("Form submitted:", { userData, formId });
      // Show OTP modal after phone validation
      setShowPhoneModal(false);
      setShowOTPModal(true);
    }
  };

  // OTP event handlers
  const handleOtpSuccess = (otp: string) => {
    console.log("OTP verified successfully:", otp);
    // Here you can proceed to the next step after successful OTP verification
    toast.info(t("messages.otpSuccess"));
    setShowOTPModal(false);
  };

  const handleOtpFailure = (error: string) => {
    console.error("OTP verification failed:", error);
    toast.error(error);
  };

  const handleOtpExpired = () => {
    console.log("OTP expired");
    toast.error(t("messages.otpExpired"));
  };

  const validatePhoneNum = () => {
    let value = String(userData.phone_number || "");
    if (!value || !value.trim()) {
      setUserLoanValidate("phone_number", false, t("errors.phoneRequired"));
      return 0;
    }
    let phoneVerify = phoneValidation(value);
    if (isNaN(parseInt(value)) || phoneVerify.valid == false) {
      setUserLoanValidate("phone_number", false, t("errors.phoneInvalid"));
      return 0;
    }
    if (!ALLOWED_TELCOS.includes(phoneVerify.telco)) {
      const telcoList = getTelcoList();
      setUserLoanValidate(
        "phone_number",
        false,
        t("errors.telcoNotSupported", { telcos: telcoList }),
      );
      return 0;
    }
    setUserLoanValidate("phone_number", true, "");
    setUserLoanData("phone_number", phoneVerify.validNum);
    trackLoanApplication.phoneNumberValid(
      phoneVerify.validNum,
      phoneVerify.telco,
    );
    return 1;
  };

  const validateForm = () => {
    const rs = {
      valid: true,
      msg: "",
    };
    if (!userData.expected_amount) {
      rs.valid = false;
      rs.msg = t("errors.amountRequired");
    } else if (!userData.loan_period) {
      rs.valid = false;
      rs.msg = t("errors.periodRequired");
    } else if (!userData.loan_purpose || userData.loan_purpose === "-1") {
      rs.valid = false;
      rs.msg = t("errors.purposeRequired");
    }
    return rs;
  };

  const onAmountChange = (value: number) => {
    setUserLoanData("expected_amount", value);
  };

  const onPurposeChange = (value: string) => {
    trackLoanApplication.inputPurpose(value);
    setUserLoanData("loan_purpose", value);
  };

  const onCloseModal = () => {
    navigateToHomepage();
  };

  return (
    <div className="font-['Lexend_Deca'] max-w-2xl mx-auto p-4">
      {/* Số tiền vay field */}
      <div className="relative mb-[34px] rounded-lg border border-[#bfd1cc] bg-white p-4 pb-[9px]">
        <label className="text-xs font-normal leading-4 text-[#4d7e70]">
          {t("expectedAmount.label")}:
        </label>
        <p className="mt-0.5 mb-0.5 text-xl font-semibold leading-[30px]">
          {userData.expected_amount === 0 ? (
            <h4 className="font-medium text-sm leading-[30px] mb-0.5">
              {t("expectedAmount.placeholder")}
            </h4>
          ) : (
            <>
              {userData.expected_amount}.000.000
              <span className="text-sm leading-5 ml-1">
                {t("expectedAmount.currency")}
              </span>
            </>
          )}
        </p>
        <div className="absolute bottom-[-9px] left-4 w-[calc(100%-32px)]">
          <Slider
            value={userData.expected_amount}
            min={5}
            max={90}
            step={5}
            onValueChange={(vals) => {
              trackLoanApplication.inputExpectedAmount(vals[0]);
              onAmountChange(vals[0]);
            }}
          />
        </div>
      </div>

      {/* Thời hạn vay field */}
      <div className="relative mb-[34px] rounded-lg border border-[#bfd1cc] bg-white p-4 pb-[9px]">
        <label className="text-xs font-normal leading-4 text-[#4d7e70]">
          {t("loanPeriod.label")}:
        </label>
        <p className="mt-0.5 mb-0.5 text-xl font-semibold leading-[30px]">
          {userData.loan_period === 0 ? (
            <h4 className="font-medium text-sm leading-[30px] mb-0.5">
              {t("loanPeriod.placeholder")}
            </h4>
          ) : (
            <>
              {userData.loan_period}
              <span className="text-sm leading-5 ml-1">
                {t("loanPeriod.unit")}
              </span>
            </>
          )}
        </p>
        <div className="absolute bottom-[-9px] left-4 w-[calc(100%-32px)]">
          <Slider
            value={userData.loan_period}
            min={3}
            max={36}
            step={1}
            onValueChange={(vals) => {
              setUserLoanData("loan_period", vals[0]);
            }}
          />
        </div>
      </div>

      {/* Mục đích vay field - Using new SelectGroup */}
      <div className="relative mb-0">
        <SelectGroup
          label={t("loanPurpose.label")}
          options={loanPurposes}
          value={userData.loan_purpose}
          onChange={onPurposeChange}
          placeholder={t("loanPurpose.placeholder")}
        />
      </div>

      {/* Term Agreement */}
      <div className="my-4 text-xs font-normal leading-5">
        <div className="text-[#073126]">
          {t("terms.text")}
          &nbsp;
          <a
            href="/dieu-khoan-su-dung"
            target="_blank"
            className="text-[#017848] font-semibold"
          >
            {t("terms.link")}
          </a>
          &nbsp;của chúng tôi.
        </div>
        <div
          className="mt-2"
          onChange={(e: any) => {
            setAgreeStatus(e.target.value);
          }}
        >
          <div className="mb-2 flex items-center">
            <input
              type="radio"
              id="radio-agree"
              name="term-agree"
              value="1"
              className="relative top-0.5 w-[13px] h-[13px] appearance-none rounded-full border border-[#999] transition-all duration-200 checked:border-4 checked:border-[#017848] outline-none"
            />
            <label
              htmlFor="radio-agree"
              className="ml-2 font-['Lexend_Deca'] text-sm md:text-xs font-normal leading-5 text-[#017848]"
            >
              {t("terms.agree")}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="radio-disagree"
              name="term-agree"
              value="0"
              className="relative top-0.5 w-[13px] h-[13px] appearance-none rounded-full border border-[#999] transition-all duration-200 checked:border-4 checked:border-[#017848] outline-none"
            />
            <label
              htmlFor="radio-disagree"
              className="ml-2 font-['Lexend_Deca'] text-sm md:text-xs font-normal leading-5 text-[#017848]"
            >
              {t("terms.disagree")}
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        className="h-14 w-full rounded-lg whitespace-nowrap"
        disabled={isSubmitting}
        onClick={onSubmitFirstStep}
      >
        {isSubmitting ? "Đang xử lý..." : "Bắt đầu tìm kiếm khoản vay"}
      </Button>

      {/* Phone Modal */}
      <Modal
        open={showPhoneModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowPhoneModal(false);
            onCloseModal();
          }
        }}
        size="lg"
      >
        <div className="font-['Lexend_Deca']">
          <p className="text-center text-2xl font-bold leading-8 mb-3">
            {t("otp.title")}
          </p>
          <p className="text-center text-sm font-normal leading-6 mb-4">
            {t("otp.description")}
          </p>
          <div>
            <TextInput
              placeholder={t("otp.placeholder")}
              value={userData.phone_number as string}
              onBlur={() => {
                validatePhoneNum();
              }}
              onChange={(e) => {
                const value = e.target.value;
                trackLoanApplication.inputPhoneNumber(value);
                setUserLoanData("phone_number", String(value || ""));
              }}
            />
            <span className="block min-h-[18px] text-[11px] text-[rgb(255,116,116)]">
              {!userDataValidate.phone_number.valid
                ? userDataValidate.phone_number.msg
                : ""}
            </span>
          </div>
          <div>
            <Button
              className="mx-auto block rounded-lg font-semibold md:text-sm w-full bg-primary"
              onClick={onSubmitFinal}
            >
              {t("otp.continue")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* OTP Modal */}
      <Modal
        open={showOTPModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowOTPModal(false);
            onCloseModal();
          }
        }}
        size="md"
      >
        <OtpContainer
          phoneNumber={userData.phone_number}
          size={4}
          otpType={2} // SMS OTP
          onSuccess={handleOtpSuccess}
          onFailure={handleOtpFailure}
          onExpired={handleOtpExpired}
        />
      </Modal>
    </div>
  );
};

export default ApplyLoanForm;
