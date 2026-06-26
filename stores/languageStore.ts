import { create } from "zustand";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import type { Language } from "@/types";

interface LanguageState {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  hydrate: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: "id",

  setLanguage: (lang) => {
    storage.set(STORAGE_KEYS.LANGUAGE, lang);
    set({ currentLanguage: lang });
  },

  toggleLanguage: () => {
    const next = get().currentLanguage === "id" ? "en" : "id";
    get().setLanguage(next);
  },

  hydrate: () => {
    const saved = storage.get<Language>(STORAGE_KEYS.LANGUAGE);
    if (saved === "id" || saved === "en") {
      set({ currentLanguage: saved });
    }
  },
}));
