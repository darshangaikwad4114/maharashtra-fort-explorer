import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
  { label: "Wikimedia Commons", href: "https://commons.wikimedia.org/" },
  { label: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
  { label: "OpenTopoMap", href: "https://opentopomap.org/" },
  { label: "Esri World Imagery", href: "https://www.arcgis.com/" },
  { label: "Legacy Folium map", href: "/legacy/folium-map.html" },
];

const stats = [
  { key: "data.statsForks" as const, value: profileStats.total },
  { key: "data.statsCurated" as const, value: profileStats.curated },
  { key: "data.statsPhotos" as const, value: profileStats.withPhotos },
  { key: "data.statsDistricts" as const, value: profileStats.districts },
  { key: "data.statsDisputed" as const, value: profileStats.disputed },
];

export default function DataPage() {
  const reviewedShare = Math.round(
    (profileStats.curated / profileStats.total) * 100,
  );

  const districtsByCount = districtsWithForts
    .slice()
    .sort((a, b) => b.fortCount - a.fortCount || a.name.localeCompare(b.name));

  return (
    <div className="pb-16">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="data.title" />
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-5">
          {stats.map(({ key, value }) => (
            <div key={key}>
              <dd className="font-display text-3xl font-semibold tabular-nums text-ink">
                {value.toLocaleString("en-IN")}
              </dd>
              <dt className="mt-1 text-xs text-ink-muted">
                <Tx k={key} />
              </dt>
            </div>
          ))}
        </dl>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={reviewedShare}
          aria-label={translate("en", "data.statsCurated")}
          className="mt-8 h-1.5 overflow-hidden rounded-full bg-parchment-sunk"
        >
          <div
            className="h-full rounded-full bg-forest"
            style={{ width: `${reviewedShare}%` }}
          />
        </div>

        <div className="mt-12 divide-y divide-line">
          <section aria-labelledby="catalogue-heading" className="py-6">
            <h2
              id="catalogue-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              <Tx k="data.catalogueTitle" />
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
              <Tx k="data.catalogueBody" />
            </p>
          </section>

          <section aria-labelledby="curated-heading" className="py-6">
            <h2
              id="curated-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              <Tx k="data.curatedTitle" />
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
              <Tx k="data.curatedBody" />
            </p>
          </section>

          <section aria-labelledby="status-heading" className="py-6">
            <h2
              id="status-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              <Tx k="data.statusTitle" />
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
              <Tx k="data.statusBody" />
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="forest">
                <Tx k="status.curated" />
              </Badge>
              <Badge variant="outline">
                <Tx k="status.catalog" />
              </Badge>
              <Badge variant="flag">
                <Tx k="status.flagged" />
              </Badge>
              <Badge variant="default">
                <Tx k="status.pending" />
              </Badge>
            </div>
          </section>

          <section aria-labelledby="missing-heading" className="py-6">
            <h2
              id="missing-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              <Tx k="data.missingTitle" />
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
              <Tx k="data.missingBody" />
            </p>
          </section>

          <section aria-labelledby="sources-heading" className="py-6">
            <h2
              id="sources-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              <Tx k="data.sourcesTitle" />
            </h2>
            <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {externalSources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-saffron-deep"
                  >
                    {source.label}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="districts-heading" className="mt-12">
          <h2
            id="districts-heading"
            className="font-display text-xl font-semibold text-ink"
          >
            <Tx k="data.districtsTitle" />
          </h2>

          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {districtsByCount.map((district) => (
              <li key={district.slug}>
                <Link
                  href={`/?district=${district.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-parchment px-3 py-2.5 text-xs transition-colors hover:border-saffron/40 hover:bg-parchment-deep/50"
                >
                  <span className="truncate text-ink-soft">{district.name}</span>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    {district.fortCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
