"use client";
import s from "./style.module.scss";
import { VN_PROVINCES } from "@app/helpers/location";
import { FULL_NAME_REGEX, ValidationConfig } from "@app/configs/constants";
import React, { useEffect, useMemo } from "react";
import { useLoanStore } from "@app/states/zu-store";
import { validProvinceCodeNID12 } from "@app/helpers/validate";
import { ActionContext } from "@app/states/zu-action";
import {
  CREDIT_HISTORY,
  CREDIT_STATUSES,
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_TYPE,
  GENDERS,
  INCOME_AMOUNT,
} from "@app/configs/data";
import { off } from "process";
import { EventType, eventTracking } from "@app/helpers/user-tracking";
import { cn } from "@/lib/utils";
import { DollarSign, User } from "lucide-react";
import { Button, SelectGroup, TextInput } from "@/components/ui";

const provinceList = VN_PROVINCES.map((x) => ({
  label: x.label,
  value: x.value,
}));
const vehicleRegistrationOptions = [
  { label: "Có", value: "cavet" },
  { label: "Không", value: "none" },
];
const yearOptions = () => {
  const year = new Date().getFullYear() - ValidationConfig.MINIMUM_AGE;
  return Array.from(new Array(ValidationConfig.MAXIMUM_AGE), (val, index) => ({
    name: (year - index).toString(),
    value: (year - index).toString(),
  }));
};

