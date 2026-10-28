import fs from "node:fs";
import path from "node:path";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import distance from "@turf/distance";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { lineString, point } from "@turf/helpers";
import type { Feature, MultiPolygon, Polygon } from "geojson";

type Curated = {
  slug: string;
  sourceName: string;
  name: string;
  nameMr: string;
  aliases: string[];
  category: string;
  heritageClass: string;
  featured: boolean;
  built: string;
  elevationM: number | null;
  difficulty: string;
  bestSeason: { from: number; to: number };
  accessibilityEn: string;
  accessibilityMr: string;
  historyEn: string;
  historyMr: string;
  travelEn: string;
  travelMr: string;
  wikiTitle: string;
  sources: { title: string; url: string; publisher: string }[];
};

type Fort = {
  id: string;
  slug: string;
  name: string;
  nameMr: string | null;
  aliases: string[];
  lat: number;
  lon: number;
  district: string;
  districtAka: string | null;
  districtSlug: string;
  districtNote: string | null;
  districtMethod: "inside" | "nearest-boundary" | "unassigned";
  districtDistanceKm: number | null;
  category: string | null;
  heritageClass: string | null;
  elevationM: number | null;
  difficulty: string | null;
  bestSeason: { from: number; to: number } | null;
  built: string | null;
  accessibility: { en: string; mr: string | null } | null;
  description: { en: string; mr: string | null } | null;
  travel: { en: string; mr: string | null } | null;
  profileStatus: "curated" | "catalog";
  coordinateStatus: "inside" | "nearest-boundary" | "flagged";
  locationWarning: string | null;
  flags: string[];
  duplicateOf: string[];
  sources: { title: string; url: string; publisher: string }[];
  image: ImageRecord | null;
  featured: boolean;
  reviewedOn: string | null;
  sourceRow: number;
};

type ImageRecord = {
  src: string;
  width: number | null;
  height: number | null;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
  caption: string;
};

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, "data/raw/forts.csv");
const DISTRICT_GEOJSON = path.join(ROOT, "data/geo/maharashtra-districts.geojson");
const CURATED_PATH = path.join(ROOT, "data/curated/forts.json");
const IMAGES_PATH = path.join(ROOT, "data/images/curated-images.json");
const OUT_FORTS = path.join(ROOT, "src/data/forts.generated.json");
const OUT_DISTRICTS = path.join(ROOT, "src/data/districts.generated.json");
const OUT_MAP = path.join(ROOT, "src/data/map-forts.generated.json");
const OUT_AUDIT = path.join(ROOT, "data/audit-report.json");

const DISTRICT_META: Record<string, { name: string; aka: string | null }> = {
  Ahmadnagar: { name: "Ahilyanagar", aka: "Ahmednagar" },
  Aurangabad: { name: "Chhatrapati Sambhajinagar", aka: "Aurangabad" },
  Osmanabad: { name: "Dharashiv", aka: "Osmanabad" },
  Raigarh: { name: "Raigad", aka: null },
  Bid: { name: "Beed", aka: null },
  Buldana: { name: "Buldhana", aka: null },
  Gondiya: { name: "Gondia", aka: null },
  Mumbai: { name: "Mumbai City", aka: null },
  "Mumbai Suburban": { name: "Mumbai Suburban", aka: null },
};

const KNOWN_COORDINATE_ISSUES: Record<string, string> = {
  kenjalgad:
    "The Wikipedia article places Kenjalgad in Satara district about 18 km northwest of Wai, but the recorded coordinate falls near Korlai in Raigad. The location is disputed; do not navigate by this point without checking.",
  "sarjekot-fort":
    "Sources place Sarjekot near Malvan in Sindhudurg district, but the recorded coordinate falls at Kolaba near Alibaug. The location is disputed and should not be used for navigation.",
  "morgiri-fort":
    "The recorded coordinate falls in central Pune near Shaniwar Wada, which is inconsistent with a hill fort. The location needs field verification.",
  "bahadur-fort":
    "Shares an identical coordinate with DharmveerGad. The names may describe the same site, but the record needs verification.",
  dharmveergad:
    "Shares an identical coordinate with Bahadur Fort. The names may describe the same site, but the record needs verification.",
};

