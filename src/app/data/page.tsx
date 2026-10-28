import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Camera,
  Database,
  ExternalLink,
  FileWarning,
  MapPinned,
  ShieldAlert,
} from "lucide-react";
import { Tx } from "@/components/common/bilingual";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { districtsWithForts, profileStats } from "@/lib/forts";
import { translate } from "@/lib/i18n";

export const metadata: Metadata = {
  title: translate("en", "meta.dataTitle"),
  description: translate("en", "meta.dataDescription"),
  alternates: { canonical: "/data" },
  openGraph: {
    title: translate("en", "meta.dataTitle"),
    description: translate("en", "meta.dataDescription"),
    url: "/data",
  },
};

const externalSources = [
  { label: "Wikipedia", href: "https://www.wikipedia.org/" },
  {
    label: "Wikimedia Commons",
    href: "https://commons.wikimedia.org/",
  },
  { label: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
  { label: "OpenTopoMap", href: "https://opentopomap.org/" },
  { label: "Esri World Imagery", href: "https://www.arcgis.com/" },
];

export default function DataPage() {
  const stats = [
    {
      key: "data.statsForks" as const,
      value: profileStats.total,
      icon: Database,
    },
    {
      key: "data.statsCurated" as const,
      value: profileStats.curated,
      icon: BadgeCheck,
    },
    {
      key: "data.statsPhotos" as const,
      value: profileStats.withPhotos,
      icon: Camera,
    },
    {
      key: "data.statsDistricts" as const,
      value: profileStats.districts,
      icon: MapPinned,
    },
    {
      key: "data.statsDisputed" as const,
      value: profileStats.disputed,
      icon: AlertTriangle,
    },
  ];

  const reviewedShare = Math.round(
    (profileStats.curated / profileStats.total) * 100,
  );

  const districtsByCount = districtsWithForts
    .slice()
    .sort((a, b) => b.fortCount - a.fortCount || a.name.localeCompare(b.name));

  return (
    <div className="pb-16">
      <header className="border-b border-line bg-parchment-deep/40">
        <div className="paper-texture mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
            <Tx k="nav.data" />
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="data.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            <Tx k="data.subtitle" />
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-parchment px-3 py-1 text-[11px] text-ink-muted">
            <FileWarning className="size-3" aria-hidden="true" />
            <Tx k="data.footerNote" />
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section aria-label={translate("en", "data.title")} className="-mt-6">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map(({ key, value, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-line-strong bg-parchment p-4 shadow-soft max-sm:last:col-span-2"
              >
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                  <Icon className="size-3.5 text-saffron-deep" aria-hidden="true" />
                  <Tx k={key} />
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
                  {value.toLocaleString("en-IN")}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-2xl border border-line bg-parchment-deep/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-ink-soft">
                <Tx k="data.statsCurated" />: {profileStats.curated} /{" "}
                {profileStats.total}
              </span>
              <span className="text-ink-muted">{reviewedShare}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={reviewedShare}
              aria-label={translate("en", "data.statsCurated")}
              className="mt-2 h-2 overflow-hidden rounded-full bg-parchment-sunk"
            >
              <div
                className="h-full rounded-full bg-forest"
                style={{ width: `${reviewedShare}%` }}
              />
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="space-y-10">
            <section aria-labelledby="catalogue-heading">
              <h2
                id="catalogue-heading"
                className="font-display text-2xl font-semibold text-ink"
              >
                <Tx k="data.catalogueTitle" />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <Tx k="data.catalogueBody" />
              </p>
            </section>

            <section aria-labelledby="curated-heading">
              <h2
                id="curated-heading"
                className="font-display text-2xl font-semibold text-ink"
              >
                <Tx k="data.curatedTitle" />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <Tx k="data.curatedBody" />
              </p>
            </section>

            <section aria-labelledby="status-heading">
              <h2
                id="status-heading"
                className="font-display text-2xl font-semibold text-ink"
              >
                <Tx k="data.statusTitle" />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <Tx k="data.statusBody" />
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="forest">
                  <BadgeCheck className="size-3" aria-hidden="true" />
                  <Tx k="status.curated" />
                </Badge>
                <Badge variant="outline">
                  <Tx k="status.catalog" />
                </Badge>
                <Badge variant="flag">
                  <ShieldAlert className="size-3" aria-hidden="true" />
                  <Tx k="status.flagged" />
                </Badge>
                <Badge variant="default">
                  <Tx k="status.pending" />
                </Badge>
              </div>
            </section>

            <section aria-labelledby="sources-heading">
              <h2
                id="sources-heading"
                className="font-display text-2xl font-semibold text-ink"
              >
                <Tx k="data.sourcesTitle" />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <Tx k="data.sourcesBody" />
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {externalSources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-parchment px-3 py-1.5 text-[11px] text-ink-soft transition-colors hover:border-saffron/40 hover:text-saffron-deep"
                    >
                      {source.label}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="missing-heading">
              <h2
                id="missing-heading"
                className="font-display text-2xl font-semibold text-ink"
              >
                <Tx k="data.missingTitle" />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <Tx k="data.missingBody" />
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line-strong bg-parchment p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-ink">
                <Tx k="data.legacyTitle" />
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                <Tx k="data.legacyBody" />
              </p>
              <a
                href="/legacy/folium-map.html"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-parchment-deep px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:text-saffron-deep"
              >
                <Tx k="data.openLegacy" />
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-2xl border border-line bg-parchment-deep/40 p-5">
              <BookOpen
                className="size-5 text-saffron-deep"
                aria-hidden="true"
              />
              <p className="mt-2 font-display text-base font-semibold text-ink">
                <Tx k="timeline.title" />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                <Tx k="timeline.subtitle" />
              </p>
              <Link
                href="/timeline"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-saffron-deep hover:underline"
              >
                <Tx k="common.learnMore" />
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        <section aria-labelledby="districts-heading" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="districts-heading"
                className="font-display text-2xl font-semibold text-ink"
              >
                <Tx k="data.districtsTitle" />
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted">
                <Tx k="data.districtsBody" />
              </p>
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {districtsByCount.map((district) => (
              <li key={district.slug}>
                <Link
                  href={`/?district=${district.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-parchment px-3 py-2.5 text-xs transition-colors hover:border-saffron/40 hover:bg-parchment-deep/50"
                >
                  <span className="truncate text-ink-soft">{district.name}</span>
                  <span className="shrink-0 rounded-full bg-parchment-deep px-2 py-0.5 text-[10px] font-medium tabular-nums text-ink-muted">
                    {district.fortCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line-strong bg-parchment-deep/50 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-semibold text-ink">
              <Tx k="explorer.title" />
            </p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink-muted">
              <Tx k="explorer.coverageShort" />
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-saffron px-5 text-sm font-medium text-white transition-colors hover:bg-saffron-deep"
          >
            <Tx k="nav.explorer" />
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
