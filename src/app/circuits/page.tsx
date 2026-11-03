import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BiLabel, Tx } from "@/components/common/bilingual";
import { FortCard } from "@/components/explorer/fort-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { circuits } from "@/content/circuits";
import { getMapFort } from "@/lib/forts";
import { translate } from "@/lib/i18n";

export const metadata: Metadata = {
  title: translate("en", "meta.circuitsTitle"),
  description: translate("en", "meta.circuitsDescription"),
  alternates: { canonical: "/circuits" },
  openGraph: {
    title: translate("en", "meta.circuitsTitle"),
    description: translate("en", "meta.circuitsDescription"),
    url: "/circuits",
  },
};

function localizedDays(days: string) {
  const match = days.match(/^(\d+)\s*days?$/i);
  if (!match) return { en: days, mr: days };
  return {
    en: `${match[1]} ${Number(match[1]) === 1 ? "day" : "days"}`,
    mr: `${match[1]} दिवस`,
  };
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      ·
    </span>
  );
}

export default function CircuitsPage() {
  const items = circuits.map((circuit) => ({
    circuit,
    forts: circuit.fortSlugs.flatMap((slug) => {
      const fort = getMapFort(slug);
      return fort ? [fort] : [];
    }),
  }));

  return (
    <div className="pb-20">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            <Tx k="circuits.title" />
          </h1>

          <nav
            aria-label={translate("en", "circuits.title")}
            className="scroll-slim scroll-fade-x mt-4 flex items-center gap-1.5 overflow-x-auto pb-1"
          >
            {items.map(({ circuit }) => (
              <a
                key={circuit.slug}
                href={`#${circuit.slug}`}
                className="shrink-0 rounded-full border border-line bg-parchment px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:border-saffron/40 hover:text-saffron-deep"
              >
                <BiLabel en={circuit.name} mr={circuit.nameMr} />
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {items.map(({ circuit, forts }, index) => {
          const days = localizedDays(circuit.days);
          const first = forts[0];

          return (
            <section
              key={circuit.slug}
              id={circuit.slug}
              aria-labelledby={`${circuit.slug}-heading`}
              className="scroll-mt-20 border-b border-line py-10 last:border-0 lg:py-12"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12">
                <div>
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-semibold tabular-nums text-saffron/70"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2
                    id={`${circuit.slug}-heading`}
                    className="mt-1 font-display text-2xl font-semibold leading-tight text-ink"
                  >
                    <BiLabel en={circuit.name} mr={circuit.nameMr} />
                  </h2>

                  <BiLabel
                    en={circuit.summary}
                    mr={circuit.summaryMr}
                    className="mt-3 block max-w-prose text-[14px] leading-relaxed text-ink-soft"
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-muted">
                    <BiLabel en={days.en} mr={days.mr} />
                    <Dot />
                    <BiLabel
                      en={translate("en", `difficulty.${circuit.difficulty}` as const)}
                      mr={translate("mr", `difficulty.${circuit.difficulty}` as const)}
                    />
                    <Dot />
                    <BiLabel en={circuit.season} mr={circuit.seasonMr} />
                  </div>

                  {first ? (
                    <Link
                      href={`/?fort=${first.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-saffron-deep transition-colors hover:text-saffron"
                    >
                      <Tx k="circuits.openRoute" />
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  {forts.map((fort) => (
                    <FortCard key={fort.slug} fort={fort} variant="grid" />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <SiteFooter />
    </div>
  );
}
