import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Info } from "lucide-react";
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
      <header className="border-b border-line bg-parchment-deep/40">
        <div className="paper-texture mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
            <Tx k="nav.timeline" />
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="timeline.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            <Tx k="timeline.subtitle" />
          </p>
          <p className="mt-4 flex max-w-2xl items-start gap-2 text-[11px] leading-relaxed text-ink-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <Tx k="timeline.note" />
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6">
        <ol className="space-y-0">
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
                    className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      <Tx k="timeline.related" />
                    </span>
                    {related.map((fort) => (
                      <Link
                        key={fort.slug}
                        href={`/forts/${fort.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-parchment px-2.5 py-1 text-[11px] text-ink-soft transition-colors hover:border-saffron/40 hover:text-saffron-deep"
                      >
                        {fort.name}
                      </Link>
                    ))}
                  </div>

                  <a
                    href={event.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-saffron-deep hover:underline"
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

        <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line-strong bg-parchment-deep/50 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-semibold text-ink">
              <Tx k="data.curatedTitle" />
            </p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink-muted">
              <Tx k="data.statusBody" />
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-parchment transition-colors hover:bg-ink-soft"
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
