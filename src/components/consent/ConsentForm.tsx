"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConsentVersion {
  version?: string | number | null;
  content?: string | null;
}

interface ConsentFormProps {
  consentVersion?: ConsentVersion;
  onGrant: () => void;
  isSubmitting?: boolean;
  onViewTerms?: () => void;
  className?: string;
}

const CookieIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    role="img"
    aria-label="Cookie icon"
  >
    <title>Cookie</title>
    <path
      d="M7.99866 14C8.5291 14 9.0378 13.7893 9.41288 13.4142C9.78795 13.0391 9.99866 12.5304 9.99866 12C9.99866 11.4696 9.78795 10.9609 9.41288 10.5858C9.0378 10.2107 8.5291 10 7.99866 10C7.46823 10 6.95952 10.2107 6.58445 10.5858C6.20938 10.9609 5.99866 11.4696 5.99866 12C5.99866 12.5304 6.20938 13.0391 6.58445 13.4142C6.95952 13.7893 7.46823 14 7.99866 14ZM15.9987 18C16.5291 18 17.0378 17.7893 17.4129 17.4142C17.7879 17.0391 17.9987 16.5304 17.9987 16C17.9987 15.4696 17.7879 14.9609 17.4129 14.5858C17.0378 14.2107 16.5291 14 15.9987 14C15.4682 14 14.9595 14.2107 14.5844 14.5858C14.2094 14.9609 13.9987 15.4696 13.9987 16C13.9987 16.5304 14.2094 17.0391 14.5844 17.4142C14.9595 17.7893 15.4682 18 15.9987 18ZM21.9987 24C21.9987 24.5304 21.7879 25.0391 21.4129 25.4142C21.0378 25.7893 20.5291 26 19.9987 26C19.4682 26 18.9595 25.7893 18.5844 25.4142C18.2094 25.0391 17.9987 24.5304 17.9987 24C17.9987 23.4696 18.2094 22.9608 18.5844 22.5858C18.9595 22.2107 19.4682 22 19.9987 22C20.5291 22 21.0378 22.2107 21.4129 22.5858C21.7879 22.9608 21.9987 23.4696 21.9987 24ZM9.99866 24C10.5291 24 11.0378 23.7893 11.4129 23.4142C11.7879 23.0391 11.9987 22.5304 11.9987 22C11.9987 21.4696 11.7879 20.9609 11.4129 20.5858C11.0378 20.2107 10.5291 20 9.99866 20C9.46823 20 8.95952 20.2107 8.58445 20.5858C8.20938 20.9609 7.99866 21.4696 7.99866 22C7.99866 22.5304 8.20938 23.0391 8.58445 23.4142C8.95952 23.7893 9.46823 24 9.99866 24ZM15.9987 2.23767e-06C12.7108 0.00027641 9.50285 1.01344 6.81125 2.90165C4.11965 4.78985 2.0751 7.46142 0.95577 10.5529C-0.163565 13.6443 -0.303336 17.0056 0.555473 20.1793C1.41428 23.353 3.22997 26.1851 5.75551 28.2902C8.28105 30.3954 11.3938 31.6714 14.6703 31.9446C17.9468 32.2179 21.2279 31.4751 24.0673 29.8173C26.9066 28.1596 29.1663 25.6674 30.5389 22.6797C31.9116 19.6921 32.3305 16.3542 31.7387 13.12C31.7047 12.9354 31.6195 12.7641 31.4927 12.6256C31.366 12.4872 31.2028 12.3872 31.0219 12.3371C30.841 12.287 30.6497 12.2889 30.4698 12.3425C30.2899 12.396 30.1287 12.4991 30.0047 12.64C29.4681 13.2512 28.7579 13.6844 27.9688 13.8816C27.1798 14.0789 26.3493 14.0309 25.5882 13.7441C24.8271 13.4573 24.1715 12.9453 23.7088 12.2764C23.2462 11.6074 22.9984 10.8133 22.9987 10C22.9984 9.74449 22.9111 9.49671 22.7511 9.29748C22.5911 9.09825 22.3681 8.95946 22.1187 8.904C21.4154 8.74568 20.7681 8.40027 20.245 7.9043C19.7219 7.40834 19.3426 6.78025 19.1471 6.08644C18.9516 5.39263 18.9473 4.65889 19.1345 3.9628C19.3217 3.26672 19.6935 2.63416 20.2107 2.132C20.3391 2.00725 20.4318 1.85029 20.4788 1.67752C20.5259 1.50474 20.5258 1.32249 20.4783 1.14981C20.4309 0.977123 20.338 0.820337 20.2093 0.695829C20.0806 0.571321 19.9208 0.48366 19.7467 0.442002C18.5191 0.147695 17.261 -0.000664563 15.9987 2.23767e-06ZM1.99867 16C1.99855 14.0143 2.42083 12.0514 3.23746 10.2415C4.05409 8.43151 5.24639 6.81598 6.73521 5.50213C8.22403 4.18828 9.9753 3.20616 11.8728 2.62098C13.7702 2.03579 15.7704 1.86093 17.7407 2.108C17.3192 2.87356 17.07 3.72197 17.0106 4.59387C16.9511 5.46578 17.0829 6.34014 17.3966 7.15582C17.7104 7.97149 18.1985 8.70878 18.8269 9.31613C19.4553 9.92348 20.2088 10.3862 21.0347 10.672C21.1457 11.6601 21.5005 12.6052 22.0674 13.4222C22.6342 14.2392 23.3951 14.9025 24.2818 15.3525C25.1685 15.8025 26.1532 16.0251 27.1472 16.0002C28.1413 15.9753 29.1136 15.7038 29.9767 15.21C30.0815 17.0784 29.8108 18.9488 29.1804 20.7107C28.55 22.4726 27.5728 24.0903 26.3065 25.4681C25.0402 26.8459 23.5105 27.9558 21.808 28.7323C20.1054 29.5088 18.2644 29.9361 16.3938 29.9889C14.5233 30.0418 12.6611 29.719 10.9174 29.0398C9.17369 28.3607 7.58385 27.3388 6.24184 26.0347C4.89983 24.7305 3.83289 23.1706 3.10408 21.447C2.37528 19.7235 1.9994 17.8713 1.99867 16Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Reusable consent form component - can be used standalone or within modals
 */
