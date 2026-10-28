"use client";

import Link from "next/link";
import { ArrowRight, Heart, Map as MapIcon, WifiOff } from "lucide-react";
import { AccountButton } from "@/components/auth/account-button";
import { FortCard } from "@/components/explorer/fort-card";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useI18n } from "@/components/providers/locale-provider";
import type { MapFort } from "@/types";

export function FavoritesView({ forts }: { forts: MapFort[] }) {
  const { t } = useI18n();
  const { favorites, ready, count, configured } = useFavorites();

  const bySlug = new Map(forts.map((fort) => [fort.slug, fort]));
  const saved = favorites
    .map((slug) => bySlug.get(slug))
    .filter((fort): fort is MapFort => Boolean(fort));

  return (
    <div className="pb-16">
      <header className="border-b border-line bg-parchment-deep/40">
        <div className="paper-texture mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
                {t("nav.favorites")}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                {t("favorites.title")}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                {t("favorites.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-saffron px-4 text-sm font-medium text-white transition-colors hover:bg-saffron-deep"
              >
                <MapIcon className="size-4" aria-hidden="true" />
                {t("favorites.browse")}
              </Link>
              {configured ? <AccountButton withLabel /> : null}
            </div>
          </div>

          {ready ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-parchment px-3 py-1.5 text-[11px] text-ink-muted">
              <WifiOff className="size-3.5" aria-hidden="true" />
              {t("favorites.count", { count })} · {t("favorites.offlineNote")}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        {!ready ? (
          <p className="text-sm text-ink-muted">{t("favorites.loading")}</p>
        ) : saved.length ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                {t("favorites.count", { count: saved.length })}
              </h2>
              <Link
                href="/?favorites=1"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-saffron-deep hover:underline"
              >
                {t("explorer.favoritesOnly")}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saved.map((fort) => (
                <FortCard key={fort.slug} fort={fort} variant="grid" />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-parchment-deep/40 px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-parchment shadow-soft">
              <Heart className="size-5 text-saffron" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">
              {t("favorites.empty")}
            </h2>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">
              {t("favorites.emptyBody")}
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-parchment transition-colors hover:bg-ink-soft"
            >
              {t("favorites.browse")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            {configured ? (
              <div className="mt-3">
                <AccountButton withLabel />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
