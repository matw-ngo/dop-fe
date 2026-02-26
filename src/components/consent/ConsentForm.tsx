"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { components } from "@/lib/api/v1/consent";

interface ConsentVersion {
  version?: string | number | null;
  content?: string | null;
}

type DataCategory = components["schemas"]["DataCategory"];
type CategoryWithId = DataCategory & { id: string };

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

  const categories = useMemo<CategoryWithId[]>(() => {
    return (dataCategories ?? []).reduce<CategoryWithId[]>(
      (result, category) => {
        if (!category.id) {
          return result;
        }

        result.push({
          ...category,
          id: category.id,
        });

        return result;
      },
      [],
    );
  }, [dataCategories]);

  const categoryIds = useMemo(() => {
    return [...new Set(categories.map((category) => category.id))];
  }, [categories]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isConsentConfirmed, setIsConsentConfirmed] = useState(true);

  const selectedCategorySet = useMemo(() => {
    return new Set(selectedCategoryIds);
  }, [selectedCategoryIds]);

  useEffect(() => {
    setSelectedCategoryIds(categoryIds);
    setIsConsentConfirmed(true);
  }, [categoryIds]);

  const hasCategories = categoryIds.length > 0;
  const isGrantDisabled =
    isSubmitting ||
    !isConsentConfirmed ||
    (hasCategories && selectedCategoryIds.length === 0);

  const setSelectionWithDraft = (updater: (draft: Set<string>) => void) => {
    setSelectedCategoryIds((prev) => {
      const draft = new Set(prev);
      updater(draft);
      return Array.from(draft);
    });
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSelectionWithDraft((draft) => {
      if (checked) {
        draft.add(categoryId);
        return;
      }

      draft.delete(categoryId);
    });
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(categoryIds);
  };

  const handleClearAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  return (
    <div className="space-y-3">
      <div className="mx-auto w-full max-w-3xl rounded-xl bg-[var(--consent-surface)]/45 p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:items-center">
          <h3 className="text-sm font-semibold text-[var(--consent-fg)]">
            {t("form.title")}
          </h3>
          {consentVersion?.version !== undefined &&
            consentVersion.version !== null && (
              <span className="rounded-full bg-[var(--consent-bg)] px-2.5 py-1 text-xs font-medium text-[var(--consent-muted)]">
                {t("form.consentVersion.short", {
                  version: consentVersion.version,
                })}
              </span>
            )}
        </div>

        {consentVersion?.content && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-[var(--consent-primary)] transition-opacity hover:opacity-80">
              {t("form.consentVersion.toggle")}
            </summary>
            <p className="mt-2 rounded-md bg-[var(--consent-bg)] p-2 text-xs leading-relaxed text-[var(--consent-muted)]">
              {consentVersion.content}
            </p>
          </details>
        )}
      </div>

      {hasCategories && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-medium text-[var(--consent-fg)]">
              {t("form.dataCategories")}
            </h4>
            <p
              className="text-xs text-[var(--consent-muted)]"
              aria-live="polite"
            >
              {t("form.selection.summary", {
                selected: selectedCategoryIds.length,
                total: categoryIds.length,
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllCategories}
              disabled={selectedCategoryIds.length === categoryIds.length}
              className="cursor-pointer rounded-md border border-[var(--consent-border)] bg-[var(--consent-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--consent-fg)] transition-colors hover:bg-[var(--consent-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("form.selection.selectAll")}
            </button>
            <button
              type="button"
              onClick={handleClearAllCategories}
              disabled={selectedCategoryIds.length === 0}
              className="cursor-pointer rounded-md border border-[var(--consent-border)] bg-[var(--consent-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--consent-fg)] transition-colors hover:bg-[var(--consent-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("form.selection.clearAll")}
            </button>
          </div>

          <ScrollArea className="h-64 rounded-lg border border-[var(--consent-border)]">
            <div className="space-y-2 p-2">
              {categories.map((category) => {
                const categoryInputId = `category-${category.id}`;
                const isSelected = selectedCategorySet.has(category.id);

                return (
                  <div
                    key={category.id}
                    className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                      isSelected
                        ? "bg-[var(--consent-surface)] ring-1 ring-[var(--consent-primary)]/45"
                        : "bg-[var(--consent-bg)]/40 hover:bg-[var(--consent-surface)]"
                    }`}
                  >
                    <Checkbox
                      id={categoryInputId}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(category.id, checked === true)
                      }
                      className="mt-1 border-[var(--consent-checkbox-border)] bg-white data-[state=checked]:border-[var(--consent-primary)] data-[state=checked]:bg-[var(--consent-primary)] data-[state=checked]:text-white"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={categoryInputId}
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
          </ScrollArea>
        </div>
      )}

      <div className="space-y-2 rounded-lg bg-[var(--consent-surface)]/35 p-3 transition-colors hover:bg-[var(--consent-surface)]">
        <div className="flex items-start gap-3">
          <Checkbox
            id="agree-all"
            checked={isConsentConfirmed}
            onCheckedChange={(checked) =>
              setIsConsentConfirmed(checked === true)
            }
            className="mt-0.5 border-[var(--consent-checkbox-border)] bg-white data-[state=checked]:border-[var(--consent-primary)] data-[state=checked]:bg-[var(--consent-primary)] data-[state=checked]:text-white"
          />
          <div className="space-y-1">
            <label
              htmlFor="agree-all"
              className="cursor-pointer text-sm font-medium text-[var(--consent-fg)]"
            >
              {t("form.agreeAll.label")}
            </label>
            <p className="text-xs text-[var(--consent-muted)]">
              {t("form.agreeAll.helper")}
            </p>
          </div>
        </div>
        {hasCategories && selectedCategoryIds.length === 0 && (
          <p className="text-xs text-[var(--consent-error)]">
            {t("form.validation.selectCategory")}
          </p>
        )}
        {!isConsentConfirmed && (
          <p className="text-xs text-[var(--consent-error)]">
            {t("form.validation.confirmConsent")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {onReject && (
          <button
            type="button"
            onClick={onReject}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-[var(--consent-border)] bg-[var(--consent-bg)] px-4 py-2 font-medium text-[var(--consent-fg)] transition-colors hover:bg-[var(--consent-surface)] disabled:cursor-not-allowed disabled:opacity-50"
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
