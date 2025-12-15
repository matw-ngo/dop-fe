import type React from "react";
import { useTranslations } from "next-intl";
import { CSS_CLASSES, URLS } from "../constants";
import type { TermsAgreementProps } from "../types";

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  value,
  onChange,
  error,
  termsLink = URLS.TERMS_AND_CONDITIONS,
  termsText,
}) => {
  const t = useTranslations("features.loan-application");

  return (
    <div className={CSS_CLASSES.TERMS_CONTAINER}>
      <div className={CSS_CLASSES.TERMS_TEXT}>
        {termsText || t("terms.text")}
        &nbsp;
        <a
          href={termsLink}
          target="_blank"
          rel="noopener noreferrer"
          className={CSS_CLASSES.TERMS_LINK}
        >
          {t("terms.link")}
        </a>
        &nbsp;của chúng tôi.
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="mt-2">
        <div className="mb-2 flex items-center">
          <input
            type="radio"
            id="radio-agree"
            name="term-agree"
            value="1"
            checked={value === "1"}
            onChange={(e) => onChange(e.target.value)}
            className={CSS_CLASSES.RADIO_INPUT}
          />
          <label htmlFor="radio-agree" className={CSS_CLASSES.RADIO_LABEL}>
            {t("terms.agree")}
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="radio-disagree"
            name="term-agree"
            value="0"
            checked={value === "0"}
            onChange={(e) => onChange(e.target.value)}
            className={CSS_CLASSES.RADIO_INPUT}
          />
          <label htmlFor="radio-disagree" className={CSS_CLASSES.RADIO_LABEL}>
            {t("terms.disagree")}
          </label>
        </div>
      </div>
    </div>
  );
};
