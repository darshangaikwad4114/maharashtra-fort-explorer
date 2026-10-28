"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { useI18n } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
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
  const displayName = locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;

  return (
    <div className="pointer-events-auto w-full animate-fade-rise overflow-hidden rounded-2xl border border-line-strong bg-parchment shadow-lift">
      <div className="flex gap-3 p-2.5">
        <div className="relative size-[88px] shrink-0 overflow-hidden rounded-xl bg-parchment-sunk">
          {fort.image ? (
            <Image
              src={fort.image}
              alt={displayName}
              fill
              sizes="88px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-ink-muted">
              {t("status.catalog")}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold leading-tight text-ink">
                {displayName}
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                {[fort.district ? districtLabel(locale, fort.district) : null, fort.category ? t(`category.${fort.category}` as const) : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="grid size-7 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-parchment-deep hover:text-ink"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {fort.profileStatus === "curated" ? (
              <Badge variant="forest">{t("status.curated")}</Badge>
            ) : (
              <Badge variant="outline">{t("status.catalog")}</Badge>
            )}
            {fort.coordinateStatus === "flagged" ? (
              <Badge variant="flag">{t("status.flagged")}</Badge>
            ) : null}
            {typeof distance === "number" ? (
              <Badge variant="outline">
                {formatDistance(distance, locale)}
              </Badge>
            ) : null}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <Link
              href={`/forts/${fort.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-deep hover:underline"
            >
              {t("explorer.viewProfile")}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <FavoriteButton slug={fort.slug} variant="plain" withLabel />
          </div>
        </div>
      </div>
    </div>
  );
}
