import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Clock,
  Footprints,
  Info,
} from "lucide-react";
import { BiLabel, BiText, Tx } from "@/components/common/bilingual";
import { FortCard } from "@/components/explorer/fort-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { circuits } from "@/content/circuits";
import { getMapFort } from "@/lib/forts";
import { translate } from "@/lib/i18n";
import type { Difficulty } from "@/types";

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

function DifficultyLabel({ value }: { value: Difficulty }) {
  return (
    <BiLabel
      en={translate("en", `difficulty.${value}`)}
      mr={translate("mr", `difficulty.${value}`)}
    />
  );
}

function localizedDays(days: string) {
  const match = days.match(/^(\d+)\s*days?$/i);
  if (!match) return { en: days, mr: days };
  return {
    en: `${match[1]} ${Number(match[1]) === 1 ? "day" : "days"}`,
    mr: `${match[1]} दिवस`,
  };
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
    <div className="pb-16">
      <header className="border-b border-line bg-parchment-deep/40">
        <div className="paper-texture mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
            <Tx k="nav.circuits" />
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            <Tx k="circuits.title" />
          </h1>

          <nav
            aria-label={translate("en", "circuits.title")}
            className="scroll-slim scroll-fade-x mt-5 flex items-center gap-1.5 overflow-x-auto pb-1"
          >
            {items.map(({ circuit }, index) => (
              <a
                key={circuit.slug}
                href={`#${circuit.slug}`}
                className="shrink-0 rounded-full border border-line-strong bg-parchment px-3 py-1.5 text-[11px] font-medium text-ink-soft transition-colors hover:border-saffron/40 hover:text-saffron-deep"
              >
                {String(index + 1).padStart(2, "0")} · {circuit.name}
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
              className="scroll-mt-24 border-b border-line py-10 lg:py-14"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-12">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="font-display text-4xl font-semibold tabular-nums text-saffron/70"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`${circuit.slug}-heading`}
                      className="min-w-0 font-display text-2xl font-semibold leading-tight text-ink"
                    >
                      <BiLabel en={circuit.name} mr={circuit.nameMr} />
                    </h2>
                  </div>

                  <BiText
                    en={circuit.summary}
                    mr={circuit.summaryMr}
                    className="mt-3 text-[14px] leading-relaxed text-ink-soft"
                  />

                  <dl className="mt-5 space-y-2 border-y border-line py-3 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                        <Clock className="size-3.5" aria-hidden="true" />
                        <Tx k="circuits.days" />
                      </dt>
                      <dd className="font-medium text-ink-soft">
                        <BiLabel en={days.en} mr={days.mr} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                        <Footprints className="size-3.5" aria-hidden="true" />
                        <Tx k="circuits.difficulty" />
                      </dt>
                      <dd className="font-medium text-ink-soft">
                        <DifficultyLabel value={circuit.difficulty} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                        <CalendarRange className="size-3.5" aria-hidden="true" />
                        <Tx k="circuits.season" />
                      </dt>
                      <dd className="text-right font-medium text-ink-soft">
                        <BiLabel en={circuit.season} mr={circuit.seasonMr} />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-xl border border-gold/35 bg-gold-soft/50 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      <Info className="size-3" aria-hidden="true" />
                      <Tx k="circuits.planningNote" />
                    </p>
                    <BiText
                      en={circuit.note}
                      mr={circuit.noteMr}
                      className="mt-1.5 text-xs leading-relaxed text-ink-soft"
                    />
                  </div>

                  {first ? (
                    <Link
                      href={`/?fort=${first.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-saffron-deep hover:underline"
                    >
                      <Tx k="circuits.openRoute" />
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    <Tx
                      k="circuits.fortsOnRoute"
                    />
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {forts.map((fort) => (
                      <FortCard key={fort.slug} fort={fort} variant="grid" />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line-strong bg-parchment-deep/50 p-6 sm:flex-row sm:items-center">
          <p className="font-display text-lg font-semibold text-ink">
            <Tx k="data.sourcesTitle" />
          </p>
          <Link
            href="/data"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-parchment transition-colors hover:bg-ink-soft"
          >
            <Tx k="nav.data" />
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
