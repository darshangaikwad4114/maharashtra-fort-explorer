"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpDown,
  ChevronDown,
  Crosshair,
  List,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FortCard } from "@/components/explorer/fort-card";
import { FortPeek } from "@/components/explorer/fort-peek";
import {
  ExplorerFilters,
  type ExplorerFilterState,
} from "@/components/explorer/explorer-filters";
import type { MapFocus, UserLocation } from "@/components/explorer/fort-map";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { Sheet } from "@/components/ui/sheet";
import { distanceKm } from "@/lib/geo";
import type { District, MapFort } from "@/types";
import { cn } from "@/lib/utils";

const FortMap = dynamic(
  () => import("@/components/explorer/fort-map").then((mod) => mod.FortMap),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

type ExplorerProps = {
  forts: MapFort[];
  districts: District[];
};

type SortKey = "name" | "district" | "elevation" | "distance";

const DEFAULT_FILTERS: ExplorerFilterState = {
  district: "all",
  category: "all",
  difficulty: "all",
  curatedOnly: false,
  favoritesOnly: false,
  showDisputed: true,
};

export function FortExplorer({ forts, districts }: ExplorerProps) {
  const { t, locale } = useI18n();
  const { favorites, ready: favoritesReady } = useFavorites();

  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const [filters, setFilters] =
    React.useState<ExplorerFilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = React.useState<SortKey>("name");
  const [view, setView] = React.useState<"map" | "list">("map");
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);
  const [focus, setFocus] = React.useState<MapFocus | null>(null);
  const [userLocation, setUserLocation] = React.useState<UserLocation | null>(
    null,
  );
  const [geolocating, setGeolocating] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [listOpen, setListOpen] = React.useState(false);

  const fortBySlug = React.useMemo(
    () => new Map(forts.map((fort) => [fort.slug, fort])),
    [forts],
  );

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fortSlug = params.get("fort");
    const initialQuery = params.get("q");
    const initialView = params.get("view");
    const initialDistrict = params.get("district");
    const favoritesOnly = params.get("favorites") === "1";

    // The URL has no server-side snapshot, so deep-link state is restored
    // once after hydration rather than during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialQuery) setQuery(initialQuery);
    if (initialView === "list") setView("list");
    if (favoritesOnly) {
      setFilters((current) => ({ ...current, favoritesOnly: true }));
    }
    if (
      initialDistrict &&
      districts.some((district) => district.slug === initialDistrict)
    ) {
      setFilters((current) => ({ ...current, district: initialDistrict }));
    }

    if (fortSlug) {
      const fort = fortBySlug.get(fortSlug);
      if (fort) {
        setSelectedSlug(fort.slug);
        setFocus({
          lat: fort.lat,
          lon: fort.lon,
          zoom: 11,
          nonce: Date.now(),
        });
      }
    }
    // URL state is read once on mount; subsequent changes are written back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrl = React.useCallback((slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("fort", slug);
    else url.searchParams.delete("fort");
    window.history.replaceState(null, "", url.toString());
  }, []);

  const updateFilters = React.useCallback(
    (patch: Partial<ExplorerFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const resetFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
  }, []);

  const distances = React.useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    return new Map(
      forts.map((fort) => [
        fort.slug,
        distanceKm(userLocation, { lat: fort.lat, lon: fort.lon }),
      ]),
    );
  }, [forts, userLocation]);

  // Keep favorite membership in its own memo so restoring saved forts from
  // storage only re-filters when that filter is active. Otherwise the map's
  // cluster layer would rebuild all markers and interrupt an open zoom.
  const favoriteSet = React.useMemo(
    () => (filters.favoritesOnly ? new Set(favorites) : null),
    [filters.favoritesOnly, favorites],
  );

  const filtered = React.useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();

    const result = forts.filter((fort) => {
      if (!filters.showDisputed && fort.coordinateStatus === "flagged") {
        return false;
      }
      if (filters.curatedOnly && fort.profileStatus !== "curated") return false;
      if (favoriteSet && !favoriteSet.has(fort.slug)) return false;
      if (
        filters.district !== "all" &&
        fort.districtSlug !== filters.district
      ) {
        return false;
      }
      if (filters.category !== "all" && fort.category !== filters.category) {
        return false;
      }
      if (
        filters.difficulty !== "all" &&
        fort.difficulty !== filters.difficulty
      ) {
        return false;
      }
      if (needle) {
        const haystack = [
          fort.name,
          fort.nameMr ?? "",
          ...fort.aliases,
          fort.district ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const displayName = (fort: MapFort) =>
      locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;

    result.sort((a, b) => {
      switch (sort) {
        case "district":
          return (
            (a.district ?? "").localeCompare(b.district ?? "") ||
            displayName(a).localeCompare(displayName(b), locale)
          );
        case "elevation":
          return (b.elevationM ?? -1) - (a.elevationM ?? -1);
        case "distance": {
          if (!userLocation) break;
          return (
            (distances.get(a.slug) ?? Infinity) -
            (distances.get(b.slug) ?? Infinity)
          );
        }
        default:
          break;
      }
      return displayName(a).localeCompare(displayName(b), locale);
    });

    return result;
  }, [
    forts,
    filters,
    favoriteSet,
    deferredQuery,
    sort,
    userLocation,
    distances,
    locale,
  ]);

  const selectedFort = React.useMemo(() => {
    if (!selectedSlug) return null;
    if (!filtered.some((fort) => fort.slug === selectedSlug)) return null;
    return fortBySlug.get(selectedSlug) ?? null;
  }, [selectedSlug, filtered, fortBySlug]);

  const activeFilterCount = [
    filters.district !== "all",
    filters.category !== "all",
    filters.difficulty !== "all",
    filters.curatedOnly,
    filters.favoritesOnly,
    !filters.showDisputed,
  ].filter(Boolean).length;

  function handleMapSelect(slug: string | null) {
    setSelectedSlug(slug);
    updateUrl(slug);
  }

  function handleNearMe() {
    if (!("geolocation" in navigator)) {
      toast.error(t("explorer.locationUnsupported"));
      return;
    }

    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(location);
        setSort("distance");
        setFocus({
          lat: location.lat,
          lon: location.lon,
          zoom: 11,
          nonce: Date.now(),
        });
        setGeolocating(false);
      },
      () => {
        setGeolocating(false);
        toast.error(t("explorer.locationDenied"));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  }

  const resultsLabel =
    filtered.length === 1
      ? t("explorer.resultsOne")
      : t("explorer.results", { count: filtered.length });

  const controls = (
    <ExplorerControls
      view={view}
      onViewChange={setView}
      query={query}
      onQueryChange={setQuery}
      resultsLabel={resultsLabel}
      activeFilterCount={activeFilterCount}
      onOpenFilters={() => setFiltersOpen(true)}
      onNearMe={handleNearMe}
      locating={geolocating}
      hasLocation={Boolean(userLocation)}
      sort={sort}
      onSortChange={setSort}
      hasDistances={Boolean(userLocation)}
      filters={filters}
      districts={districts}
      onChangeFilters={updateFilters}
    />
  );

  const filterSheet = (
    <Sheet
      open={filtersOpen}
      onOpenChange={setFiltersOpen}
      side="right"
      title={t("explorer.filters")}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 px-5 py-5">
          <ExplorerFilters
            districts={districts}
            state={filters}
            onChange={updateFilters}
          />
        </div>
        <div className="flex items-center gap-2 border-t border-line px-4 py-4">
          <button
            type="button"
            onClick={resetFilters}
            disabled={!activeFilterCount}
            className="rounded-full px-3 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            {t("common.reset")}
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="flex-1 rounded-full bg-saffron py-3 text-sm font-medium text-white transition-colors hover:bg-saffron-deep"
          >
            {resultsLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );

  if (view === "list") {
    return (
      <div className="min-h-[calc(100dvh-4rem)]">
        <div className="border-b border-line bg-parchment">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
            {controls}
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          {filtered.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((fort) => (
                <FortCard
                  key={fort.slug}
                  fort={fort}
                  variant="grid"
                  distance={distances.get(fort.slug)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              onClear={resetFilters}
              favoritesOnly={filters.favoritesOnly}
            />
          )}
        </div>

        {filterSheet}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 lg:grid lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 flex-col border-r border-line bg-parchment lg:flex">
          <div className="border-b border-line px-4 py-4">{controls}</div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-slim px-2 py-2">
            {filtered.length ? (
              <div className="space-y-1.5">
                {filtered.map((fort) => (
                  <FortCard
                    key={fort.slug}
                    fort={fort}
                    distance={distances.get(fort.slug)}
                    selected={fort.slug === selectedFort?.slug}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                onClear={resetFilters}
                favoritesOnly={filters.favoritesOnly}
              />
            )}
          </div>
        </aside>

        <section className="relative min-h-0 flex-1">
          <h1 className="sr-only lg:hidden">{t("explorer.title")}</h1>
          <FortMap
            forts={filtered}
            selectedSlug={selectedFort?.slug ?? null}
            onSelect={handleMapSelect}
            focus={focus}
            userLocation={userLocation}
            locale={locale}
            label={t("explorer.mapLabel")}
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-[1100] lg:hidden">
            <div className="pointer-events-auto flex items-center gap-2">
              <SearchBox
                value={query}
                onChange={setQuery}
                className="min-w-0 flex-1"
                elevated
              />
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-label={t("explorer.openFilters")}
                className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-parchment text-ink-soft shadow-soft"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                {activeFilterCount ? (
                  <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-saffron px-1 text-[10px] font-semibold leading-4 text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {selectedFort ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-10 z-[1100] lg:left-1/2 lg:right-auto lg:w-[380px] lg:-translate-x-1/2">
              <FortPeek
                fort={selectedFort}
                distance={distances.get(selectedFort.slug)}
                onClose={() => handleMapSelect(null)}
              />
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-x-3 bottom-10 z-[1100] lg:hidden">
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="pointer-events-auto flex w-full items-center justify-between gap-3 rounded-2xl border border-line-strong bg-parchment/95 px-4 py-3 text-left shadow-lift backdrop-blur"
              >
                <span className="text-sm font-medium tabular-nums text-ink">
                  {resultsLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <List className="size-3.5" aria-hidden="true" />
                  {t("explorer.listView")}
                </span>
              </button>
            </div>
          )}
        </section>
      </div>

      {filterSheet}

      <Sheet
        open={listOpen}
        onOpenChange={setListOpen}
        side="bottom"
        title={resultsLabel}
        className="h-[80vh]"
      >
        <div className="space-y-1.5 p-3 pb-8">
          {filtered.length ? (
            filtered.map((fort) => (
              <FortCard
                key={fort.slug}
                fort={fort}
                distance={distances.get(fort.slug)}
                selected={fort.slug === selectedFort?.slug}
              />
            ))
          ) : favoritesReady ? (
            <EmptyState
              onClear={resetFilters}
              favoritesOnly={filters.favoritesOnly}
            />
          ) : null}
        </div>
      </Sheet>
    </div>
  );
}

type ControlsProps = {
  view: "map" | "list";
  onViewChange: (view: "map" | "list") => void;
  query: string;
  onQueryChange: (query: string) => void;
  resultsLabel: string;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onNearMe: () => void;
  locating: boolean;
  hasLocation: boolean;
  hasDistances: boolean;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  filters: ExplorerFilterState;
  districts: District[];
  onChangeFilters: (patch: Partial<ExplorerFilterState>) => void;
};

function ExplorerControls({
  view,
  onViewChange,
  query,
  onQueryChange,
  resultsLabel,
  activeFilterCount,
  onOpenFilters,
  onNearMe,
  locating,
  hasLocation,
  hasDistances,
  sort,
  onSortChange,
  filters,
  districts,
  onChangeFilters,
}: ControlsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="truncate font-display text-lg font-semibold text-ink">
            {t("explorer.title")}
          </h1>
          <span className="shrink-0 text-xs tabular-nums text-ink-muted">
            {resultsLabel}
          </span>
        </div>
        <ViewToggle view={view} onChange={onViewChange} />
      </div>

      <SearchBox value={query} onChange={onQueryChange} />

      <div className="flex items-center gap-1.5">
        <ToolbarButton
          onClick={onOpenFilters}
          active={Boolean(activeFilterCount)}
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          {t("explorer.filters")}
          {activeFilterCount ? (
            <span className="rounded-full bg-saffron px-1.5 text-[10px] font-semibold leading-4 text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </ToolbarButton>

        <ToolbarButton onClick={onNearMe} disabled={locating} active={hasLocation}>
          <Crosshair
            className={cn("size-3.5", locating && "animate-spin")}
            aria-hidden="true"
          />
          {t("explorer.nearMe")}
        </ToolbarButton>

        <label className="relative ml-auto inline-flex items-center">
          <span className="sr-only">{t("explorer.sortBy")}</span>
          <ArrowUpDown
            className="pointer-events-none absolute left-2.5 size-3 text-ink-muted"
            aria-hidden="true"
          />
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="h-8 appearance-none rounded-full border border-line-strong bg-parchment pl-7 pr-7 text-[12px] font-medium text-ink-soft transition-colors hover:bg-parchment-deep focus-visible:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/20"
          >
            <option value="name">{t("explorer.sortName")}</option>
            <option value="district">{t("explorer.sortDistrict")}</option>
            <option value="elevation">{t("explorer.sortElevation")}</option>
            {hasDistances ? (
              <option value="distance">{t("explorer.sortDistance")}</option>
            ) : null}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2 size-3 text-ink-muted"
          />
        </label>
      </div>

      <FilterSummary
        filters={filters}
        districts={districts}
        onChange={onChangeFilters}
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors disabled:opacity-60",
        active
          ? "border-saffron/35 bg-saffron-soft text-saffron-deep"
          : "border-line-strong bg-parchment text-ink-soft hover:bg-parchment-deep",
      )}
    >
      {children}
    </button>
  );
}

function SearchBox({
  value,
  onChange,
  className,
  elevated = false,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  elevated?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("explorer.searchPlaceholder")}
        aria-label={t("explorer.searchPlaceholder")}
        className={cn(
          "h-10 w-full rounded-xl border border-line-strong bg-parchment pl-9 pr-8 text-sm text-ink placeholder:text-ink-muted/80 focus-visible:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/20 [&::-webkit-search-cancel-button]:appearance-none",
          elevated && "shadow-soft",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("common.clear")}
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-parchment-deep hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "map" | "list";
  onChange: (view: "map" | "list") => void;
}) {
  const { t } = useI18n();

  return (
    <div
      role="group"
      aria-label={`${t("explorer.mapView")} / ${t("explorer.listView")}`}
      className="inline-flex shrink-0 items-center rounded-full border border-line/80 bg-parchment-deep/60 p-0.5"
    >
      {(
        [
          { key: "map", label: t("explorer.mapView"), Icon: MapIcon },
          { key: "list", label: t("explorer.listView"), Icon: List },
        ] as const
      ).map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          aria-pressed={view === key}
          onClick={() => onChange(key)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
            view === key
              ? "bg-parchment text-ink shadow-soft"
              : "text-ink-muted hover:text-ink",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

function FilterSummary({
  filters,
  districts,
  onChange,
}: {
  filters: ExplorerFilterState;
  districts: District[];
  onChange: (patch: Partial<ExplorerFilterState>) => void;
}) {
  const { t } = useI18n();
  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (filters.district !== "all") {
    const district = districts.find((item) => item.slug === filters.district);
    chips.push({
      key: "district",
      label: district?.name ?? filters.district,
      clear: () => onChange({ district: "all" }),
    });
  }
  if (filters.category !== "all") {
    chips.push({
      key: "category",
      label: t(`category.${filters.category}` as const),
      clear: () => onChange({ category: "all" }),
    });
  }
  if (filters.difficulty !== "all") {
    chips.push({
      key: "difficulty",
      label: t(`difficulty.${filters.difficulty}` as const),
      clear: () => onChange({ difficulty: "all" }),
    });
  }
  if (filters.curatedOnly) {
    chips.push({
      key: "curated",
      label: t("explorer.curatedOnly"),
      clear: () => onChange({ curatedOnly: false }),
    });
  }
  if (filters.favoritesOnly) {
    chips.push({
      key: "favorites",
      label: t("explorer.favoritesOnly"),
      clear: () => onChange({ favoritesOnly: false }),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-parchment-deep py-1 pl-2.5 pr-1 text-[11px] text-ink-soft"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.clear}
            aria-label={`${t("common.clear")} ${chip.label}`}
            className="grid size-4 place-items-center rounded-full transition-colors hover:bg-parchment-sunk"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}

function EmptyState({
  onClear,
  favoritesOnly,
}: {
  onClear: () => void;
  favoritesOnly: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-parchment-deep/40 px-6 py-14 text-center">
      <Search className="size-6 text-line-strong" aria-hidden="true" />
      <h2 className="mt-3 font-display text-base font-semibold text-ink">
        {favoritesOnly ? t("favorites.empty") : t("explorer.noResults")}
      </h2>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-full border border-line-strong bg-parchment px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-parchment-deep"
      >
        {t("explorer.clearFilters")}
      </button>
    </div>
  );
}

function MapLoading() {
  const { t } = useI18n();
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(160deg,#efe7d7,#e2d7c3)]">
      <span className="size-8 animate-spin rounded-full border-2 border-line-strong border-t-saffron" />
      <span className="sr-only">{t("explorer.mapLoading")}</span>
    </div>
  );
}
