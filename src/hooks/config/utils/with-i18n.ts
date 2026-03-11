import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * Utility to create i18n-enabled config hook using next-intl
 *
 * @param keys - Array of translation keys
 * @param translationNamespace - next-intl namespace (e.g., "common.formOptions.gender")
 * @returns Translated options array
 *
 * @example
 * ```ts
 * const t = useTranslations("common.formOptions.gender");
 * const options = useTranslatedOptions(["male", "female"], t);
 * // Returns: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }]
 * ```
 */
export function useTranslatedOptions(
  keys: readonly string[] | undefined,
  translationNamespace: string,
): ISelectBoxOption[] | undefined {
  const t = useTranslations(translationNamespace);

  return useMemo(() => {
    if (!keys) return undefined;

    return keys.map((key) => ({
      label: t(key as any),
      value: key,
    }));
  }, [keys, t]);
}
