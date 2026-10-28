/**
 * Downloads curated fort photographs at 1280px from Wikimedia Commons and
 * records author/license/source so attribution can be rendered in the UI.
 * Only images with explicit reuse metadata are accepted.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/images/forts");
const OUT_JSON = path.join(ROOT, "data/images/curated-images.json");
const UA = "MaharashtraFortExplorer/1.0 (educational heritage project)";

const curated = JSON.parse(await fs.readFile(path.join(ROOT, "data/curated/forts.json"), "utf8"));
const wiki = JSON.parse(await fs.readFile(path.join(ROOT, "data/wiki/forts-wiki.json"), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function commonsSearch(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  const params = {
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: "1280",
    format: "json",
    formatversion: "2",
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const data = await res.json();
  const pages = data.query?.pages ?? [];
  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const m = info.extmetadata ?? {};
      const title = page.title ?? "";
      if (!/\.(jpe?g|png)$/i.test(title)) return null;
      if (/map|plan|sketch|diagram|logo|coin|stamp/i.test(title)) return null;
      if (!info.mime?.startsWith("image/")) return null;
      if ((info.width ?? 0) < 1000 || (info.height ?? 0) < 600) return null;
      return {
        title,
        thumbUrl: info.thumburl ?? info.url,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
        descriptionUrl: info.descriptionurl ?? null,
        artist: stripHtml(m.Artist?.value) || "Wikimedia Commons contributor",
        license: stripHtml(m.LicenseShortName?.value) || null,
        licenseUrl: m.LicenseUrl?.value || null,
        attributionRequired: stripHtml(m.AttributionRequired?.value) || null,
        landscape: (info.width ?? 0) >= (info.height ?? 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.landscape) - Number(a.landscape));
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) throw new Error(`Unexpected content-type ${type}`);
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length && length < 10_000) throw new Error(`Image too small (${length} bytes)`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

await fs.mkdir(OUT_DIR, { recursive: true });

let existing = {};
try {
  existing = JSON.parse(await fs.readFile(OUT_JSON, "utf8"));
} catch {
  existing = {};
}

const output = {};
const missing = [];

for (const fort of curated.forts) {
  const item =
    wiki.items.find((w) => w.title === fort.wikiTitle) ??
    wiki.items.find((w) => w.title.toLowerCase() === fort.wikiTitle.toLowerCase());

  let chosen = null;
  if (item?.image?.thumbUrl) {
    chosen = {
      title: item.image.file,
      thumbUrl: item.image.thumbUrl,
      width: item.image.width,
      height: item.image.height,
      descriptionUrl: item.image.descriptionUrl,
      artist: item.image.artist || "Wikimedia Commons contributor",
      license: item.image.license || null,
      licenseUrl: item.image.licenseUrl || null,
      attributionRequired: item.image.attributionRequired || null,
    };
  } else {
    const results = await commonsSearch(`${fort.name} Maharashtra fort`);
    chosen = results.find((r) => r.license) ?? results[0] ?? null;
    await sleep(350);
  }

  if (!chosen?.thumbUrl || !chosen.license) {
    missing.push(`${fort.slug} (${fort.name})`);
    continue;
  }

  const filename = `${fort.slug}.jpg`;
  const dest = path.join(OUT_DIR, filename);
  const src = `/images/forts/${filename}`;

  try {
    if (!existing[fort.slug]) {
      const url = chosen.thumbUrl.replace(/\?.*$/, "");
      await download(url, dest);
      await sleep(300);
    }
    output[fort.slug] = {
      src,
      width: chosen.width ?? null,
      height: chosen.height ?? null,
      author: chosen.artist,
      license: chosen.license,
      licenseUrl: chosen.licenseUrl,
      sourceUrl: chosen.descriptionUrl,
      caption: `${fort.name} — photo: ${chosen.artist} (${chosen.license})`,
    };
    console.log(`OK  ${fort.slug} | ${chosen.license} | ${chosen.artist}`);
  } catch (err) {
    console.error(`FAIL ${fort.slug}: ${err.message}`);
    missing.push(`${fort.slug} (${fort.name})`);
  }
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(output, null, 2) + "\n");

console.log(`\nSaved ${Object.keys(output).length} images; missing ${missing.length}.`);
if (missing.length) console.log(`Missing: ${missing.join(", ")}`);
