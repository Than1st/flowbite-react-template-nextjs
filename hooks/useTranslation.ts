"use client";

import id from "@/locales/id";
import en from "@/locales/en";
import { useLanguageStore } from "@/stores/languageStore";

const translations = { id, en };

export function useTranslation() {
  const currentLanguage = useLanguageStore((s) => s.currentLanguage);

  const t = (key: string, params?: Record<string, string | number>) => {
    const dict = translations[currentLanguage] as Record<string, string>;
    let text = dict[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    return text;
  };

  return { t, currentLanguage };
}
