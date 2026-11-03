import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
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
        author: {
          "@type": "Person",
          name: developer.name,
          url: developer.portfolio,
        },
      },
    ],
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="about.title" />
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            <Tx k="about.intro" />
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <section aria-labelledby="project-heading" className="py-10">
          <h2
            id="project-heading"
            className="font-display text-xl font-semibold text-ink"
          >
            <Tx k="about.projectTitle" />
          </h2>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            <Tx k="about.projectBody" />
          </p>
        </section>

        <section
          aria-labelledby="developer-heading"
          className="border-t border-line py-10"
        >
          <div className="flex items-center gap-3">
            <BrandMark className="size-9" />
            <h2
              id="developer-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              {developer.name}
            </h2>
          </div>
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            <Tx k="about.developerBody" />
          </p>
          <a
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-saffron-deep hover:underline"
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
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
