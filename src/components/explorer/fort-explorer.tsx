"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpDown,
  ChevronDown,
  Crosshair,
  Heart,
  List,
  LocateFixed,
  Map as MapIcon,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FortCard } from "@/components/explorer/fort-card";
import { FortPeek } from "@/components/explorer/fort-peek";
import {
  ExplorerFilters,
  SelectField,
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
  curatedCount: number;
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

const CATEGORY_DOTS: Record<string, string> = {
  hill: "#B85423",
  sea: "#2F6F7E",
  land: "#8C5A3C",
  pinnacle: "#34503F",
};

export function FortExplorer({ forts, districts, curatedCount }: ExplorerProps) {
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

  function clearAll() {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
  }

  const resultsLabel =
    filtered.length === 1
      ? t("explorer.resultsOne")
      : t("explorer.results", { count: filtered.length });

  const filterPanel = (
    <ExplorerFilters
      districts={districts}
      state={filters}
      onChange={updateFilters}
      onReset={resetFilters}
      hasLocation={Boolean(userLocation)}
      locating={geolocating}
      onNearMe={handleNearMe}
      activeCount={activeFilterCount}
    />
  );

  const sortSelect = (
    <label className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
      <ArrowUpDown className="size-3" aria-hidden="true" />
      <span className="sr-only">{t("explorer.sortBy")}</span>
      <span className="relative">
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="appearance-none rounded-full border border-line-strong bg-parchment py-1 pl-2.5 pr-7 text-[11px] font-medium text-ink-soft hover:bg-parchment-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/30"
        >
          <option value="name">{t("explorer.sortName")}</option>
          <option value="district">{t("explorer.sortDistrict")}</option>
          <option value="elevation">{t("explorer.sortElevation")}</option>
          {userLocation ? (
            <option value="distance">{t("explorer.sortDistance")}</option>
          ) : null}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-ink-muted"
        />
      </span>
    </label>
  );

  if (view === "list") {
    return (
      <div className="min-h-[calc(100dvh-4rem)]">
        <div className="border-b border-line bg-parchment/95 backdrop-blur supports-[backdrop-filter]:bg-parchment/85">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                  {t("explorer.title")}
                </h1>
                <p className="mt-1 text-xs text-ink-muted">
                  {t("explorer.coverage", {
                    curated: curatedCount,
                    total: forts.length,
                  })}
                </p>
              </div>
              <ViewToggle view={view} onChange={setView} />
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <SearchBox
                value={query}
                onChange={setQuery}
                className="flex-1"
              />
              <div className="hidden gap-2 md:flex">
                <SelectField
                  label={t("explorer.filterDistrict")}
                  value={filters.district}
                  onChange={(value) => updateFilters({ district: value })}
                  className="w-40"
                >
                  <option value="all">{t("explorer.allDistricts")}</option>
                  {districts.map((district) => (
                    <option key={district.slug} value={district.slug}>
                      {district.name} ({district.fortCount})
                    </option>
                  ))}
                </SelectField>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 self-end rounded-xl border border-line-strong bg-parchment px-3 text-xs font-medium text-ink-soft hover:bg-parchment-deep md:hidden"
                >
                  <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  {t("explorer.filters")}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-parchment px-3 py-1.5 text-[11px] font-medium text-ink-soft hover:bg-parchment-deep"
                >
                  <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  {t("explorer.filters")}
                  {activeFilterCount ? (
                    <span className="rounded-full bg-saffron px-1.5 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={handleNearMe}
                  disabled={geolocating}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium",
                    userLocation
                      ? "border-forest/35 bg-forest-soft text-forest"
                      : "border-line-strong bg-parchment text-ink-soft hover:bg-parchment-deep",
                  )}
                >
                  <Crosshair
                    className={cn("size-3.5", geolocating && "animate-spin")}
                    aria-hidden="true"
                  />
                  {geolocating ? t("explorer.locating") : t("explorer.nearMe")}
                </button>
                <FilterSummary
                  filters={filters}
                  districts={districts}
                  onChange={updateFilters}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-muted">{resultsLabel}</span>
                {sortSelect}
              </div>
            </div>
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
            <EmptyState onClear={clearAll} favoritesOnly={filters.favoritesOnly} />
          )}
        </div>

        <Sheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          side="bottom"
          title={t("explorer.filters")}
          description={resultsLabel}
        >
          <div className="p-5 pb-8">
            {filterPanel}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-5 w-full rounded-full bg-saffron py-3 text-sm font-medium text-white hover:bg-saffron-deep"
            >
              {resultsLabel}
            </button>
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 lg:grid lg:grid-cols-[396px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 flex-col border-r border-line bg-parchment lg:flex">
          <div className="border-b border-line px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-[26px] font-semibold leading-tight text-ink">
                  {t("explorer.title")}
                </h1>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                  {t("explorer.coverage", {
                    curated: curatedCount,
                    total: forts.length,
                  })}
                </p>
              </div>
              <ViewToggle view={view} onChange={setView} />
            </div>
            <SearchBox
              value={query}
              onChange={setQuery}
              className="mt-4"
            />
          </div>

          <div className="border-b border-line bg-parchment-deep/35 px-4 py-4">
            {filterPanel}
          </div>

          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
            <span className="text-xs font-medium text-ink-soft">
              {resultsLabel}
            </span>
            {sortSelect}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-slim px-3 pb-4">
            {filtered.length ? (
              <div className="space-y-2">
                {filtered.map((fort) => (
                  <FortCard
                    key={fort.slug}
                    fort={fort}
                    distance={distances.get(fort.slug)}
                    selected={fort.slug === selectedFort?.slug}
                    onHover={() => undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="p-3">
                <EmptyState
                  onClear={clearAll}
                  favoritesOnly={filters.favoritesOnly}
                />
              </div>
            )}
          </div>
        </aside>

        <section className="relative min-h-0 flex-1">
          <FortMap
            forts={filtered}
            selectedSlug={selectedFort?.slug ?? null}
            onSelect={handleMapSelect}
            focus={focus}
            userLocation={userLocation}
            locale={locale}
            label={t("explorer.mapLabel")}
          />

          <div className="pointer-events-none absolute inset-x-0 top-3 z-[1100] px-3 lg:hidden">
            <div className="pointer-events-auto rounded-2xl border border-line-strong bg-parchment/95 p-2.5 shadow-lift backdrop-blur">
              <div className="flex items-center gap-2">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  className="flex-1"
                  compact
                />
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  aria-label={t("explorer.openFilters")}
                  className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-parchment text-ink-soft hover:bg-parchment-deep"
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  {activeFilterCount ? (
                    <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-saffron px-1 text-[10px] font-semibold leading-4 text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>
              <div className="scroll-slim scroll-fade-x mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-parchment">
                  {resultsLabel}
                </span>
                <MobileChip onClick={handleNearMe} active={Boolean(userLocation)}>
                  <Crosshair className="size-3" aria-hidden="true" />
                  {t("explorer.nearMe")}
                </MobileChip>
                <MobileChip
                  onClick={() => updateFilters({ curatedOnly: !filters.curatedOnly })}
                  active={filters.curatedOnly}
                >
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {t("explorer.curatedOnly")}
                </MobileChip>
                <MobileChip
                  onClick={() => updateFilters({ favoritesOnly: !filters.favoritesOnly })}
                  active={filters.favoritesOnly}
                >
                  <Heart className="size-3" aria-hidden="true" />
                  {t("explorer.favoritesOnly")}
                </MobileChip>
                {selectedFort ? (
                  <MobileChip
                    onClick={() => handleMapSelect(null)}
                    active={false}
                  >
                    <X className="size-3" aria-hidden="true" />
                    {t("common.clear")}
                  </MobileChip>
                ) : null}
              </div>
            </div>
          </div>

          <MapLegend className="absolute left-4 top-4 z-[1000] hidden lg:block" />

          {selectedFort ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-10 z-[1100] lg:left-1/2 lg:right-auto lg:w-[380px] lg:-translate-x-1/2">
              <FortPeek
                fort={selectedFort}
                distance={distances.get(selectedFort.slug)}
                onClose={() => handleMapSelect(null)}
              />
            </div>
          ) : null}

          {!selectedFort ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-10 z-[1100] lg:hidden">
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="pointer-events-auto flex w-full items-center justify-between gap-3 rounded-2xl border border-line-strong bg-parchment/95 px-4 py-3 text-left shadow-lift backdrop-blur"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <List className="size-4 text-saffron-deep" aria-hidden="true" />
                  {t("explorer.results", { count: filtered.length })}
                </span>
                <span className="text-[11px] text-ink-muted">
                  {t("explorer.listView")} →
                </span>
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <Sheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        side="bottom"
        title={t("explorer.filters")}
        description={resultsLabel}
      >
        <div className="p-5 pb-8">
          {filterPanel}
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="mt-5 w-full rounded-full bg-saffron py-3 text-sm font-medium text-white hover:bg-saffron-deep"
          >
            {resultsLabel}
          </button>
        </div>
      </Sheet>

      <Sheet
        open={listOpen}
        onOpenChange={setListOpen}
        side="bottom"
        title={resultsLabel}
        description={`${activeFilterCount ? `${activeFilterCount} ${t("explorer.filtersActive")}` : t("explorer.selectHint")}`}
        className="h-[80vh]"
      >
        <div className="space-y-2 p-4 pb-8">
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
            <EmptyState onClear={clearAll} favoritesOnly={filters.favoritesOnly} />
          ) : null}
        </div>
      </Sheet>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  className,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
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
          "w-full rounded-xl border border-line-strong bg-parchment pl-9 pr-8 text-sm text-ink placeholder:text-ink-muted/80 focus-visible:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/20 [&::-webkit-search-cancel-button]:appearance-none",
          compact ? "h-10" : "h-11",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("common.clear")}
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-parchment-deep hover:text-ink"
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
      className="inline-flex shrink-0 items-center rounded-full border border-line-strong bg-parchment-deep p-0.5"
    >
      <button
        type="button"
        aria-pressed={view === "map"}
        onClick={() => onChange("map")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors",
          view === "map"
            ? "bg-parchment text-ink shadow-soft"
            : "text-ink-muted hover:text-ink",
        )}
      >
        <MapIcon className="size-3.5" aria-hidden="true" />
        {t("explorer.mapView")}
      </button>
      <button
        type="button"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors",
          view === "list"
            ? "bg-parchment text-ink shadow-soft"
            : "text-ink-muted hover:text-ink",
        )}
      >
        <List className="size-3.5" aria-hidden="true" />
        {t("explorer.listView")}
      </button>
    </div>
  );
}

function MobileChip({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
        active
          ? "border-saffron/40 bg-saffron-soft text-saffron-deep"
          : "border-line-strong bg-parchment text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}

function MapLegend({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "pointer-events-none rounded-xl border border-line-strong bg-parchment/92 px-3 py-2.5 shadow-soft backdrop-blur",
        className,
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {t("explorer.legend")}
      </p>
      <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-ink-soft">
        {(["hill", "sea", "land", "pinnacle"] as const).map((category) => (
          <li key={category} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: CATEGORY_DOTS[category] }}
            />
            {t(`category.${category}`)}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ background: "#4B4237" }}
          />
          {t("status.pending")}
        </li>
      </ul>
      <p className="mt-1.5 flex items-center gap-1.5 border-t border-line pt-1.5 text-[10px] text-flag">
        <span
          aria-hidden="true"
          className="size-2 rounded-full border border-dashed border-flag"
        />
        {t("status.flagged")}
      </p>
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
          className="inline-flex items-center gap-1 rounded-full bg-parchment-deep px-2 py-1 text-[10px] text-ink-soft"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.clear}
            aria-label={`${t("common.clear")} ${chip.label}`}
            className="grid size-3.5 place-items-center rounded-full hover:bg-parchment-sunk"
          >
            <X className="size-2.5" aria-hidden="true" />
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-parchment-deep/40 px-6 py-12 text-center">
      <LocateFixed className="size-8 text-line-strong" aria-hidden="true" />
      <h2 className="mt-3 font-display text-lg font-semibold text-ink">
        {favoritesOnly ? t("favorites.empty") : t("explorer.noResults")}
      </h2>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-muted">
        {favoritesOnly ? t("favorites.emptyBody") : t("explorer.noResultsHint")}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-full border border-line-strong bg-parchment px-4 py-2 text-xs font-medium text-ink-soft hover:bg-parchment-deep"
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
      <div className="flex flex-col items-center gap-3 text-ink-muted">
        <span className="size-8 animate-spin rounded-full border-2 border-line-strong border-t-saffron" />
        <p className="text-xs">{t("explorer.mapLoading")}</p>
      </div>
    </div>
  );
}