const DISTRICT_OVERRIDES: Record<string, { district: string; reason: string }> = {
  "Mahim Fort": {
    district: "Mumbai Suburban",
    reason: "Mahim lies in Mumbai Suburban district; the boundary dataset places this shoreline point in Mumbai City.",
  },
};

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function cleanText(value: string): { text: string; fixed: boolean } {
  const original = value;
  const text = value
    .replace(/\uFFFD/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return { text, fixed: text !== original.replace(/\s+/g, " ").trim() };
}

function splitName(raw: string): { name: string; aliases: string[] } {
  const parts = raw
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const name = parts.shift() ?? raw;
  return { name, aliases: parts.filter((p) => p.toLowerCase() !== name.toLowerCase()) };
}

function parseCsv(text: string): { name: string; lat: number; lon: number; row: number }[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const rows: { name: string; lat: number; lon: number; row: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(.*),([-0-9.]+),([-0-9.]+)$/);
    if (!match) {
      throw new Error(`Could not parse CSV line ${i + 1}: ${line}`);
    }
    const lat = Number(match[2]);
    const lon = Number(match[3]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error(`Invalid coordinates on line ${i + 1}: ${line}`);
    }
    rows.push({ name: match[1], lat, lon, row: i + 1 });
  }
  return rows;
}

function districtSlug(rawName: string, displayName: string): string {
  return slugify(displayName) || slugify(rawName);
}

function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  return distance(point([a.lon, a.lat]), point([b.lon, b.lat]), { units: "kilometers" });
}

function distanceToFeatureKm(fort: { lat: number; lon: number }, feature: GeoJSON.Feature): number {
  const geom = feature.geometry;
  const polygons =
    geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
  let best = Number.POSITIVE_INFINITY;
  const p = point([fort.lon, fort.lat]);
  for (const rings of polygons) {
    for (const ring of rings) {
      const line = lineString(ring as [number, number][]);
      const snapped = nearestPointOnLine(line, p, { units: "kilometers" });
      const d = snapped.properties.dist;
      if (typeof d === "number" && d < best) best = d;
    }
  }
  return best;
}

const curatedDoc = JSON.parse(fs.readFileSync(CURATED_PATH, "utf8")) as {
  reviewedOn: string;
  forts: Curated[];
};
const curatedBySource = new Map<string, Curated>();
for (const item of curatedDoc.forts) curatedBySource.set(item.sourceName, item);

const districtGeo = JSON.parse(fs.readFileSync(DISTRICT_GEOJSON, "utf8")) as GeoJSON.FeatureCollection;
const districtFeatures = districtGeo.features.map((feature) => {
  const raw = String(feature.properties?.dtname ?? "Unknown");
  const meta = DISTRICT_META[raw] ?? { name: raw, aka: null };
  return { feature, raw, name: meta.name, aka: meta.aka, slug: districtSlug(raw, meta.name) };
});

let images: Record<string, ImageRecord> = {};
if (fs.existsSync(IMAGES_PATH)) {
  images = JSON.parse(fs.readFileSync(IMAGES_PATH, "utf8")) as Record<string, ImageRecord>;
}

const csv = fs.readFileSync(CSV_PATH, "utf8");
const rawRows = parseCsv(csv);

const encodingFixes: string[] = [];
const curatedMatchIssues: string[] = [];
const curatedMatched = new Set<string>();
const usedSlugs = new Map<string, number>();
const baseRows = rawRows.map((row) => {
  const cleaned = cleanText(row.name);
  if (cleaned.fixed) encodingFixes.push(`Row ${row.row}: "${row.name}" → "${cleaned.text}"`);
  const split = splitName(cleaned.text);
  const curated = curatedBySource.get(split.name);
  const name = curated?.name ?? split.name;
  const baseSlug = slugify(name);
  const count = (usedSlugs.get(baseSlug) ?? 0) + 1;
  usedSlugs.set(baseSlug, count);
  return { ...row, cleanedName: split.name, aliases: split.aliases, curated, name, baseSlug, count };
});

const forts: Fort[] = [];
const unassigned: { name: string; lat: number; lon: number; nearestKm: number }[] = [];

