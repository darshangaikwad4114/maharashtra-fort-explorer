"use client";

import Link from "next/link";
import { Heart, Map as MapIcon } from "lucide-react";
import { AccountButton } from "@/components/auth/account-button";
import { FortCard } from "@/components/explorer/fort-card";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useI18n } from "@/components/providers/locale-provider";
import type { MapFort } from "@/types";

export function FavoritesView({ forts }: { forts: MapFort[] }) {
  const { t } = useI18n();
  const { favorites, ready, configured } = useFavorites();

  const bySlug = new Map(forts.map((fort) => [fort.slug, fort]));
  const saved = favorites
    .map((slug) => bySlug.get(slug))
    .filter((fort): fort is MapFort => Boolean(fort));

  return (
    <div className="pb-16">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {t("favorites.title")}
              </h1>
              {ready ? (
                <p className="text-sm tabular-nums text-ink-muted">
                  {t("favorites.count", { count: saved.length })}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
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
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        {!ready ? (
          <p className="text-sm text-ink-muted">{t("favorites.loading")}</p>
        ) : saved.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((fort) => (
              <FortCard key={fort.slug} fort={fort} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-full border border-line bg-parchment">
              <Heart className="size-5 text-saffron" aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-xl font-semibold text-ink">
              {t("favorites.empty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
