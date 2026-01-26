"use client";

import { useTranslations } from "next-intl";

interface ConsentFormProps {
  consentVersion?: any;
  dataCategories?: any[];
  onGrant: () => void;
  isSubmitting: boolean;
}

export function ConsentForm({
  consentVersion,
  dataCategories,
  onGrant,
  isSubmitting,
}: ConsentFormProps) {
  const t = useTranslations("features.consent");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">{t("form.title")}</h3>
        {consentVersion && (
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>{t("form.consentVersion.label")}:</strong>{" "}
              {consentVersion.version}
            </p>
            {consentVersion.content && (
              <div className="mt-2 p-4 bg-muted rounded-lg text-xs leading-relaxed">
                {consentVersion.content}
              </div>
            )}
          </div>
        )}
      </div>

      {dataCategories && dataCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{t("form.dataCategories")}</h4>
          <div className="space-y-2">
            {dataCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-start gap-2 p-3 border rounded-lg"
              >
                <input
                  type="checkbox"
                  id={category.id}
                  checked={true}
                  disabled
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {category.name}
                  </label>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 border rounded-lg">
        <input
          type="checkbox"
          id="agree-all"
          checked={true}
          disabled
          className="mt-0.5"
        />
        <label
          htmlFor="agree-all"
          className="text-sm font-medium cursor-pointer"
        >
          {t("form.agreeAll.label")}
        </label>
      </div>

      <button
        type="button"
        onClick={onGrant}
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? t("form.grant.loading") : t("form.grant.button")}
      </button>
    </div>
  );
}

export default ConsentForm;
