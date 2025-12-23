"use client";
import { FULL_NAME_REGEX, ValidationConfig } from "@app/configs/constants";
import {
  CREDIT_HISTORY,
  CREDIT_STATUSES,
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_TYPE,
  GENDERS,
  INCOME_AMOUNT,
} from "@app/configs/data";
import { VN_PROVINCES } from "@app/helpers/location";
import { EventType, eventTracking } from "@app/helpers/user-tracking";
import { validProvinceCodeNID12 } from "@app/helpers/validate";
import { ActionContext } from "@app/states/zu-action";
import { useLoanStore } from "@app/states/zu-store";
import { DollarSign, User } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, SelectGroup, TextInput } from "@/components/ui";
import { cn } from "@/lib/utils";
import s from "./style.module.scss";

const provinceList = VN_PROVINCES.map((x) => ({
  label: x.label,
  value: x.value,
}));
const vehicleRegistrationOptions = (t: any) => [
  { label: t("personal.vehicleRegistration.options.yes"), value: "cavet" },
  { label: t("personal.vehicleRegistration.options.no"), value: "none" },
];
const yearOptions = () => {
  const year = new Date().getFullYear() - ValidationConfig.MINIMUM_AGE;
  return Array.from(new Array(ValidationConfig.MAXIMUM_AGE), (val, index) => ({
    name: (year - index).toString(),
    value: (year - index).toString(),
  }));
};

