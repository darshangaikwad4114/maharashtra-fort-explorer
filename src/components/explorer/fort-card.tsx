"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Mountain,
  MoveUpRight,
  Ruler,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { useI18n } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { districtLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";
import type { MapFort } from "@/types";

type FortCardProps = {
  fort: MapFort;
  distance?: number | null;
  variant?: "row" | "grid";
  selected?: boolean;
  onHover?: (slug: string | null) => void;
};

export function FortCard({
  fort,
  distance,
  variant = "row",
  selected = false,
  onHover,
}: FortCardProps) {
  const { t, locale } = useI18n();
  const displayName =
    locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;
  const categoryLabel = fort.category
    ? t(`category.${fort.category}` as const)
    : null;

  const meta = (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
      {fort.district ? <span>{districtLabel(locale, fort.district)}</span> : null}
      {fort.district && categoryLabel ? (
        <span aria-hidden="true" className="text-line-strong">
          ·
        </span>
      ) : null}
      {categoryLabel ? <span>{categoryLabel}</span> : null}
      {fort.elevationM ? (
        <span className="inline-flex items-center gap-0.5">
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <Ruler className="size-3" aria-hidden="true" />
          {fort.elevationM.toLocaleString("en-IN")} m
        </span>
      ) : null}
    </div>
  );

  return (
    <article
      onMouseEnter={() => onHover?.(fort.slug)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-parchment transition-[border-color,box-shadow,background-color] focus-within:ring-2 focus-within:ring-saffron/40",
        selected
          ? "border-saffron/70 bg-saffron-soft/40 shadow-soft"
          : "border-line hover:border-line-strong hover:bg-parchment-deep/40",
        variant === "row" ? "flex gap-3 p-2.5" : "flex flex-col",
      )}
    >
      <Link
        href={`/forts/${fort.slug}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`${displayName} — ${t("explorer.viewProfile")}`}
      />

      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-parchment-sunk",
          variant === "row"
            ? "size-[92px] rounded-xl"
            : "aspect-[4/3] w-full rounded-t-2xl",
        )}
      >
        {fort.image ? (
          <Image
            src={fort.image}
            alt={displayName}
            fill
            sizes={variant === "row" ? "92px" : "(max-width: 1024px) 100vw, 33vw"}
            loading={selected ? "eager" : "lazy"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[linear-gradient(145deg,#efe6d6,#e3d7c1)] text-ink-muted">
            <Mountain className="size-5" aria-hidden="true" />
            {variant === "grid" ? (
              <span className="text-[10px] uppercase tracking-wide">
                {t("status.catalog")}
              </span>
            ) : null}
          </div>
        )}
        {variant === "grid" ? (
          <div className="absolute left-2.5 top-2.5 z-20">
            <FavoriteButton
              slug={fort.slug}
              className="bg-parchment/95 shadow-soft backdrop-blur"
            />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1",
          variant === "row" ? "py-0.5 pr-8" : "flex flex-col gap-2 p-3.5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[15px] font-semibold leading-snug text-ink">
              {displayName}
            </h2>
            {locale === "mr" && fort.nameMr ? (
              <p className="truncate text-[11px] text-ink-muted">{fort.name}</p>
            ) : fort.nameMr ? (
              <p className="truncate text-[11px] text-ink-muted" lang="mr">
                {fort.nameMr}
              </p>
            ) : null}
          </div>
          {variant === "row" ? (
            <FavoriteButton
              slug={fort.slug}
              className="absolute right-2 top-2 z-20"
            />
          ) : null}
        </div>

        <div className={variant === "row" ? "mt-1.5" : "mt-0.5"}>{meta}</div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {fort.profileStatus === "curated" ? (
            <Badge variant="forest">{t("status.curated")}</Badge>
          ) : null}
          {fort.coordinateStatus === "flagged" ? (
            <Badge variant="flag" title={fort.locationWarning ?? undefined}>
              <AlertTriangle className="size-3" aria-hidden="true" />
              {t("status.flagged")}
            </Badge>
          ) : null}
          {typeof distance === "number" ? (
            <Badge variant="outline">
              {formatDistance(distance, locale)}
            </Badge>
          ) : null}
          {variant === "grid" ? (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-saffron-deep opacity-0 transition-opacity group-hover:opacity-100">
              {t("explorer.viewProfile")}
              <MoveUpRight className="size-3" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
