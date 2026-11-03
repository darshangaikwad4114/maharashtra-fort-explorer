"use client";

import { ChevronDown, Heart, ShieldAlert, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import type { Difficulty, District, FortCategory } from "@/types";
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
};

const categories: FortCategory[] = ["hill", "sea", "land", "pinnacle"];
const difficulties: Difficulty[] = ["easy", "moderate", "hard", "very_hard"];

export function ExplorerFilters({
  districts,
  state,
  onChange,
}: ExplorerFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FilterSelect
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
        </FilterSelect>

        <FilterSelect
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
        </FilterSelect>

        <FilterSelect
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
        </FilterSelect>
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

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full appearance-none truncate rounded-xl border border-line-strong bg-parchment pl-3 pr-9 text-[13px] font-medium text-ink-soft transition-colors hover:bg-parchment-deep/50 focus-visible:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/20"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      />
    </span>
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
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
