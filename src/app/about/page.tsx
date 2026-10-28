import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Database,
  Gauge,
  Layers,
  Map as MapIcon,
  Server,
} from "lucide-react";
import { Tx } from "@/components/common/bilingual";
import { BrandMark } from "@/components/layout/brand";
import { SiteFooter } from "@/components/layout/site-footer";
import { developer, siteUrl } from "@/content/site";
import { profileStats } from "@/lib/forts";
import { translate, type TranslateKey } from "@/lib/i18n";

export const metadata: Metadata = {
  title: translate("en", "meta.aboutTitle"),
  description: translate("en", "meta.aboutDescription"),
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    title: translate("en", "meta.aboutTitle"),
    description: translate("en", "meta.aboutDescription"),
    url: "/about",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "About the developer of Maharashtra Fort Explorer",
      },
    ],
  },
};

const stack: {
  icon: typeof Code2;
  label: TranslateKey;
  items: string[];
}[] = [
  {
    icon: Code2,
    label: "about.stackFramework",
    items: ["Next.js 16 App Router", "React 19", "TypeScript"],
  },
  {
    icon: Layers,
    label: "about.stackInterface",
    items: ["Tailwind CSS v4", "Radix primitives", "Bilingual EN / मराठी"],
  },
  {
    icon: MapIcon,
    label: "about.stackMaps",
    items: [
      "Leaflet + React Leaflet",
      "OpenStreetMap tiles",
      "Marker clustering",
    ],
  },
  {
    icon: Database,
    label: "about.stackData",
    items: [
      "Verified static dataset",
      "Optional Supabase/PostgreSQL",
      "Row-level security",
    ],
  },
  {
    icon: Server,
    label: "about.stackDelivery",
    items: ["Prerendered pages", "PWA offline shell", "HTTPS on Vercel"],
  },
  {
    icon: Gauge,
    label: "about.stackQuality",
    items: ["TypeScript checks", "ESLint", "Static build verification"],
  },
];

export default function AboutPage() {
  const stats = [
    { value: String(profileStats.total), label: "about.statForts" as const },
    { value: String(profileStats.curated), label: "about.statProfiles" as const },
    { value: String(profileStats.districts), label: "about.statDistricts" as const },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: developer.name,
        url: developer.portfolio,
        jobTitle: developer.role,
        knowsAbout: [
          "Next.js",
          "React",
          "TypeScript",
          "Tailwind CSS",
          "Leaflet",
          "Supabase",
        ],
      },
      {
        "@type": "WebApplication",
        name: "Maharashtra Fort Explorer",
        url: siteUrl,
        applicationCategory: "TravelApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        inLanguage: ["en", "mr"],
        author: { "@type": "Person", name: developer.name, url: developer.portfolio },
      },
    ],
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-line bg-parchment-deep/40">
        <div className="paper-texture mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
            <Tx k="about.eyebrow" />
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="about.title" />
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            <Tx k="about.intro" />
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              className="inline-flex h-11 items-center gap-2 rounded-full bg-saffron px-5 text-sm font-semibold text-parchment transition-colors hover:bg-saffron-deep"
              href={developer.portfolio}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tx k="about.portfolioCta" />
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">
                (<Tx k="common.newTab" />)
              </span>
            </a>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-parchment px-5 text-sm font-medium text-ink-soft transition-colors hover:border-saffron/50 hover:text-saffron-deep"
              href="/"
            >
              <Tx k="about.mapCta" />
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 gap-3 border-b border-line py-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-line bg-parchment px-4 py-3"
            >
              <dd className="font-display text-3xl font-semibold tabular-nums text-ink">
                {stat.value}
              </dd>
              <dt className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <Tx k={stat.label} />
              </dt>
            </div>
          ))}
          <div className="rounded-xl border border-line bg-parchment px-4 py-3">
            <dd className="font-display text-3xl font-semibold text-ink">
              EN · मर
            </dd>
            <dt className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <Tx k="about.statLanguages" />
            </dt>
          </div>
        </dl>

        <section
          aria-labelledby="project-heading"
          className="grid gap-8 border-b border-line py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-14 lg:py-14"
        >
          <div>
            <h2
              id="project-heading"
              className="font-display text-2xl font-semibold text-ink"
            >
              <Tx k="about.projectTitle" />
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              <Tx k="about.projectBody" />
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-parchment-deep/40 p-6">
            <div className="flex items-center gap-3">
              <BrandMark className="size-10" />
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  <Tx k="about.developerTitle" />
                </h2>
                <p className="text-xs text-ink-muted">{developer.role}</p>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
              <Tx k="about.developerBody" />
            </p>
            <p className="mt-4 text-lg font-semibold text-ink">
              {developer.name}
            </p>
            <a
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-saffron-deep hover:underline"
              href={developer.portfolio}
              target="_blank"
              rel="noopener noreferrer"
            >
              {developer.portfolio.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only">
                (<Tx k="common.newTab" />)
              </span>
            </a>
          </div>
        </section>

        <section aria-labelledby="stack-heading" className="border-b border-line py-10 lg:py-14">
          <h2
            id="stack-heading"
            className="font-display text-2xl font-semibold text-ink"
          >
            <Tx k="about.stackTitle" />
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            <Tx k="about.stackBody" />
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((group, index) => {
              const Icon = group.icon;
              return (
                <li
                  key={`${group.label}-${index}`}
                  className="rounded-xl border border-line bg-parchment px-4 py-4"
                >
                  <div className="flex items-center gap-2 text-ink">
                    <Icon className="size-4 text-saffron" aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      <Tx k={group.label} />
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="data-heading" className="py-10 lg:py-14">
          <h2
            id="data-heading"
            className="font-display text-2xl font-semibold text-ink"
          >
            <Tx k="about.dataTitle" />
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            <Tx k="about.dataBody" />
          </p>
          <Link
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-saffron-deep hover:underline"
            href="/data"
          >
            <Tx k="about.dataCta" />
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
