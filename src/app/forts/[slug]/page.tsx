import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Compass,
  ExternalLink,
  Footprints,
  Info,
  Landmark,
  MapPin,
  Mountain,
  Navigation,
  Ruler,
  ShieldAlert,
} from "lucide-react";
import { BiLabel, BiText, Tx } from "@/components/common/bilingual";
import { BrandMark } from "@/components/layout/brand";
import { FortCard } from "@/components/explorer/fort-card";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { FortMiniMap } from "@/components/fort/fort-mini-map";
import { ShareButton } from "@/components/fort/share-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { forts, getFort, getMapFort, nearbyForts } from "@/lib/forts";
import { distanceKm, mapsDirectionsUrl, osmUrl } from "@/lib/geo";
import { districtLabel, seasonLabel, translate } from "@/lib/i18n";

export function generateStaticParams() {
  return forts.map((fort) => ({ slug: fort.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fort = getFort(slug);
  if (!fort) {
    return { title: "Fort not found" };
  }

  const district = fort.district ?? "Maharashtra";
  const fallback = `${fort.name} in ${district}${
    fort.district ? " district" : ""
  }, Maharashtra — location, district and nearby forts.`;
  const description = (fort.description?.en ?? fallback).slice(0, 158);
  const images = fort.image
    ? [
        {
          url: fort.image.src,
          width: fort.image.width,
          height: fort.image.height,
          alt: fort.name,
        },
      ]
    : undefined;

  return {
    title: `${fort.name} — ${district}`,
    description,
    alternates: { canonical: `/forts/${fort.slug}` },
    openGraph: {
      type: "article",
      title: `${fort.name} — ${district}`,
      description,
      url: `/forts/${fort.slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${fort.name} — ${district}`,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function StripLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
      {children}
    </p>
  );
}

function FactRow({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
      <dt className="shrink-0 text-xs text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right text-xs font-medium text-ink-soft">
        {children}
      </dd>
    </div>
  );
}

function Unavailable() {
  return (
    <span className="italic text-ink-muted/70">
      <Tx k="fort.factUnavailable" />
    </span>
  );
}

export default async function FortPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fort = getFort(slug);
  if (!fort) notFound();

  const curated = fort.profileStatus === "curated";
  const disputed = fort.coordinateStatus === "flagged";
  const districtMr = districtLabel("mr", fort.district);
  const nearby = nearbyForts(fort, 4).flatMap((neighbor) => {
    const mapFort = getMapFort(neighbor.slug);
    return mapFort
      ? [{ mapFort, km: distanceKm(fort, neighbor) }]
      : [];
  });

  const seasonEn = seasonLabel("en", fort.bestSeason);
  const seasonMr = seasonLabel("mr", fort.bestSeason);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: fort.name,
    alternateName: [fort.nameMr, ...fort.aliases].filter(Boolean),
    description:
      fort.description?.en ??
      `${fort.name} is a fort recorded in the Maharashtra Fort Explorer catalogue${
        fort.district ? `, ${fort.district} district` : ""
      }.`,
    url: `${siteUrl}/forts/${fort.slug}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: fort.lat,
      longitude: fort.lon,
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
      ...(fort.district ? { addressLocality: fort.district } : {}),
    },
    ...(fort.image
      ? { image: new URL(fort.image.src, siteUrl).toString() }
      : {}),
    ...(curated
      ? { sameAs: fort.sources.map((source) => source.url) }
      : {}),
    ...(fort.elevationM
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Elevation",
            value: fort.elevationM,
            unitCode: "MTR",
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Maharashtra Fort Explorer",
        item: siteUrl,
      },
      ...(fort.district
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: `${fort.district} district`,
              item: `${siteUrl}/?district=${fort.districtSlug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: fort.district ? 3 : 2,
        name: fort.name,
        item: `${siteUrl}/forts/${fort.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="pb-16">
        <div className="border-b border-line bg-parchment-deep/40">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-4 text-[11px] text-ink-muted sm:px-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 transition-colors hover:text-saffron-deep"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              <Tx k="fort.backToMap" />
            </Link>
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
            {fort.district ? (
              <>
                <Link
                  href={`/?district=${fort.districtSlug}`}
                  className="truncate transition-colors hover:text-saffron-deep"
                >
                  <BiLabel en={fort.district} mr={districtMr} />
                </Link>
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              </>
            ) : null}
            <span className="truncate text-ink-soft">{fort.name}</span>
          </nav>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:pt-10">
          <div className="grid items-start gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {curated ? (
                  <Badge variant="forest">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    <Tx k="status.curated" />
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Tx k="status.catalog" />
                  </Badge>
                )}
                {fort.category ? (
                  <Badge variant="gold">
                    <BiLabel
                      en={translate("en", `category.${fort.category}`)}
                      mr={translate("mr", `category.${fort.category}`)}
                    />
                  </Badge>
                ) : null}
                {fort.heritageClass ? (
                  <Badge variant="default">
                    <BiLabel
                      en={translate("en", `fort.heritage.${fort.heritageClass}`)}
                      mr={translate("mr", `fort.heritage.${fort.heritageClass}`)}
                    />
                  </Badge>
                ) : null}
                {disputed ? (
                  <Badge variant="flag">
                    <ShieldAlert className="size-3" aria-hidden="true" />
                    <Tx k="status.flagged" />
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-4 font-display text-[2.1rem] font-semibold leading-[1.08] text-ink sm:text-5xl">
                {fort.name}
              </h1>

              {fort.nameMr ? (
                <p className="mt-1.5 text-lg text-ink-muted">
                  <span data-lang="en" lang="mr">
                    {fort.nameMr}
                  </span>
                  <span data-lang="mr" lang="en">
                    {fort.name}
                  </span>
                </p>
              ) : null}

              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-saffron" aria-hidden="true" />
                  <BiLabel en={fort.district ?? "—"} mr={districtMr || "—"} />
                </span>
                <span aria-hidden="true" className="text-line-strong">
                  ·
                </span>
                <span>
                  <Tx k="fort.state" />
                </span>
              </p>

              {fort.aliases.length ? (
                <p className="mt-2 text-xs text-ink-muted">
                  <Tx k="fort.alsoKnown" />: {fort.aliases.join(", ")}
                </p>
              ) : null}

              <div className="mt-5 max-w-prose space-y-3 text-[15px] leading-relaxed text-ink-soft">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {curated ? <Tx k="fort.history" /> : <Tx k="fort.overview" />}
                </h2>
                {curated && fort.description ? (
                  <BiText
                    en={fort.description.en}
                    mr={fort.description.mr}
                    className="space-y-3"
                  />
                ) : (
                  <p>
                    <Tx k="fort.catalogBody" />
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link
                  href={`/?fort=${fort.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-saffron px-5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-saffron-deep"
                >
                  <Compass className="size-4" aria-hidden="true" />
                  <Tx k="fort.onMap" />
                </Link>
                <FavoriteButton slug={fort.slug} variant="outline" withLabel />
                <ShareButton name={fort.name} />
                <a
                  href={mapsDirectionsUrl(fort)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-parchment px-4 text-sm font-medium text-ink-soft transition-colors hover:border-saffron/50 hover:text-saffron-deep"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  <Tx k="fort.directions" />
                </a>
              </div>

              {curated && fort.reviewedOn ? (
                <p className="mt-3 text-[11px] text-ink-muted">
                  <Tx k="fort.lastReviewed" vars={{ date: fort.reviewedOn }} />
                </p>
              ) : null}
            </div>

            <figure className="lg:sticky lg:top-24">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-strong bg-parchment-sunk shadow-soft">
                {fort.image ? (
                  <Image
                    src={fort.image.src}
                    alt={fort.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />
                ) : (
                  <div className="paper-texture flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                    <BrandMark className="size-12 opacity-80" />
                    <p className="text-sm font-medium text-ink-soft">
                      <Tx k="fort.noPhoto" />
                    </p>
                    <p className="max-w-xs text-[11px] leading-relaxed text-ink-muted">
                      <Tx k="fort.noPhotoHint" />
                    </p>
                  </div>
                )}
              </div>
              {fort.image ? (
                <figcaption className="mt-2 text-[10px] text-ink-muted">
                  <Tx k="fort.photoCredit" />{": "}
                  <a
                    href={fort.image.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-line-strong underline-offset-2 hover:text-saffron-deep"
                  >
                    {fort.image.author} · {fort.image.license}
                  </a>
                </figcaption>
              ) : null}
            </figure>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div className="min-w-0 space-y-9">
            {disputed ? (
              <section
                aria-labelledby="location-warning"
                className="rounded-2xl border border-flag/30 bg-[#f7e5df] p-5"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="mt-0.5 size-5 shrink-0 text-flag"
                    aria-hidden="true"
                  />
                  <div>
                    <h2
                      id="location-warning"
                      className="font-display text-base font-semibold text-flag"
                    >
                      <Tx k="fort.locationWarningTitle" />
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {fort.locationWarning}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                      <Tx k="fort.disputedNotice" />
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {curated && (fort.accessibility || fort.travel) ? (
              <section aria-labelledby="visit-heading">
                <StripLabel>
                  <Tx k="fort.visit" />
                </StripLabel>
                <h2
                  id="visit-heading"
                  className="mt-1 font-display text-2xl font-semibold text-ink"
                >
                  <Tx k="fort.gettingThere" />
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {fort.accessibility ? (
                    <div className="rounded-2xl border border-line bg-parchment-deep/40 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                        <Footprints
                          className="size-4 text-saffron-deep"
                          aria-hidden="true"
                        />
                        <Tx k="fort.accessibility" />
                      </div>
                      <BiText
                        en={fort.accessibility.en}
                        mr={fort.accessibility.mr}
                        className="mt-2 text-[13px] leading-relaxed text-ink-muted"
                      />
                    </div>
                  ) : null}
                  {fort.travel ? (
                    <div className="rounded-2xl border border-line bg-parchment-deep/40 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                        <Compass
                          className="size-4 text-saffron-deep"
                          aria-hidden="true"
                        />
                        <Tx k="fort.gettingThere" />
                      </div>
                      <BiText
                        en={fort.travel.en}
                        mr={fort.travel.mr}
                        className="mt-2 text-[13px] leading-relaxed text-ink-muted"
                      />
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    <Tx k="fort.editorialNote" />
                  </span>
                </p>
              </section>
            ) : null}

            {!curated ? (
              <section
                aria-labelledby="catalog-heading"
                className="rounded-2xl border border-gold/40 bg-gold-soft/60 p-5"
              >
                <StripLabel>
                  <Tx k="fort.dataStatus" />
                </StripLabel>
                <h2
                  id="catalog-heading"
                  className="mt-1 font-display text-xl font-semibold text-ink"
                >
                  <Tx k="fort.catalogTitle" />
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  <Tx k="fort.catalogBody" />
                </p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-forest/25 bg-forest-soft px-3 py-1.5 text-[11px] font-medium text-forest">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  <Tx k="fort.verifiedBasics" />
                </p>
              </section>
            ) : null}

            <section aria-labelledby="verify-heading">
              <StripLabel>
                <Tx k="fort.dataStatus" />
              </StripLabel>
              <h2
                id="verify-heading"
                className="mt-1 font-display text-2xl font-semibold text-ink"
              >
                <Tx k="fort.aboutData" />
              </h2>

              <div className="mt-4 rounded-2xl border border-line bg-parchment-deep/35 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <Tx k="fort.methodTitle" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {fort.coordinateStatus === "inside" ? (
                    <Tx k="fort.methodInside" />
                  ) : fort.coordinateStatus === "nearest-boundary" ? (
                    <Tx k="fort.methodCoast" />
                  ) : (
                    <Tx k="fort.methodFlagged" />
                  )}
                </p>

                <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                      <Tx k="fort.coordinates" />
                    </dt>
                    <dd className="mt-0.5 font-mono text-xs text-ink-soft">
                      {fort.lat.toFixed(5)}, {fort.lon.toFixed(5)}
                    </dd>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                      <Tx k="fort.district" />
                    </dt>
                    <dd className="mt-0.5 text-xs text-ink-soft">
                      <BiLabel
                        en={fort.district ?? "—"}
                        mr={districtMr || "—"}
                      />
                      <span className="ml-1 text-[10px] text-ink-muted">
                        ({fort.districtMethod})
                      </span>
                    </dd>
                  </div>
                </dl>

                {fort.districtNote ? (
                  <div className="mt-4 rounded-xl border border-line bg-parchment/70 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      <Tx k="fort.districtNote" />
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {fort.districtNote}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <Tx k="fort.sources" />
                </h3>
                {fort.sources.length ? (
                  <ul className="mt-2 space-y-2">
                    {fort.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-start gap-1.5 text-sm text-saffron-deep hover:underline"
                        >
                          <ExternalLink
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {source.title}
                          {source.publisher ? (
                            <span className="text-ink-muted">
                              · {source.publisher}
                            </span>
                          ) : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    <Tx k="fort.sourcePending" />
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line-strong bg-parchment p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-ink">
                <Tx k="fort.facts" />
              </h2>
              <dl className="mt-3">
                <FactRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      <Tx k="fort.district" />
                    </span>
                  }
                >
                  {fort.district ? (
                    <Link
                      href={`/?district=${fort.districtSlug}`}
                      className="hover:text-saffron-deep hover:underline"
                    >
                      <BiLabel en={fort.district} mr={districtMr} />
                    </Link>
                  ) : (
                    <Unavailable />
                  )}
                </FactRow>

                <FactRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark className="size-3.5" aria-hidden="true" />
                      <Tx k="explorer.filterCategory" />
                    </span>
                  }
                >
                  {fort.category ? (
                    <BiLabel
                      en={translate("en", `category.${fort.category}`)}
                      mr={translate("mr", `category.${fort.category}`)}
                    />
                  ) : (
                    <Unavailable />
                  )}
                </FactRow>

                <FactRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <Ruler className="size-3.5" aria-hidden="true" />
                      <Tx k="fort.elevation" />
                    </span>
                  }
                >
                  {fort.elevationM ? (
                    `${fort.elevationM.toLocaleString("en-IN")} m`
                  ) : (
                    <Unavailable />
                  )}
                </FactRow>

                <FactRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <Mountain className="size-3.5" aria-hidden="true" />
                      <Tx k="fort.difficulty" />
                    </span>
                  }
                >
                  {fort.difficulty ? (
                    <BiLabel
                      en={translate("en", `difficulty.${fort.difficulty}`)}
                      mr={translate("mr", `difficulty.${fort.difficulty}`)}
                    />
                  ) : (
                    <Unavailable />
                  )}
                </FactRow>

                <FactRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarRange className="size-3.5" aria-hidden="true" />
                      <Tx k="fort.season" />
                    </span>
                  }
                >
                  {seasonEn && seasonMr ? (
                    <span>
                      <span data-lang="en" lang="en">
                        {translate("en", "fort.bestMonths", {
                          from: seasonEn.from,
                          to: seasonEn.to,
                        })}
                      </span>
                      <span data-lang="mr" lang="mr">
                        {translate("mr", "fort.bestMonths", {
                          from: seasonMr.from,
                          to: seasonMr.to,
                        })}
                      </span>
                    </span>
                  ) : (
                    <Unavailable />
                  )}
                </FactRow>

                <FactRow label={<Tx k="fort.built" />}>
                  {fort.built ?? <Unavailable />}
                </FactRow>

                <FactRow label={<Tx k="fort.heritage" />}>
                  {fort.heritageClass ? (
                    <BiLabel
                      en={translate("en", `fort.heritage.${fort.heritageClass}`)}
                      mr={translate("mr", `fort.heritage.${fort.heritageClass}`)}
                    />
                  ) : (
                    <Unavailable />
                  )}
                </FactRow>
              </dl>

              {curated && fort.reviewedOn ? (
                <div className="mt-4 border-t border-line pt-3 text-[11px] text-ink-muted">
                  <Tx k="fort.lastReviewed" vars={{ date: fort.reviewedOn }} />
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-2xl border border-line-strong bg-parchment shadow-soft">
              <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <Tx k="fort.minMap" />
                </h2>
                {disputed ? (
                  <Badge variant="flag">
                    <Tx k="status.flagged" />
                  </Badge>
                ) : (
                  <Badge variant="forest">
                    <Tx k="status.verified" />
                  </Badge>
                )}
              </div>
              <div className="h-56">
                <FortMiniMap
                  lat={fort.lat}
                  lon={fort.lon}
                  name={fort.name}
                  category={fort.category}
                  flagged={disputed}
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
                <p className="text-[10px] text-ink-muted">
                  <Tx k="fort.coordHint" />
                </p>
                <a
                  href={osmUrl(fort)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-medium text-saffron-deep hover:underline"
                >
                  OSM ↗
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-parchment-deep/40 p-5">
              <p className="font-display text-base font-semibold text-ink">
                <Tx k="fort.exploreArea" />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                <Tx k="fort.nearbyHint" />
              </p>
              {fort.districtSlug ? (
                <Link
                  href={`/?district=${fort.districtSlug}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-parchment px-3.5 py-2 text-xs font-medium text-ink-soft shadow-soft transition-colors hover:text-saffron-deep"
                >
                  <Tx
                    k="fort.exploreDistrict"
                    vars={{ district: fort.district ?? "" }}
                  />
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <section
          aria-labelledby="nearby-heading"
          className="mx-auto mt-12 w-full max-w-6xl px-4 sm:px-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <StripLabel>
                <Tx k="fort.exploreArea" />
              </StripLabel>
              <h2
                id="nearby-heading"
                className="mt-1 font-display text-2xl font-semibold text-ink"
              >
                <Tx k="fort.nearby" />
              </h2>
            </div>
            <p className="text-[11px] text-ink-muted">
              <Tx k="fort.nearbyHint" />
            </p>
          </div>

          {nearby.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nearby.map(({ mapFort, km }) => (
                <FortCard
                  key={mapFort.slug}
                  fort={mapFort}
                  variant="grid"
                  distance={km}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              <Tx k="fort.nearbyEmpty" />
            </p>
          )}
        </section>

        <div className="mx-auto mt-12 w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line-strong bg-parchment-deep/50 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                <Tx k="explorer.title" />
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                <Tx k="explorer.coverageShort" />
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-parchment transition-colors hover:bg-ink-soft"
            >
              <Tx k="fort.allForts" />
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </>
  );
}
