"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pl from "@/locales/pl.json";

export type Language = "en" | "pl" | "es";

/** Keys defined in the English locale, which is the reference language. */
export type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const translations = { en, pl, es };

/**
 * Translates a key into a specific language, independent of the UI language.
 * Used where content has its own language, e.g. the section headings of a CV
 * generated in Polish while the interface is in English. Falls back to
 * English, then to the key itself.
 */
export function translateFor(language: string, key: string): string {
  const table = (translations as Record<string, Record<string, string>>)[
    language
  ];
  return (
    table?.[key] ?? (translations.en as Record<string, string>)[key] ?? key
  );
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  // Stable per language, so effects can list `t` without refiring each render.
  const t = useCallback(
    (key: string): string => {
      return (translations[language] as Record<string, string>)[key] || key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
