import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { BiLabel, BiText, Tx } from "@/components/common/bilingual";
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

function FactRow({
  label,
  children,
}: {
  label: React.ReactNode;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
      <dt className="shrink-0 text-xs text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right text-xs font-medium text-ink-soft">
        {children}
      </dd>
    </div>
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
    return mapFort ? [{ mapFort, km: distanceKm(fort, neighbor) }] : [];
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
    ...(curated ? { sameAs: fort.sources.map((source) => source.url) } : {}),
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

      <article className="pb-20">
        <div className="border-b border-line">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3.5 text-[12px] text-ink-muted sm:px-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              <Tx k="fort.backToMap" />
            </Link>
            {fort.district ? (
              <>
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
                <Link
                  href={`/?district=${fort.districtSlug}`}
                  className="truncate transition-colors hover:text-ink"
                >
                  <BiLabel en={fort.district} mr={districtMr} />
                </Link>
              </>
            ) : null}
          </nav>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:pt-10">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {fort.category ? (
                  <Badge variant="gold">
                    <BiLabel
                      en={translate("en", `category.${fort.category}`)}
                      mr={translate("mr", `category.${fort.category}`)}
                    />
                  </Badge>
                ) : null}
                {disputed ? (
                  <Badge variant="flag">
                    <AlertTriangle className="size-3" aria-hidden="true" />
                    <Tx k="status.flagged" />
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.08] text-ink sm:text-5xl">
                <span data-lang="en" lang="en">
                  {fort.name}
                </span>
                <span data-lang="mr" lang="mr">
                  {fort.nameMr ?? fort.name}
                </span>
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

              {fort.district ? (
                <Link
                  href={`/?district=${fort.districtSlug}`}
                  className="mt-2 inline-block text-sm text-ink-soft transition-colors hover:text-saffron-deep"
                >
                  <BiLabel en={fort.district} mr={districtMr} />
                </Link>
              ) : null}

              <div className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
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
                  <Tx k="fort.onMap" />
                </Link>
                <a
                  href={mapsDirectionsUrl(fort)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-parchment px-4 text-sm font-medium text-ink-soft transition-colors hover:border-saffron/50 hover:text-saffron-deep"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  <Tx k="fort.directions" />
                </a>
                <FavoriteButton slug={fort.slug} variant="outline" withLabel />
                <ShareButton name={fort.name} iconOnly />
              </div>

              {disputed ? (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-flag/30 bg-[#f7e5df] p-4">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-flag"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-flag">
                      <Tx k="fort.locationWarningTitle" />
                    </h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      {fort.locationWarning}
                    </p>
                  </div>
                </div>
              ) : null}

              {curated && (fort.accessibility || fort.travel) ? (
                <section aria-labelledby="visit-heading" className="mt-10">
                  <h2
                    id="visit-heading"
                    className="font-display text-xl font-semibold text-ink"
                  >
                    <Tx k="fort.visit" />
                  </h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {fort.accessibility ? (
                      <div className="rounded-2xl border border-line bg-parchment-deep/40 p-4">
                        <h3 className="text-xs font-semibold text-ink-soft">
                          <Tx k="fort.accessibility" />
                        </h3>
                        <BiText
                          en={fort.accessibility.en}
                          mr={fort.accessibility.mr}
                          className="mt-1.5 text-[13px] leading-relaxed text-ink-muted"
                        />
                      </div>
                    ) : null}
                    {fort.travel ? (
                      <div className="rounded-2xl border border-line bg-parchment-deep/40 p-4">
                        <h3 className="text-xs font-semibold text-ink-soft">
                          <Tx k="fort.gettingThere" />
                        </h3>
                        <BiText
                          en={fort.travel.en}
                          mr={fort.travel.mr}
                          className="mt-1.5 text-[13px] leading-relaxed text-ink-muted"
                        />
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section aria-labelledby="nearby-heading" className="mt-10">
                <div className="flex items-baseline justify-between gap-3">
                  <h2
                    id="nearby-heading"
                    className="font-display text-xl font-semibold text-ink"
                  >
                    <Tx k="fort.nearby" />
                  </h2>
                  {fort.districtSlug ? (
                    <Link
                      href={`/?district=${fort.districtSlug}`}
                      className="shrink-0 text-xs font-medium text-saffron-deep transition-colors hover:text-saffron"
                    >
                      <Tx k="fort.exploreDistrict" vars={{ district: fort.district ?? "" }} />
                    </Link>
                  ) : null}
                </div>
                {nearby.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                  <p className="mt-3 text-sm text-ink-muted">
                    <Tx k="fort.nearbyEmpty" />
                  </p>
                )}
              </section>

              <details className="group mt-10 rounded-2xl border border-line bg-parchment-deep/30 px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  <Tx k="fort.sources" />
                  <ChevronDown
                    className="size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>

                <div className="mt-4 space-y-4 border-t border-line pt-4">
                  {fort.sources.length ? (
                    <ul className="space-y-2">
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
                    <p className="text-sm leading-relaxed text-ink-muted">
                      <Tx k="fort.sourcePending" />
                    </p>
                  )}

                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex justify-between gap-3 text-xs">
                      <dt className="text-ink-muted">
                        <Tx k="fort.coordinates" />
                      </dt>
                      <dd className="font-mono text-ink-soft">
                        {fort.lat.toFixed(5)}, {fort.lon.toFixed(5)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 text-xs">
                      <dt className="text-ink-muted">
                        <Tx k="fort.district" />
                      </dt>
                      <dd className="text-ink-soft">
                        <BiLabel en={fort.district ?? "—"} mr={districtMr || "—"} />
                      </dd>
                    </div>
                  </dl>

                  <p className="text-xs leading-relaxed text-ink-muted">
                    {fort.coordinateStatus === "inside" ? (
                      <Tx k="fort.methodInside" />
                    ) : fort.coordinateStatus === "nearest-boundary" ? (
                      <Tx k="fort.methodCoast" />
                    ) : (
                      <Tx k="fort.methodFlagged" />
                    )}
                  </p>

                  {fort.districtNote ? (
                    <p className="text-xs leading-relaxed text-ink-muted">
                      {fort.districtNote}
                    </p>
                  ) : null}

                  {curated && fort.reviewedOn ? (
                    <p className="text-[11px] text-ink-muted">
                      <Tx k="fort.lastReviewed" vars={{ date: fort.reviewedOn }} />
                    </p>
                  ) : null}
                </div>
              </details>
            </div>

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
              {fort.image ? (
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-strong bg-parchment-sunk shadow-soft">
                    <Image
                      src={fort.image.src}
                      alt={fort.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 360px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-[10px] text-ink-muted">
                    <a
                      href={fort.image.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-line-strong underline-offset-2 hover:text-saffron-deep"
                    >
                      {fort.image.author} · {fort.image.license}
                    </a>
                  </figcaption>
                </figure>
              ) : null}

              <div className="rounded-2xl border border-line-strong bg-parchment p-4 shadow-soft">
                <h2 className="font-display text-base font-semibold text-ink">
                  <Tx k="fort.facts" />
                </h2>
                <dl className="mt-2">
                  <FactRow label={<Tx k="fort.district" />}>
                    {fort.district ? (
                      <Link
                        href={`/?district=${fort.districtSlug}`}
                        className="hover:text-saffron-deep"
                      >
                        <BiLabel en={fort.district} mr={districtMr} />
                      </Link>
                    ) : null}
                  </FactRow>

                  <FactRow label={<Tx k="explorer.filterCategory" />}>
                    {fort.category ? (
                      <BiLabel
                        en={translate("en", `category.${fort.category}`)}
                        mr={translate("mr", `category.${fort.category}`)}
                      />
                    ) : null}
                  </FactRow>

                  <FactRow label={<Tx k="fort.elevation" />}>
                    {fort.elevationM ? (
                      `${fort.elevationM.toLocaleString("en-IN")} m`
                    ) : null}
                  </FactRow>

                  <FactRow label={<Tx k="fort.difficulty" />}>
                    {fort.difficulty ? (
                      <BiLabel
                        en={translate("en", `difficulty.${fort.difficulty}`)}
                        mr={translate("mr", `difficulty.${fort.difficulty}`)}
                      />
                    ) : null}
                  </FactRow>

                  <FactRow label={<Tx k="fort.season" />}>
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
                    ) : null}
                  </FactRow>

                  <FactRow label={<Tx k="fort.built" />}>{fort.built}</FactRow>

                  <FactRow label={<Tx k="fort.heritage" />}>
                    {fort.heritageClass ? (
                      <BiLabel
                        en={translate("en", `fort.heritage.${fort.heritageClass}`)}
                        mr={translate("mr", `fort.heritage.${fort.heritageClass}`)}
                      />
                    ) : null}
                  </FactRow>

                  {fort.aliases.length ? (
                    <FactRow label={<Tx k="fort.alsoKnown" />}>
                      {fort.aliases.join(", ")}
                    </FactRow>
                  ) : null}
                </dl>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-parchment shadow-soft">
                <div className="h-56">
                  <FortMiniMap
                    lat={fort.lat}
                    lon={fort.lon}
                    name={fort.name}
                    flagged={disputed}
                  />
                </div>
                <a
                  href={osmUrl(fort)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2 top-2 z-[500] inline-flex items-center gap-1 rounded-full bg-parchment/92 px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-soft backdrop-blur transition-colors hover:text-saffron-deep"
                >
                  OpenStreetMap
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <SiteFooter />
    </>
  );
}