export const LoanExtraInfoForm = () => {
  const t = useTranslations("features.loan-extra-info");
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
    const province = userData.province;
    let valid = 1;
    if (!province || !province.trim()) {
      setUserLoanValidate("province", false, t("personal.province.error"));
      valid = 0;
    } else {
      setUserLoanValidate("province", true, "");
    }

    return valid;
  };
  const fullNameValidation = () => {
    const fullName = userData.full_name;
    if (!fullName) {
      setUserLoanValidate(
        "full_name",
        false,
        t("personal.fullName.error.invalid"),
      );
      return 0;
    }
    if (!FULL_NAME_REGEX.test(fullName.trim())) {
      setUserLoanValidate(
        "full_name",
        false,
        t("personal.fullName.error.format"),
      );
      return 0;
    }
    eventTracking(EventType.lending_page_input_name_valid, { name: fullName });
    setUserLoanValidate("full_name", true, "");
    return 1;
  };
  const nationalIdValidation = () => {
    const id = userData.national_id;
    const validateRegex = new RegExp(/^[0-9]{3}[0-3][0-9]{8}$/);
    if (!id || !id.trim()) {
      setUserLoanValidate(
        "national_id",
        false,
        t("personal.nationalId.error.required"),
      );
      return 0;
    }
    if (!validateRegex.test(id)) {
      setUserLoanValidate(
        "national_id",
        false,
        t("personal.nationalId.error.invalid"),
      );
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
        t("personal.nationalId.error.ageLimit"),
      );
      return 0;
    }
    setUserLoanData("birthyear", birthYear);
    const provinceCode = id.substring(0, 3);
    if (!validProvinceCodeNID12(provinceCode)) {
      setUserLoanValidate(
        "national_id",
        false,
        t("personal.nationalId.error.provinceCode"),
      );
      return 0;
    }
    eventTracking(EventType.lending_page_input_nid_valid, { nid: id });

    setUserLoanValidate("national_id", true, "");
    return 1;
  };
  const empStatusValidation = () => {
    const cs = userData.career_status;
    let valid = 1;
    if (!cs || !cs.trim()) {
      setUserLoanValidate(
        "career_status",
        false,
        t("income.careerStatus.error"),
      );
      valid = 0;
    } else {
      setUserLoanValidate("career_status", true, "");
    }

    return valid;
  };
  const incomeAmountValidation = () => {
    const ic = userData.income;
    let valid = 1;
    if (
      (userData.career_status === "employed" ||
        userData.career_status === "self_employed") &&
      (!ic || ic <= 0)
    ) {
      setUserLoanValidate("income", false, t("income.incomeAmount.error"));
      valid = 0;
    } else {
      setUserLoanValidate("income", true, "");
    }

    return valid;
  };
  const empTypeValidation = () => {
    const ic = userData.career_type;
    let valid = 1;
    if (userData.career_status === "employed" && (!ic || !ic.trim())) {
      setUserLoanValidate("career_type", false, t("income.careerType.error"));
      valid = 0;
    } else {
      setUserLoanValidate("career_type", true, "");
    }

    return valid;
  };
  const creditHistoryValidation = () => {
    const ic = userData.credit_status;
    let valid = 1;
    if (ic >= 0) {
      setUserLoanValidate("credit_status", true, "");
    } else {
      setUserLoanValidate(
        "credit_status",
        false,
        t("finance.creditHistory.error"),
      );
      valid = 0;
    }

    return valid;
  };
  const step1Validation = () => {
    const result =
      locationValidation() * nationalIdValidation() * fullNameValidation();
    return result != 0;
  };
  const step2Validation = () => {
    const result =
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
          <span>{t("personal.title")}</span>
        </div>
        <div className={s.field}>
          <TextInput
            className={s.text_input}
            value={userData.full_name || ""}
            placeholder={t("personal.fullName.placeholder")}
            onBlur={fullNameValidation}
            onChange={(e) => onNameChangeHandle(e.target.value)}
            error={!userDataValidate.full_name.valid}
            errorMessage={
              !userDataValidate.full_name.valid
                ? userDataValidate.full_name.msg
                : ""
            }
          ></TextInput>
          {/* Removed redundant error span as TextInput handles it */}
        </div>
        <div className={s.field}>
          <TextInput
            className={s.text_input}
            placeholder={t("personal.nationalId.placeholder")}
            onBlur={nationalIdValidation}
            value={userData.national_id || ""}
            onChange={(e) => {
              const value = e.target.value;
              eventTracking(EventType.lending_page_input_nid, { nid: value });
              setUserLoanData("national_id", value);
            }}
            error={!userDataValidate.national_id.valid}
            errorMessage={
              !userDataValidate.national_id.valid
                ? userDataValidate.national_id.msg
                : ""
            }
          ></TextInput>
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field)}>
          <SelectGroup
            label={t("personal.province.label")}
            options={provinceList}
            value={userData.province || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_province, {
                living_province: value,
              });
              setUserLoanData("province", value);
            }}
            error={
              !userDataValidate.province.valid
                ? userDataValidate.province.msg
                : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field)}>
          <SelectGroup
            label={t("personal.vehicleRegistration.label")}
            options={vehicleRegistrationOptions(t)}
            value={userData.extra_docs || "-1"}
            onChange={(value) => {
              setUserLoanData("extra_docs", value);
            }}
            error={
              !userDataValidate.extra_docs.valid
                ? userDataValidate.extra_docs.msg
                : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={s.field}>
          <Button className={s.btn} onClick={moveToIncomeStep}>
            {t("personal.continue")}
          </Button>
        </div>
      </div>
      <div className={cn(s.income_info, { hidden: infoStep !== "income" })}>
        <div className={s.caption}>
          <DollarSign />
          <span>{t("income.title")}</span>
        </div>
        <div className={cn(s.field)}>
          <SelectGroup
            label={t("income.careerStatus.label")}
            options={EMPLOYMENT_STATUSES}
            value={userData.career_status || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_job, {
                job: value,
              });
              setUserLoanData("career_status", value);
            }}
            error={
              !userDataValidate.career_status.valid
                ? userDataValidate.career_status.msg
                : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field, { "is-hidden": !isEmployment })}>
          <SelectGroup
            label={t("income.careerType.label")}
            options={EMPLOYMENT_TYPE}
            value={userData.career_type || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_industry, {
                industry: value,
              });
              setUserLoanData("career_type", value);
            }}
            error={
              !userDataValidate.career_type.valid
                ? userDataValidate.career_type.msg
                : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field, { "is-hidden": !shouldShowIncome })}>
          <SelectGroup
            label={t("income.incomeAmount.label")}
            options={INCOME_AMOUNT}
            value={userData.income || "-1"}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_income_range, {
                monthly_income_range: value,
              });
              setUserLoanData("income", value);
            }}
            error={
              !userDataValidate.income.valid ? userDataValidate.income.msg : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field, "mt-5")}>
          <Button className={s.btn} onClick={moveToCreditStep}>
            {t("income.continue")}
          </Button>
        </div>
      </div>
      <div className={cn(s.credit_info, { hidden: infoStep !== "finance" })}>
        <div className={s.caption}>
          <DollarSign />
          <span>{t("finance.title")}</span>
        </div>
        <div className={cn(s.field, "mt-4")}>
          <SelectGroup
            label={t("finance.havingLoan.label")}
            options={CREDIT_STATUSES}
            value={userData.having_loan.toString()}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_current_loan, {
                current_loan: value,
              });
              setUserLoanData("having_loan", parseInt(value));
            }}
            error={
              !userDataValidate.having_loan.valid
                ? userDataValidate.having_loan.msg
                : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field, "mt-4")}>
          <SelectGroup
            label={t("finance.creditHistory.label")}
            options={CREDIT_HISTORY}
            value={userData.credit_status.toString()}
            onChange={(value) => {
              eventTracking(EventType.lending_page_select_credit_history, {
                credit_history: value,
              });
              setUserLoanData("credit_status", parseInt(value));
            }}
            error={
              !userDataValidate.credit_status.valid
                ? userDataValidate.credit_status.msg
                : ""
            }
          />
          {/* Removed redundant error span */}
        </div>
        <div className={cn(s.field, "mt-5")}>
          <Button className={s.btn} onClick={onSubmit}>
            {t("finance.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};
