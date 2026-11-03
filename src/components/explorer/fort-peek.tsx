"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { useI18n } from "@/components/providers/locale-provider";
import { districtLabel } from "@/lib/i18n";
import { formatDistance } from "@/lib/geo";
import type { MapFort } from "@/types";

export function FortPeek({
  fort,
  distance,
  onClose,
}: {
  fort: MapFort;
  distance?: number | null;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const name = locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;

  const meta = [
    fort.district ? districtLabel(locale, fort.district) : null,
    fort.category ? t(`category.${fort.category}` as const) : null,
    typeof distance === "number" ? formatDistance(distance, locale) : null,
  ].filter(Boolean) as string[];

  return (
    <div className="pointer-events-auto flex w-full animate-fade-rise items-center gap-3 rounded-2xl border border-line-strong bg-parchment p-2.5 shadow-lift">
      <div className="relative size-[64px] shrink-0 overflow-hidden rounded-xl bg-parchment-sunk">
        {fort.image ? (
          <Image src={fort.image} alt={name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="flex min-w-0 items-center gap-1.5 font-display text-[15px] font-semibold leading-tight text-ink">
          <span className="truncate">{name}</span>
          {fort.coordinateStatus === "flagged" ? (
            <>
              <AlertTriangle className="size-3.5 shrink-0 text-flag" aria-hidden="true" />
              <span className="sr-only">{t("status.flagged")}</span>
            </>
          ) : null}
        </h2>
        {meta.length ? (
          <p className="mt-0.5 truncate text-[11px] text-ink-muted">
            {meta.join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <FavoriteButton slug={fort.slug} variant="plain" className="size-8 rounded-full" />
        <Link
          href={`/forts/${fort.slug}`}
          className="inline-flex items-center gap-1 rounded-full bg-saffron px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-saffron-deep"
        >
          {t("explorer.viewProfile")}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-parchment-deep hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
