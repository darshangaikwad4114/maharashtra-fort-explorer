"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu } from "lucide-react";
import { AccountButton } from "@/components/auth/account-button";
import { BrandMark } from "@/components/layout/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "nav.explorer", exact: true },
  { href: "/circuits", key: "nav.circuits", exact: false },
  { href: "/timeline", key: "nav.timeline", exact: false },
  { href: "/data", key: "nav.data", exact: false },
  { href: "/about", key: "nav.about", exact: false },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { count } = useFavorites();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-parchment/88 backdrop-blur-md supports-[backdrop-filter]:bg-parchment/75">
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-offset-4"
          aria-label={t("app.name")}
        >
          <BrandMark className="size-9 shrink-0 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="min-w-0">
            <span className="block truncate font-display text-[15px] font-semibold leading-tight text-ink sm:text-base">
              <span data-lang="en">Maharashtra Fort Explorer</span>
              <span data-lang="mr">महाराष्ट्र किल्ला अन्वेषक</span>
            </span>
            <span className="hidden truncate text-[11px] leading-tight text-ink-muted sm:block">
              {t("app.tagline")}
            </span>
          </span>
        </Link>

        <nav
          aria-label={t("nav.menu")}
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                  active
                    ? "text-ink"
                    : "text-ink-muted hover:bg-parchment-deep hover:text-ink",
                )}
              >
                {t(item.key)}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-saffron"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <Link
            href="/favorites"
            aria-label={t("nav.favorites")}
            className="relative inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-parchment text-ink-soft transition-colors hover:bg-parchment-deep hover:text-saffron-deep"
          >
            <Heart className="size-4" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-4.5 place-items-center rounded-full bg-saffron px-1 text-[10px] font-semibold leading-4 text-white">
                {count}
              </span>
            ) : null}
          </Link>

          <div className="hidden sm:block">
            <AccountButton />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.menu")}
            className="inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-parchment text-ink-soft transition-colors hover:bg-parchment-deep hover:text-ink md:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        side="right"
        title={t("nav.menu")}
      >
        <div className="flex h-full flex-col">
          <nav className="flex flex-col gap-1 p-4" aria-label={t("nav.menu")}>
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-saffron-soft font-medium text-saffron-deep"
                      : "text-ink-soft hover:bg-parchment-deep",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <Link
              href="/favorites"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-ink-soft hover:bg-parchment-deep"
            >
              {t("nav.favorites")}
              {count > 0 ? (
                <span className="ml-2 rounded-full bg-saffron px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          </nav>

          <div className="mt-auto space-y-4 border-t border-line p-4">
            <LanguageSwitcher />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-ink-muted">{t("auth.account")}</span>
              <AccountButton />
            </div>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
