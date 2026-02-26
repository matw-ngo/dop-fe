"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { components } from "@/lib/api/v1/consent";

interface ConsentVersion {
  version?: string | number | null;
  content?: string | null;
}

type DataCategory = components["schemas"]["DataCategory"];

interface ConsentFormProps {
  consentVersion?: ConsentVersion;
  dataCategories?: DataCategory[];
  onGrant: () => void;
  onReject?: () => void;
  isSubmitting: boolean;
}

export function ConsentForm({
  consentVersion,
  dataCategories,
  onGrant,
  onReject,
  isSubmitting,
}: ConsentFormProps) {
  const t = useTranslations("features.consent");
  const categoryIds = useMemo(() => {
    const ids = (dataCategories ?? [])
      .map((category) => category.id)
      .filter((id): id is string => Boolean(id));

    return [...new Set(ids)];
  }, [dataCategories]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isAgreeAll, setIsAgreeAll] = useState(true);

  useEffect(() => {
    setSelectedCategoryIds(categoryIds);
    setIsAgreeAll(true);
  }, [categoryIds]);

  const areAllCategoriesSelected =
    categoryIds.length === 0 ||
    selectedCategoryIds.length === categoryIds.length;

  const isGrantDisabled =
    isSubmitting || !isAgreeAll || !areAllCategoriesSelected;

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSelectedCategoryIds((prev) => {
      if (checked) {
        return prev.includes(categoryId) ? prev : [...prev, categoryId];
      }

      return prev.filter((id) => id !== categoryId);
    });
  };

  const handleAgreeAllToggle = (checked: boolean) => {
    setIsAgreeAll(checked);
    setSelectedCategoryIds(checked ? categoryIds : []);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-[var(--consent-fg)]">
          {t("form.title")}
        </h3>
        {consentVersion && (
          <div className="text-sm text-[var(--consent-muted)]">
            <p>
              <strong>{t("form.consentVersion.label")}:</strong>{" "}
              {consentVersion.version}
            </p>
            {consentVersion.content && (
              <div className="mt-2 rounded-lg bg-[var(--consent-surface)] p-4 text-xs leading-relaxed text-[var(--consent-muted)]">
                {consentVersion.content}
              </div>
            )}
          </div>
        )}
      </div>

      {dataCategories && dataCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--consent-fg)]">
            {t("form.dataCategories")}
          </h4>
          <div className="space-y-2">
            {dataCategories.map((category) => {
              const categoryId = category.id ?? "";
              if (!categoryId) return null;

              return (
                <div
                  key={categoryId}
                  className="flex items-start gap-3 rounded-lg border border-[var(--consent-border)] p-3 transition-colors hover:bg-[var(--consent-surface)]"
                >
                  <Checkbox
                    id={categoryId}
                    checked={selectedCategoryIds.includes(categoryId)}
                    onCheckedChange={(checked) =>
                      handleCategoryToggle(categoryId, checked === true)
                    }
                    className="mt-1 border-[var(--consent-checkbox-border)] bg-white dark:bg-white data-[state=checked]:border-[var(--consent-primary)] data-[state=checked]:bg-[var(--consent-primary)] dark:data-[state=checked]:border-[var(--consent-primary)] dark:data-[state=checked]:bg-[var(--consent-primary)] data-[state=checked]:text-white"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={categoryId}
                      className="cursor-pointer text-sm font-medium text-[var(--consent-fg)]"
                    >
                      {category.name}
                    </label>
                    {category.description && (
                      <p className="mt-1 text-xs text-[var(--consent-muted)]">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-lg border border-[var(--consent-border)] p-3 transition-colors hover:bg-[var(--consent-surface)]">
        <Checkbox
          id="agree-all"
          checked={isAgreeAll}
          onCheckedChange={(checked) => handleAgreeAllToggle(checked === true)}
          className="mt-0.5 border-[var(--consent-checkbox-border)] bg-white dark:bg-white data-[state=checked]:border-[var(--consent-primary)] data-[state=checked]:bg-[var(--consent-primary)] dark:data-[state=checked]:border-[var(--consent-primary)] dark:data-[state=checked]:bg-[var(--consent-primary)] data-[state=checked]:text-white"
        />
        <label
          htmlFor="agree-all"
          className="cursor-pointer text-sm font-medium text-[var(--consent-fg)]"
        >
          {t("form.agreeAll.label")}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {onReject && (
          <button
            type="button"
            onClick={onReject}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-[var(--consent-error)] bg-transparent px-4 py-2 font-medium text-[var(--consent-error)] transition-colors hover:bg-[var(--consent-error)]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("form.reject.button")}
          </button>
        )}
        <button
          type="button"
          onClick={onGrant}
          disabled={isGrantDisabled}
          className="w-full rounded-lg bg-[var(--consent-primary)] px-4 py-2 font-medium text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t("form.grant.loading") : t("form.grant.button")}
        </button>
      </div>
    </div>
  );
}

export default ConsentForm;
