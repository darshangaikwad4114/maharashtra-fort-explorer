"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Mountain } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { useI18n } from "@/components/providers/locale-provider";
import { districtLabel } from "@/lib/i18n";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";
import type { MapFort } from "@/types";

type FortCardProps = {
  fort: MapFort;
  distance?: number | null;
  variant?: "row" | "grid";
  selected?: boolean;
};

export function FortCard({
  fort,
  distance,
  variant = "row",
  selected = false,
}: FortCardProps) {
  const { t, locale } = useI18n();
  const name = locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;

  const meta = [
    fort.district ? districtLabel(locale, fort.district) : null,
    fort.category ? t(`category.${fort.category}` as const) : null,
    fort.elevationM ? `${fort.elevationM.toLocaleString("en-IN")} m` : null,
    typeof distance === "number" ? formatDistance(distance, locale) : null,
  ].filter(Boolean) as string[];

  const heading = (
    <>
      <span className="truncate">{name}</span>
      {fort.coordinateStatus === "flagged" ? (
        <>
          <AlertTriangle
            className="size-3.5 shrink-0 text-flag"
            aria-hidden="true"
          />
          <span className="sr-only">{t("status.flagged")}</span>
        </>
      ) : null}
    </>
  );

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-parchment transition-colors focus-within:ring-2 focus-within:ring-saffron/30",
        selected
          ? "border-saffron/60 bg-saffron-soft/30"
          : "border-line hover:border-line-strong hover:bg-parchment-deep/40",
      )}
    >
      <Link
        href={`/forts/${fort.slug}`}
        className="absolute inset-0 z-10"
        aria-label={name}
      />

      {variant === "row" ? (
        <div className="flex items-center gap-3 p-2 pr-10">
          <Thumb fort={fort} name={name} sizes="56px" className="size-14 rounded-lg" />
          <div className="min-w-0 flex-1">
            <h2 className="flex min-w-0 items-center gap-1.5 font-display text-[14px] font-semibold leading-snug text-ink">
              {heading}
            </h2>
            {meta.length ? (
              <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                {meta.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <Thumb
            fort={fort}
            name={name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="aspect-[4/3] w-full rounded-none"
          />
          <div className="p-3.5">
            <h2 className="flex min-w-0 items-center gap-1.5 font-display text-[15px] font-semibold leading-snug text-ink">
              {heading}
            </h2>
            {meta.length ? (
              <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                {meta.join(" · ")}
              </p>
            ) : null}
          </div>
        </>
      )}

      <FavoriteButton
        slug={fort.slug}
        className={cn(
          "absolute right-2 z-20",
          variant === "row"
            ? "top-1/2 -translate-y-1/2 border-0 bg-transparent"
            : "top-2 size-8 bg-parchment/92 shadow-soft backdrop-blur",
        )}
      />
    </article>
  );
}

function Thumb({
  fort,
  name,
  sizes,
  className,
}: {
  fort: MapFort;
  name: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-parchment-sunk",
        className,
      )}
    >
      {fort.image ? (
        <Image
          src={fort.image}
          alt={name}
          fill
          sizes={sizes}
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-line-strong">
          <Mountain className="size-4" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
