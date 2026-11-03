import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BiLabel, BiText, Tx } from "@/components/common/bilingual";
import { SiteFooter } from "@/components/layout/site-footer";
import { getForts } from "@/lib/forts";
import { translate } from "@/lib/i18n";
import { timeline } from "@/content/timeline";

export const metadata: Metadata = {
  title: translate("en", "meta.timelineTitle"),
  description: translate("en", "meta.timelineDescription"),
  alternates: { canonical: "/timeline" },
  openGraph: {
    title: translate("en", "meta.timelineTitle"),
    description: translate("en", "meta.timelineDescription"),
    url: "/timeline",
  },
};

export default function TimelinePage() {
  return (
    <div className="pb-16">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="timeline.title" />
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6">
        <ol>
          {timeline.map((event) => {
            const related = getForts(event.fortSlugs);
            return (
              <li
                key={`${event.year}-${event.title}`}
                className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-8"
              >
                <div className="pt-5 text-right sm:pt-4">
                  <p className="font-display text-xl font-semibold tabular-nums text-saffron-deep sm:text-3xl">
                    {event.year}
                  </p>
                </div>

                <div className="relative border-l border-line-strong/70 pb-10 pl-5 sm:pl-8">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5px] top-6 size-2.5 rounded-full border-2 border-parchment bg-saffron sm:top-5"
                  />

                  <h2 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                    <BiLabel en={event.title} mr={event.titleMr} />
                  </h2>

                  <BiText
                    en={event.description}
                    mr={event.descriptionMr}
                    className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {related.map((fort) => (
                      <Link
                        key={fort.slug}
                        href={`/forts/${fort.slug}`}
                        className="inline-flex items-center rounded-full border border-line bg-parchment px-2.5 py-1 text-[11px] text-ink-soft transition-colors hover:border-saffron/40 hover:text-saffron-deep"
                      >
                        {fort.name}
                      </Link>
                    ))}
                  </div>

                  <a
                    href={event.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-saffron-deep hover:underline"
                  >
                    <Tx k="timeline.source" />
                    <span className="text-ink-muted">· {event.source.title}</span>
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <SiteFooter />
    </div>
  );
}
