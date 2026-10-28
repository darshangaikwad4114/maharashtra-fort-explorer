"use client";

import {
  ChevronDown,
  Crosshair,
  Heart,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import type { FortCategory, Difficulty, District } from "@/types";
import { cn } from "@/lib/utils";

export type ExplorerFilterState = {
  district: string;
  category: "all" | FortCategory;
  difficulty: "all" | Difficulty;
  curatedOnly: boolean;
  favoritesOnly: boolean;
  showDisputed: boolean;
};

type ExplorerFiltersProps = {
  districts: District[];
  state: ExplorerFilterState;
  onChange: (patch: Partial<ExplorerFilterState>) => void;
  onReset: () => void;
  hasLocation: boolean;
  locating: boolean;
  onNearMe: () => void;
  activeCount: number;
};

const categories: FortCategory[] = ["hill", "sea", "land", "pinnacle"];
const difficulties: Difficulty[] = ["easy", "moderate", "hard", "very_hard"];

export function ExplorerFilters({
  districts,
  state,
  onChange,
  onReset,
  hasLocation,
  locating,
  onNearMe,
  activeCount,
}: ExplorerFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {t("explorer.filters")}
          {activeCount ? (
            <span className="ml-1.5 rounded-full bg-saffron-soft px-1.5 py-0.5 text-[10px] text-saffron-deep">
              {activeCount}
            </span>
          ) : null}
        </p>
        {activeCount ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted transition-colors hover:text-saffron-deep"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            {t("common.reset")}
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
        <SelectField
          label={t("explorer.filterDistrict")}
          value={state.district}
          onChange={(value) => onChange({ district: value })}
        >
          <option value="all">{t("explorer.allDistricts")}</option>
          {districts.map((district) => (
            <option key={district.slug} value={district.slug}>
              {district.name} ({district.fortCount})
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t("explorer.filterCategory")}
          value={state.category}
          onChange={(value) =>
            onChange({ category: value as "all" | FortCategory })
          }
        >
          <option value="all">{t("explorer.allCategories")}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {t(`category.${category}`)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t("explorer.filterDifficulty")}
          value={state.difficulty}
          onChange={(value) =>
            onChange({ difficulty: value as "all" | Difficulty })
          }
        >
          <option value="all">{t("explorer.allDifficulties")}</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {t(`difficulty.${difficulty}`)}
            </option>
          ))}
        </SelectField>

        <div className="flex flex-col justify-end">
          <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {t("explorer.nearMe")}
          </span>
          <button
            type="button"
            onClick={onNearMe}
            disabled={locating}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition-colors",
              hasLocation
                ? "border-forest/40 bg-forest-soft text-forest"
                : "border-line-strong bg-parchment text-ink-soft hover:bg-parchment-deep",
              locating && "opacity-60",
            )}
          >
            <Crosshair
              className={cn("size-3.5", locating && "animate-spin")}
              aria-hidden="true"
            />
            {locating ? t("explorer.locating") : t("explorer.nearMe")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ToggleChip
          active={state.curatedOnly}
          onClick={() => onChange({ curatedOnly: !state.curatedOnly })}
          icon={<ShieldCheck className="size-3.5" aria-hidden="true" />}
        >
          {t("explorer.curatedOnly")}
        </ToggleChip>
        <ToggleChip
          active={state.favoritesOnly}
          onClick={() => onChange({ favoritesOnly: !state.favoritesOnly })}
          icon={<Heart className="size-3.5" aria-hidden="true" />}
        >
          {t("explorer.favoritesOnly")}
        </ToggleChip>
        <ToggleChip
          active={state.showDisputed}
          onClick={() => onChange({ showDisputed: !state.showDisputed })}
          icon={<ShieldAlert className="size-3.5" aria-hidden="true" />}
          tone="flag"
        >
          {t("explorer.showDisputed")}
        </ToggleChip>
      </div>
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none truncate rounded-xl border border-line-strong bg-parchment pl-3 pr-8 text-xs font-medium text-ink-soft shadow-[inset_0_1px_2px_rgb(35_30_25_/_0.03)] transition-colors hover:bg-parchment-deep/50 focus-visible:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/20"
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted"
        />
      </span>
    </label>
  );
}

function ToggleChip({
  active,
  onClick,
  icon,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "flag";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? tone === "flag"
            ? "border-flag/35 bg-[#f4dfd9] text-flag"
            : "border-saffron/35 bg-saffron-soft text-saffron-deep"
          : "border-line-strong bg-transparent text-ink-muted hover:bg-parchment-deep hover:text-ink",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
