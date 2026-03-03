"use client";
import { DollarSign, User } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import {
  CREDIT_HISTORY,
  CREDIT_STATUSES,
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_TYPE,
  FULL_NAME_REGEX,
  GENDER_OPTIONS,
  INCOME_AMOUNT,
  MARITAL_STATUS,
  ValidationConfig,
  VN_PROVINCES,
} from "@/app/[locale]/loan-wizard/constants";
import { validProvinceCodeNID12 } from "@/app/[locale]/loan-wizard/utils";
import { Button, SelectGroup, TextInput } from "@/components/ui";
import { EventType, trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { useLoanApplicationStore } from "@/store/use-loan-store";
import s from "./style.module.scss";

const provinceList = VN_PROVINCES.map((x) => ({
  label: x.label,
  value: x.value,
}));
const vehicleRegistrationOptions = (t: any) => [
  { label: t("personal.vehicleRegistration.options.yes"), value: "cavet" },
  { label: t("personal.vehicleRegistration.options.no"), value: "none" },
];
const _yearOptions = () => {
  const year = new Date().getFullYear() - ValidationConfig.MINIMUM_AGE;
  return Array.from(new Array(ValidationConfig.MAXIMUM_AGE), (_val, index) => ({
    name: (year - index).toString(),
    value: (year - index).toString(),
  }));
};

export const LoanExtraInfoForm = () => {
  const t = useTranslations("features.loan-extra-info");
  const {
    setFieldValue,
    getFieldValue,
    isSubmitting,
    fieldErrors,
    setFieldError,
    clearFieldError,
    applicationData,
  } = useLoanApplicationStore();

  const userData = React.useMemo(() => {
    return {
      full_name: applicationData.personalInfo?.fullName,
      national_id: applicationData.personalInfo?.nationalId,
      province: applicationData.personalInfo?.currentAddress?.provinceCode,
      career_status: applicationData.employmentInfo?.employmentType,
      income: applicationData.financialInfo?.monthlyIncomeRange,
      career_type: applicationData.employmentInfo?.industry,
      credit_status: applicationData.financialInfo?.existingLoans
        ?.hasExistingLoans
        ? 1
        : 0,
      having_loan: applicationData.financialInfo?.existingLoans
        ?.hasExistingLoans
        ? 1
        : 0,
      extra_docs: applicationData.documents?.addressProof?.documentType,
    };
  }, [applicationData]);

  const setUserLoanData = (field: string, value: any) => {
    const mapping: Record<string, string> = {
      full_name: "personalInfo.fullName",
      national_id: "personalInfo.nationalId",
      province: "personalInfo.currentAddress.provinceCode",
      career_status: "employmentInfo.employmentType",
      income: "financialInfo.monthlyIncomeRange",
      career_type: "employmentInfo.industry",
      credit_status: "financialInfo.existingLoans.hasExistingLoans",
      having_loan: "financialInfo.existingLoans.hasExistingLoans",
      extra_docs: "documents.addressProof.documentType",
    };
    const path = mapping[field] || field;
    setFieldValue(path, value);
  };

  const setUserLoanValidate = (field: string, valid: boolean, msg: string) => {
    if (valid) {
      clearFieldError(field);
    } else {
      setFieldError(field, msg);
    }
  };

  const userDataValidate = React.useMemo(() => {
    const fields = [
      "full_name",
      "national_id",
      "province",
      "career_status",
      "income",
      "career_type",
      "credit_status",
      "having_loan",
      "extra_docs",
    ];
    const result: Record<string, { valid: boolean; msg: string }> = {};
    fields.forEach((f) => {
      result[f] = {
        valid: !fieldErrors[f],
        msg: fieldErrors[f] || "",
      };
    });
    return result;
  }, [fieldErrors]);

  const {
    startSubmission,
    setSubmissionSuccess,
    setSubmissionError,
    setCurrentStep,
  } = useLoanApplicationStore();

  const [_isIncomeStep, _setIncomeStep] = React.useState(false);
  const [infoStep, setInforStep] = React.useState<
    "personal" | "income" | "finance"
  >("personal");
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async () => {
    trackEvent(EventType.LENDING_PAGE_FORM_SUBMIT, {});
    if (isLoading || !step3Validation()) {
      return;
    }

    setIsLoading(true);
    startSubmission();

    try {
      // Mock API call or actual submission logic
      console.log("Submitting loan data:", userData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmissionSuccess();
      setIsLoading(false);

      // Navigate or show success
      // setInforStep("personal");
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionError(
        error instanceof Error ? error.message : "Submission failed",
      );
      setIsLoading(false);
    }
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
    trackEvent(EventType.LENDING_PAGE_INPUT_NAME_VALID, { name: fullName });
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
      10,
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
    trackEvent(EventType.LENDING_PAGE_INPUT_NID_VALID, { nid: id });

    setUserLoanValidate("national_id", true, "");
    return 1;
  };
  const empStatusValidation = () => {
    const cs = userData.career_status as string;
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
    const ic = userData.income as string;
    let valid = 1;
    if (
      (userData.career_status === "formal" ||
        userData.career_status === "informal" ||
        userData.career_status === "self_employed") &&
      (!ic || ic === "-1")
    ) {
      setUserLoanValidate("income", false, t("income.incomeAmount.error"));
      valid = 0;
    } else {
      setUserLoanValidate("income", true, "");
    }

    return valid;
  };
  const empTypeValidation = () => {
    const ic = userData.career_type as string;
    let valid = 1;
    if (
      (userData.career_status === "formal" ||
        userData.career_status === "informal") &&
      (!ic || !ic.trim() || ic === "-1")
    ) {
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
    return result !== 0;
  };
  const step2Validation = () => {
    const result =
      incomeAmountValidation() * empStatusValidation() * empTypeValidation();
    return result !== 0;
  };
  const step3Validation = () => {
    return creditHistoryValidation() !== 0;
  };
  const isEmployment = useMemo(
    () =>
      userData.career_status === "formal" ||
      userData.career_status === "informal",
    [userData.career_status],
  );
  const shouldShowIncome = useMemo(
    () =>
      userData.career_status === "formal" ||
      userData.career_status === "informal" ||
      userData.career_status === "self_employed",
    [userData.career_status],
  );
  const onNameChangeHandle = (value: string) => {
    trackEvent(EventType.LENDING_PAGE_INPUT_NAME, { name: value });
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
              trackEvent(EventType.LENDING_PAGE_INPUT_NID, { nid: value });
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
              trackEvent(EventType.LENDING_PAGE_SELECT_PROVINCE, {
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
              trackEvent(EventType.LENDING_PAGE_SELECT_JOB, {
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
              trackEvent(EventType.LENDING_PAGE_SELECT_INDUSTRY, {
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
              trackEvent(EventType.LENDING_PAGE_SELECT_INCOME_RANGE, {
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
              trackEvent(EventType.LENDING_PAGE_SELECT_CURRENT_LOAN, {
                current_loan: value,
              });
              setUserLoanData("having_loan", parseInt(value, 10));
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
              trackEvent(EventType.LENDING_PAGE_SELECT_CREDIT_HISTORY, {
                credit_history: value,
              });
              setUserLoanData("credit_status", parseInt(value, 10));
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
