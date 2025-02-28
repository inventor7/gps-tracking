import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { loadLocaleMessages, type LanguageCode } from "@/plugins/i18n";
import { i18n } from "@/main";

type Direction = "ltr" | "rtl";

interface LanguageInfo {
  name: string;
  flag: string;
  dir: Direction;
}

export const useLanguageStore = defineStore("language", () => {
  const router = useRouter();
  const currentLanguage = ref<LanguageCode>(
    import.meta.env.VITE_DEFAULT_LOCALE as LanguageCode
  );
  const direction = ref<Direction>("ltr");

  const languages = computed<Record<LanguageCode, LanguageInfo>>(() => ({
    en: {
      name: "English",
      flag: "🇺🇸",
      dir: "ltr",
    },
    fr: {
      name: "Français",
      flag: "🇫🇷",
      dir: "ltr",
    },
    ar: {
      name: "العربية",
      flag: "🇸🇦",
      dir: "rtl",
    },
  }));

  const currentLanguageInfo = computed<LanguageInfo>(
    () => languages.value[currentLanguage.value]
  );

  const setLanguage = async (locale: LanguageCode) => {
    currentLanguage.value = locale;
    direction.value = languages.value[locale].dir;
    localStorage.setItem("language", locale);

    if (!i18n.global.availableLocales.includes(currentLanguage.value)) {
      await loadLocaleMessages(i18n, currentLanguage.value);
    }

    i18n.global.locale.value = currentLanguage.value;
    document.querySelector("html")?.setAttribute("lang", currentLanguage.value);
  };

  function initializeLanguage() {
    const savedLanguage = localStorage.getItem("language") as LanguageCode;
    const initialLanguage =
      savedLanguage || import.meta.env.VITE_DEFAULT_LOCALE;

    if (languages.value[initialLanguage]) {
      currentLanguage.value = initialLanguage;
      direction.value = languages.value[initialLanguage].dir;
    }
  }

  return {
    currentLanguage,
    direction,
    languages,
    currentLanguageInfo,
    setLanguage,
    initializeLanguage,
  };
});
