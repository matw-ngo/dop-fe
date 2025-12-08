import { useTranslations } from "next-intl";
import React from "react";

export interface FieldTranslations {
  label?: string;
  placeholder?: string;
  description?: string;
}

/**
 * Hook to handle field translations with fallback logic
 *
 * Translation priority:
 * 1. Root-level translations (for full paths like 'form.field.email.label')
 * 2. Namespaced translations (for page-specific keys)
 * 3. Fallback to props value
 */
export function useFieldTranslations(
  props: Record<string, any>,
  translationNamespace?: string,
): FieldTranslations {
  const tRoot = useTranslations();
  const tNamespaced = useTranslations(translationNamespace);

  const { labelKey, placeholderKey, descriptionKey } = props;

  const label = React.useMemo(() => {
    if (!labelKey) return props.label;
    if (tRoot.has(labelKey)) return tRoot(labelKey);
    if (tNamespaced.has(labelKey)) return tNamespaced(labelKey);
    return props.label;
  }, [labelKey, props.label, tRoot, tNamespaced]);

  const placeholder = React.useMemo(() => {
    if (!placeholderKey) return props.placeholder;
    if (tRoot.has(placeholderKey)) return tRoot(placeholderKey);
    if (tNamespaced.has(placeholderKey)) return tNamespaced(placeholderKey);
    return props.placeholder;
  }, [placeholderKey, props.placeholder, tRoot, tNamespaced]);

  const description = React.useMemo(() => {
    if (!descriptionKey) return props.description;
    if (tRoot.has(descriptionKey)) return tRoot(descriptionKey);
    if (tNamespaced.has(descriptionKey)) return tNamespaced(descriptionKey);
    return props.description;
  }, [descriptionKey, props.description, tRoot, tNamespaced]);

  return { label, placeholder, description };
}
