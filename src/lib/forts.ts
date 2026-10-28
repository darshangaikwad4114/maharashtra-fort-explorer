import fortsJson from "@/data/forts.generated.json";
import districtsJson from "@/data/districts.generated.json";
import mapFortsJson from "@/data/map-forts.generated.json";
import { distanceKm } from "@/lib/geo";
import type { District, Fort, MapFort } from "@/types";

export const forts = (fortsJson as unknown as Fort[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const districts = (districtsJson as unknown as District[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const districtsWithForts = districts.filter((d) => d.fortCount > 0);

export const fortBySlug = new Map(forts.map((fort) => [fort.slug, fort]));

export const profileStats = {
  total: forts.length,
  curated: forts.filter((fort) => fort.profileStatus === "curated").length,
  withPhotos: forts.filter((fort) => fort.image).length,
  districts: districtsWithForts.length,
  disputed: forts.filter((fort) => fort.coordinateStatus === "flagged").length,
};

export function getFort(slug: string): Fort | undefined {
  return fortBySlug.get(slug);
}

export function getForts(slugs: string[]): Fort[] {
  return slugs
    .map((slug) => fortBySlug.get(slug))
    .filter((fort): fort is Fort => Boolean(fort));
}

export function nearbyForts(fort: Fort, limit = 4, maxKm = 120): Fort[] {
  return forts
    .filter((candidate) => candidate.slug !== fort.slug)
    .map((candidate) => ({
      fort: candidate,
      km: distanceKm(fort, candidate),
    }))
    .filter((entry) => entry.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
    .map((entry) => entry.fort);
}

export function getMapFort(slug: string): MapFort | undefined {
  return mapForts.find((fort) => fort.slug === slug);
}

export const mapForts = mapFortsJson as MapFort[];
