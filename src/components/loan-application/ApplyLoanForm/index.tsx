import React, { useState } from "react";
import type { ISelectBoxOption } from "@/components/ui/select-group";
import { Modal, SelectGroup, TextInput, Slider } from "@/components/ui";

const Button = ({ children, onClick, disabled, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-[#017848] hover:bg-[#016036] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const OtpForm = ({ size }: any) => (
  <div className="p-4 text-center font-['Lexend_Deca']">
    <p className="mb-4 text-sm font-normal leading-6">Vui lòng nhập mã OTP đã được gửi đến điện thoại của bạn</p>
    <div className="flex justify-center gap-2">
      {Array.from({ length: size }).map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center border border-[#bfd1cc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#017848]"
        />
      ))}
    </div>
  </div>
);

const eventTracking = (eventType: string, data: any) => {
  console.log("Event tracked:", eventType, data);
};

const EventType = {
  lending_page_input_expected_amount: "lending_page_input_expected_amount",
  lending_page_input_purpose: "lending_page_input_purpose",
  lending_page_input_phone_number: "lending_page_input_phone_number",
  lending_page_input_phone_number_valid: "lending_page_input_phone_number_valid",
};

const ALLOWED_TELCOS = ["Viettel", "Mobifone", "Vinaphone"];

const phoneValidation = (phone: string) => {
  const isValid = /^[0-9]{10,11}$/.test(phone);
  return {
    valid: isValid,
    telco: "Viettel",
    validNum: phone,
  };
};

const uuidv4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
  const r = Math.random() * 16 | 0;
  const v = c === "x" ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

const toast = {
  info: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

const LOAN_PURPOSES: ISelectBoxOption[] = [
  {
    label: "Vay mua đồ công nghệ",
    value: "cd_loan",
  },
  {
    label: "Vay tiêu dùng hàng ngày",
    value: "consumer_loan",
  },
  {
    label: "Vay học tập/học phí",
    value: "student_loan",
  },
  {
    label: "Vay du lịch",
    value: "travel_loan",
  },
  {
    label: "Vay sửa chữa nhà cửa",
    value: "improvement_loan",
  },
  {
    label: "Vay mua xe",
    value: "motor_loan",
  },
  {
    label: "Vay làm đẹp và chăm sóc sức khỏe",
    value: "healthcare_loan",
  },
  {
    label: "Mục đích khác",
    value: "other_loan",
  },
];

const ApplyLoanForm = () => {
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
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const setUserLoanValidate = (field: string, valid: boolean, msg: string) => {
    setUserDataValidate(prev => ({
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
        toast.info("Vui lòng đồng ý với điều khoản sử dụng để tiếp tục.");
      }
    } else {
      toast.info(rs.msg);
    }
  };

  React.useEffect(() => {
    setFormId(uuidv4());
  }, []);

  const onSubmitFinal = () => {
    if (validatePhoneNum()) {
      console.log("Form submitted:", { userData, formId });
    }
  };

  const validatePhoneNum = () => {
    let value = userData.phone_number;
    if (!value || !value.trim()) {
      setUserLoanValidate(
        "phone_number",
        false,
        "Số điện thoại không được để trống"
      );
      return 0;
    }
    let phoneVerify = phoneValidation(value);
    if (isNaN(parseInt(value)) || phoneVerify.valid == false) {
      setUserLoanValidate("phone_number", false, "Số điện thoại  không hợp lệ");
      return 0;
    }
    if (!ALLOWED_TELCOS.includes(phoneVerify.telco)) {
      setUserLoanValidate(
        "phone_number",
        false,
        `Chỉ hỗ trợ nhà mạng ${ALLOWED_TELCOS.join(", ")}`
      );
      return 0;
    }
    setUserLoanValidate("phone_number", true, "");
    setUserLoanData("phone_number", phoneVerify.validNum);
    eventTracking(EventType.lending_page_input_phone_number_valid, {
      phone_number: value,
    });
    return 1;
  };

  const validateForm = () => {
    const rs = {
      valid: true,
      msg: "",
    };
    if (!userData.expected_amount) {
      rs.valid = false;
      rs.msg = "Vui lòng chọn khoản vay";
    } else if (!userData.loan_period) {
      rs.valid = false;
      rs.msg = "Vui lòng chọn thời gian vay";
    } else if (!userData.loan_purpose || userData.loan_purpose === "-1") {
      rs.valid = false;
      rs.msg = "Vui lòng chọn mục đích vay";
    }
    return rs;
  };

  const onAmountChange = (value: number) => {
    setUserLoanData("expected_amount", value);
  };

  const onPurposeChange = (value: string) => {
    eventTracking(EventType.lending_page_input_purpose, {
      expected_purpose: value,
    });
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
          Số tiền vay:
        </label>
        <p className="mt-0.5 mb-0.5 text-xl font-semibold leading-[30px]">
          {userData.expected_amount === 0 ? (
            <h4 className="font-medium text-sm leading-[30px] mb-0.5">
              Chọn khoản vay
            </h4>
          ) : (
            <>
              {userData.expected_amount}.000.000
              <span className="text-sm leading-5 ml-1">đ</span>
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
              eventTracking(EventType.lending_page_input_expected_amount, {
                expected_amount: vals[0],
              });
              onAmountChange(vals[0]);
            }}
            className="mt-3"
          />
        </div>
      </div>

      {/* Thời hạn vay field */}
      <div className="relative mb-[34px] rounded-lg border border-[#bfd1cc] bg-white p-4 pb-[9px]">
        <label className="text-xs font-normal leading-4 text-[#4d7e70]">
          Thời hạn vay:
        </label>
        <p className="mt-0.5 mb-0.5 text-xl font-semibold leading-[30px]">
          {userData.loan_period === 0 ? (
            <h4 className="font-medium text-sm leading-[30px] mb-0.5">
              Chọn thời gian vay
            </h4>
          ) : (
            <>
              {userData.loan_period}
              <span className="text-sm leading-5 ml-1">tháng</span>
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
            className="mt-3"
          />
        </div>
      </div>

      {/* Mục đích vay field - Using new SelectGroup */}
      <div className="relative mb-0">
        <SelectGroup
          label="Mục đích vay"
          options={LOAN_PURPOSES}
          value={userData.loan_purpose}
          onChange={onPurposeChange}
          placeholder="- Chọn -"
        />
      </div>

      {/* Term Agreement */}
      <div className="my-4 text-xs font-normal leading-5">
        <div className="text-[#073126]">
          Để đăng kí và sử dụng dịch vụ từ Fin Zone, xin vui lòng đọc và đồng ý với&nbsp;
          <a
            href="/dieu-khoan-su-dung"
            target="_blank"
            className="text-[#017848] font-semibold"
          >
            Điều khoản sử dụng dịch vụ
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
              Tôi đồng ý và muốn sử dụng dịch vụ.
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
              Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.
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
            Nhập số điện thoại
          </p>
          <p className="text-center text-sm font-normal leading-6 mb-4">
            Nhập số điện thoại của bạn để tiếp tục tìm kiếm khoản vay
          </p>
          <div>
            <TextInput
              placeholder="Số điện thoại"
              value={userData.phone_number as string}
              onBlur={() => {
                validatePhoneNum();
              }}
              onChange={(value) => {
                eventTracking(EventType.lending_page_input_phone_number, {
                  phone_number: value,
                });
                setUserLoanData("phone_number", value);
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
              className="mx-auto block rounded-lg font-semibold md:text-sm"
              onClick={onSubmitFinal}
            >
              Tiếp Tục
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
        <OtpForm size={4} />
      </Modal>
    </div>
  );
};

export default ApplyLoanForm;