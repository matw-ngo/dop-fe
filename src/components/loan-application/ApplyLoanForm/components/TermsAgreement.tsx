import { useTranslations } from "next-intl";
import type React from "react";
import { type CSSProperties, useMemo, useState } from "react";
import { ConsentTermsContent } from "@/components/consent/ConsentForm";
import {
  ConsentDialog,
  ConsentDialogClose,
} from "@/components/consent/ConsentDialog";
import { Button } from "@/components/ui/button";
import { useFormTheme } from "@/components/form-generation/themes";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { URLS } from "../constants";

export interface TermsAgreementProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /**
   * Configuration for links behavior
   * - "dialog": Open content in dialog (default)
   * - "newTab": Open in new browser tab
   */
  linkBehavior?: "dialog" | "newTab";
}

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  value,
  onChange,
  error,
  linkBehavior = "dialog",
}) => {
  const t = useTranslations("features.loan-application");
  const { theme } = useFormTheme();
  const tenant = useTenant();

  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  // Theme styles for ConsentDialog
  const consentThemeStyles = useMemo(
    () =>
      ({
        "--consent-bg": theme.colors.background,
        "--consent-fg": theme.colors.textPrimary || "#0f172a",
        "--consent-muted": theme.colors.textSecondary || "#64748b",
        "--consent-border": theme.colors.border,
        "--consent-primary": theme.colors.primary,
        "--consent-primary-hover": `${theme.colors.primary}e6`,
        "--consent-surface": theme.colors.readOnly,
        "--consent-error": theme.colors.error,
        "--consent-backdrop": theme.colors.textPrimary || "#0f172a",
      }) as CSSProperties,
    [theme],
  );

  // Use theme colors via CSS variables
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

      {/* Terms and Conditions Dialog */}
      {linkBehavior === "dialog" && (
        <>
          <ConsentDialog
            open={showTermsDialog}
            onOpenChange={setShowTermsDialog}
            title={t("terms.termsDialogTitle")}
            variant="center"
            themeStyles={consentThemeStyles}
            disableOutsideClose={true}
          >
            <ConsentTermsContent
              consentVersion={{
                content: `Nội dung Điều khoản sử dụng dịch vụ sẽ được load từ API hoặc hiển thị ở đây.\n\nĐể xem chi tiết, vui lòng truy cập: ${URLS.TERMS_AND_CONDITIONS}`,
              }}
            />

            <div className="flex justify-center pt-5">
              <Button
                onClick={() => setShowTermsDialog(false)}
                size="lg"
                className="h-14 w-[295px] rounded-lg bg-[var(--consent-primary)] text-base font-semibold leading-6 text-white transition-colors hover:bg-[var(--consent-primary-hover)]"
              >
                {t("terms.closeButton")}
              </Button>
            </div>
          </ConsentDialog>

          {/* Privacy Policy Dialog */}
          <ConsentDialog
            open={showPrivacyDialog}
            onOpenChange={setShowPrivacyDialog}
            title={t("terms.privacyDialogTitle")}
            variant="center"
            themeStyles={consentThemeStyles}
            disableOutsideClose={true}
          >
            <ConsentTermsContent
              consentVersion={{
                content: `Nội dung Chính sách bảo mật sẽ được load từ API hoặc hiển thị ở đây.\n\nĐể xem chi tiết, vui lòng truy cập: ${URLS.PRIVACY_POLICY}`,
              }}
            />

            <div className="flex justify-center pt-5">
              <Button
                onClick={() => setShowPrivacyDialog(false)}
                size="lg"
                className="h-14 w-[295px] rounded-lg bg-[var(--consent-primary)] text-base font-semibold leading-6 text-white transition-colors hover:bg-[var(--consent-primary-hover)]"
              >
                {t("terms.closeButton")}
              </Button>
            </div>
          </ConsentDialog>
        </>
      )}
    </>
  );
};