export function ConsentForm({
  consentVersion: _consentVersion,
  onGrant,
  isSubmitting = false,
  onViewTerms,
  className = "",
}: ConsentFormProps) {
  const t = useTranslations("features.consent.form");

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewTerms?.();
  };

  return (
    <div
      className={`flex flex-col gap-6 md:flex-row md:items-end md:gap-8 ${className}`}
    >
      {/* Content Section */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-[var(--consent-primary)] mt-0.5">
            <CookieIcon />
          </div>
          <h3 className="text-base font-bold uppercase leading-7 text-[var(--consent-fg)] md:text-lg md:leading-8">
            {t("title")}
          </h3>
        </div>

        <div className="space-y-3 text-sm leading-5 text-[var(--consent-fg)]">
          <p>{t("description")}</p>
          <p>
            {t.rich("agreement", {
              link: (chunks) => (
                <button
                  type="button"
                  onClick={handleTermsClick}
                  className="font-medium text-[var(--consent-primary)] underline-offset-2 hover:underline focus:underline focus:outline-none"
                >
                  {chunks}
                </button>
              ),
            })}
          </p>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex shrink-0 md:w-auto">
        <Button
          onClick={onGrant}
          disabled={isSubmitting}
          loading={isSubmitting}
          size="lg"
          className="h-12 w-full rounded-lg bg-[var(--consent-primary)] px-5 text-sm font-semibold leading-6 text-white transition-colors hover:bg-[var(--consent-primary-hover)] md:h-14 md:w-[156px] md:text-base"
        >
          {isSubmitting ? t("loading") : t("continueButton")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Reusable consent terms content - can be used in any modal or page
 */
interface ConsentTermsContentProps {
  consentVersion?: ConsentVersion;
  className?: string;
}

export function ConsentTermsContent({
  consentVersion,
  className = "",
}: ConsentTermsContentProps) {
  const t = useTranslations("features.consent.form");

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-center gap-4">
        <div className="text-[var(--consent-primary)]">
          <CookieIcon />
        </div>
        <h3 className="text-lg font-bold leading-8 text-[var(--consent-fg)]">
          {t("termsModal.title")}
        </h3>
      </div>

      {consentVersion?.content && (
        <ScrollArea className="h-[213px] rounded-lg border border-[var(--consent-border)] p-2">
          <div className="whitespace-pre-wrap text-sm leading-5 text-[var(--consent-fg)]">
            {consentVersion.content}
          </div>
        </ScrollArea>
      )}

      <p className="mx-auto max-w-[506px] text-center text-sm leading-5 text-[var(--consent-fg)]">
        {t("termsModal.description")}
      </p>
    </div>
  );
}

export default ConsentForm;
