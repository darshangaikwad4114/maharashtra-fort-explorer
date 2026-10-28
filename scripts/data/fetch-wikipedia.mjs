/**
 * Fetches lead extracts + lead image metadata for curated forts from Wikipedia.
 * Output is a research aid: data/wiki/forts-wiki.json. Human review is required
 * before anything is promoted into the shipped dataset.
 */
import fs from "node:fs/promises";
import path from "node:path";

const CURATED_TITLES = [
  "Raigad Fort",
  "Rajgad Fort",
  "Torna Fort",
  "Sinhagad",
  "Pratapgad",
  "Shivneri Fort",
  "Lohagad",
  "Visapur Fort",
  "Harishchandragad",
  "Panhala Fort",
  "Vijaydurg Fort",
  "Sindhudurg Fort",
  "Murud-Janjira",
  "Purandar Fort",
  "Daulatabad Fort",
  "Ajinkyatara",
  "Korigad",
  "Tikona",
  "Tung Fort",
  "Vasota",
  "Salher",
  "Narnala",
  "Gawilghur",
  "Kolaba Fort",
  "Suvarnadurg",
  "Jaigad Fort",
  "Arnala fort",
  "Vasai Fort",
  "Malhargad",
  "Kothaligad",
  "Kalavantin Durg",
  "Prabalgad",
  "Padmadurg",
  "Khanderi",
  "Belapur Fort",
  "Mahim Fort",
  "Worli Fort",
  "Sion Hillock Fort",
  "Castella de Aguada",
  "Sewri Fort",
  "Ghodbunder Fort",
  "Anjanvel Fort",
  "Gowalkot",
  "Purnagad",
  "Vishalgad",
  "Sajjangad",
  "Mahipatgad",
  "Kamalgad",
  "Rasalgad",
  "Prachitgad",
  "Vardhangad",
  "Chandan Fort",
  "Samangad",
  "Devgad fort",
  "Bhagwantgad",
  "Yashwantgad",
  "Dronagiri Fort",
];

const API = "https://en.wikipedia.org/w/api.php";
const UA = "MaharashtraFortExplorer/1.0 (educational heritage project)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function api(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ format: "json", formatversion: "2", ...params })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

const batches = [];
for (let i = 0; i < CURATED_TITLES.length; i += 20) batches.push(CURATED_TITLES.slice(i, i + 20));

const byTitle = new Map();
for (const batch of batches) {
  const data = await api({
    action: "query",
    prop: "pageimages|extracts|info",
    inprop: "url",
    exintro: "1",
    explaintext: "1",
    exlimit: "max",
    piprop: "thumbnail|name",
    pilimit: "max",
    pilicense: "any",
    pithumbsize: "1280",
    redirects: "1",
    titles: batch.join("|"),
  });
  for (const page of data.query?.pages ?? []) {
    if (!page.title || page.missing) continue;
    byTitle.set(page.title, {
      title: page.title,
      description: page.description ?? null,
      url: page.fullurl ?? null,
      imageFile: page.pageimage ? `File:${page.pageimage}` : null,
      imageUrl: page.thumbnail?.source ?? null,
      imageWidth: page.thumbnail?.width ?? null,
      imageHeight: page.thumbnail?.height ?? null,
      extract: stripHtml(page.extract),
    });
  }
  await sleep(400);
}

const fileTitles = [...byTitle.values()].map((p) => p.imageFile).filter(Boolean);
const metaByFile = new Map();
for (let i = 0; i < fileTitles.length; i += 20) {
  const batch = fileTitles.slice(i, i + 20);
  const data = await api({
    action: "query",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1280",
    titles: batch.join("|"),
  });
  for (const page of data.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const m = info.extmetadata ?? {};
    metaByFile.set(page.title, {
      file: page.title,
      descriptionUrl: info.descriptionurl ?? null,
      thumbUrl: info.thumburl ?? info.url ?? null,
      width: info.width ?? null,
      height: info.height ?? null,
      artist: stripHtml(m.Artist?.value) || null,
      credit: stripHtml(m.Credit?.value) || null,
      license: stripHtml(m.LicenseShortName?.value) || null,
      licenseUrl: m.LicenseUrl?.value || null,
      attributionRequired: stripHtml(m.AttributionRequired?.value) || null,
      restrictions: stripHtml(m.Restrictions?.value) || null,
    });
  }
  await sleep(400);
}

const items = [...byTitle.values()].map((p) => ({
  ...p,
  image: p.imageFile
    ? metaByFile.get(p.imageFile.replace(/_/g, " ")) ?? metaByFile.get(p.imageFile) ?? null
    : null,
}));

await fs.mkdir(path.join("data", "wiki"), { recursive: true });
await fs.writeFile(
  path.join("data", "wiki", "forts-wiki.json"),
  JSON.stringify({ fetchedAt: new Date().toISOString(), source: "en.wikipedia.org", items }, null, 2),
);

for (const item of items) {
  console.log(
    `${item.title} | ${item.image?.license ?? "NO_IMAGE"} | ${item.image?.artist ?? ""} | ${item.extract.slice(0, 140).replace(/\n/g, " ")}`,
  );
}
console.log(`\nSaved ${items.length} records to data/wiki/forts-wiki.json`);