export const LoanExtraInfoForm = () => {
  const {
    setUserLoanData,
    setUserLoanValidate,
    leadData,
    userData,
    userDataValidate,
    isSubmitting,
    currentLoanStep,
    loanExtraInfoSubmitted,
  } = useLoanStore();
  const { finishLoanExtraInfoSubmit } = React.useContext(ActionContext);
  const [isIncomeStep, setIncomeStep] = React.useState(false);
  const [infoStep, setInforStep] = React.useState<
    "personal" | "income" | "finance"
  >("personal");
  const [isLoading, setIsLoading] = React.useState(false);
  const onSubmit = () => {
    eventTracking(EventType.lending_page_click_submit, {});
    if (isLoading || !step3Validation()) {
      // if (isLoading) {
      return;
    }
    setIsLoading(true);
    finishLoanExtraInfoSubmit(userData);
  };
  const moveToIncomeStep = () => {
    if (step1Validation()) {
      setInforStep("income");
    }
  };
  const moveToCreditStep = () => {
    if (step2Validation()) {
      setInforStep("finance");
    }
  };

  const locationValidation = () => {
    let province = userData.province;
    let valid = 1;
    if (!province || !province.trim()) {
      setUserLoanValidate(
        "province",
        false,
        "Vui lòng chọn tỉnh thành hiện tại",
      );
      valid = 0;
    } else {
      setUserLoanValidate("province", true, "");
    }

    return valid;
  };
  const fullNameValidation = () => {
    let fullName = userData.full_name;
    if (!fullName) {
      setUserLoanValidate("full_name", false, "Họ tên không hợp lệ");
      return 0;
    }
    if (!FULL_NAME_REGEX.test(fullName.trim())) {
      setUserLoanValidate(
        "full_name",
        false,
        "Họ và tên chỉ gồm ký tự chữ cái a-z và gồm cả họ và tên",
      );
      return 0;
    }
    eventTracking(EventType.lending_page_input_name_valid, { name: fullName });
    setUserLoanValidate("full_name", true, "");
    return 1;
  };
  const nationalIdValidation = () => {
    let id = userData.national_id;
    let validateRegex = new RegExp(/^[0-9]{3}[0-3][0-9]{8}$/);
    if (!id || !id.trim()) {
      setUserLoanValidate("national_id", false, "Vui lòng nhập số CCCD");
      return 0;
    }
    if (!validateRegex.test(id)) {
      setUserLoanValidate("national_id", false, "Số CCCD không hợp lệ");
      return 0;
    }
    const birthCode = id.substring(3, 6);
    const minYear = new Date().getFullYear() - ValidationConfig.MAXIMUM_AGE;
    const maxYear = new Date().getFullYear() - ValidationConfig.MINIMUM_AGE;
    const birthYear = parseInt(
      ["0", "1"].includes(birthCode[0])
        ? `19${birthCode.substring(1, 3)}`
        : `20${birthCode.substring(1, 3)}`,
    );
    if (birthYear < minYear || birthYear > maxYear) {
      setUserLoanValidate(
        "national_id",
        false,
        "Số CCCD không hợp lệ: Năm sinh không thỏa yêu cầu.",
      );
      return 0;
    }
    setUserLoanData("birthyear", birthYear);
    const provinceCode = id.substring(0, 3);
    if (!validProvinceCodeNID12(provinceCode)) {
      setUserLoanValidate(
        "national_id",
        false,
        "Số CCCD không hợp lệ: Mã tỉnh thành không chính xác.",
      );
      return 0;
    }
    eventTracking(EventType.lending_page_input_nid_valid, { nid: id });

    setUserLoanValidate("national_id", true, "");
    return 1;
  };
  const empStatusValidation = () => {
    let cs = userData.career_status;
    let valid = 1;
    if (!cs || !cs.trim()) {
      setUserLoanValidate(
        "career_status",
        false,
        "Vui lòng chọn tình trạng việc làm của bạn.",
      );
      valid = 0;
    } else {
      setUserLoanValidate("career_status", true, "");
    }

    return valid;
  };
  const incomeAmountValidation = () => {
    let ic = userData.income;
    let valid = 1;
    if (
      (userData.career_status === "employed" ||
        userData.career_status === "self_employed") &&
      (!ic || ic <= 0)
    ) {
      setUserLoanValidate(
        "income",
        false,
        "Vui lòng chọn khoản thu nhập của bạn.",
      );
      valid = 0;
    } else {
      setUserLoanValidate("income", true, "");
    }

    return valid;
  };
  const empTypeValidation = () => {
    let ic = userData.career_type;
    let valid = 1;
    if (userData.career_status === "employed" && (!ic || !ic.trim())) {
      setUserLoanValidate(
        "career_type",
        false,
        "Vui lòng chọn lĩnh vực nghề nghiệp của bạn.",
      );
      valid = 0;
    } else {
      setUserLoanValidate("career_type", true, "");
    }

    return valid;
  };
  const creditHistoryValidation = () => {
    let ic = userData.credit_status;
    let valid = 1;
    if (ic >= 0) {
      setUserLoanValidate("credit_status", true, "");
    } else {
      setUserLoanValidate(
        "credit_status",
        false,
        "Vui lòng chọn lịch sử tín dụng của bạn.",
      );
      valid = 0;
    }

    return valid;
  };
  const step1Validation = () => {
    let result =
      locationValidation() * nationalIdValidation() * fullNameValidation();
    return result != 0;
  };
  const step2Validation = () => {
    let result =
      incomeAmountValidation() * empStatusValidation() * empTypeValidation();
    return result != 0;
  };
  const step3Validation = () => {
    return creditHistoryValidation() != 0;
  };
  const isEmployment = useMemo(
    () => userData.career_status === "employed",
    [userData.career_status],
  );
  const shouldShowIncome = useMemo(
    () =>
      userData.career_status === "employed" ||
      userData.career_status === "self_employed",
    [userData.career_status],
  );
  const onNameChangeHandle = (value: string) => {
    eventTracking(EventType.lending_page_input_name, { name: value });
    setUserLoanData("full_name", value);
  };
  return (
    <div className={s.loan_extra_form}>
      <div className={cn(s.personal_info, { hidden: infoStep !== "personal" })}>
        <div className={s.caption}>
          <User />
          <span>Thông tin cá nhân</span>
        </div>
        <div className={s.field}>
          <TextInput
            classNames={s.text_input}
            value={userData.full_name || ""}
            placeholder="Họ và tên"
            onBlur={fullNameValidation}
            onChange={onNameChangeHandle}
          ></TextInput>
          <span className={cn(s.error)}>
            {!userDataValidate.full_name.valid
              ? userDataValidate.full_name.msg
              : ""}
          </span>
        </div>
        <div className={s.field}>
          <TextInput
            classNames={s.text_input}
            placeholder="Căn cước công dân 12 Số"
            onBlur={nationalIdValidation}
            value={userData.national_id || ""}
            onChange={(value) => {
              eventTracking(EventType.lending_page_input_nid, { nid: value });
              setUserLoanData("national_id", value);
            }}
          ></TextInput>
          <span className={cn(s.error)}>
            {!userDataValidate.national_id.valid
              ? userDataValidate.national_id.msg
              : ""}
          </span>
        </div>
        <div className={cn(s.field)}>
          <SelectGroup
            label="Tỉnh thành"
            listOptions={provinceList}
            value={userData.province || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_province, {
                living_province: value,
              });
              setUserLoanData("province", value);
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.province.valid
              ? userDataValidate.province.msg
              : ""}
          </span>
        </div>
        <div className={cn(s.field)}>
          <SelectGroup
            label="Sở hữu Đăng ký/ Cà vẹt xe chính chủ"
            listOptions={vehicleRegistrationOptions}
            value={userData.extra_docs || "-1"}
            onChange={(value) => {
              setUserLoanData("extra_docs", value);
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.extra_docs.valid
              ? userDataValidate.extra_docs.msg
              : ""}
          </span>
        </div>
        <div className={s.field}>
          <Button className={s.btn} onClick={moveToIncomeStep}>
            Tiếp tục
          </Button>
        </div>
      </div>
      <div className={cn(s.income_info, { hidden: infoStep !== "income" })}>
        <div className={s.caption}>
          <DollarSign />
          <span>Thông tin thu nhập</span>
        </div>
        <div className={cn(s.field)}>
          <SelectGroup
            label="Tình trạng việc làm"
            listOptions={EMPLOYMENT_STATUSES}
            value={userData.career_status || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_job, {
                job: value,
              });
              setUserLoanData("career_status", value);
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.career_status.valid
              ? userDataValidate.career_status.msg
              : ""}
          </span>
        </div>
        <div className={cn(s.field, { "is-hidden": !isEmployment })}>
          <SelectGroup
            label="Lĩnh vực làm việc"
            listOptions={EMPLOYMENT_TYPE}
            value={userData.career_type || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_industry, {
                industry: value,
              });
              setUserLoanData("career_type", value);
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.career_type.valid
              ? userDataValidate.career_type.msg
              : ""}
          </span>
        </div>
        <div className={cn(s.field, { "is-hidden": !shouldShowIncome })}>
          <SelectGroup
            label="Mức thu nhập"
            listOptions={INCOME_AMOUNT}
            value={userData.income || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_income_range, {
                monthly_income_range: value,
              });
              setUserLoanData("income", value);
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.income.valid ? userDataValidate.income.msg : ""}
          </span>
        </div>
        <div className={cn(s.field, "mt-5")}>
          <Button
            className={s.btn}
            onClick={moveToCreditStep}
            isLoading={isLoading}
          >
            Tiếp Tục
          </Button>
        </div>
      </div>
      <div className={cn(s.credit_info, { hidden: infoStep !== "finance" })}>
        <div className={s.caption}>
          <IncomeIcon />
          <span>Thông tin tài chính</span>
        </div>
        <div className={cn(s.field, "mt-4")}>
          <SelectGroup
            label="Hiện tại, Bạn đang có khoản vay tổ chức tài chính/ngân hàng không?"
            listOptions={CREDIT_STATUSES}
            value={userData.having_loan.toString()}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_current_loan, {
                current_loan: value,
              });
              setUserLoanData("having_loan", parseInt(value));
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.having_loan.valid
              ? userDataValidate.having_loan.msg
              : ""}
          </span>
        </div>
        <div className={cn(s.field, "mt-4")}>
          <SelectGroup
            label="Lịch sử tín dụng của bạn trong 3 năm gần đây?"
            listOptions={CREDIT_HISTORY}
            value={userData.credit_status.toString()}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_credit_history, {
                credit_history: value,
              });
              setUserLoanData("credit_status", parseInt(value));
            }}
          />
          <span className={cn(s.error)}>
            {!userDataValidate.credit_status.valid
              ? userDataValidate.credit_status.msg
              : ""}
          </span>
        </div>
        <div className={cn(s.field, "mt-5")}>
          <Button className={s.btn} onClick={onSubmit} isLoading={isLoading}>
            Bắt Đầu Tìm Kiếm Khoản Vay
          </Button>
        </div>
      </div>
    </div>
  );
};
