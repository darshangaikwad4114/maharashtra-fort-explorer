/**
 * Seeds the verified catalogue into Supabase.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The service
 * role key bypasses RLS, so this script must only ever run on a trusted machine
 * and never be shipped to the browser. Safe to re-run: every write is an upsert
 * keyed on the natural slug.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { circuits } from "../../src/content/circuits";
import { timeline } from "../../src/content/timeline";
import type { District, Fort } from "../../src/types";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
    break;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill in the server-only keys.",
  );
  process.exit(1);
}

if (serviceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY matches the anon key. Refusing to seed without the service-role key.",
  );
  process.exit(1);
}

const readJson = <T,>(relativePath: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), relativePath), "utf8")) as T;

const forts = readJson<Fort[]>("src/data/forts.generated.json");
const districts = readJson<District[]>("src/data/districts.generated.json");

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Row = Record<string, unknown>;

async function upsert(
  table: string,
  rows: Row[],
  onConflict: string,
  batchSize = 250,
) {
  for (let index = 0; index < rows.length; index += batchSize) {
    const chunk = rows.slice(index, index + batchSize);
    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict });
    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }
  }
  console.log(`  ${table.padEnd(16)} ${rows.length} rows`);
}

const categories = [
  { slug: "hill", name_en: "Hill fort", name_mr: "गिरिदुर्ग", sort_order: 1 },
  { slug: "sea", name_en: "Sea fort", name_mr: "जलदुर्ग", sort_order: 2 },
  { slug: "land", name_en: "Land fort", name_mr: "भुईकोट", sort_order: 3 },
  {
    slug: "pinnacle",
    name_en: "Pinnacle fort",
    name_mr: "शिखरदुर्ग",
    sort_order: 4,
  },
];

async function main() {
  console.log(`Seeding ${forts.length} forts into ${url}`);
  console.log(
    "This project must have supabase/migrations/0001_init.sql applied first.\n",
  );

  await upsert(
    "districts",
    districts.map((district) => ({
      slug: district.slug,
      name: district.name,
      aka: district.aka,
      fort_count: district.fortCount,
    })),
    "slug",
  );

  await upsert("categories", categories, "slug");

  await upsert(
    "forts",
    forts.map((fort) => ({
      slug: fort.slug,
      name: fort.name,
      name_mr: fort.nameMr,
      aliases: fort.aliases,
      lat: fort.lat,
      lon: fort.lon,
      district_slug: fort.districtSlug,
      district_aka: fort.districtAka,
      district_note: fort.districtNote,
      district_method: fort.districtMethod,
      district_distance_km: fort.districtDistanceKm,
      category_slug: fort.category,
      heritage_class: fort.heritageClass,
      elevation_m: fort.elevationM,
      difficulty: fort.difficulty,
      best_season: fort.bestSeason,
      built: fort.built,
      description: fort.description,
      accessibility: fort.accessibility,
      travel: fort.travel,
      profile_status: fort.profileStatus,
      coordinate_status: fort.coordinateStatus,
      location_warning: fort.locationWarning,
      flags: fort.flags,
      duplicate_of: fort.duplicateOf,
      featured: fort.featured,
      reviewed_on: fort.reviewedOn,
      source_row: fort.sourceRow,
    })),
    "slug",
  );

  await upsert(
    "fort_images",
    forts.flatMap((fort) =>
      fort.image
        ? [
            {
              fort_slug: fort.slug,
              src: fort.image.src,
              width: fort.image.width,
              height: fort.image.height,
              author: fort.image.author,
              license: fort.image.license,
              license_url: fort.image.licenseUrl,
              source_url: fort.image.sourceUrl,
              caption: fort.image.caption,
            },
          ]
        : [],
    ),
    "fort_slug",
  );

  await upsert(
    "fort_sources",
    forts.flatMap((fort) =>
      fort.sources.map((source) => ({
        fort_slug: fort.slug,
        title: source.title,
        url: source.url,
        publisher: source.publisher ?? null,
      })),
    ),
    "fort_slug,url",
  );

  await upsert(
    "circuits",
    circuits.map((circuit, index) => ({
      slug: circuit.slug,
      name: circuit.name,
      name_mr: circuit.nameMr,
      summary: circuit.summary,
      summary_mr: circuit.summaryMr,
      days: circuit.days,
      difficulty: circuit.difficulty,
      season: circuit.season,
      season_mr: circuit.seasonMr,
      note: circuit.note,
      note_mr: circuit.noteMr,
      sort_order: index,
    })),
    "slug",
  );

  await upsert(
    "circuit_forts",
    circuits.flatMap((circuit) =>
      circuit.fortSlugs.map((slug, position) => ({
        circuit_slug: circuit.slug,
        fort_slug: slug,
        position,
      })),
    ),
    "circuit_slug,fort_slug",
  );

  await upsert(
    "timeline_events",
    timeline.map((event, index) => ({
      year: event.year,
      title: event.title,
      title_mr: event.titleMr,
      description: event.description,
      description_mr: event.descriptionMr,
      source_title: event.source.title,
      source_url: event.source.url,
      source_publisher: event.source.publisher ?? null,
      position: index,
    })),
    "year,title",
  );

  console.log("\nSeed complete. Public tables are readable through anon RLS.");
}

main().catch((error: unknown) => {
  console.error("\nSeed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
