"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/layout/brand";
import { useI18n } from "@/components/providers/locale-provider";
import { developer } from "@/content/site";

const links = [
  { href: "/", key: "nav.explorer" },
  { href: "/circuits", key: "nav.circuits" },
  { href: "/timeline", key: "nav.timeline" },
  { href: "/data", key: "nav.data" },
  { href: "/about", key: "nav.about" },
] as const;

export function SiteFooter() {
  const { t } = useI18n();
  // Read the clock after hydration so the static shell can be prerendered.
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="font-display text-sm font-semibold text-ink">
            {t("app.name")}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-muted">
          <span>
            © {year ?? ""} {developer.name}
          </span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink"
          >
            {t("footer.credit")}
          </a>
          <a
            href={developer.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-saffron-deep transition-colors hover:text-saffron"
          >
            {t("footer.portfolio")}
            <ArrowUpRight className="size-3" aria-hidden="true" />
            <span className="sr-only">({t("common.newTab")})</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
