"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tx } from "@/components/common/bilingual";
import { BrandMark } from "@/components/layout/brand";
import { useI18n } from "@/components/providers/locale-provider";
import { developer } from "@/content/site";

export function SiteFooter() {
  const { t } = useI18n();
  // Read the clock after hydration so the static shell can be prerendered.
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Deferring the clock keeps the footer's static shell prerenderable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-line bg-parchment-deep/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <BrandMark className="size-9" />
            <p className="font-display text-lg font-semibold text-ink">
              {t("app.name")}
            </p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            {t("app.tagline")}. {t("footer.offlineReady")}.
          </p>
          <p className="mt-4 text-xs text-ink-muted">
            © {year ?? ""} {t("app.name")}
          </p>
        </div>

        <nav aria-label={t("footer.explore")}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("footer.explore")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link className="hover:text-saffron-deep" href="/">
                {t("nav.explorer")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-saffron-deep" href="/circuits">
                {t("nav.circuits")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-saffron-deep" href="/timeline">
                {t("nav.timeline")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-saffron-deep" href="/favorites">
                {t("nav.favorites")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("footer.data")}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("footer.data")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link className="hover:text-saffron-deep" href="/data">
                {t("nav.data")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-saffron-deep" href="/about">
                {t("footer.aboutLink")}
              </Link>
            </li>
            <li>
              <a
                className="hover:text-saffron-deep"
                href="/legacy/folium-map.html"
                target="_blank"
                rel="noreferrer"
              >
                {t("data.openLegacy")}
              </a>
            </li>
            <li>
              <a
                className="hover:text-saffron-deep"
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
              >
                OpenStreetMap
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t("footer.developer")}
          </h2>
          <p className="mt-3 text-sm font-medium text-ink">{developer.name}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
            {t("footer.developerRole")}
          </p>
          <a
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-saffron-deep hover:underline"
            href={developer.portfolio}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("footer.portfolio")}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">
              (<Tx k="common.newTab" />)
            </span>
          </a>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
            {t("footer.stack")}
          </p>
        </div>
      </div>

      <div className="border-t border-line/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("footer.credit")}</p>
          <p>{t("footer.builtBy")}</p>
        </div>
      </div>
    </footer>
  );
}
