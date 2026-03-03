// EXAMPLE: How to use with real API data

import { useTranslations } from "next-intl";
import type React from "react";
import { useMemo, useState } from "react";
import { ConsentTermsContent } from "@/components/consent/ConsentForm";
import {
  ConsentDialog,
  ConsentDialogClose,
} from "@/components/consent/ConsentDialog";
import { useFormTheme } from "@/components/form-generation/themes";
import { useTermsContent } from "@/hooks/consent/use-terms-content";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { URLS } from "../constants";

export interface TermsAgreementProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  linkBehavior?: "dialog" | "newTab";
  // Optional: Pass consent purpose IDs to load real content
  termsConsentPurposeId?: string;
  privacyConsentPurposeId?: string;
}

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  value,
  onChange,
  error,
  linkBehavior = "dialog",
  termsConsentPurposeId,
  privacyConsentPurposeId,
}) => {
  const t = useTranslations("features.loan-application");
  const { theme } = useFormTheme();
  const tenant = useTenant();

  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  // Fetch real content from API
  const { data: termsContent, isLoading: isLoadingTerms } = useTermsContent({
    consentPurposeId: termsConsentPurposeId,
    enabled: showTermsDialog && !!termsConsentPurposeId,
  });

  const { data: privacyContent, isLoading: isLoadingPrivacy } = useTermsContent(
    {
      consentPurposeId: privacyConsentPurposeId,
      enabled: showPrivacyDialog && !!privacyConsentPurposeId,
    },
  );

  const consentThemeStyles = useMemo(
    () => ({
      "--consent-bg": theme.colors.background,
      "--consent-fg": theme.colors.textPrimary || "#0f172a",
      "--consent-muted": theme.colors.textSecondary || "#64748b",
      "--consent-border": theme.colors.border,
      "--consent-primary": theme.colors.primary,
    }),
    [theme],
  );

  const textColor = "text-[var(--form-text)]";
  const primaryColor = "text-[var(--form-primary)]";
  const errorColor = "text-[var(--form-error)]";
  const radioBorderColor = "border-[var(--form-border)]";

  const renderLink = (chunks: React.ReactNode) => {
    if (linkBehavior === "newTab") {
      return (
        <a
          href={URLS.TERMS_AND_CONDITIONS}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold underline hover:opacity-80 transition-opacity ${primaryColor}`}
        >
          {chunks}
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShowTermsDialog(true);
        }}
        className={`font-semibold underline hover:opacity-80 transition-opacity ${primaryColor}`}
      >
        {chunks}
      </button>
    );
  };

  const renderPrivacyLink = (chunks: React.ReactNode) => {
    if (linkBehavior === "newTab") {
      return (
        <a
          href={URLS.PRIVACY_POLICY}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold underline hover:opacity-80 transition-opacity ${primaryColor}`}
        >
          {chunks}
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShowPrivacyDialog(true);
        }}
        className={`font-semibold underline hover:opacity-80 transition-opacity ${primaryColor}`}
      >
        {chunks}
      </button>
    );
  };

  return (
    <>
      <div className="my-4 text-xs font-normal leading-5">
        <div className={textColor}>
          {t.rich("terms.fullText", {
            companyName: tenant.name,
            terms: renderLink,
            privacy: renderPrivacyLink,
          })}
        </div>
        {error && <p className={`text-xs mt-1 ${errorColor}`}>{error}</p>}
        <div className="mt-2">
          <div className="mb-2 flex items-start">
            <input
              type="radio"
              id="radio-agree"
              name="term-agree"
              value="1"
              checked={value === "1"}
              onChange={(e) => onChange(e.target.value)}
              className={`relative top-[2px] w-[13px] h-[13px] appearance-none rounded-full border transition-all duration-200 outline-none flex-shrink-0 cursor-pointer ${radioBorderColor} ${
                value === "1"
                  ? "!border-[var(--form-primary)] !border-4"
                  : "border"
              }`}
            />
            <label
              htmlFor="radio-agree"
              className={`ml-2 text-xs font-normal leading-5 cursor-pointer ${textColor}`}
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
              className={`relative top-[2px] w-[13px] h-[13px] appearance-none rounded-full border transition-all duration-200 outline-none flex-shrink-0 cursor-pointer ${radioBorderColor} ${
                value === "0"
                  ? "!border-[var(--form-primary)] !border-4"
                  : "border"
              }`}
            />
            <label
              htmlFor="radio-disagree"
              className={`ml-2 text-xs font-normal leading-5 cursor-pointer ${textColor}`}
            >
              {t.rich("terms.disagree", {
                terms: renderLink,
              })}
            </label>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Dialog with real API data */}
      {linkBehavior === "dialog" && (
        <>
          <ConsentDialog
            open={showTermsDialog}
            onOpenChange={setShowTermsDialog}
            title={t("terms.termsDialogTitle")}
            variant="center"
            themeStyles={consentThemeStyles}
          >
            <ConsentDialogClose onClose={() => setShowTermsDialog(false)} />
            {isLoadingTerms ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-[var(--consent-muted)]">Loading...</span>
              </div>
            ) : (
              <ConsentTermsContent
                consentVersion={
                  termsContent || {
                    content: `Nội dung Điều khoản sử dụng dịch vụ.\n\nĐể xem chi tiết, vui lòng truy cập: ${URLS.TERMS_AND_CONDITIONS}`,
                  }
                }
              />
            )}
          </ConsentDialog>

          {/* Privacy Policy Dialog with real API data */}
          <ConsentDialog
            open={showPrivacyDialog}
            onOpenChange={setShowPrivacyDialog}
            title={t("terms.privacyDialogTitle")}
            variant="center"
            themeStyles={consentThemeStyles}
          >
            <ConsentDialogClose onClose={() => setShowPrivacyDialog(false)} />
            {isLoadingPrivacy ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-[var(--consent-muted)]">Loading...</span>
              </div>
            ) : (
              <ConsentTermsContent
                consentVersion={
                  privacyContent || {
                    content: `Nội dung Chính sách bảo mật.\n\nĐể xem chi tiết, vui lòng truy cập: ${URLS.PRIVACY_POLICY}`,
                  }
                }
              />
            )}
          </ConsentDialog>
        </>
      )}
    </>
  );
};
