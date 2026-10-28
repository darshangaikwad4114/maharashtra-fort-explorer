"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  slug,
  className,
  withLabel = false,
  variant = "icon",
}: {
  slug: string;
  className?: string;
  withLabel?: boolean;
  variant?: "icon" | "outline" | "plain";
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useI18n();
  const saved = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={saved}
      aria-label={saved ? t("fort.saved") : t("fort.save")}
      className={cn(
        "group inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors",
        variant === "icon" &&
          "size-9 rounded-full border border-line-strong bg-parchment/90 text-ink-muted hover:text-saffron",
        variant === "outline" &&
          "h-10 rounded-full border border-line-strong bg-parchment px-4 text-ink-soft hover:border-saffron/50 hover:text-saffron-deep",
        variant === "plain" && "text-ink-soft hover:text-saffron-deep",
        saved && "text-saffron-deep",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          "size-4 transition-transform group-active:scale-90",
          saved && "fill-saffron text-saffron",
        )}
      />
      {withLabel ? (
        <span>{saved ? t("fort.saved") : t("fort.save")}</span>
      ) : null}
    </button>
  );
}
