import { getRequestConfig } from "next-intl/server";

const locales = ["vi", "en"];
const defaultLocale = "vi";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
