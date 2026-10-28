"use client";

import * as React from "react";
import {
  translate,
  type Locale,
  type TranslateKey,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslateKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "mfe.locale";
const LOCALE_EVENT = "mfe:locale-change";

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "mr" || stored === "en" ? stored : "en";
  } catch {
    return "en";
  }
}

function subscribeLocale(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCALE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCALE_EVENT, onChange);
  };
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = React.useSyncExternalStore(
    subscribeLocale,
    readLocale,
    () => "en" as Locale,
  );

  React.useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private modes can reject writes; the in-memory store still updates.
    }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const t = React.useCallback(
    (key: TranslateKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function applyLocale(locale: Locale) {
  const root = document.documentElement;
  root.dataset.locale = locale;
  root.lang = locale;
}

export function useI18n() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }
  return ctx;
}
