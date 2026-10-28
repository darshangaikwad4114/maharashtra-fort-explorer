import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Tx } from "@/components/common/bilingual";
import { BrandMark } from "@/components/layout/brand";
import { SiteFooter } from "@/components/layout/site-footer";
import { developer, siteUrl } from "@/content/site";
import { translate } from "@/lib/i18n";

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

export default function AboutPage() {
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
        <section
          aria-labelledby="project-heading"
          className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-14 lg:py-14"
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
      </div>

      <SiteFooter />
    </div>
  );
}
