"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  if (compact) {
    const next = locale === "en" ? "mr" : "en";
    return (
      <button
        type="button"
        onClick={() => setLocale(next)}
        aria-label={`${t("nav.menu")}: ${next === "en" ? "English" : "मराठी"}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 text-xs font-medium text-ink-soft transition-colors hover:bg-parchment-deep"
      >
        <Languages className="size-3.5" aria-hidden="true" />
        {locale === "en" ? "मराठी" : "EN"}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="भाषा / Language"
      className="inline-flex items-center rounded-full border border-line-strong bg-parchment-deep/60 p-0.5"
    >
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          aria-pressed={locale === item.code}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors",
            locale === item.code
              ? "bg-parchment text-ink shadow-soft"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {item.code === "en" ? "EN" : "मराठी"}
        </button>
      ))}
    </div>
  );
}