for (const row of baseRows) {
  const p = point([row.lon, row.lat]);
  let inside = districtFeatures.find((d) =>
    booleanPointInPolygon(
      p,
      d.feature as Feature<Polygon | MultiPolygon>,
    ),
  );
  let method: Fort["districtMethod"] = "inside";
  let nearestKm: number | null = 0;

  if (!inside) {
    let best: (typeof districtFeatures)[number] | null = null;
    let bestKm = Number.POSITIVE_INFINITY;
    for (const d of districtFeatures) {
      const dkm = distanceToFeatureKm(row, d.feature);
      if (dkm < bestKm) {
        bestKm = dkm;
        best = d;
      }
    }
    if (best && bestKm <= 35) {
      inside = best;
      method = "nearest-boundary";
      nearestKm = Math.round(bestKm * 10) / 10;
    } else {
      unassigned.push({ name: row.name, lat: row.lat, lon: row.lon, nearestKm: Math.round(bestKm) });
      continue;
    }
  }

  if (!inside) continue;

  const curated = row.curated;
  const slugCandidate = curated?.slug ?? (row.count > 1 ? `${row.baseSlug}-${inside.slug}` : row.baseSlug);

  const district = inside.name;
  const flags: string[] = [];
  if (method === "nearest-boundary") flags.push("district-assigned-from-coast");
  if (curated) curatedMatched.add(curated.sourceName);

  const fort: Fort = {
    id: slugCandidate,
    slug: slugCandidate,
    name: row.name,
    nameMr: curated?.nameMr ?? null,
    aliases: [...new Set([...row.aliases, ...(curated?.aliases ?? [])])],
    lat: row.lat,
    lon: row.lon,
    district,
    districtAka: inside.aka,
    districtSlug: inside.slug,
    districtNote: null,
    districtMethod: method,
    districtDistanceKm: method === "nearest-boundary" ? nearestKm : null,
    category: curated?.category ?? null,
    heritageClass: curated?.heritageClass ?? null,
    elevationM: curated?.elevationM ?? null,
    difficulty: curated?.difficulty ?? null,
    bestSeason: curated?.bestSeason ?? null,
    built: curated?.built ?? null,
    accessibility: curated ? { en: curated.accessibilityEn, mr: curated.accessibilityMr } : null,
    description: curated ? { en: curated.historyEn, mr: curated.historyMr } : null,
    travel: curated ? { en: curated.travelEn, mr: curated.travelMr } : null,
    profileStatus: curated ? "curated" : "catalog",
    coordinateStatus: method === "inside" ? "inside" : "nearest-boundary",
    locationWarning: null,
    flags,
    duplicateOf: [],
    sources: curated?.sources ?? [],
    image: curated ? images[curated.slug] ?? null : null,
    featured: curated?.featured ?? false,
    reviewedOn: curated ? curatedDoc.reviewedOn : null,
    sourceRow: row.row,
  };

  forts.push(fort);
}

const curatedMissing = curatedDoc.forts
  .filter((c) => !curatedMatched.has(c.sourceName))
  .map((c) => c.sourceName);
if (curatedMissing.length) {
  curatedMatchIssues.push(`Curated names not found in CSV: ${curatedMissing.join(", ")}`);
}

// Duplicate / near-duplicate coordinate detection (300 m).
const duplicateGroups: { slugs: string[]; distanceM: number; coords: [number, number] }[] = [];
for (let i = 0; i < forts.length; i++) {
  for (let j = i + 1; j < forts.length; j++) {
    const d = km(forts[i], forts[j]);
    if (d <= 0.3) {
      forts[i].flags.push("duplicate-coordinates");
      forts[j].flags.push("duplicate-coordinates");
      forts[i].duplicateOf.push(forts[j].slug);
      forts[j].duplicateOf.push(forts[i].slug);
      duplicateGroups.push({
        slugs: [forts[i].slug, forts[j].slug],
        distanceM: Math.round(d * 1000),
        coords: [forts[i].lat, forts[i].lon],
      });
    }
  }
}

// Apply known location disputes and the one verified district override.
for (const fort of forts) {
  const issue = KNOWN_COORDINATE_ISSUES[fort.slug];
  if (issue) {
    fort.coordinateStatus = "flagged";
    fort.locationWarning = issue;
    fort.flags.push("location-disputed");
  }
  const override = DISTRICT_OVERRIDES[fort.name];
  if (override) {
    fort.district = override.district;
    fort.districtNote = override.reason;
    fort.flags.push("district-manual-override");
  }
}

