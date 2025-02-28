import { createI18n } from "vue-i18n";
import { nextTick } from "vue";

export type LanguageCode = "en" | "fr" | "ar";

export const SUPPORT_LOCALES = ["en", "fr", "ar"] as const;

type I18nOptions = {
  locale: LanguageCode;
  fallbackLocale?: LanguageCode;
};

export function setupI18n(
  options: I18nOptions = { locale: import.meta.env.VITE_DEFAULT_LOCALE }
) {
  const i18n = createI18n({
    legacy: false,
    locale: options.locale,
    fallbackLocale:
      options.fallbackLocale || import.meta.env.VITE_FALLBACK_LOCALE,
    messages: {},
  });

  i18n.global.locale.value = options.locale;
  document.querySelector("html")?.setAttribute("lang", options.locale);
  return i18n;
}

export async function loadLocaleMessages(i18n: any, locale: LanguageCode) {
  const messages = await import(`../locales/${locale}.json`);

  i18n.global.setLocaleMessage(locale, messages.default);

  return nextTick();
}
