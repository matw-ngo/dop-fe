import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import { ConsentTermsContent } from "@/components/consent/ConsentForm";
import { useFormTheme } from "@/components/form-generation/themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={textColor}>
                  {t("terms.termsDialogTitle")}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <ConsentTermsContent
                  consentVersion={{
                    content: `Nội dung Điều khoản sử dụng dịch vụ sẽ được load từ API hoặc hiển thị ở đây.\n\nĐể xem chi tiết, vui lòng truy cập: ${URLS.TERMS_AND_CONDITIONS}`,
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Privacy Policy Dialog */}
          <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={textColor}>
                  {t("terms.privacyDialogTitle")}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <ConsentTermsContent
                  consentVersion={{
                    content: `Nội dung Chính sách bảo mật sẽ được load từ API hoặc hiển thị ở đây.\n\nĐể xem chi tiết, vui lòng truy cập: ${URLS.PRIVACY_POLICY}`,
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};