// Resolve slug collisions after district suffixing.
const seen = new Map<string, Fort>();
for (const fort of forts) {
  if (seen.has(fort.slug)) {
    const alt = `${fort.slug}-${fort.districtSlug}`;
    fort.slug = alt;
    fort.id = alt;
  }
  seen.set(fort.slug, fort);
}

// Coordinates sanity bounds (Maharashtra envelope, generous).
for (const fort of forts) {
  if (fort.lat < 15.5 || fort.lat > 22.2 || fort.lon < 72.4 || fort.lon > 81) {
    fort.flags.push("outside-maharashtra-envelope");
    fort.coordinateStatus = "flagged";
  }
}

const districtCounts = new Map<string, number>();
for (const fort of forts) {
  const key = fort.district;
  districtCounts.set(key, (districtCounts.get(key) ?? 0) + 1);
}

const districts = districtFeatures
  .map((d) => ({
    name: d.name,
    aka: d.aka,
    slug: d.slug,
    fortCount: districtCounts.get(d.name) ?? 0,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

forts.sort((a, b) => a.name.localeCompare(b.name));

const curatedForts = forts.filter((f) => f.profileStatus === "curated");
const audit = {
  generatedAt: new Date().toISOString(),
  sourceCsv: "data/raw/forts.csv",
  districtBoundarySource:
    "https://github.com/datta07/INDIAN-SHAPEFILES/blob/master/STATES/MAHARASHTRA/MAHARASHTRA_DISTRICTS.geojson",
  totals: {
    csvRows: rawRows.length,
    published: forts.length,
    excluded: unassigned.length,
    curated: curatedForts.length,
    catalog: forts.length - curatedForts.length,
    withImage: forts.filter((f) => f.image).length,
    withDescription: forts.filter((f) => f.description).length,
  },
  encodingFixes,
  curatedMatchIssues,
  excludedOutOfState: unassigned,
  duplicateGroups,
  flags: forts
    .filter((f) => f.flags.length)
    .map((f) => ({ slug: f.slug, name: f.name, flags: f.flags, duplicateOf: f.duplicateOf })),
  curatedMissingImages: curatedForts.filter((f) => !f.image).map((f) => f.slug),
  districts: districts.map((d) => ({ name: d.name, count: d.fortCount })),
};

fs.mkdirSync(path.dirname(OUT_FORTS), { recursive: true });
fs.writeFileSync(OUT_FORTS, JSON.stringify(forts, null, 2) + "\n");
fs.writeFileSync(OUT_DISTRICTS, JSON.stringify(districts, null, 2) + "\n");

// Slim projection for the client map so the explorer does not ship full profiles.
const mapForts = forts.map((fort) => ({
  slug: fort.slug,
  name: fort.name,
  nameMr: fort.nameMr,
  aliases: fort.aliases,
  lat: fort.lat,
  lon: fort.lon,
  district: fort.district,
  districtSlug: fort.districtSlug,
  category: fort.category,
  difficulty: fort.difficulty,
  profileStatus: fort.profileStatus,
  coordinateStatus: fort.coordinateStatus,
  locationWarning: fort.locationWarning,
  image: fort.image?.src ?? null,
  featured: fort.featured,
  elevationM: fort.elevationM,
}));
fs.writeFileSync(OUT_MAP, JSON.stringify(mapForts) + "\n");
fs.writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2) + "\n");

console.log(`Published ${forts.length} forts (${curatedForts.length} curated, ${forts.length - curatedForts.length} catalog).`);
console.log(`Excluded ${unassigned.length}; duplicate groups: ${duplicateGroups.length}; flags: ${audit.flags.length}.`);
if (curatedMissing.length) console.log(`WARNING curated missing: ${curatedMissing.join(", ")}`);
if (audit.curatedMissingImages.length) console.log(`Curated without image: ${audit.curatedMissingImages.join(", ")}`);
console.log(`District counts: ${districts.filter((d) => d.fortCount).length} districts with forts.`);
console.log(`Wrote ${path.relative(ROOT, OUT_FORTS)}, districts and audit report.`);
