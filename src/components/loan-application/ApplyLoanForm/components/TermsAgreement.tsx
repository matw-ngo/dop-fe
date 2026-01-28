import { useTranslations } from "next-intl";
import type React from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { URLS } from "../constants";

export interface TermsAgreementProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  value,
  onChange,
  error,
}) => {
  const t = useTranslations("features.loan-application");
  const { theme } = useFormTheme();
  const tenant = useTenant();

  const primaryColor = theme.colors.primary;
  const textPrimary = theme.colors.textPrimary || "#073126";
  const errorColor = theme.colors.error || "#ff7474";
  const radioBorder = theme.colors.radioBorder || "#999999";

  const renderLink = (chunks: React.ReactNode) => (
    <a
      href={URLS.TERMS_AND_CONDITIONS}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline"
      style={{ color: primaryColor }}
    >
      {chunks}
    </a>
  );

  const renderPrivacyLink = (chunks: React.ReactNode) => (
    <a
      href={URLS.PRIVACY_POLICY}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline"
      style={{ color: primaryColor }}
    >
      {chunks}
    </a>
  );

  return (
    <div className="my-4 text-xs font-normal leading-5">
      <div style={{ color: textPrimary }}>
        {t.rich("terms.fullText", {
          companyName: tenant.name,
          terms: renderLink,
          privacy: renderPrivacyLink,
        })}
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: errorColor }}>
          {error}
        </p>
      )}
      <div className="mt-2">
        <div className="mb-2 flex items-start">
          <input
            type="radio"
            id="radio-agree"
            name="term-agree"
            value="1"
            checked={value === "1"}
            onChange={(e) => onChange(e.target.value)}
            className="relative top-[2px] w-[13px] h-[13px] appearance-none rounded-full border transition-all duration-200 checked:border-4 outline-none flex-shrink-0 cursor-pointer"
            style={
              {
                "--tw-ring-color": primaryColor,
                borderWidth: value === "1" ? "4px" : "1px",
                borderColor: value === "1" ? primaryColor : radioBorder,
              } as React.CSSProperties
            }
          />
          <label
            htmlFor="radio-agree"
            className="ml-2 text-xs font-normal leading-5 cursor-pointer"
            style={{ color: textPrimary }}
          >
            {t.rich("terms.agree", {
              terms: renderLink,
            })}
          </label>
        </div>
        <div className="flex items-start">
          <input
            type="radio"
            id="radio-disagree"
            name="term-agree"
            value="0"
            checked={value === "0"}
            onChange={(e) => onChange(e.target.value)}
            className="relative top-[2px] w-[13px] h-[13px] appearance-none rounded-full border transition-all duration-200 checked:border-4 outline-none flex-shrink-0 cursor-pointer"
            style={
              {
                borderWidth: value === "0" ? "4px" : "1px",
                borderColor: value === "0" ? primaryColor : radioBorder,
              } as React.CSSProperties
            }
          />
          <label
            htmlFor="radio-disagree"
            className="ml-2 text-xs font-normal leading-5 cursor-pointer"
            style={{ color: textPrimary }}
          >
            {t.rich("terms.disagree", {
              terms: renderLink,
            })}
          </label>
        </div>
      </div>
    </div>
  );
};
